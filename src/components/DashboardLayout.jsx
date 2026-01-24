import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderOpen, Users, LogOut, Menu, X, Clock, CheckCircle, XCircle, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get user info from sessionStorage
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        // Clear session storage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userInfo');
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: FileText, label: "All Stories", path: "/dashboard/stories" },
    ];
    if(JSON.parse(sessionStorage.getItem('userInfo') || '{}').role === 'admin'){
        navItems.push({ icon: FolderOpen, label: "Categories", path: "/dashboard/categories" });
        navItems.push({ icon: Clock, label: "Pending Approval", path: "/dashboard/pending-approval" });
        navItems.push({ icon: CheckCircle, label: "Approved Posts", path: "/dashboard/approved-posts" });
        navItems.push({ icon: XCircle, label: "Rejected Posts", path: "/dashboard/rejected-posts" });
        navItems.push({ icon: EyeOff, label: "Hidden Posts", path: "/dashboard/hidden-posts" });
        navItems.push({ icon: Users, label: "Team", path: "/dashboard/team" });
    }

    const handleNavClick = () => {
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on mobile by default, shown via overlay */}
            <aside className={`
                bg-slate-950 border-r border-white/5 transition-all duration-300 flex flex-col z-40
                fixed inset-y-0 left-0 w-64
                md:relative md:flex-shrink-0
                ${isSidebarOpen ? 'md:w-64' : 'md:w-20'} 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 md:p-6 flex items-center justify-between">
                    <div className={`${!isSidebarOpen && 'hidden'}`}>
                        <div className="font-bold text-lg text-white truncate max-w-[140px]">
                            {userInfo.email || 'User'}
                        </div>
                        <div className={`text-xs font-semibold capitalize ${userInfo.role === 'admin' ? 'text-purple-400' : 'text-blue-400'}`}>
                            {userInfo.role || 'Member'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:block p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                        </button>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-8">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/dashboard"}
                            onClick={handleNavClick}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-[#FFCC66]/20 to-[#FF7A18]/20 text-orange-400' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                        >
                            <item.icon size={20} className={`${!isSidebarOpen && 'mx-auto'}`} />
                            <span className={`font-medium whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-200 hover:bg-red-500/10 text-slate-400 hover:text-red-400 group"
                    >
                        <LogOut size={20} className={`${!isSidebarOpen && 'mx-auto'}`} />
                        <span className={`font-medium whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content - Takes full width on mobile */}
            <main className="flex-1 overflow-y-auto relative w-full min-w-0">
                {/* Header (optional or part of pages) */}
                <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-slate-100">Overview</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{userInfo.email || 'User'}</p>
                            <p className={`text-xs capitalize ${userInfo.role === 'admin' ? 'text-purple-400' : 'text-blue-400'}`}>{userInfo.role || 'Member'}</p>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm md:text-base">
                            {(userInfo.email || 'U').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
