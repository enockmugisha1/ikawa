import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExporterModel from '@/models/Exporter';
import { getCurrentUser } from '@/lib/auth';

// GET - List all exporters
export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Exporter users can only see their own data
        let query: any = { isActive: true };
        if (currentUser.role === 'exporter' && currentUser.exporterId) {
            query._id = currentUser.exporterId;
        }

        const exporters = await ExporterModel.find(query).sort({ companyTradingName: 1 });

        return NextResponse.json({ exporters });
    } catch (error) {
        console.error('Get exporters error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create exporter (Admin only)
export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        const exporter = await ExporterModel.create(body);

        return NextResponse.json({ exporter }, { status: 201 });
    } catch (error) {
        console.error('Create exporter error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
