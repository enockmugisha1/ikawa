'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Settings as SettingsIcon, User } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface SidebarProfileProps {
    profileHref: string;
    onSettingsClick: () => void;
}

interface UserData {
    name: string;
    email: string;
    role: string;
    profilePicture?: string;
}

export function SidebarProfile({ profileHref, onSettingsClick }: SidebarProfileProps) {
    const [user, setUser] = useState<UserData | null>(null);
    const [uploading, setUploading] = useState(false);
    const [hovered, setHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(d => { if (d.user) setUser(d.user); })
            .catch(() => {});
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }

        // Optimistic preview
        const reader = new FileReader();
        reader.onloadend = () => setUser(u => u ? { ...u, profilePicture: reader.result as string } : u);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            const res = await fetch('/api/upload/profile-picture', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const { imageUrl } = await res.json();

            await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profilePicture: imageUrl }),
            });

            setUser(u => u ? { ...u, profilePicture: imageUrl } : u);
            toast.success('Profile picture updated');
        } catch {
            toast.error('Failed to upload picture');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    const roleLabel = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : '';

    return (
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-700/40">
            {/* Profile picture + info */}
            <div className="flex items-center gap-3 px-2 py-2">
                {/* Avatar with camera overlay */}
                <div
                    className="relative shrink-0 cursor-pointer"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile picture"
                >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center ring-2 ring-emerald-200 dark:ring-emerald-700/50 transition-all duration-200">
                        {user?.profilePicture ? (
                            <Image
                                src={user.profilePicture}
                                alt={user?.name || 'Profile'}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {initials}
                            </span>
                        )}
                    </div>
                    {/* Camera overlay */}
                    {(hovered || uploading) && (
                        <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
                            {uploading ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Camera className="w-3.5 h-3.5 text-white" />
                            )}
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Name + role */}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate leading-tight">
                        {user?.name || 'Loading…'}
                    </p>
                    <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide truncate">
                        {roleLabel}
                    </p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-1.5 mt-1 px-1">
                <a
                    href={profileHref}
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all duration-150"
                >
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Profile</span>
                </a>
                <button
                    onClick={onSettingsClick}
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all duration-150"
                >
                    <SettingsIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    );
}
