'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, Phone, Calendar, User } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';

interface Worker {
    _id: string;
    workerId: string;
    fullName: string;
    phone: string;
    gender: string;
    status: string;
    enrollmentDate: string;
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/workers');
            const data = await res.json();
            setWorkers(data.workers || []);
        } catch (error) {
            console.error('Error fetching workers:', error);
        } finally {
            setLoading(false);
        }
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
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Workers Directory</h1>
                    </div>
                    <p className="text-gray-600">
                        Manage and view all registered workers ({workers.length} total)
                    </p>
                </div>
                <a
                    href="/supervisor/onboarding"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 font-medium shadow-lg shadow-emerald-500/30 transition-all"
                >
                    <UserPlus className="w-5 h-5" />
                    Onboard Worker
                </a>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Workers</p>
                            <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {workers.filter(w => w.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Inactive</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {workers.filter(w => w.status !== 'active').length}
                            </p>
                        </div>
                    </div>
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
        </div>
    );
}
