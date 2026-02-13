import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserModel from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, password, name, phone, role, exporterId, facilityId } = body;

        // Validate required fields
        if (!email || !password || !name || !phone || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await UserModel.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            phone,
            role,
            exporterId: exporterId || undefined,
            facilityId: facilityId || undefined,
            isActive: true,
        });

        // Generate JWT token for auto-login
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            exporterId: user.exporterId?.toString(),
            facilityId: user.facilityId?.toString(),
        });

        // Determine redirect based on role
        const dashboardUrl =
            user.role === 'supervisor'
                ? '/supervisor/dashboard'
                : user.role === 'admin'
                    ? '/admin/dashboard'
                    : '/exporter/dashboard';

        console.log('[Register] Setting cookie for new user:', user.email, 'role:', user.role);

        // Set authentication cookie using Next.js cookies API
        const { cookies } = require('next/headers');
        const cookieStore = await cookies();

        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        console.log('[Register] ✓ Cookie set successfully');

        // Create response with cookie header
        const response = NextResponse.json(
            {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    phone: user.phone,
                },
                redirectUrl: dashboardUrl,
            },
            { status: 201 }
        );

        // Also set cookie via response header for immediate availability
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
