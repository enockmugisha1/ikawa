'use client';

import { useEffect, useState } from 'react';
import { 
    FileText, 
    TrendingUp, 
    Users, 
    Package, 
    Activity,
    Calendar,
    Building2,
    ArrowRight,
    Clock,
    DollarSign,
    Weight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics/admin');
            const data = await res.json();
            setAnalytics(data.analytics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Comprehensive Reports',
            description: 'Per exporter, worker, and facility reports',
            icon: FileText,
            href: '/admin/reports',
            color: 'emerald',
        },
        {
            title: 'Worker Management',
            description: 'View, edit, and manage worker records',
            icon: Users,
            href: '/admin/workers',
            color: 'blue',
        },
        {
            title: 'Exporter Management',
            description: 'Configure exporters and sorting rates',
            icon: Building2,
            href: '/admin/exporters',
            color: 'purple',
        },
        {
            title: 'Daily Validation',
            description: 'Review and validate today\'s operations',
            icon: Activity,
            href: '/admin/validation',
            color: 'orange',
        },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                    System-wide overview and operational management
                </p>
            </div>

            {/* Today's Operations */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">Today's Operations</h2>
                        <p className="text-gray-600 flex items-center gap-2 text-xs sm:text-sm">
                            <Calendar className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </span>
                            <span className="sm:hidden">
                                {new Date().toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </p>
                    </div>
                    <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-600 opacity-50" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
                        <p className="text-gray-700 text-xs sm:text-sm font-medium">Workers On-Site</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2 text-gray-900">{analytics?.workersCheckedInToday || 0}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                        <p className="text-gray-700 text-xs sm:text-sm font-medium">Active Sessions</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2 text-gray-900">{analytics?.activeSessions || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                        <p className="text-gray-700 text-xs sm:text-sm font-medium">Bags Processed</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2 text-gray-900">{analytics?.bagsToday || 0}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                        <p className="text-gray-700 text-xs sm:text-sm font-medium">Exporters Active</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2 text-gray-900">{analytics?.exportersServedToday || 0}</p>
                    </div>
                </div>
            </div>

            {/* System Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">System Overview</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Complete platform statistics</p>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Workers</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics?.totalWorkers || 0}</p>
                                <p className="text-xs text-blue-600 mt-1">({analytics?.activeWorkers || 0} active)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Exporters</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics?.totalExporters || 0}</p>
                                <p className="text-xs text-purple-600 mt-1">({analytics?.activeExporters || 0} active)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Bags</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics?.totalBags?.toLocaleString() || 0}</p>
                                <p className="text-xs text-emerald-600 mt-1">{analytics?.totalKilograms?.toLocaleString() || 0} kg total</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                <Weight className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Today's Weight</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics?.totalKilogramsToday?.toLocaleString() || 0}</p>
                                <p className="text-xs text-orange-600 mt-1">kg processed</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{analytics?.totalHoursWorked || 0}</p>
                                <p className="text-xs text-indigo-600 mt-1">worked today</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Today's Costs</p>
                                <p className="text-2xl font-bold text-gray-900">${analytics?.totalCostsToday?.toLocaleString() || 0}</p>
                                <p className="text-xs text-green-600 mt-1">total charges</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Navigate to key admin functions</p>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="group relative overflow-hidden rounded-lg border-2 border-gray-200 p-4 sm:p-6 hover:border-gray-300 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                                                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${action.color}-600`} />
                                                </div>
                                                <h4 className="font-semibold text-sm sm:text-base text-gray-900">{action.title}</h4>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 mb-4">{action.description}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Key Principles */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Operational Excellence
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>Exporter attribution is explicit - Full traceability</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>Work measured by bags (60kg), not time alone</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>One cooperative, many exporters, one truth source</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>Attendance supports work - Immutable audit trail</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
