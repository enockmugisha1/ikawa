import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AttendanceModel from '@/models/Attendance';
import WorkerModel from '@/models/Worker';
import { getCurrentUser } from '@/lib/auth';
import { getStartOfDay, getEndOfDay } from '@/lib/utils';

// POST - Check in worker
export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !['supervisor', 'admin'].includes(currentUser.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        const { workerId } = body;
        let { facilityId } = body;

        console.log('[Check-in] Request:', { workerId, facilityId, userFacilityId: currentUser.facilityId });

        // If no facilityId provided, try to get from user or worker
        if (!facilityId) {
            facilityId = currentUser.facilityId;
        }

        // If still no facilityId, get from worker's facility
        if (!facilityId) {
            const worker = await WorkerModel.findById(workerId);
            if (worker && 'facilityId' in worker && worker.facilityId) {
                facilityId = worker.facilityId;
            }
        }

        // If still no facilityId, get first available facility
        if (!facilityId) {
            const FacilityModel = (await import('@/models/Facility')).default;
            const facility = await FacilityModel.findOne({ isActive: true });
            console.log('[Check-in] Found facility from database:', facility ? facility._id : 'none');
            if (facility) {
                facilityId = facility._id;
            }
        }

        if (!facilityId) {
            console.error('[Check-in] No facilityId available after all fallbacks');
            return NextResponse.json(
                { error: 'No facility available. Please create a facility first or contact administrator.' },
                { status: 400 }
            );
        }

        console.log('[Check-in] Final facilityId to use:', facilityId);

        // Validate worker exists and is active
        const worker = await WorkerModel.findById(workerId);
        if (!worker) {
            return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
        }
        if (worker.status !== 'active') {
            return NextResponse.json(
                { error: 'Worker is not active' },
                { status: 400 }
            );
        }

        const today = new Date();
        const startOfDay = getStartOfDay(today);
        const endOfDay = getEndOfDay(today);

        // Check if worker has ANY attendance record today (on-site or checked-out)
        // According to documentation: One check-in per day only
        const existingAttendance = await AttendanceModel.findOne({
            workerId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        if (existingAttendance) {
            if (existingAttendance.status === 'on-site') {
                return NextResponse.json(
                    { error: 'Worker is already checked in and currently on-site' },
                    { status: 400 }
                );
            } else {
                // Worker already checked in and out today
                return NextResponse.json(
                    { error: 'Worker has already completed attendance for today (checked in and out)' },
                    { status: 400 }
                );
            }
        }

        // Create attendance record
        const attendance = await AttendanceModel.create({
            workerId,
            facilityId,
            date: today,
            checkInTime: new Date(),
            status: 'on-site',
            supervisorId: currentUser.userId,
        });

        console.log('[Check-in] Attendance created:', attendance._id);

        const populatedAttendance = await AttendanceModel.findById(attendance._id)
            .populate('workerId')
            .populate('facilityId');

        return NextResponse.json({ attendance: populatedAttendance }, { status: 201 });
    } catch (error) {
        console.error('[Check-in] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}

// GET - Get today's attendance
export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const today = new Date();
        const startOfDay = getStartOfDay(today);
        const endOfDay = getEndOfDay(today);

        const attendance = await AttendanceModel.find({
            date: { $gte: startOfDay, $lte: endOfDay },
        })
            .populate('workerId')
            .populate('facilityId')
            .sort({ checkInTime: -1 });

        return NextResponse.json({ attendance });
    } catch (error) {
        console.error('Get attendance error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
