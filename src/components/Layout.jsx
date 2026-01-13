import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, LogIn, Mail, Moon, Sun, X, Menu } from 'lucide-react';
import Footer from './Footer';
import { useState } from 'react';

const Layout = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-orange-500 selection:text-white font-sans overflow-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 backdrop-blur-md bg-slate-900/50 border-b border-white/5">
                <Link to="/" className="hover:opacity-80 transition-opacity">
                    <img src="logo.png" alt="No Noise Stories" className="h-12 md:h-16 w-auto" />
                </Link>

                <div className="hidden md:flex space-x-8 items-center bg-slate-800/50 px-6 py-2 rounded-full border border-white/5 shadow-lg">
                    <NavLink to="/" icon={<Home size={18} />} label="Home" active={isActive('/')} />
                    <NavLink to="/contact" icon={<Mail size={18} />} label="Contact" active={isActive('/contact')} />
                    <div className="w-px h-4 bg-white/10 mx-2"></div>
                    <NavLink to="/login" icon={<LogIn size={18} />} label="Login" active={isActive('/login')} variant="primary" />
                </div>

                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden text-slate-300 hover:text-orange-400 p-2"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMobileMenu}></div>
                    <div className="fixed top-[72px] left-0 right-0 bg-slate-900 border-b border-white/10 p-6 space-y-4 animate-in slide-in-from-top duration-200">
                        <NavLink to="/" icon={<Home size={18} />} label="Home" active={isActive('/')} onClick={closeMobileMenu} />
                        <NavLink to="/contact" icon={<Mail size={18} />} label="Contact" active={isActive('/contact')} onClick={closeMobileMenu} />
                        <div className="h-px bg-white/10 my-4"></div>
                        <NavLink to="/login" icon={<LogIn size={18} />} label="Login" active={isActive('/login')} variant="primary" onClick={closeMobileMenu} />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="pt-20 md:pt-24 min-h-screen relative">
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob will-change-transform"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000 will-change-transform"></div>
                    <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000 will-change-transform"></div>
                </div>

                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

const NavLink = ({ to, icon, label, active, variant, onClick }) => {
    const baseClasses = "flex items-center gap-2 text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full";
    const activeClasses = active ? "text-orange-400 bg-orange-400/10" : "text-slate-400 hover:text-orange-300 hover:bg-white/5";
    const primaryClasses = variant === 'primary'
        ? "bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] text-slate-900 hover:opacity-90 hover:scale-105 shadow-[0_0_15px_rgba(255,122,24,0.4)] border-none"
        : "";

    return (
        <Link to={to} onClick={onClick} className={`${baseClasses} ${!variant ? activeClasses : ''} ${primaryClasses}`}>
            {icon}
            <span>{label}</span>
        </Link>
    )
}

export default Layout;
