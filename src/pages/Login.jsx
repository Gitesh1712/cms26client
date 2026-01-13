import { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/login', { email, password });

            // Assuming response contains a token or user session
            sessionStorage.clear
            console.log("Login successful:", response);
            if (response.token) {
                sessionStorage.setItem('token', response.token);
            }

            // Store user info
            if (response.user) {
                sessionStorage.setItem('userInfo', JSON.stringify({
                    email: response.user.email,
                    role: response.user.role
                }));
            }

            navigate('/dashboard');
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md relative group">
                {/* Glow effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back</h2>
                        <p className="text-slate-400">Enter your credentials to access the nexus.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all duration-300"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                {/* <a href="#" className="text-xs text-orange-400 hover:text-orange-300">Forgot password?</a> */}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all duration-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* <div className="flex items-center space-x-2 ml-1">
                            <input type="checkbox" id="remember" className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-offset-slate-900 focus:ring-orange-500" />
                            <label htmlFor="remember" className="text-sm text-slate-400 select-none cursor-pointer">Remember me for 30 days</label>
                        </div> */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(255,122,24,0.3)] hover:shadow-[0_0_30px_rgba(255,122,24,0.5)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
                        </button>
                    </form>

                    {/* <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <a href="#" className="text-orange-400 hover:text-orange-300 font-medium">Create one now</a>
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default Login;
