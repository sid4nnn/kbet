import { Link, useLocation } from 'react-router-dom';
import {
    Gamepad2,
    Dices,
    Tv,
    Star,
    Flame,
    CircleDollarSign,
    CreditCard,
    Headphones,
    Twitter,
    Send
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { icon: Dices, label: 'Slots', path: '/slots' },
        { icon: CreditCard, label: 'Blackjack', path: '/blackjack' },
        { icon: Tv, label: 'Live', path: '/live' },
        { icon: Flame, label: 'Hot', path: '/hot' },
        { icon: CircleDollarSign, label: 'Roulette', path: '/roulette' },
    ];

    return (
        <aside className="w-64 bg-[#1a2c38] flex flex-col border-r border-[#2c3e50] hidden md:flex">
            <div className="p-4 flex items-center gap-2 border-b border-[#2c3e50]">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">KBET</span>
            </div>

            <div className="p-4">
                <Link to="/" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                    <Gamepad2 size={20} />
                    <span>Home</span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3 mt-2">Menu</div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-[#2c3e50] text-white'
                                : 'text-gray-400 hover:text-white hover:bg-[#243442]'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#2c3e50] space-y-4">
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#243442] w-full transition-colors">
                    <Headphones size={18} />
                    Live Support
                </button>


                <div className="flex items-center justify-center gap-4 pt-2">
                    <a href="https://discord.gg/example" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#5865F2] transition-colors p-2 hover:bg-[#2c3e50] rounded-lg">
                        <Gamepad2 size={20} />
                    </a>
                    <a href="https://t.me/example" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0088cc] transition-colors p-2 hover:bg-[#2c3e50] rounded-lg">
                        <Send size={20} />
                    </a>
                    <a href="https://x.com/example" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#2c3e50] rounded-lg">
                        <Twitter size={20} />
                    </a>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
