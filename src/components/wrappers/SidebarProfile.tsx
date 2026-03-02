'use client';

import { Settings, User } from 'lucide-react';

interface SidebarProfileProps {
    profileHref: string;
    onSettingsClick: () => void;
}

export function SidebarProfile({ profileHref, onSettingsClick }: SidebarProfileProps) {
    return (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700/40 space-y-1">
            <a
                href={profileHref}
                className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
            >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-gray-100 dark:bg-white/5 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-all duration-200">
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
                </span>
                <span className="truncate">Profile</span>
            </a>

            <button
                onClick={onSettingsClick}
                className="group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200"
            >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-gray-100 dark:bg-white/5 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-all duration-200">
                    <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
                </span>
                <span className="truncate">Settings</span>
            </button>
        </div>
    );
}
