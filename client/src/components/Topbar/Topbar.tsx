import { useState, useRef, useEffect } from 'react';
import { Search, Bell, MessageSquare, User as UserIcon, LogOut } from 'lucide-react';
import AnimatedBalance from './AnimatedBalance';
import type { Notification } from './NotificationDropdown';
import NotificationDropdown from './NotificationDropdown';
import DepositModal from './DepositModal';
import type { User } from '../../pages/AuthPage';

interface TopbarProps {
    user: User | null;
    onLogout: () => void;
    notifications: Notification[];
}

const Topbar = ({ user, onLogout, notifications }: TopbarProps) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.length;

    const xpPerLevel = 200;
    const level = user ? Math.floor((Math.sqrt(1 + user.xp / 25) - 1) / 2) : 1;
    const currentLevelXp = user ? (user.xp || 0) % xpPerLevel : 0;
    const progressPercent = (currentLevelXp / xpPerLevel) * 100;

    return (
        <>
            <header className="h-20 bg-[#1a2c38] border-b border-[#2c3e50] flex items-center justify-between px-6 sticky top-0 z-10">
                {/* Left: Search */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-full max-w-md hidden md:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-[#2c3e50] rounded-xl leading-5 bg-[#0f1923] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#16202a] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-colors"
                            placeholder="Search for games..."
                        />
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-4">
                    {/* Balance with Deposit Button */}
                    <div className="hidden md:flex items-center">
                        <AnimatedBalance
                            value={user?.walletBalance || 0}
                            onDeposit={() => setShowDepositModal(true)}
                        />
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-2 relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`p-2 rounded-lg transition-colors relative ${showNotifications ? 'bg-[#2c3e50] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2c3e50]'}`}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a2c38]"></span>
                            )}
                        </button>

                        <NotificationDropdown
                            notifications={notifications}
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                        />

                        <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2c3e50] rounded-lg transition-colors">
                            <MessageSquare size={20} />
                        </button>
                    </div>

                    {/* Profile / Logout */}
                    <div className="flex items-center gap-3 pl-4 border-l border-[#2c3e50]">
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg relative">
                                <UserIcon size={20} />
                                {/* Circular Progress Border could go here, but bar is requested */}
                            </div>
                            <div className="hidden lg:block min-w-[80px]">
                                <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{user?.displayName || 'Player'}</div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs text-gray-500 font-medium">Lvl {level}</div>
                                    <div className="h-1.5 flex-1 bg-[#0f1923] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#2c3e50] rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <DepositModal
                isOpen={showDepositModal}
                onClose={() => setShowDepositModal(false)}
                user={user}
            />
        </>
    );
};

export default Topbar;
