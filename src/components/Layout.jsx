import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, LogIn, Mail, Menu, X, Filter, ChevronDown, Info, Newspaper } from 'lucide-react';
import Footer from './Footer';
import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const Layout = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);

    const isActive = (path) => location.pathname === path;
    const isHomePage = location.pathname === '/';

    const closeMobileMenu = () => setMobileMenuOpen(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/public/categories');
                const categoriesData = response?.data || [];
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsideDesktop = dropdownRef.current && !dropdownRef.current.contains(event.target);
            const isOutsideMobile = !mobileDropdownRef.current || !mobileDropdownRef.current.contains(event.target);
            if (isOutsideDesktop && isOutsideMobile) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 0);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [dropdownOpen]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category.name || 'All Categories');
        setDropdownOpen(false);
        window.dispatchEvent(new CustomEvent('categoryFilterChange', {
            detail: { category: category.id || null }
        }));
    };

    const topStoriesCat = categories.find(c =>
        c.name?.toLowerCase().replace(/[\s\-_]/g, '').includes('topstori')
    );
    const otherCategories = categories.filter(c => c !== topStoriesCat);
    const orderedCategories = topStoriesCat ? [topStoriesCat, ...otherCategories] : otherCategories;
    const overflowCats = orderedCategories.slice(4);

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-orange-500 selection:text-white font-['Inter',_'Poppins',_'SF_Pro_Display',_system-ui,_-apple-system,_sans-serif] overflow-x-hidden">
            <nav className="fixed top-0 left-0 right-0 p-3 sm:p-4 md:p-6 z-50 backdrop-blur-md bg-slate-900/50 border-b border-white/5">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="hover:opacity-80 transition-opacity flex-shrink-0"
                        onClick={() => {
                            window.dispatchEvent(new CustomEvent('categoryFilterChange', { detail: { category: null } }));
                        }}
                    >
                        <img
                            src="/logo.png"
                            alt="No Noise Stories"
                            style={{ width: '120px', height: '70px' }}
                            onError={(e) => { console.error('Logo failed to load:', e); e.target.style.display = 'none'; }}
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex space-x-6 items-center bg-slate-800/50 px-6 py-2 rounded-full border border-white/5 shadow-lg">

                        <NavLink
                            to="/"
                            label="Home"
                            active={isActive('/')}
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('categoryFilterChange', { detail: { category: null } }));
                            }}
                        />

                        <NavLink to="/about" label="About" active={isActive('/about')} />

                        {/* Category buttons — desktop only on home */}
                        {isHomePage && (() => {
                            const topStory = categories.find(c =>
                                c.name?.toLowerCase().replace(/[\s\-_]/g, '').includes('topstori')
                            );
                            const others = categories.filter(c => c !== topStory);
                            const ordered = topStory ? [topStory, ...others] : others;
                            return ordered.slice(0, 4).map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategorySelect(category)}
                                    className={`flex items-center gap-2 text-base font-bold transition-colors px-4 py-2 rounded-full uppercase tracking-wide ${
                                        selectedCategory === category.name
                                            ? 'text-orange-400 bg-orange-400/10'
                                            : 'text-slate-400 hover:text-orange-300 hover:bg-white/5'
                                    }`}
                                >
                                    <span>{category.name}</span>
                                </button>
                            ));
                        })()}

                        {/* More dropdown — desktop */}
                        {isHomePage && overflowCats.length > 0 && (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 text-base font-bold text-slate-400 hover:text-orange-300 transition-colors px-4 py-2 rounded-full hover:bg-white/5 uppercase tracking-wide"
                                >
                                    <span>More</span>
                                    <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                        <div className="py-2 max-h-80 overflow-y-auto">
                                            <button
                                                onClick={() => handleCategorySelect({})}
                                                className="w-full text-left px-4 py-3 text-base font-bold text-slate-300 hover:bg-orange-400/10 hover:text-orange-300 transition-colors flex items-center gap-3 capitalize"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                                All Categories
                                            </button>
                                            <div className="h-px bg-white/10 my-1 mx-2"></div>
                                            {overflowCats.map((category) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => handleCategorySelect(category)}
                                                    className="w-full text-left px-4 py-3 text-base font-bold text-slate-300 hover:bg-orange-400/10 hover:text-orange-300 transition-colors flex items-center gap-3 capitalize"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                                    <span className="truncate">{category.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <NavLink to="/CitizenJournalist" label="Citizen Journalist" active={isActive('/CitizenJournalist')} />
                        <NavLink to="/contact" label="Contact" active={isActive('/contact')} />

                        <div className="w-px h-4 bg-white/10 mx-2"></div>

                        <NavLink to="/login" icon={<LogIn size={18} />} label="Login" active={isActive('/login')} variant="primary" />
                    </div>

                    {/* Hamburger — mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden text-slate-300 hover:text-orange-400 p-2 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Category filter pill — mobile, home only */}
                {isHomePage && (
                    <div className="lg:hidden mt-3">
                        <div className="relative" ref={mobileDropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-orange-300 transition-colors px-3 py-2 rounded-full bg-slate-800/50 border border-white/5 hover:bg-white/5 uppercase tracking-wide"
                            >
                                <Filter size={16} />
                                <span className="truncate max-w-[100px]">{selectedCategory}</span>
                                <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="py-2 max-h-64 overflow-y-auto">
                                        <button
                                            onClick={() => handleCategorySelect({})}
                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-orange-400/10 hover:text-orange-300 transition-colors capitalize"
                                        >
                                            All Categories
                                        </button>
                                        <div className="h-px bg-white/10 my-1 mx-2"></div>

                                        {topStoriesCat && (
                                            <button
                                                onClick={() => handleCategorySelect(topStoriesCat)}
                                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-orange-300 hover:bg-orange-400/10 transition-colors capitalize"
                                            >
                                                {topStoriesCat.name}
                                            </button>
                                        )}

                                        {otherCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategorySelect(category)}
                                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-orange-400/10 hover:text-orange-300 transition-colors capitalize"
                                            >
                                                <span className="truncate">{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* ✅ FIXED: Mobile menu — CitizenJournalist added */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>
                    <div className={`fixed left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-4 sm:p-6 space-y-3 shadow-2xl ${
                        isHomePage ? 'top-[140px] sm:top-[148px]' : 'top-[80px] sm:top-[88px]'
                    }`}>
                        <NavLink to="/" icon={<Home size={18} />} label="Home" active={isActive('/')} onClick={closeMobileMenu} mobile />
                        <NavLink to="/about" icon={<Info size={18} />} label="About" active={isActive('/about')} onClick={closeMobileMenu} mobile />
                        {/* ✅ THIS WAS MISSING */}
                        <NavLink to="/CitizenJournalist" icon={<Newspaper size={18} />} label="Citizen Journalist" active={isActive('/CitizenJournalist')} onClick={closeMobileMenu} mobile />
                        <NavLink to="/contact" icon={<Mail size={18} />} label="Contact" active={isActive('/contact')} onClick={closeMobileMenu} mobile />
                        <div className="h-px bg-white/10 my-3"></div>
                        <NavLink to="/login" icon={<LogIn size={18} />} label="Login" active={isActive('/login')} variant="primary" onClick={closeMobileMenu} mobile />
                    </div>
                </div>
            )}

            <main className={`min-h-screen relative ${isHomePage ? 'pt-20 sm:pt-24 md:pt-28 lg:pt-20' : 'pt-20 sm:pt-24 md:pt-28'}`}>
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-orange-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-20 animate-blob will-change-transform"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-amber-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-20 animate-blob animation-delay-2000 will-change-transform"></div>
                    <div className="absolute -bottom-32 left-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-red-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-20 animate-blob animation-delay-4000 will-change-transform"></div>
                </div>
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

const NavLink = ({ to, icon, label, active, variant, onClick, mobile }) => {
    const baseClasses = "flex items-center gap-3 text-base font-bold transition-all duration-300 rounded-full uppercase tracking-wide";
    const desktopClasses = mobile ? "px-4 py-3 w-full" : "px-4 py-2";
    const activeClasses = active
        ? "text-orange-400 bg-orange-400/10"
        : "text-slate-400 hover:text-orange-300 hover:bg-white/5";
    const primaryClasses = variant === 'primary'
        ? "bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] text-slate-900 hover:opacity-90 hover:scale-105 shadow-[0_0_15px_rgba(255,122,24,0.4)] border-none"
        : "";

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`${baseClasses} ${desktopClasses} ${!variant ? activeClasses : ''} ${primaryClasses}`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export default Layout;