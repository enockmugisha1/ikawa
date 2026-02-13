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
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalWorkers: 0,
        totalExporters: 0,
        bagsToday: 0,
        activeWorkers: 0,
        sessionsToday: 0,
        totalBags: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [workersRes, exportersRes, bagsTodayRes, attendanceRes, sessionsRes, allBagsRes] = await Promise.all([
                fetch('/api/workers'),
                fetch('/api/exporters'),
                fetch(`/api/bags?date=${today}`),
                fetch('/api/attendance/checkin'),
                fetch('/api/sessions'),
                fetch('/api/bags'),
            ]);

            const workersData = await workersRes.json();
            const exportersData = await exportersRes.json();
            const bagsTodayData = await bagsTodayRes.json();
            const attendanceData = await attendanceRes.json();
            const sessionsData = await sessionsRes.json();
            const allBagsData = await allBagsRes.json();

            setStats({
                totalWorkers: workersData.workers?.length || 0,
                totalExporters: exportersData.exporters?.length || 0,
                bagsToday: bagsTodayData.bags?.length || 0,
                activeWorkers: attendanceData.attendance?.filter((a: any) => a.status === 'on-site').length || 0,
                sessionsToday: sessionsData.sessions?.length || 0,
                totalBags: allBagsData.bags?.length || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
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
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Today's Operations</h2>
                        <p className="text-emerald-100 flex items-center gap-2 text-xs sm:text-sm">
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
                    <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-200 opacity-50" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <p className="text-emerald-100 text-xs sm:text-sm font-medium">Workers On-Site</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">{stats.activeWorkers}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <p className="text-emerald-100 text-xs sm:text-sm font-medium">Active Sessions</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">{stats.sessionsToday}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <p className="text-emerald-100 text-xs sm:text-sm font-medium">Bags Processed</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">{stats.bagsToday}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <p className="text-emerald-100 text-xs sm:text-sm font-medium">Exporters Active</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-1 sm:mt-2">
                            {Math.min(stats.totalExporters, stats.sessionsToday > 0 ? stats.totalExporters : 0)}
                        </p>
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
                                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkers}</p>
                                <p className="text-xs text-blue-600 mt-1">Registered in system</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Exporters</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalExporters}</p>
                                <p className="text-xs text-purple-600 mt-1">Active in platform</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Bags</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalBags}</p>
                                <p className="text-xs text-emerald-600 mt-1">60kg bags processed</p>
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
