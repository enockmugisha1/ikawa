'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, Phone, Calendar, User, Filter, X, ChevronDown, Search, Clock, Package, DollarSign, Award, TrendingUp, Eye } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';

interface Worker {
    _id: string;
    workerId: string;
    fullName: string;
    phone: string;
    gender: string;
    status: string;
    enrollmentDate: string;
    earnings?: number;
    hourlyRate?: number;
}

interface WorkerStats {
    totalActiveWorkers: number;
    totalInactiveWorkers: number;
    totalLaborCosts: number;
    avgHoursPerWorker: number;
    topPerformer: {
        name: string;
        bagsProcessed: number;
    } | null;
}

interface WorkerDetails {
    totalHours: number;
    totalBags: number;
    earnings: number;
    daysWorkedThisMonth: number;
}

interface FilterParams {
    search?: string;
    status?: string;
    gender?: string;
    dateFrom?: string;
    dateTo?: string;
    week?: string;
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [workerStats, setWorkerStats] = useState<WorkerStats | null>(null);
    const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
    const [workerDetails, setWorkerDetails] = useState<WorkerDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    const [filters, setFilters] = useState<FilterParams>({
        search: '',
        status: 'all',
        gender: 'all',
        dateFrom: '',
        dateTo: '',
        week: ''
    });

    useEffect(() => {
        fetchWorkers();
        fetchWorkerStats();
    }, [filters]);

    const fetchWorkers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            if (filters.search) params.append('search', filters.search);
            if (filters.status && filters.status !== 'all') params.append('status', filters.status);
            if (filters.gender && filters.gender !== 'all') params.append('gender', filters.gender);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);
            if (filters.week) params.append('week', filters.week);
            
            const queryString = params.toString();
            const url = `/api/workers${queryString ? `?${queryString}` : ''}`;
            
            const res = await fetch(url);
            const data = await res.json();
            setWorkers(data.workers || []);
        } catch (error) {
            console.error('Error fetching workers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkerStats = async () => {
        try {
            const res = await fetch('/api/workers/stats');
            const data = await res.json();
            setWorkerStats(data.stats);
        } catch (error) {
            console.error('Error fetching worker stats:', error);
        }
    };

    const handleUpdateHourlyRate = async (workerId: string, hourlyRate: number) => {
        try {
            const res = await fetch(`/api/workers/${workerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hourlyRate }),
            });

            if (!res.ok) throw new Error('Update failed');
            
            // Refresh workers list
            fetchWorkers();
        } catch (error) {
            console.error('Error updating hourly rate:', error);
        }
    };

    const fetchWorkerDetails = async (workerId: string) => {
        setLoadingDetails(true);
        try {
            const res = await fetch(`/api/workers/${workerId}/details`);
            const data = await res.json();
            setWorkerDetails(data.details);
            setSelectedWorker(workerId);
        } catch (error) {
            console.error('Error fetching worker details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleFilterChange = (key: keyof FilterParams, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            gender: 'all',
            dateFrom: '',
            dateTo: '',
            week: ''
        });
    };

    const getWeekOptions = () => {
        const weeks = [];
        const today = new Date();
        
        for (let i = 0; i < 12; i++) {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - (today.getDay() || 7) - (i * 7));
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            const startStr = weekStart.toISOString().split('T')[0];
            const endStr = weekEnd.toISOString().split('T')[0];
            
            weeks.push({
                value: `${startStr}_${endStr}`,
                label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            });
        }
        
        return weeks;
    };

    const hasActiveFilters = () => {
        return filters.search !== '' || 
               (filters.status !== 'all' && filters.status !== '') ||
               (filters.gender !== 'all' && filters.gender !== '') ||
               filters.dateFrom !== '' ||
               filters.dateTo !== '' ||
               filters.week !== '';
    };

    const columns: Column<Worker>[] = [
        {
            key: 'fullName',
            label: 'Name',
            sortable: true,
            render: (worker) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {worker.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{worker.fullName}</div>
                        <div className="text-xs text-gray-500">{worker.workerId}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Phone',
            sortable: true,
            render: (worker) => (
                <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {worker.phone}
                </div>
            )
        },
        {
            key: 'gender',
            label: 'Gender',
            sortable: true,
            render: (worker) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{worker.gender}</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (worker) => (
                <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${worker.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-800'
                    }
                `}>
                    {worker.status === 'active' && (
                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-1.5" />
                    )}
                    {worker.status}
                </span>
            )
        },
        {
            key: 'earnings',
            label: 'Total Earnings',
            sortable: true,
            render: (worker) => (
                <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">
                        FRw {worker.earnings?.toLocaleString() || 0}
                    </span>
                </div>
            )
        },
        {
            key: 'hourlyRate',
            label: 'Hourly Rate',
            sortable: true,
            render: (worker) => (
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={worker.hourlyRate || 50}
                        onChange={(e) => handleUpdateHourlyRate(worker._id, parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        min="0"
                        step="10"
                    />
                    <span className="text-xs text-gray-500">FRw/hr</span>
                </div>
            )
        },
        {
            key: 'enrollmentDate',
            label: 'Enrolled Date',
            sortable: true,
            render: (worker) => (
                <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(worker.enrollmentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (worker) => (
                <button
                    onClick={() => fetchWorkerDetails(worker._id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 dark:from-emerald-600 dark:via-teal-700 dark:to-emerald-800 rounded-2xl p-8 shadow-xl shadow-emerald-500/30">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>
                
                {/* Decorative gradient circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-300/20 rounded-full blur-3xl"></div>
                
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Workers Directory</h1>
                        </div>
                        <p className="text-white/90 text-lg ml-15">
                            Manage and view all registered workers ({workers.length} total)
                        </p>
                    </div>
                    <a
                        href="/supervisor/onboarding"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 font-medium transition-all shadow-lg"
                    >
                        <UserPlus className="w-5 h-5" />
                        Onboard Worker
                    </a>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Filters</span>
                        {hasActiveFilters() && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                Active
                            </span>
                        )}
                    </div>
                    <ChevronDown 
                        className={`w-5 h-5 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Filter Controls */}
                {showFilters && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {/* Search */}
                            <div className="lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or worker ID..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    value={filters.gender}
                                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                                >
                                    <option value="all">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Week Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Week
                                </label>
                                <select
                                    value={filters.week}
                                    onChange={(e) => handleFilterChange('week', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                                >
                                    <option value="">All Weeks</option>
                                    {getWeekOptions().map(week => (
                                        <option key={week.value} value={week.value}>
                                            {week.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date From */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date From
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            {/* Date To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date To
                                </label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {hasActiveFilters() && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Cards - Worker Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Active Workers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {workerStats?.totalActiveWorkers || workers.filter(w => w.status === 'active').length}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Inactive Workers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {workerStats?.totalInactiveWorkers || workers.filter(w => w.status !== 'active').length}
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Total Labor Costs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        FRw {workerStats?.totalLaborCosts?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Avg Hours/Worker</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {workerStats?.avgHoursPerWorker?.toFixed(1) || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Per worker</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <p className="text-sm text-amber-900 font-medium">Top Performer</p>
                    <p className="text-2xl font-bold text-amber-900 mt-1 truncate">
                        {workerStats?.topPerformer?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                        {workerStats?.topPerformer?.bagsProcessed || 0} bags
                    </p>
                </div>
            </div>

            {/* Workers Table */}
            <DataTable
                data={workers}
                columns={columns}
                keyExtractor={(worker) => worker._id}
                searchable={true}
                searchKeys={['fullName', 'workerId', 'phone']}
                pageSize={25}
                loading={loading}
                emptyMessage="No workers found. Click 'Onboard Worker' to register your first worker."
            />

            {/* Worker Details Modal */}
            {selectedWorker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedWorker(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Worker Details</h2>
                            <button
                                onClick={() => setSelectedWorker(null)}
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : workerDetails ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-blue-900">Total Hours Worked</p>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-900">{workerDetails.totalHours.toFixed(1)}</p>
                                    <p className="text-sm text-blue-700 mt-1">Hours</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                            <Package className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-purple-900">Total Bags Processed</p>
                                    </div>
                                    <p className="text-3xl font-bold text-purple-900">{workerDetails.totalBags}</p>
                                    <p className="text-sm text-purple-700 mt-1">Bags</p>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-emerald-900">Earnings to Date</p>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-900">FRw {workerDetails.earnings.toLocaleString()}</p>
                                    <p className="text-sm text-emerald-700 mt-1">Total Earned</p>
                                </div>

                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-sm font-medium text-amber-900">Days Worked This Month</p>
                                    </div>
                                    <p className="text-3xl font-bold text-amber-900">{workerDetails.daysWorkedThisMonth}</p>
                                    <p className="text-sm text-amber-700 mt-1">Days</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No details available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
