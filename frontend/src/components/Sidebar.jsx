import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const [savedCount, setSavedCount] = useState(0);

    // Update saved count on mount and when localStorage changes
    React.useEffect(() => {
        const updateCount = () => {
            const saved = JSON.parse(localStorage.getItem('savedPrograms') || '[]');
            setSavedCount(saved.length);
        };

        updateCount();

        // Listen for storage events
        window.addEventListener('storage', updateCount);

        // Custom event for same-tab updates
        window.addEventListener('programSaved', updateCount);

        return () => {
            window.removeEventListener('storage', updateCount);
            window.removeEventListener('programSaved', updateCount);
        };
    }, []);

    const navItems = [
        { path: '/', label: 'AI Agent', icon: '🤖' },
        { path: '/projects', label: 'Dự án đã lưu', icon: '◫', badge: savedCount },
        { path: '/ads', label: 'Quản lý Ads', icon: '📢' },
        { path: '/experiments', label: 'Experiments', icon: '🧪' },
        { path: '/dashboard', label: 'Analytics', icon: '▭' },
        { path: '/settings', label: 'Settings', icon: '⚙' },
    ];

    return (
        <div className="w-64 h-screen bg-black border-r border-white/10 flex flex-col flex-shrink-0">
            {/* Logo/Brand */}
            <div className="px-6 py-8 border-b border-white/10">
                <h1 className="text-2xl font-serif text-white tracking-tight">Adecos</h1>
                <p className="text-xs text-luxury-gray uppercase tracking-widest mt-1">AI-Powered Platform</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center justify-between px-4 py-3 mb-2 rounded-sm
                                transition-all duration-300 group
                                ${isActive
                                    ? 'bg-white text-black'
                                    : 'text-luxury-gray hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-mono opacity-60">{item.icon}</span>
                                <span className="text-sm font-light tracking-wide">{item.label}</span>
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className={`
                                    px-2 py-0.5 rounded-full text-xs font-mono
                                    ${isActive ? 'bg-black text-white' : 'bg-white/10 text-white'}
                                `}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10">
                <p className="text-xs text-luxury-gray">MVP v1.0</p>
            </div>
        </div>
    );
};

export default Sidebar;
