'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Shield, Plus, Search, RefreshCw, Power, PowerOff, X,
    User, Phone, Mail, MapPin, KeyRound,
} from 'lucide-react';

interface SupervisorUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    facilityId?: { _id: string; name: string };
    createdAt: string;
}

interface Facility {
    _id: string;
    name: string;
    code: string;
}

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    facilityId: '',
};

export default function AdminSupervisorsPage() {
    const [supervisors, setSupervisors] = useState<SupervisorUser[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        fetchSupervisors();
        fetchFacilities();
    }, []);

    const fetchSupervisors = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/create-user?role=supervisor&all=true');
            const data = await res.json();
            setSupervisors(data.users || []);
        } catch {
            toast.error('Failed to load supervisors');
        } finally {
            setLoading(false);
        }
    };

    const fetchFacilities = async () => {
        try {
            const res = await fetch('/api/facilities');
            if (res.ok) {
                const data = await res.json();
                setFacilities(data.facilities || []);
            }
        } catch {
            console.error('Failed to load facilities');
        }
    };

    const openAdd = () => { setFormData(emptyForm); setShowAddForm(true); };
    const closeForm = () => { setShowAddForm(false); setFormData(emptyForm); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role: 'supervisor',
                    facilityId: formData.facilityId || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create supervisor');
            toast.success(data.message || 'Supervisor created successfully');
            closeForm();
            fetchSupervisors();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create supervisor');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (user: SupervisorUser) => {
        try {
            const res = await fetch('/api/admin/create-user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, isActive: !user.isActive }),
            });
            if (!res.ok) throw new Error('Status update failed');
            toast.success(`Supervisor ${!user.isActive ? 'activated' : 'deactivated'}`);
            fetchSupervisors();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleResendCredentials = async (user: SupervisorUser) => {
        try {
            const res = await fetch('/api/admin/resend-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to resend');
            toast.success(data.message || 'Credentials resent successfully');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to resend credentials');
        }
    };

    const filtered = supervisors.filter(s => {
        const q = searchTerm.toLowerCase();
        const matchSearch = !searchTerm ||
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.phone.includes(q);
        const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? s.isActive : !s.isActive);
        return matchSearch && matchStatus;
    });

    const active = supervisors.filter(s => s.isActive).length;
    const inactive = supervisors.length - active;

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            {/* Header */}
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
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Supervisors</h1>
                        </div>
                        <p className="text-white/90 text-base sm:text-lg ml-15">Manage supervisor accounts and access</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
                    >
                        <Plus className="w-5 h-5" /> Add Supervisor
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Total</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{supervisors.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-green-200 dark:border-green-800 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Power className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-green-600 font-medium">Active</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{active}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <PowerOff className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Inactive</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactive}</p>
                    </div>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Supervisor Directory</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{filtered.length} of {supervisors.length} supervisors</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search supervisors..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-44 sm:w-56 bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button onClick={fetchSupervisors} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Refresh">
                            <RefreshCw className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-14 text-gray-500">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-3"></div>
                        <p className="text-sm">Loading supervisors...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Shield className="w-14 h-14 mx-auto mb-4 text-gray-200 dark:text-gray-600" />
                        <p className="font-semibold text-gray-500 mb-1">No supervisors found</p>
                        <p className="text-sm text-gray-400 mb-5">
                            {searchTerm ? 'Try adjusting your search.' : 'Add your first supervisor to get started.'}
                        </p>
                        {!searchTerm && (
                            <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium transition-colors">
                                <Plus className="w-4 h-4" /> Add Supervisor
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Supervisor</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Facility</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map(sup => (
                                    <tr key={sup._id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center shrink-0">
                                                    <Shield className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{sup.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">Added {new Date(sup.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    <span className="truncate max-w-[180px]">{sup.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                                                    <span>{sup.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span>{sup.facilityId?.name || 'Not assigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                sup.isActive
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sup.isActive ? 'bg-white' : 'bg-gray-400'}`}></span>
                                                {sup.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleResendCredentials(sup)}
                                                    className="p-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60 transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <KeyRound className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(sup)}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        sup.isActive
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60'
                                                    }`}
                                                    title={sup.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {sup.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Supervisor Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Supervisor</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Login credentials will be emailed automatically.
                                </p>
                            </div>
                            <button onClick={closeForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-emerald-600" />Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                                    placeholder="Full name"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600" />Email</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-600" />Phone</span>
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                                        placeholder="+250..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600" />Facility <span className="text-gray-400 font-normal">(optional)</span></span>
                                </label>
                                <select
                                    value={formData.facilityId}
                                    onChange={e => setFormData({ ...formData, facilityId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
                                >
                                    <option value="">No facility assigned</option>
                                    {facilities.map(f => (
                                        <option key={f._id} value={f._id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Info banner */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                    A temporary password will be generated and sent to the supervisor&apos;s email. They can change it using the &quot;Forgot Password&quot; option.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Creating...' : 'Create Supervisor'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeForm}
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
