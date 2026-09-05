import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Mail, Menu, X, Filter, ChevronDown, Info } from 'lucide-react';
import Footer from './Footer';
import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import SubscribeModal from '../pages/Subscribemodal';
import { generateSlug } from '../utils/slugify';

const Layout = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);

    const isActive = (path) => location.pathname === path;



    // const isHomePage = location.pathname === '/';
    // const isLoginPage = location.pathname === '/login';
    // const pathSegments = location.pathname.split('/').filter(Boolean);
    // const isPostPage = pathSegments.length === 2;
    // const showHomeLink = !isHomePage && !isPostPage;


const isHomePage = location.pathname === '/';
const isLoginPage = location.pathname === '/login';
const isPrivacyPolicyPage = location.pathname === '/privacy-policy';
const pathSegments = location.pathname.split('/').filter(Boolean);
const isPostPage = pathSegments.length === 2;
// Known static top-level pages (not category slugs) — these still show the Home link.
const STATIC_TOP_LEVEL_PATHS = ['shorts', 'contact', 'citizenjournalist', 'about', 'subscribeall'];
const isCategoryPage = pathSegments.length === 1 && !STATIC_TOP_LEVEL_PATHS.includes(pathSegments[0].toLowerCase());
const showHomeLink = !isHomePage && !isPostPage && !isPrivacyPolicyPage && !isCategoryPage;


// Post/article pages follow the "/:category/:slug" url pattern (see Post.jsx useParams)

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
        if (!category.name) {
            navigate('/');
            return;
        }
        navigate(`/${generateSlug(category.name)}`);
    };

    const isNNSImpactCategory = (category) => {
        return category.name?.toLowerCase().replace(/[\s\-_]/g, '').includes('nnsimpact') ||
               category.name?.toLowerCase().replace(/[\s\-_]/g, '').includes('nnsimp');
    };

    const topStoriesCat = categories.find(c =>
        c.name?.toLowerCase().replace(/[\s\-_]/g, '').includes('topstori')
    );
    const otherCategories = categories.filter(c => c !== topStoriesCat);
    const orderedCategories = topStoriesCat ? [topStoriesCat, ...otherCategories] : otherCategories;

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-orange-500 selection:text-white font-['Inter',_'Poppins',_'SF_Pro_Display',_system-ui,_-apple-system,_sans-serif] overflow-x-hidden">

            {/* ── CSS Animations ── */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .float-animation {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
                .pulse-ring::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 9999px;
                    background: linear-gradient(135deg, #FFCC66, #FF7A18);
                    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    z-index: -1;
                }
                @keyframes bounce-soft {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .bounce-soft {
                    animation: bounce-soft 2s ease-in-out infinite;
                }
            `}</style>

            {/* ── Fixed Subscribe Button - MOBILE (Bottom Right Circular) ── */}
            {/* <div className={`fixed bottom-6 right-6 z-40 lg:hidden ${isLoginPage ? '!hidden' : ''}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bounce-soft relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#FFCC66] to-[#FF7A18] text-slate-900 shadow-2xl hover:shadow-[0_0_30px_rgba(255,122,24,0.7)] transition-all duration-300 hover:scale-110 active:scale-95 border-none cursor-pointer pulse-ring"
                    aria-label="Subscribe Now"
                >
                    <Mail size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                </button>
              
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-900/95 backdrop-blur-sm border border-orange-500/30 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                        Subscribe Now
                        <div className="absolute top-full right-5 w-2 h-2 bg-slate-900/95 border-r border-b border-orange-500/30 transform rotate-45 -mt-1"></div>
                    </div>
                </div>
            </div> */}

            {/* ── Subscribe Modal ── */}
            {isOpen && <SubscribeModal onClose={() => setIsOpen(false)} />}

            {/* ── Navbar ── */}
            {!isLoginPage && (
                <nav className="fixed top-0 left-0 right-0  z-50 backdrop-blur-md bg-slate-900/50 border-b border-white/5 p-0" >
                    <div className="flex justify-between items-center mx-2 gap-2">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="hover:opacity-80 transition-opacity flex-shrink-0 md:ml-16 lg:ml-24 xl:ml-32"
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

                        {/* Desktop Nav + Subscribe Section */}
                        <div className="hidden lg:flex items-center gap-3 mr-8 md:mr-16 lg:mr-24 xl:mr-32">

                        {/* Desktop Nav (categories) - sirf tab render karo jab andar kuch dikhane layak ho */}
                        {(isHomePage || showHomeLink) && (
                            <div className="flex space-x-3 items-center bg-slate-800/50 px-6 py-2 rounded-full border border-white/5 shadow-lg">
                                {showHomeLink && (
                                    <NavLink
                                        to="/"
                                        label="Home"
                                        active={isActive('/')}
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('categoryFilterChange', { detail: { category: null } }));
                                        }}
                                    />
                                )}

                                {isHomePage && (() => {
                                    const nnsImpactCats = orderedCategories.filter(c => isNNSImpactCategory(c));
                                    const normalCats = orderedCategories.filter(c => !isNNSImpactCategory(c));

                                    return (
                                        <>
                                            {/* Normal categories pehle */}
                                            {normalCats.map((category) => {
                                                const name = category.name || '';
                                                const isPlusVes = name.includes('+') && name.toLowerCase().endsWith('s');
                                                return (
                                                    <button
                                                        key={category.id}
                                                        onClick={() => handleCategorySelect(category)}
                                                        className={`flex items-center gap-2 text-sm font-bold transition-colors px-3 py-2 rounded-full uppercase tracking-wide ${
                                                            selectedCategory === category.name
                                                                ? 'text-orange-400 bg-orange-400/10'
                                                                : 'text-slate-400 hover:text-orange-300 hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <span>
                                                            {isPlusVes ? (
                                                                <>
                                                                    {name.slice(0, -1)}
                                                                    <span className="lowercase">s</span>
                                                                </>
                                                            ) : (
                                                                name
                                                            )}
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            {/* NNS Impact orange button */}
                                            {nnsImpactCats.map((category) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => handleCategorySelect(category)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] text-slate-900 font-bold text-sm uppercase tracking-wide hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(255,122,24,0.4)] cursor-pointer border-none"
                                                >
                                                    <span>{category.name}</span>
                                                </button>
                                            ))}
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Subscribe Now - alag chhota section, categories ke bahar */}
                        {/* <button
                            onClick={() => setIsOpen(true)}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] text-slate-900 font-bold text-xs uppercase tracking-wide hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-[0_0_12px_rgba(255,122,24,0.4)] cursor-pointer border-none flex-shrink-0"
                        >
                           
                            <span>Subscribe Now</span>
                        </button> */}

                        </div>

                        {/* Mobile Right Side: homepage par Category Filter, doosre pages par Hamburger */}
                        <div className="lg:hidden flex items-center flex-shrink-0 md:mr-8 lg:mr-12">
                            {isHomePage ? (
                                <div className="relative" ref={mobileDropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-orange-300 transition-colors px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-slate-800/50 border border-white/5 hover:bg-white/5 uppercase tracking-wide whitespace-nowrap"
                                    >
                                        <Filter size={16} />
                                        <span className="truncate max-w-[80px] sm:max-w-[100px]">{selectedCategory}</span>
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
                            ) : showHomeLink ? (
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="text-slate-300 hover:text-orange-400 p-2 transition-colors"
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </nav>
            )}

            {/* ── Mobile Menu ── */}
            {!isLoginPage && mobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>
                    <div className={`fixed left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-4 sm:p-6 space-y-3 shadow-2xl ${
                        isHomePage ? 'top-[140px] sm:top-[148px]' : 'top-[80px] sm:top-[88px]'
                    }`}>
                        {showHomeLink && (
                            <NavLink
                                to="/"
                                icon={<Home size={18} />}
                                label="Home"
                                active={isActive('/')}
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('categoryFilterChange', { detail: { category: null } }));
                                    closeMobileMenu();
                                }}
                                mobile
                            />
                        )}

                        {/* <NavLink
                            to="/CitizenJournalist"
                            icon={<Newspaper size={18} />}
                            label="Citizen Journalist"
                            active={isActive('/CitizenJournalist')}
                            onClick={closeMobileMenu}
                            mobile
                        /> */}
                    </div>
                </div>
            )}

            <main className={`min-h-screen relative ${isLoginPage ? '' : isHomePage ? 'pt-20 sm:pt-24 md:pt-28 lg:pt-20' : 'pt-20 sm:pt-24 md:pt-28'}`}>
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-orange-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-20 animate-blob will-change-transform"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-amber-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-20 animate-blob animation-delay-2000 will-change-transform"></div>
                    <div className="absolute -bottom-32 left-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-red-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[100px] opacity-20 animate-blob animation-delay-4000 will-change-transform"></div>
                </div>
                <Outlet />
            </main>

            {!isLoginPage && <Footer />}
        </div>
    );
};

const NavLink = ({ to, icon, label, active, variant, onClick, mobile }) => {
    const baseClasses = "flex items-center gap-3 text-sm font-bold transition-all duration-300 rounded-full uppercase tracking-wide";
    const desktopClasses = mobile ? "px-4 py-3 w-full" : "px-3 py-2";
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