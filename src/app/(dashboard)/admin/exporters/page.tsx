'use client';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Exporter {
    _id: string;
    exporterCode: string;
    tinNumber?: string;
    companyTradingName: string;
    companyAddress: string;
    contactPerson: string;
    phone: string;
    email: string;
    isActive: boolean;
}

export default function AdminExportersPage() {
    const [exporters, setExporters] = useState<Exporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingExporter, setEditingExporter] = useState<Exporter | null>(null);
    const [formData, setFormData] = useState({
        exporterCode: '',
        tinNumber: '',
        companyTradingName: '',
        companyAddress: '',
        contactPerson: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        fetchExporters();
    }, []);

    const fetchExporters = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/exporters');
            const data = await res.json();
            setExporters(data.exporters || []);
        } catch (error) {
            console.error('Error fetching exporters:', error);
            toast.error('Failed to load exporters');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExporter = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/exporters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, isActive: true }),
            });

            if (!res.ok) throw new Error('Add failed');

            toast.success('Exporter added successfully');
            setShowAddForm(false);
            setFormData({
                exporterCode: '',
                tinNumber: '',
                companyTradingName: '',
                companyAddress: '',
                contactPerson: '',
                phone: '',
                email: '',
            });
            fetchExporters();
        } catch (error) {
            toast.error('Failed to add exporter');
        }
    };

    const handleEditExporter = (exporter: Exporter) => {
        setEditingExporter(exporter);
        setFormData({
            exporterCode: exporter.exporterCode,
            tinNumber: exporter.tinNumber || '',
            companyTradingName: exporter.companyTradingName,
            companyAddress: exporter.companyAddress,
            contactPerson: exporter.contactPerson,
            phone: exporter.phone,
            email: exporter.email,
        });
    };

    const handleUpdateExporter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExporter) return;

        try {
            const res = await fetch(`/api/exporters/${editingExporter._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Update failed');

            toast.success('Exporter updated successfully');
            setEditingExporter(null);
            setFormData({
                exporterCode: '',
                tinNumber: '',
                companyTradingName: '',
                companyAddress: '',
                contactPerson: '',
                phone: '',
                email: '',
            });
            fetchExporters();
        } catch (error) {
            toast.error('Failed to update exporter');
        }
    };

    const handleToggleStatus = async (exporter: Exporter) => {
        try {
            const res = await fetch(`/api/exporters/${exporter._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !exporter.isActive }),
            });

            if (!res.ok) throw new Error('Status update failed');

            toast.success(`Exporter ${!exporter.isActive ? 'activated' : 'deactivated'}`);
            fetchExporters();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div>
            <Toaster position="top-right" />

            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exporters Management</h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">Manage coffee exporters and their details</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                >
                    <span className="mr-2">+</span> Add Exporter
                </button>
            </div>

            {/* Exporters List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {loading ? (
                    <div className="col-span-full p-8 text-center text-gray-500">
                        Loading exporters...
                    </div>
                ) : exporters.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-gray-500">
                        No exporters found
                    </div>
                ) : (
                    exporters.map((exporter) => (
                        <div
                            key={exporter._id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {exporter.companyTradingName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {exporter.tinNumber ? `TIN: ${exporter.tinNumber}` : exporter.exporterCode}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${exporter.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {exporter.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="mr-2">📍</span>
                                    {exporter.companyAddress}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="mr-2">👤</span>
                                    {exporter.contactPerson}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="mr-2">📞</span>
                                    {exporter.phone}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="mr-2">✉️</span>
                                    {exporter.email}
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditExporter(exporter)}
                                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(exporter)}
                                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${exporter.isActive
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                >
                                    {exporter.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {(showAddForm || editingExporter) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingExporter ? 'Edit Exporter' : 'Add New Exporter'}
                        </h2>
                        <form
                            onSubmit={editingExporter ? handleUpdateExporter : handleAddExporter}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exporter Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.exporterCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, exporterCode: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    required
                                    disabled={!!editingExporter}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    TIN Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tinNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, tinNumber: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Trading Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.companyTradingName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, companyTradingName: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Address
                                </label>
                                <textarea
                                    value={formData.companyAddress}
                                    onChange={(e) =>
                                        setFormData({ ...formData, companyAddress: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    rows={2}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Person
                                </label>
                                <input
                                    type="text"
                                    value={formData.contactPerson}
                                    onChange={(e) =>
                                        setFormData({ ...formData, contactPerson: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    {editingExporter ? 'Save Changes' : 'Add Exporter'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingExporter(null);
                                        setFormData({
                                            exporterCode: '',
                                            tinNumber: '',
                                            companyTradingName: '',
                                            companyAddress: '',
                                            contactPerson: '',
                                            phone: '',
                                            email: '',
                                        });
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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
