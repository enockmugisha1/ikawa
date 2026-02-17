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
    AlertCircle,
    DollarSign
} from 'lucide-react';
import { ExportButton } from '@/components/export/ExportButton';
import { ExportData } from '@/lib/export';

export default function ExporterDashboard() {
    const [bags, setBags] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporterInfo, setExporterInfo] = useState({ name: 'Exporter', code: 'EXP' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bagsRes, analyticsRes] = await Promise.all([
                fetch('/api/bags'),
                fetch('/api/analytics/exporter'),
            ]);

            const bagsData = await bagsRes.json();
            const analyticsData = await analyticsRes.json();
            
            const myBags = bagsData.bags || [];
            setBags(myBags);
            setAnalytics(analyticsData.analytics);
            
            // Get exporter info from first bag or use defaults
            if (myBags.length > 0 && myBags[0].exporterId) {
                setExporterInfo({
                    name: myBags[0].exporterId.companyTradingName || 'Exporter',
                    code: myBags[0].exporterId.exporterCode || 'EXP'
                });
            }
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
                totalBags: analytics?.totalBags || 0,
                totalWeight: analytics?.totalWeight || 0,
                totalWorkers: analytics?.workersEngaged || 0,
                averageWeight: analytics?.totalBags > 0 ? analytics.totalWeight / analytics.totalBags : 0
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
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Package className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm font-medium">Total Bags</p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">{analytics?.totalBags || 0}</p>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">All time processed</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm font-medium">Workers Engaged</p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">{analytics?.workersEngaged || 0}</p>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">Unique workers</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Weight className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm font-medium">Total Weight</p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">{analytics?.totalWeight?.toLocaleString() || 0}</p>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">kg processed</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-gray-700 text-xs sm:text-sm font-medium">Daily Average</p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">{analytics?.avgBagsPerDay?.toFixed(1) || 0}</p>
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">bags per day</p>
                </div>
            </div>

            {/* Financial Metrics */}
            {analytics && analytics.ratePerBag > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm font-medium">Cost Today</p>
                        <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                            ${analytics.costToday?.toLocaleString() || 0}
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-gray-600">{analytics.bagsToday || 0} bags @ ${analytics.ratePerBag}/bag</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm font-medium">Cost This Month</p>
                        <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                            ${analytics.costThisMonth?.toLocaleString() || 0}
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-gray-600">{analytics.bagsThisMonth || 0} bags processed</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm font-medium">Total Cost</p>
                        <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
                            ${analytics.totalCost?.toLocaleString() || 0}
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-gray-600">All time charges</p>
                    </div>
                </div>
            )}

            {/* Period Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Performance Overview</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Bags processed across different periods</p>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Today</p>
                                    <p className="text-2xl font-bold text-gray-900">{analytics?.bagsToday || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-blue-600">
                                <span>Bags processed</span>
                                <span className="font-semibold">{analytics?.bagsToday > 0 ? '✓ Active' : '• Pending'}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">This Week</p>
                                    <p className="text-2xl font-bold text-gray-900">{analytics?.bagsThisWeek || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-purple-600">
                                <span>Last 7 days</span>
                                <span className="font-semibold">{((analytics?.bagsThisWeek || 0) / 7).toFixed(1)} avg/day</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-emerald-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">{analytics?.bagsThisMonth || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-emerald-600">
                                <span>Monthly total</span>
                                <span className="font-semibold">{(((analytics?.bagsThisMonth || 0) / new Date().getDate()) * 30).toFixed(0)} projected</span>
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
