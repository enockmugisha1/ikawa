import { ReactNode } from 'react';

export const metadata = {
    title: 'Login - CWMS',
    description: 'Login to Casual Worker Management System',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
