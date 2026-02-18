import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WorkerModel from '@/models/Worker';
import { getCurrentUser } from '@/lib/auth';
import { generateWorkerId } from '@/lib/utils';

// GET - List all workers
export async function GET(request: NextRequest) {
    try {
        console.log('[Workers API] GET request received');
        
        const currentUser = await getCurrentUser();
        console.log('[Workers API] Current user:', currentUser?.email || 'none');
        
        if (!currentUser) {
            console.log('[Workers API] No authenticated user');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[Workers API] Connecting to database...');
        await dbConnect();
        console.log('[Workers API] Database connected');

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        let query: any = {};

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Search by name, phone, or workerId
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { workerId: { $regex: search, $options: 'i' } },
            ];
        }

        console.log('[Workers API] Query:', JSON.stringify(query));
        const workers = await WorkerModel.find(query)
            .populate('cooperativeId')
            .sort({ createdAt: -1 })
            .limit(100);

        console.log('[Workers API] Found', workers.length, 'workers');
        
        // Calculate earnings for each worker
        const SessionModel = (await import('@/models/Session')).default;
        const workersWithEarnings = await Promise.all(
            workers.map(async (worker) => {
                const workerObj = worker.toObject();
                const DEFAULT_HOURLY_RATE = workerObj.hourlyRate || 50;
                
                // Get all sessions for this worker
                const workerSessions = await SessionModel.find({ workerId: worker._id })
                    .select('startTime endTime status');
                
                let totalHours = 0;
                workerSessions.forEach((session: any) => {
                    if (session.endTime) {
                        const hours = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60 * 60);
                        totalHours += hours;
                    } else if (session.status === 'active') {
                        const hours = (Date.now() - new Date(session.startTime).getTime()) / (1000 * 60 * 60);
                        totalHours += hours;
                    }
                });
                
                const earnings = Math.round(totalHours * DEFAULT_HOURLY_RATE * 100) / 100;
                
                return {
                    ...workerObj,
                    earnings,
                    hourlyRate: DEFAULT_HOURLY_RATE
                };
            })
        );
        
        return NextResponse.json({ workers: workersWithEarnings });
    } catch (error) {
        console.error('[Workers API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST - Create new worker
export async function POST(request: NextRequest) {
    try {
        console.log('[Workers API] POST - Creating new worker');
        
        const currentUser = await getCurrentUser();
        if (!currentUser || !['supervisor', 'admin'].includes(currentUser.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();
        console.log('[Workers API] Request body received:', { ...body, photo: body.photo ? '[photo data]' : 'none' });

        // Validate required fields
        if (!body.cooperativeId) {
            return NextResponse.json(
                { error: 'Cooperative ID is required', details: 'Please select a cooperative' },
                { status: 400 }
            );
        }

        if (!body.fullName || !body.phone) {
            return NextResponse.json(
                { error: 'Missing required fields', details: 'Full name and phone are required' },
                { status: 400 }
            );
        }

        // Generate unique worker ID
        const workerId = generateWorkerId();
        console.log('[Workers API] Generated worker ID:', workerId);

        // Clean up empty string values for optional ObjectId fields
        const cleanedBody = { ...body };
        if (cleanedBody.facilityId === '' || cleanedBody.facilityId === null) {
            delete cleanedBody.facilityId;
        }

        const worker = await WorkerModel.create({
            ...cleanedBody,
            workerId,
            enrollmentDate: new Date(),
            consentTimestamp: new Date(),
        });

        console.log('[Workers API] Worker created successfully:', worker._id);
        return NextResponse.json({ worker }, { status: 201 });
    } catch (error) {
        console.error('[Workers API] Create worker error:', error);
        
        // Handle validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json(
                { 
                    error: 'Validation failed', 
                    details: error.message 
                },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
