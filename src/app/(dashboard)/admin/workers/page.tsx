'use client';

import { useEffect, useState } from 'react';
import { Users, RefreshCw, X, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Worker {
    _id: string;
    workerId: string;
    fullName: string;
    gender: string;
    phone: string;
    email?: string;
    primaryRole: string;
    status: string;
    cooperativeId: {
        _id: string;
        name: string;
    };
    enrollmentDate: string;
}

interface Cooperative {
    _id: string;
    name: string;
    code: string;
}

const emptyNewWorker = {
    fullName: '',
    workerId: '',
    gender: 'male',
    phone: '',
    email: '',
    primaryRole: 'Coffee Sorter',
    cooperativeId: '',
    consentWorkRecords: false,
};

export default function AdminWorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<any>({});

    // New worker registration state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newWorker, setNewWorker] = useState(emptyNewWorker);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchWorkers();
        fetchCooperatives();
    }, []);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/workers');
            const data = await res.json();
            setWorkers(data.workers || []);
        } catch (error) {
            console.error('Error fetching workers:', error);
            toast.error('Failed to load workers');
        } finally {
            setLoading(false);
        }
    };

    const fetchCooperatives = async () => {
        try {
            const res = await fetch('/api/cooperatives');
            if (res.ok) {
                const data = await res.json();
                setCooperatives(data.cooperatives || []);
            }
        } catch {
            console.error('Failed to load cooperatives');
        }
    };

    const handleEditWorker = (worker: Worker) => {
        setSelectedWorker(worker);
        setFormData({
            fullName: worker.fullName,
            phone: worker.phone,
            gender: worker.gender,
            primaryRole: worker.primaryRole,
        });
        setEditMode(true);
    };

    const handleUpdateWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorker) return;

        try {
            const res = await fetch(`/api/workers/${selectedWorker._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Update failed');

            toast.success('Worker updated successfully');
            setEditMode(false);
            setSelectedWorker(null);
            fetchWorkers();
        } catch {
            toast.error('Failed to update worker');
        }
    };

    const handleToggleStatus = async (worker: Worker) => {
        try {
            const newStatus = worker.status === 'active' ? 'inactive' : 'active';
            const res = await fetch(`/api/workers/${worker._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Status update failed');

            toast.success(`Worker ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
            fetchWorkers();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleAddWorker = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newWorker.consentWorkRecords) {
            toast.error('Worker consent is required');
            return;
        }
        if (!newWorker.cooperativeId) {
            toast.error('Please select a cooperative');
            return;
        }

        setSubmitting(true);
        try {
            const payload: any = {
                ...newWorker,
                photo: '/uploads/placeholder.jpg',
            };

            const res = await fetch('/api/workers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.details || 'Registration failed');

            toast.success('Worker registered successfully!');
            setShowAddForm(false);
            setNewWorker(emptyNewWorker);
            fetchWorkers();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredWorkers = workers.filter((worker) => {
        const matchesSearch =
            worker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker.workerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            worker.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 dark:from-emerald-600 dark:via-teal-700 dark:to-emerald-800 rounded-2xl p-8 shadow-xl shadow-emerald-500/30">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-300/20 rounded-full blur-3xl"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Workers Management</h1>
                        </div>
                        <p className="text-white/90 text-base sm:text-lg ml-15">Manage all workers across cooperatives</p>
                    </div>
                    <button
                        onClick={() => { setNewWorker(emptyNewWorker); setShowAddForm(true); }}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
                    >
                        <UserPlus className="w-5 h-5" /> Register Worker
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search Workers
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name, ID, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Status Filter
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                        >
                            <option value="all">All Workers</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchWorkers}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Workers Table */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Workers Directory</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''} found</p>
                    </div>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                        <p>Loading workers...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-[#0f172a]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cooperative</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-[#1e293b] divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredWorkers.map((worker) => (
                                    <tr key={worker._id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Users className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{worker.fullName}</div>
                                                    <div className="text-xs text-gray-500">{worker.workerId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-300">{worker.phone}</div>
                                            <div className="text-sm text-gray-500 capitalize">{worker.gender}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-300">
                                                {worker.cooperativeId?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                                worker.status === 'active'
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-red-600 text-white'
                                            }`}>
                                                {worker.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditWorker(worker)}
                                                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60 transition-colors text-xs font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(worker)}
                                                    className={`px-3 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                                                        worker.status === 'active'
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60'
                                                    }`}
                                                >
                                                    {worker.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredWorkers.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p className="font-medium">No workers found</p>
                                <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editMode && selectedWorker && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Worker</h2>
                            <button onClick={() => { setEditMode(false); setSelectedWorker(null); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateWorker} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" required>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Role</label>
                                <input type="text" value={formData.primaryRole} onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" required />
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">Save Changes</button>
                                <button type="button" onClick={() => { setEditMode(false); setSelectedWorker(null); }} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Register Worker Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register New Worker</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Fill in the worker details below.</p>
                            </div>
                            <button onClick={() => setShowAddForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleAddWorker} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                                <input type="text" required value={newWorker.fullName} onChange={e => setNewWorker({ ...newWorker, fullName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" placeholder="Enter full name" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Worker ID (National ID)</label>
                                    <input type="text" value={newWorker.workerId} onChange={e => setNewWorker({ ...newWorker, workerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" placeholder="Auto-generated if blank" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender *</label>
                                    <select required value={newWorker.gender} onChange={e => setNewWorker({ ...newWorker, gender: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
                                    <input type="tel" required value={newWorker.phone} onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" placeholder="+250..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input type="email" value={newWorker.email} onChange={e => setNewWorker({ ...newWorker, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" placeholder="email@example.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Primary Role *</label>
                                    <input type="text" required value={newWorker.primaryRole} onChange={e => setNewWorker({ ...newWorker, primaryRole: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white" placeholder="Coffee Sorter" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cooperative *</label>
                                    <select required value={newWorker.cooperativeId} onChange={e => setNewWorker({ ...newWorker, cooperativeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white">
                                        <option value="">Select cooperative</option>
                                        {cooperatives.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Consent */}
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newWorker.consentWorkRecords}
                                        onChange={e => setNewWorker({ ...newWorker, consentWorkRecords: e.target.checked })}
                                        className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs text-amber-800 dark:text-amber-400">
                                        Worker has given consent for work records to be maintained in the system. *
                                    </span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Registering...' : 'Register Worker'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
