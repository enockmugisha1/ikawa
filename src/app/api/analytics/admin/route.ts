import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WorkerModel from '@/models/Worker';
import AttendanceModel from '@/models/Attendance';
import SessionModel from '@/models/Session';
import BagModel from '@/models/Bag';
import ExporterModel from '@/models/Exporter';
import FacilityModel from '@/models/Facility';
import RateCardModel from '@/models/RateCard';
import { getCurrentUser } from '@/lib/auth';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const today = new Date();
        const startOfDay = getStartOfDay(today);
        const endOfDay = getEndOfDay(today);

        // Calculate last 7 days for averages
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Calculate last 30 days for monthly stats
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Parallel queries for better performance
        const [
            totalWorkers,
            activeWorkers,
            totalExporters,
            activeExporters,
            totalFacilities,
            workersCheckedInToday,
            activeSessions,
            bagsToday,
            bagsLast7Days,
            bagsLast30Days,
            totalBags,
            sessionsToday,
            exportersToday,
            allBagsToday,
        ] = await Promise.all([
            // System-wide metrics
            WorkerModel.countDocuments(),
            WorkerModel.countDocuments({ status: 'active' }),
            ExporterModel.countDocuments(),
            ExporterModel.countDocuments({ isActive: true }),
            FacilityModel.countDocuments({ isActive: true }),

            // Today's operations
            AttendanceModel.countDocuments({
                date: { $gte: startOfDay, $lte: endOfDay },
            }),
            SessionModel.countDocuments({ status: 'active' }),
            BagModel.countDocuments({
                date: { $gte: startOfDay, $lte: endOfDay },
            }),

            // Historical data
            BagModel.countDocuments({
                date: { $gte: sevenDaysAgo, $lte: endOfDay },
            }),
            BagModel.countDocuments({
                date: { $gte: thirtyDaysAgo, $lte: endOfDay },
            }),
            BagModel.countDocuments(),

            // Detailed data
            SessionModel.find({
                date: { $gte: startOfDay, $lte: endOfDay },
            }).select('startTime endTime status'),
            BagModel.distinct('exporterId', {
                date: { $gte: startOfDay, $lte: endOfDay },
            }),
            BagModel.find({
                date: { $gte: startOfDay, $lte: endOfDay },
            }).populate('exporterId').select('exporterId weight workers'),
        ]);

        // Calculate metrics
        const totalKilograms = totalBags * 60;
        const totalKilogramsToday = bagsToday * 60;

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

        const avgBagsPerDay = bagsLast7Days / 7;
        const avgBagsPerDayLast30 = bagsLast30Days / 30;
        const exportersServedToday = exportersToday.length;

        // Calculate total costs
        let totalCostsToday = 0;
        const exporterIds = [...new Set(allBagsToday.map((bag: any) => bag.exporterId?._id?.toString()).filter(Boolean))];
        
        if (exporterIds.length > 0) {
            const rateCards = await RateCardModel.find({
                exporterId: { $in: exporterIds },
                isActive: true,
                effectiveFrom: { $lte: today },
                $or: [
                    { effectiveTo: null },
                    { effectiveTo: { $gte: today } }
                ]
            });

            const rateMap = new Map();
            rateCards.forEach((rc: any) => {
                rateMap.set(rc.exporterId.toString(), rc.ratePerBag);
            });

            const exporterBagCounts = new Map();
            allBagsToday.forEach((bag: any) => {
                const exporterId = bag.exporterId?._id?.toString();
                if (exporterId) {
                    exporterBagCounts.set(exporterId, (exporterBagCounts.get(exporterId) || 0) + 1);
                }
            });

            exporterBagCounts.forEach((bagCount, exporterId) => {
                const rate = rateMap.get(exporterId) || 0;
                totalCostsToday += bagCount * rate;
            });
        }

        // Get trend data (last 7 days)
        const trendData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayStart = getStartOfDay(date);
            const dayEnd = getEndOfDay(date);

            const [dayAttendance, dayBags, daySessions] = await Promise.all([
                AttendanceModel.countDocuments({
                    date: { $gte: dayStart, $lte: dayEnd },
                }),
                BagModel.countDocuments({
                    date: { $gte: dayStart, $lte: dayEnd },
                }),
                SessionModel.countDocuments({
                    date: { $gte: dayStart, $lte: dayEnd },
                }),
            ]);

            trendData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                workers: dayAttendance,
                bags: dayBags,
                sessions: daySessions,
            });
        }

        const analytics = {
            // System overview
            totalWorkers,
            activeWorkers,
            totalExporters,
            activeExporters,
            totalFacilities,
            totalBags,
            totalKilograms,

            // Today's operations
            workersCheckedInToday,
            activeSessions,
            bagsToday,
            totalKilogramsToday,
            exportersServedToday,
            totalHoursWorked: Math.round(totalHoursWorked * 10) / 10,
            totalCostsToday: Math.round(totalCostsToday * 100) / 100,

            // Averages and trends
            avgBagsPerDay: Math.round(avgBagsPerDay * 10) / 10,
            avgBagsPerDayLast30: Math.round(avgBagsPerDayLast30 * 10) / 10,
            bagsLast7Days,
            bagsLast30Days,

            // Trend data
            trends: {
                attendance: trendData,
                bags: trendData,
                sessions: trendData,
            },
        };

        return NextResponse.json({ analytics });
    } catch (error) {
        console.error('Get admin analytics error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
