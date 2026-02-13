import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CooperativeModel from '@/models/Cooperative';
import { getCurrentUser } from '@/lib/auth';

// GET - List all cooperatives
export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const cooperatives = await CooperativeModel.find({ isActive: true })
            .sort({ name: 1 })
            .select('_id name code');

        return NextResponse.json({ cooperatives });
    } catch (error) {
        console.error('[Cooperatives API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
