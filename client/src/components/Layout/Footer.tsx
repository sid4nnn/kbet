import { Twitter, Send, Gamepad2 } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0f1923] border-t border-[#2c3e50] py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

                <div className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} Casino. All rights reserved.
                </div>


                <div className="flex items-center gap-6">
                    <a
                        href="https://discord.gg/example"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#5865F2] transition-colors flex items-center gap-2 group"
                    >
                        <div className="p-2 bg-[#1a2c38] rounded-lg group-hover:bg-[#5865F2]/10 transition-colors">
                            <Gamepad2 size={20} />
                        </div>
                        <span className="font-medium hidden md:block">Discord</span>
                    </a>

                    <a
                        href="https://t.me/example"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#0088cc] transition-colors flex items-center gap-2 group"
                    >
                        <div className="p-2 bg-[#1a2c38] rounded-lg group-hover:bg-[#0088cc]/10 transition-colors">
                            <Send size={20} />
                        </div>
                        <span className="font-medium hidden md:block">Telegram</span>
                    </a>

                    <a
                        href="https://x.com/example"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                        <div className="p-2 bg-[#1a2c38] rounded-lg group-hover:bg-white/10 transition-colors">
                            <Twitter size={20} />
                        </div>
                        <span className="font-medium hidden md:block">X</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
