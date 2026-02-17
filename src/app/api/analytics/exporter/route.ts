import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WorkerModel from '@/models/Worker';
import BagModel from '@/models/Bag';
import SessionModel from '@/models/Session';
import RateCardModel from '@/models/RateCard';
import { getCurrentUser } from '@/lib/auth';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'exporter') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!currentUser.exporterId) {
            return NextResponse.json({ error: 'Exporter ID not found' }, { status: 400 });
        }

        await dbConnect();

        const exporterId = currentUser.exporterId;
        const today = new Date();
        const startOfDay = getStartOfDay(today);
        const endOfDay = getEndOfDay(today);

        // Calculate date ranges
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        // Parallel queries
        const [
            bagsToday,
            bagsThisWeek,
            bagsThisMonth,
            totalBags,
            allBags,
            sessionsToday,
            activeRateCard,
        ] = await Promise.all([
            // Bags today
            BagModel.countDocuments({
                exporterId,
                date: { $gte: startOfDay, $lte: endOfDay },
            }),

            // Bags this week
            BagModel.countDocuments({
                exporterId,
                date: { $gte: sevenDaysAgo, $lte: endOfDay },
            }),

            // Bags this month
            BagModel.countDocuments({
                exporterId,
                date: { $gte: monthStart, $lte: endOfDay },
            }),

            // Total bags all time
            BagModel.countDocuments({ exporterId }),

            // All bags with worker details
            BagModel.find({ exporterId })
                .populate('workers.workerId')
                .select('weight date workers')
                .sort({ date: -1 })
                .limit(1000),

            // Sessions today
            SessionModel.find({
                exporterId,
                date: { $gte: startOfDay, $lte: endOfDay },
            }).select('startTime endTime status'),

            // Get active rate card
            RateCardModel.findOne({
                exporterId,
                isActive: true,
                effectiveFrom: { $lte: today },
                $or: [
                    { effectiveTo: null },
                    { effectiveTo: { $gte: today } }
                ]
            }),
        ]);

        // Calculate workers engaged
        const uniqueWorkers = new Set();
        allBags.forEach((bag: any) => {
            bag.workers?.forEach((w: any) => {
                if (w.workerId?._id) {
                    uniqueWorkers.add(w.workerId._id.toString());
                }
            });
        });
        const workersEngaged = uniqueWorkers.size;

        // Calculate total weight
        const totalWeight = allBags.reduce((sum: number, bag: any) => sum + (bag.weight || 60), 0);
        const totalWeightToday = bagsToday * 60;

        // Calculate total hours worked
        let totalHoursWorked = 0;
        sessionsToday.forEach((session: any) => {
            if (session.endTime) {
                const hours = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60 * 60);
                totalHoursWorked += hours;
            } else if (session.status === 'active') {
                const hours = (Date.now() - new Date(session.startTime).getTime()) / (1000 * 60 * 60);
                totalHoursWorked += hours;
            }
        });

        // Calculate average bags per day
        const oldestBag = allBags.length > 0 
            ? new Date(allBags[allBags.length - 1].date)
            : today;
        const daysSinceStart = Math.max(1, Math.ceil((today.getTime() - oldestBag.getTime()) / (1000 * 60 * 60 * 24)));
        const avgBagsPerDay = totalBags / daysSinceStart;

        // Calculate costs
        const ratePerBag = activeRateCard?.ratePerBag || 0;
        const totalCost = totalBags * ratePerBag;
        const costToday = bagsToday * ratePerBag;
        const costThisMonth = bagsThisMonth * ratePerBag;

        // Get trend data (last 7 days)
        const trendData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayStart = getStartOfDay(date);
            const dayEnd = getEndOfDay(date);

            const dayBags = await BagModel.countDocuments({
                exporterId,
                date: { $gte: dayStart, $lte: dayEnd },
            });

            trendData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                bags: dayBags,
                weight: dayBags * 60,
            });
        }

        const analytics = {
            // Overview
            totalBags,
            workersEngaged,
            totalWeight,
            avgBagsPerDay: Math.round(avgBagsPerDay * 10) / 10,

            // Today's metrics
            bagsToday,
            totalWeightToday,
            totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
            costToday: Math.round(costToday * 100) / 100,

            // Period metrics
            bagsThisWeek,
            bagsThisMonth,
            costThisMonth: Math.round(costThisMonth * 100) / 100,

            // Financial
            ratePerBag,
            totalCost: Math.round(totalCost * 100) / 100,
            projectedMonthlyCost: Math.round((bagsThisMonth / new Date().getDate()) * 30 * ratePerBag * 100) / 100,

            // Trends
            trends: {
                bags: trendData,
                weight: trendData,
            },
        };

        return NextResponse.json({ analytics });
    } catch (error) {
        console.error('Get exporter analytics error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
