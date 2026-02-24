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
    DollarSign,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { ExportButton } from '@/components/export/ExportButton';
import { ExportData } from '@/lib/export';

export default function ExporterDashboard() {
    const [bags, setBags] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporterInfo, setExporterInfo] = useState({ name: 'Exporter', code: 'EXP' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

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
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 dark:from-blue-600 dark:via-indigo-700 dark:to-blue-800 rounded-2xl p-8 shadow-xl shadow-blue-500/30">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-300/20 rounded-full blur-3xl"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Exporter Dashboard</h1>
                        </div>
                        <p className="text-white/90 text-base sm:text-lg ml-15">
                            Coffee export operations &amp; performance overview
                        </p>
                        <p className="text-white/70 text-sm mt-1 ml-15 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <ExportButton data={getExportData()} label="Export Data" />
                        <button
                            onClick={fetchData}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 font-medium transition-all shadow-lg"
                        >
                            <Clock className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Bags</p>
                    <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{analytics?.totalBags || 0}</p>
                    <p className="mt-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">All time processed</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Workers Engaged</p>
                    <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{analytics?.workersEngaged || 0}</p>
                    <p className="mt-2 text-xs sm:text-sm text-purple-600 dark:text-purple-400">Unique workers</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-700 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow">
                            <Weight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Weight</p>
                    <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{analytics?.totalWeight?.toLocaleString() || 0}</p>
                    <p className="mt-2 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">kg processed</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 rounded-xl shadow-lg border border-orange-200 dark:border-orange-700 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-orange-700 dark:text-orange-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Daily Average</p>
                    <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{analytics?.avgBagsPerDay?.toFixed(1) || 0}</p>
                    <p className="mt-2 text-xs sm:text-sm text-orange-600 dark:text-orange-400">bags per day</p>
                </div>
            </div>

            {/* Financial Metrics */}
            {analytics && analytics.ratePerBag > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl shadow-lg border border-green-200 dark:border-green-700 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Cost Today</p>
                        <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                            FRw {analytics.costToday?.toLocaleString() || 0}
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-green-600 dark:text-green-400">{analytics.bagsToday || 0} bags @ FRw {analytics.ratePerBag}/bag</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Cost This Month</p>
                        <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                            FRw {analytics.costThisMonth?.toLocaleString() || 0}
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">{analytics.bagsThisMonth || 0} bags processed</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700 p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <BarChart3 className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Cost</p>
                        <p className="mt-1 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                            FRw {analytics.totalCost?.toLocaleString() || 0}
                        </p>
                        <p className="mt-2 text-xs sm:text-sm text-purple-600 dark:text-purple-400">All time charges</p>
                    </div>
                </div>
            )}

            {/* Period Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Performance Overview</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Bags processed across different periods</p>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">Today</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics?.bagsToday || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                                <span>Bags processed</span>
                                <span className="font-semibold">{analytics?.bagsToday > 0 ? '✓ Active' : '• Pending'}</span>
                            </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wide">This Week</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics?.bagsThisWeek || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400">
                                <span>Last 7 days</span>
                                <span className="font-semibold">{((analytics?.bagsThisWeek || 0) / 7).toFixed(1)} avg/day</span>
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wide">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics?.bagsThisMonth || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                                <span>Monthly total</span>
                                <span className="font-semibold">{(((analytics?.bagsThisMonth || 0) / new Date().getDate()) * 30).toFixed(0)} projected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bags */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Bags</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Latest processed bags</p>
                    </div>
                    {bags.length > 0 && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                            {bags.length.toLocaleString()} total bags
                        </span>
                    )}
                </div>
                <div className="p-4 sm:p-6">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p>Loading data...</p>
                        </div>
                    ) : bags.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <p className="font-medium">No bags processed yet</p>
                            <p className="text-sm mt-1">Bag records will appear here once processing begins</p>
                        </div>
                    ) : (() => {
                        const totalPages = Math.ceil(bags.length / ITEMS_PER_PAGE);
                        const pageBags = bags.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                        return (
                            <>
                                <div className="space-y-3">
                                    {pageBags.map((bag, idx) => (
                                        <div key={bag._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all gap-3 sm:gap-0 bg-white dark:bg-gray-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{bag.bagNumber}</p>
                                                        <span className="text-xs text-gray-400 dark:text-gray-500"># {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(bag.date).toLocaleDateString()}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {bag.workers.length} worker{bag.workers.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <div className="text-left sm:text-right">
                                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{bag.weight} kg</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{bag.status}</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    bag.status === 'completed'
                                                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                                                }`}>
                                                    {bag.status === 'completed' ? '✓ Complete' : '⏳ Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(currentPage * ITEMS_PER_PAGE, bags.length)}</span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{bags.length.toLocaleString()}</span> bags
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                                className="px-2 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                title="First page"
                                            >
                                                «
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" /> Prev
                                            </button>

                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                                                const page = start + i;
                                                return page <= totalPages ? (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                                            currentPage === page
                                                                ? 'bg-blue-600 text-white shadow'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ) : null;
                                            })}

                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next <ChevronRight className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="px-2 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                title="Last page"
                                            >
                                                »
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Read-Only Access</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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
