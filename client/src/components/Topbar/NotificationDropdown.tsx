import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';

export interface Notification {
    id: string;
    message: string;
    timestamp: Date;
    type: 'win' | 'loss' | 'info';
}

interface NotificationDropdownProps {
    notifications: Notification[];
    onClose: () => void;
    isOpen: boolean;
}

const NotificationDropdown = ({ notifications, onClose, isOpen }: NotificationDropdownProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-80 bg-[#1a2c38] border border-[#2c3e50] rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-3 border-b border-[#2c3e50] bg-[#16202a]">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                            <Bell size={14} className="text-emerald-500" />
                            Notifications
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-xs">
                                No new notifications
                            </div>
                        ) : (
                            <ul className="divide-y divide-[#2c3e50]">
                                {notifications.map((note) => (
                                    <li key={note.id} className="p-3 hover:bg-[#243442] transition-colors">
                                        <p className={`text-sm font-medium ${note.type === 'win' ? 'text-emerald-400' :
                                            note.type === 'loss' ? 'text-red-400' : 'text-gray-300'
                                            }`}>
                                            {note.message}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            {note.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {note.timestamp.toLocaleDateString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationDropdown;
