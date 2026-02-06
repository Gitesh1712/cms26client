import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); 
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email || loading) return;

        setLoading(true);
        setStatus(null);
        setMessage('');

        try {
           
            await api.post('/public/newsletter', { email, source: 'footer' });
            setStatus('success');
            setMessage('Thanks for subscribing!');
            setEmail('');
        } catch (err) {
            console.error('Newsletter error:', err);
            setStatus('error');
            setMessage(err.message || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="relative mt-12 md:mt-20 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                    
                    <div className="space-y-6">
                        <Link to="/" className="hover:opacity-80 transition-opacity block">
                            <img src="logo.png" alt="No Noise Stories" className="h-20 w-auto" />
                        </Link>
                        <p className="text-slate-400 leading-relaxed max-w-xs">
                            Uncovering the signals in the noise. High-fidelity storytelling for the modern era.
                        </p>
                    </div>

                  
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-white uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/contact" className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-2">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-2">
                                    Admin Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                
                    <div className="space-y-6">
                        <h4 className="text-lg font-bold text-white uppercase tracking-wider">Newsletter</h4>
                        <p className="text-slate-400 text-sm">
                            Subscribe to our newsletter and get the best stories in your inbox.
                        </p>
                        <form onSubmit={handleSubscribe} className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bottom-2 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin text-slate-950" /> : <Send size={18} />}
                            </button>
                        </form>
                        {status && (
                            <div className={`mt-2 flex items-center gap-2 text-xs font-medium ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {status === 'success' && <CheckCircle2 size={14} />}
                                {message}
                            </div>
                        )}
                    </div>
                </div>

          
                <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2026 no noise stories all rights reserved
                    </p>
                    <div className="flex gap-8 text-xs text-slate-600">
                        <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        
            <div className="absolute -z-10 bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none"></div>
        </footer>
    );
};

export default Footer;
