import { Play } from 'lucide-react';
import LatestWins from './LatestWins';

interface GameCardProps {
    title: string;
    provider: string;
    color: string;
}

const GameCard = ({ title, provider, color }: GameCardProps) => (
    <div className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer bg-[#1a2c38] hover:-translate-y-1 transition-transform duration-300 shadow-lg">
        {/* Placeholder Image Area */}
        <div className={`absolute inset-0 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent">
            <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
            <p className="text-gray-400 text-xs font-medium mt-1">{provider}</p>
        </div>

        {/* Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
            <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200">
                <Play size={24} fill="currentColor" />
            </button>
        </div>
    </div>
);

const Home = () => {
    return (
        <div className="flex flex-col gap-6">
            <LatestWins />
            <div className="space-y-8 pb-10 px-6 max-w-7xl mx-auto w-full">
                {/* Hero Section */}
                <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-800 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-4 w-fit backdrop-blur-md border border-white/10">
                            WELCOME BONUS
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                            Unlock Bonuses <br />
                            <span className="text-emerald-200">Instantly</span>
                        </h1>
                        <p className="text-emerald-100 text-lg mb-8 max-w-md">
                            Register an account and get exclusive access to our premium games and daily rewards.
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-white text-emerald-900 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                                Claim Now
                            </button>
                            <button className="bg-emerald-700/50 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700/70 transition-colors backdrop-blur-sm border border-emerald-500/30">
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Decorative Elements (Right side placeholder) */}
                    <div className="absolute right-0 bottom-0 w-1/2 h-full hidden md:block">
                        {/* This would be where the character image goes */}
                        <div className="absolute right-10 bottom-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Casino', desc: 'All casino games', icon: '🎲', color: 'bg-indigo-600' },
                        { label: 'Sports', desc: 'Betting and live', icon: '🏀', color: 'bg-orange-600' },
                        { label: 'Bonuses', desc: 'Daily rewards', icon: '🎁', color: 'bg-pink-600' },
                        { label: 'Tournaments', desc: 'Compete & Win', icon: '🏆', color: 'bg-green-600' },
                    ].map((cat) => (
                        <div key={cat.label} className="bg-[#1a2c38] p-4 rounded-xl flex items-center gap-4 hover:bg-[#243442] transition-colors cursor-pointer border border-[#2c3e50] group">
                            <div className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                                {cat.icon}
                            </div>
                            <div>
                                <div className="font-bold text-white">{cat.label}</div>
                                <div className="text-xs text-gray-400">{cat.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Slots Games */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                            <h2 className="text-xl font-bold text-white">Slots Games</h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 text-sm font-bold bg-[#2c3e50] text-emerald-400 rounded-lg hover:bg-[#364b5f] transition-colors">View All</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <GameCard title="Cash Quest" provider="Hacksaw Gaming" color="bg-yellow-600" />
                        <GameCard title="Xmas Drop" provider="Hacksaw Gaming" color="bg-red-600" />
                        <GameCard title="The Dog House" provider="Pragmatic Play" color="bg-blue-400" />
                        <GameCard title="Tai The Toad" provider="Hacksaw Gaming" color="bg-green-500" />
                        <GameCard title="Mega Mine" provider="Relax Gaming" color="bg-purple-600" />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
