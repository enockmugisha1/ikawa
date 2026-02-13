'use client';

import { useEffect, useState } from 'react';
import { 
    Package, 
    Users, 
    TrendingUp, 
    Calendar,
    Weight,
    Clock,
    BarChart3,
    AlertCircle
} from 'lucide-react';
import { ExportButton } from '@/components/export/ExportButton';
import { ExportData } from '@/lib/export';

export default function ExporterDashboard() {
    const [bags, setBags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporterInfo, setExporterInfo] = useState({ name: 'Exporter', code: 'EXP' });
    const [stats, setStats] = useState({
        totalBags: 0,
        workersEngaged: 0,
        totalWeight: 0,
        bagsToday: 0,
        bagsThisWeek: 0,
        bagsThisMonth: 0,
        avgBagsPerDay: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/bags');
            const data = await res.json();
            const myBags = data.bags || [];

            setBags(myBags);
            
            // Get exporter info from first bag or use defaults
            if (myBags.length > 0 && myBags[0].exporterId) {
                setExporterInfo({
                    name: myBags[0].exporterId.name || 'Exporter',
                    code: myBags[0].exporterId.exporterCode || 'EXP'
                });
            }

            const uniqueWorkers = new Set();
            myBags.forEach((bag: any) => {
                bag.workers.forEach((w: any) => uniqueWorkers.add(w.workerId._id));
            });

            const totalWeight = myBags.reduce((sum: number, bag: any) => sum + (bag.weight || 60), 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const bagsToday = myBags.filter((bag: any) => {
                const bagDate = new Date(bag.date);
                bagDate.setHours(0, 0, 0, 0);
                return bagDate.getTime() === today.getTime();
            }).length;

            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            const bagsThisWeek = myBags.filter((bag: any) => 
                new Date(bag.date) >= weekAgo
            ).length;

            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const bagsThisMonth = myBags.filter((bag: any) => 
                new Date(bag.date) >= monthStart
            ).length;

            const oldestBag = myBags.length > 0 
                ? new Date(Math.min(...myBags.map((b: any) => new Date(b.date).getTime())))
                : today;
            const daysSinceStart = Math.max(1, Math.ceil((today.getTime() - oldestBag.getTime()) / (1000 * 60 * 60 * 24)));
            const avgBagsPerDay = myBags.length / daysSinceStart;

            setStats({
                totalBags: myBags.length,
                workersEngaged: uniqueWorkers.size,
                totalWeight,
                bagsToday,
                bagsThisWeek,
                bagsThisMonth,
                avgBagsPerDay,
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getExportData = (): ExportData => {
        const exportBags = bags.slice(0, 100).map(bag => ({
            bagNumber: bag.bagNumber,
            weight: bag.weight || 60,
            date: new Date(bag.date),
            worker: bag.workers[0]?.workerId?.name || 'Unknown'
        }));

        return {
            exporterName: exporterInfo.name,
            exporterCode: exporterInfo.code,
            bags: exportBags,
            summary: {
                totalBags: stats.totalBags,
                totalWeight: stats.totalWeight,
                totalWorkers: stats.workersEngaged,
                averageWeight: stats.totalBags > 0 ? stats.totalWeight / stats.totalBags : 0
            }
        };
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Exporter Dashboard</h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <ExportButton data={getExportData()} label="Export Data" />
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-100 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                    >
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                        <Package className="w-8 h-8 sm:w-10 sm:h-10 text-blue-100" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Bags</p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold">{stats.totalBags}</p>
                    <p className="mt-2 text-xs sm:text-sm text-blue-100">All time processed</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-100" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className="text-purple-100 text-xs sm:text-sm font-medium">Workers Engaged</p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold">{stats.workersEngaged}</p>
                    <p className="mt-2 text-xs sm:text-sm text-purple-100">Unique workers</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                        <Weight className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-100" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className="text-emerald-100 text-xs sm:text-sm font-medium">Total Weight</p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold">{stats.totalWeight.toLocaleString()}</p>
                    <p className="mt-2 text-xs sm:text-sm text-emerald-100">kg processed</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-3">
                        <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-100" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    <p className="text-orange-100 text-xs sm:text-sm font-medium">Daily Average</p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold">{stats.avgBagsPerDay.toFixed(1)}</p>
                    <p className="mt-2 text-xs sm:text-sm text-orange-100">bags per day</p>
                </div>
            </div>

            {/* Period Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Performance Overview</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Bags processed across different periods</p>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Today</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.bagsToday}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-blue-600">
                                <span>Bags processed</span>
                                <span className="font-semibold">{stats.bagsToday > 0 ? '✓ Active' : '• Pending'}</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">This Week</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.bagsThisWeek}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-purple-600">
                                <span>Last 7 days</span>
                                <span className="font-semibold">{(stats.bagsThisWeek / 7).toFixed(1)} avg/day</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.bagsThisMonth}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-emerald-600">
                                <span>Monthly total</span>
                                <span className="font-semibold">{((stats.bagsThisMonth / new Date().getDate()) * 30).toFixed(0)} projected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Bags</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Latest processed bags</p>
                    </div>
                    {bags.length > 10 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Showing 10 of {bags.length}
                        </span>
                    )}
                </div>
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p>Loading data...</p>
                        </div>
                    ) : bags.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">No bags processed yet</p>
                            <p className="text-sm mt-1">Bag records will appear here once processing begins</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bags.slice(0, 10).map((bag) => (
                                <div key={bag._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all gap-3 sm:gap-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{bag.bagNumber}</p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(bag.date).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {bag.workers.length} workers
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-4">
                                        <div className="text-left sm:text-right">
                                            <p className="font-bold text-gray-900 text-lg">{bag.weight} kg</p>
                                            <p className="text-xs text-gray-500 capitalize">{bag.status}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            bag.status === 'completed' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {bag.status === 'completed' ? '✓ Complete' : '⏳ Pending'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-2">Read-Only Access</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            You have view-only access to your processing data. You cannot modify attendance,
                            worker assignments, or bag records. For any data corrections or updates,
                            please contact the system administrator.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
