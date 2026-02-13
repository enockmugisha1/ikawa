'use client';

import { useState, useEffect } from 'react';
import { X, Palette, Download, Bell } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useSettings, ExportFormat, DateFormat } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateNotifications, updateExports } = useSettings();
  const { mode } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'exports' | 'notifications'>('appearance');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'exports', label: 'Exports', icon: Download },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--card-bg)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 p-4 border-r" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--card-border)' }}>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
                    style={{
                      backgroundColor: activeTab === tab.id ? 'var(--card-bg)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                      fontWeight: activeTab === tab.id ? '500' : '400'
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Appearance Settings</h3>
                  
                  <div className="space-y-6">
                    {/* Theme Mode */}
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Theme Mode</h4>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          Switch between light and dark mode
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exports' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Export Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Default Format */}
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Default Export Format
                      </label>
                      <select
                        value={settings.exports.defaultFormat}
                        onChange={(e) => updateExports({ defaultFormat: e.target.value as ExportFormat })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          borderColor: 'var(--input-border)',
                          color: 'var(--foreground)'
                        }}
                      >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                        Date Format
                      </label>
                      <select
                        value={settings.exports.dateFormat}
                        onChange={(e) => updateExports({ dateFormat: e.target.value as DateFormat })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          borderColor: 'var(--input-border)',
                          color: 'var(--foreground)'
                        }}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Notification Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Email Notifications</h4>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.email}
                          onChange={(e) => updateNotifications({ email: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Browser Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Browser Notifications</h4>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                          Receive push notifications in browser
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.browser}
                          onChange={(e) => updateNotifications({ browser: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: 'var(--muted)',
              color: 'var(--foreground)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
