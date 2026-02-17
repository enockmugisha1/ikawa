'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    Users, 
    Activity, 
    Package, 
    TrendingUp, 
    Clock, 
    UserPlus,
    Settings,
    RefreshCw,
    Info,
    Weight,
    Building2,
    DollarSign,
    BarChart3
} from 'lucide-react';

export default function SupervisorDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/analytics/supervisor');
            const data = await res.json();
            setAnalytics(data.analytics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
                    </div>
                    <p className="text-gray-600">
                        Welcome back! Here's today's overview
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid - High-Level Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                {/* Total Workers */}
                <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Total Workers</p>
                        <p className="mt-2 text-4xl font-bold text-gray-900">{analytics?.totalWorkers || 0}</p>
                        <p className="mt-2 text-sm text-emerald-600 font-medium">Active</p>
                    </div>
                </div>

                {/* Workers Checked In Today */}
                <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-emerald-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Checked In Today</p>
                        <p className="mt-2 text-4xl font-bold text-gray-900">{analytics?.workersCheckedInToday || 0}</p>
                        <p className="mt-2 text-sm text-gray-600">On-site now</p>
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-purple-600" />
                            </div>
                            {analytics?.activeSessions > 0 && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            )}
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Active Sessions</p>
                        <p className="mt-2 text-4xl font-bold text-gray-900">{analytics?.activeSessions || 0}</p>
                        <p className="mt-2 text-sm text-gray-600">Sorting now</p>
                    </div>
                </div>

                {/* Bags Processed Today */}
                <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-amber-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Bags Processed</p>
                        <p className="mt-2 text-4xl font-bold text-gray-900">{analytics?.bagsToday || 0}</p>
                        <p className="mt-2 text-sm text-gray-600">Today's output</p>
                    </div>
                </div>

                {/* Total Labor Costs Today */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-emerald-900 text-sm font-medium">Labor Costs Today</p>
                        <p className="mt-2 text-4xl font-bold text-emerald-900">
                            ${analytics?.totalLaborCostsToday?.toLocaleString() || 0}
                        </p>
                        <p className="mt-2 text-sm text-emerald-700 font-medium">
                            {analytics?.totalHoursWorked || 0} hrs worked
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trend */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Attendance Trend</h3>
                            <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-sm">Loading chart...</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={analytics?.trends?.attendance || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        color: '#111827'
                                    }}
                                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                                    itemStyle={{ color: '#374151' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="workers" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Bags Processed Trend */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Bags Processed</h3>
                            <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-sm">Loading chart...</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics?.trends?.bags || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        color: '#111827'
                                    }}
                                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                                    itemStyle={{ color: '#374151' }}
                                />
                                <Bar 
                                    dataKey="bags" 
                                    fill="#8b5cf6" 
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-600" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                        href="/supervisor/operations"
                        className="group p-5 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all hover:shadow-md"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                <Settings className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 group-hover:text-emerald-700">
                                    Daily Operations
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Check-in & Assign</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href="/supervisor/onboarding"
                        className="group p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all hover:shadow-md"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <UserPlus className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 group-hover:text-blue-700">
                                    Onboard Worker
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Register new worker</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href="/supervisor/workers"
                        className="group p-5 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all hover:shadow-md"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 group-hover:text-purple-700">
                                    View Workers
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Worker directory</p>
                            </div>
                        </div>
                    </a>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="group p-5 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all hover:shadow-md disabled:opacity-50"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-gray-900">Refresh Stats</p>
                                <p className="text-sm text-gray-500 mt-1">Update dashboard</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-3 text-lg">
                            Daily Workflow Guide
                        </h3>
                        <ol className="space-y-2">
                            <li className="flex items-start gap-3">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                                <span className="text-blue-800 flex-1">Check-in workers as they arrive at the facility</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                                <span className="text-blue-800 flex-1">Assign checked-in workers to exporters for sorting sessions</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                                <span className="text-blue-800 flex-1">Record completed bags (select 2-4 workers per bag)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                                <span className="text-blue-800 flex-1">Check-out workers when their shift is complete</span>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
