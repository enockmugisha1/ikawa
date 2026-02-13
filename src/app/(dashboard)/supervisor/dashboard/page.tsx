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
    Info
} from 'lucide-react';

export default function SupervisorDashboard() {
    const [stats, setStats] = useState({
        attendance: 0,
        activeSessions: 0,
        bagsToday: 0,
    });
    const [attendanceTrend, setAttendanceTrend] = useState<any[]>([]);
    const [bagsTrend, setBagsTrend] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchTrends();
    }, []);

    const fetchStats = async () => {
        try {
            const [attendanceRes, sessionsRes, bagsRes] = await Promise.all([
                fetch('/api/attendance/checkin'),
                fetch('/api/sessions'),
                fetch('/api/bags?date=' + new Date().toISOString().split('T')[0]),
            ]);

            const attendanceData = await attendanceRes.json();
            const sessionsData = await sessionsRes.json();
            const bagsData = await bagsRes.json();

            setStats({
                attendance: attendanceData.attendance?.length || 0,
                activeSessions: sessionsData.sessions?.length || 0,
                bagsToday: bagsData.bags?.length || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return date.toISOString().split('T')[0];
            });

            const attendanceData = last7Days.map((date, index) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                workers: Math.floor(Math.random() * 20) + 10,
            }));

            const bagsData = last7Days.map((date, index) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                bags: Math.floor(Math.random() * 30) + 10,
            }));

            setAttendanceTrend(attendanceData);
            setBagsTrend(bagsData);
        } catch (error) {
            console.error('Error fetching trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchStats(), fetchTrends()]);
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-xl p-6 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-emerald-100" />
                        </div>
                        <p className="text-emerald-100 text-sm font-medium">Today's Attendance</p>
                        <p className="mt-2 text-4xl font-bold">{stats.attendance}</p>
                        <p className="mt-2 text-sm text-emerald-100">Workers checked in</p>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl p-6 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <Clock className="w-5 h-5 text-blue-100" />
                        </div>
                        <p className="text-blue-100 text-sm font-medium">Active Sessions</p>
                        <p className="mt-2 text-4xl font-bold">{stats.activeSessions}</p>
                        <p className="mt-2 text-sm text-blue-100">Workers sorting now</p>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-xl p-6 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-purple-100" />
                        </div>
                        <p className="text-purple-100 text-sm font-medium">Bags Processed</p>
                        <p className="mt-2 text-4xl font-bold">{stats.bagsToday}</p>
                        <p className="mt-2 text-sm text-purple-100">Today's output</p>
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
                            <LineChart data={attendanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }} 
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
                            <BarChart data={bagsTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }} 
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
