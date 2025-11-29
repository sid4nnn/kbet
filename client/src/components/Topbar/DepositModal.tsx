import { useState } from 'react';
import { X, CreditCard, Wallet, Bitcoin, Coins, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

const paymentMethods = [
    { id: 'card', name: 'Visa / Mastercard', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'paypal', name: 'Paypal', icon: Wallet, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { id: 'crypto', name: 'Crypto', icon: Bitcoin, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { id: 'kcoins', name: 'KCoins', icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { id: 'skins', name: 'CS Skins', icon: Gamepad2, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
];

export default function DepositModal({ isOpen, onClose, user }: DepositModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [adminAmount, setAdminAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMethodClick = (methodId: string) => {
        setSelectedMethod(methodId);
        if (methodId !== 'kcoins' || user?.role !== 'admin') {
        }
    };

    const handleAdminDeposit = async () => {
        if (!adminAmount || isNaN(Number(adminAmount))) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/wallet/admin-deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ amountCents: Number(adminAmount) })
            });
            if (res.ok) {
                onClose();
                setAdminAmount('');
                setSelectedMethod(null);
                window.location.reload();
            } else {
                alert('Deposit failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error depositing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                    >

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#1a2c38] border border-[#2c3e50] rounded-2xl shadow-2xl overflow-hidden"
                        >

                            <div className="flex items-center justify-between p-6 border-b border-[#2c3e50]">
                                <h2 className="text-xl font-bold text-white">Deposit Funds</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-[#2c3e50] rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>


                            <div className="p-6 grid gap-3">
                                {paymentMethods.map((method) => (
                                    <div key={method.id} className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleMethodClick(method.id)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${method.bg} hover:bg-opacity-20 group ${selectedMethod === method.id ? 'ring-2 ring-emerald-500' : ''}`}
                                        >
                                            <div className={`p-3 rounded-lg bg-[#0f1923] ${method.color} shadow-sm group-hover:shadow-md transition-shadow`}>
                                                <method.icon size={24} />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-white font-bold text-lg">{method.name}</span>
                                                <span className="text-xs text-gray-400">Instant • 0% Fee</span>
                                            </div>
                                        </button>


                                        {selectedMethod === 'kcoins' && method.id === 'kcoins' && user?.role === 'admin' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="pl-4 pr-4 pb-2"
                                            >
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={adminAmount}
                                                        onChange={(e) => setAdminAmount(e.target.value)}
                                                        placeholder="Amount"
                                                        className="flex-1 bg-[#0f1923] border border-[#2c3e50] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                                    />
                                                    <button
                                                        onClick={handleAdminDeposit}
                                                        disabled={loading}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {loading ? '...' : 'Add'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>


                            <div className="p-4 bg-[#0f1923] text-center text-xs text-gray-500 border-t border-[#2c3e50]">
                                Secure payments powered by Stripe & CoinGate
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
