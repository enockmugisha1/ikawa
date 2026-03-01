'use client';

import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Mail, KeyRound, Lock } from 'lucide-react';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Reset code sent to your email!');
            setStep('otp');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Code verified!');
            setStep('password');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Password reset successfully!');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const stepConfig = {
        email: { icon: Mail, title: 'Forgot Password', subtitle: 'Enter your email to receive a reset code' },
        otp: { icon: KeyRound, title: 'Enter Reset Code', subtitle: `We sent a 6-digit code to ${email}` },
        password: { icon: Lock, title: 'Set New Password', subtitle: 'Choose a strong new password' },
    };

    const { icon: StepIcon, title, subtitle } = stepConfig[step];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <Toaster position="top-right" />
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
                            <StepIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                        <p className="text-gray-600 text-sm">{subtitle}</p>
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {(['email', 'otp', 'password'] as Step[]).map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                    step === s ? 'bg-emerald-600 text-white' :
                                    (['email', 'otp', 'password'].indexOf(step) > i) ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-gray-100 text-gray-400'
                                }`}>
                                    {i + 1}
                                </div>
                                {i < 2 && <div className={`w-8 h-0.5 ${(['email', 'otp', 'password'].indexOf(step) > i) ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleRequestOtp} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all">
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900 text-center text-2xl tracking-[0.5em] font-mono"
                                    placeholder="000000"
                                />
                            </div>
                            <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all">
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button type="button" onClick={() => { setOtp(''); handleRequestOtp({ preventDefault: () => {} } as React.FormEvent); }} className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                                Resend Code
                            </button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 'password' && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none bg-white text-gray-900"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Back to login */}
                    <div className="mt-6 text-center">
                        <a href="/login" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
