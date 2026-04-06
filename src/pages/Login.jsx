import { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { validatePassword } from '../utils/validation';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        if (val) setPasswordError(validatePassword(val));
        else setPasswordError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

       
        const passErr = validatePassword(password);
        if (passErr) {
            setPasswordError(passErr);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/login', { email, password });

            sessionStorage.clear();

            if (response.token) {
                sessionStorage.setItem('token', response.token);
            }

            if (response.user) {
                sessionStorage.setItem('userInfo', JSON.stringify({
                    name: response.user.name,
                    email: response.user.email,
                    role: response.user.role
                }));
            }

            const from = location.state?.from || '/dashboard';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-2 text-white">Welcome Back</h2>
                        <p className="text-slate-400">Log in to publish and manage news content.</p>
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
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all duration-300"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    
                                    value={password}
                                    onChange={handlePasswordChange}
                                    className={`w-full bg-slate-950/50 border rounded-xl py-3 pl-12 pr-12 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all duration-300 ${
                                        passwordError
                                            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
                                            : 'border-slate-800 focus:border-orange-500/50 focus:ring-orange-500/50'
                                    }`}
                                    placeholder="••••••••"
                                />
                                
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                           
                            {passwordError && (
                                <p className="text-red-400 text-xs flex items-center gap-1 ml-1">
                                    <AlertCircle size={12} />
                                    {passwordError}
                                </p>
                            )}

                            
                            <p className="text-slate-500 text-xs ml-1">
                                Password must contain at least one special character: ! @ # $ % ^ & *
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !!passwordError}
                            className="w-full py-3.5 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(255,122,24,0.3)] hover:shadow-[0_0_30px_rgba(255,122,24,0.5)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;