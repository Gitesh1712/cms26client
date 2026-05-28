import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
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
        <footer className="relative mt-12 md:mt-20 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

                   
                    <div className="space-y-6">
                        <Link to="/" className="hover:opacity-80 transition-opacity block">
                            <img
                                src="/logo.png"
                                alt="No Noise Stories"
                                className="h-20 w-auto"
                                onError={(e) => { console.error('Footer logo failed to load:', e); }}
                            />
                        </Link>
                        <p className="text-slate-300 leading-relaxed max-w-xs text-sm" style={{ fontWeight: 300 }}>
                            Uncovering the signals in the noise. High-fidelity storytelling for the modern era.
                        </p>
                    </div>

               
                    <div className="space-y-6">
                        <h4 className="text-base font-bold uppercase tracking-widest"
                            style={{ color: '#fbbf24' }}>
                            Quick Links
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/about"
                                    className="text-slate-300 hover:text-orange-400 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-slate-300 hover:text-orange-400 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacy-policy"
                                    className="text-slate-300 hover:text-orange-400 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/login"
                                    className="text-slate-300 hover:text-orange-400 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    Admin Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                 
                    <div className="space-y-6">
                        <h4 className="text-base font-bold uppercase tracking-widest"
                            style={{ color: '#fbbf24' }}>
                            Follow Us
                        </h4>
                        <div className="flex flex-col gap-4">

                        
                            <Link to="https://x.com/NoNoiseStories" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 text-slate-300 hover:text-white transition-all group">
                                <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-black border border-white/20 group-hover:border-white/40 flex items-center justify-center transition-all duration-200">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Twitter / X</span>
                            </Link>

                            
                            <Link to="https://www.instagram.com/nonoisestories/" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 text-slate-300 hover:text-white transition-all group">
                                <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:via-pink-500 group-hover:to-orange-400 border border-white/20 group-hover:border-transparent flex items-center justify-center transition-all duration-200">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Instagram</span>
                            </Link>

                         
                            <Link to="https://www.linkedin.com/company/no-noise-stories/" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 text-slate-300 hover:text-white transition-all group">
                                <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-[#0A66C2] border border-white/20 group-hover:border-transparent flex items-center justify-center transition-all duration-200">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">LinkedIn</span>
                            </Link>
                            <Link to="https://www.youtube.com/@NoNoiseStories" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 text-slate-300 hover:text-white transition-all group">
                                <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-[#FF0000] border border-white/20 group-hover:border-transparent flex items-center justify-center transition-all duration-200">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">YouTube</span>
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-base font-bold uppercase tracking-widest"
                            style={{ color: '#fbbf24' }}>
                            Newsletter
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                            Subscribe to our newsletter and get the best stories in your inbox.
                        </p>
                        <form onSubmit={handleSubscribe} className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bottom-2 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {loading
                                    ? <Loader2 size={18} className="animate-spin text-slate-950" />
                                    : <Send size={18} />
                                }
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
                <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        © 2026 no noise stories all rights reserved
                    </p>
                    <div className="flex gap-8 text-xs text-slate-400">
                        <Link to="/privacy-policy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
                        <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
            <div className="absolute -z-10 bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-orange-500/5 to-transparent pointer-events-none" />
        </footer>
    );
};

export default Footer;