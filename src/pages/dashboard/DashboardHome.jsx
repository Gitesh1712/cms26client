import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail, Loader2, CheckCircle, XCircle, FileText, Users,
  FolderOpen, Layers, Clock, CheckCircle2, Ban, EyeOff,
} from "lucide-react";
import { api } from "../../services/api";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [leadsStats, setLeadsStats] = useState({ totalLeads: 0, todayLeads: 0 });
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalPosts: 0, totalCategories: 0, teamMembers: 0,
    approvedPosts: 0, pendingPosts: 0, rejectedPosts: 0, hiddenPosts: 0,
  });

  const fetchLeads = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await api.get("/leads/count", { Authorization: `Bearer ${token}` });
      setLeadsStats({ totalLeads: response?.totalLeads || 0, todayLeads: response?.todayLeads || 0 });
    } catch (err) { console.error("Failed to fetch leads:", err); }
  };

  const fetchCategoryCounts = async () => {
    try {
      setCategoryLoading(true);
      const token = sessionStorage.getItem("token");
      const [categoriesRes, postsRes] = await Promise.all([
        api.get("/public/categories"),
        api.get("/posts", { Authorization: `Bearer ${token}` })
      ]);
      const categories = categoriesRes?.data || [];
      const rawPosts = Array.isArray(postsRes) ? postsRes : (postsRes?.data || []);
      const posts = [...rawPosts].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

  
      const countMap = {};
      posts.forEach(post => {
        const cat = post.category;
        if (cat) {
          const key = String(cat).toLowerCase();
          countMap[key] = (countMap[key] || 0) + 1;
        }
      });

      setCategoryCounts(categories.map(cat => ({
        ...cat,
        count: countMap[String(cat.id).toLowerCase()] || 0
      })));

      setAdminStats(prev => ({
        ...prev,
        totalPosts: posts.length,
        totalCategories: categories.length,
        approvedPosts: posts.filter(p => p.status === 1).length,
        pendingPosts: posts.filter(p => p.status === 0).length,
        rejectedPosts: posts.filter(p => p.status === 2).length,
        hiddenPosts: posts.filter(p => p.status === 4).length,
      }));
    } catch (err) {
      console.error("Failed to fetch category counts:", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchSubscriberStats = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const allSubs = await api.get("/newsletter", { Authorization: `Bearer ${token}` });
      const total = allSubs?.total || 0;
      const active = allSubs?.subscribers?.filter((s) => s.status === "active").length || 0;
      setStats({ total, active, unsubscribed: total - active });
    } catch (err) { console.error("Failed to fetch subscriber stats:", err); }
  };

  const fetchTeamMembers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await api.get("/users", { Authorization: `Bearer ${token}` });
      const users = response?.data?.users || [];
      setAdminStats(prev => ({ ...prev, teamMembers: users.length }));
    } catch (err) { console.error("Failed to fetch team members:", err); }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");
    setIsAdmin(userInfo.role === "admin");
    fetchLeads();
    fetchCategoryCounts();
    if (userInfo.role === "admin") {
      fetchSubscriberStats();
      fetchTeamMembers();
    }
  }, []);

  useEffect(() => {
    const handler = () => fetchCategoryCounts();
    window.addEventListener('categoriesUpdated', handler);
    return () => window.removeEventListener('categoriesUpdated', handler);
  }, []);

 
  const handleCategoryCardClick = (cat) => {
    navigate(`/dashboard/stories?category=${encodeURIComponent(cat.id)}`);
  };

  return (
    <div className="space-y-8">

      {isAdmin && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Leads Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-orange-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
              <div className="relative">
                <p className="text-slate-400 text-xs md:text-sm font-medium mb-2">Today's Leads</p>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{leadsStats.todayLeads}</p>
                <p className="text-xs text-slate-500">New leads received today</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-blue-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
              <div className="relative">
                <p className="text-slate-400 text-xs md:text-sm font-medium mb-2">Total Leads</p>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{leadsStats.totalLeads}</p>
                <p className="text-xs text-slate-500">All-time leads collected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Posts by Category</h2>
        {categoryLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categoryCounts.map((cat, index) => (
              <div key={cat.id} onClick={() => handleCategoryCardClick(cat)}
                className={`cursor-pointer border border-white/10 rounded-2xl p-5 md:p-6 relative overflow-hidden hover:border-orange-500/40 hover:ring-1 hover:ring-orange-500/20 transition-all ${
                  index % 2 === 0 ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-800/80 to-slate-900/90'
                }`}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10 opacity-15"
                  style={{ backgroundColor: cat.color || '#FF7A18' }}></div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${cat.color || '#FF7A18'}20` }}>
                    <FileText size={24} style={{ color: cat.color || '#FF7A18' }} />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-white mb-2">{cat.count}</p>
                  <p className="text-sm text-slate-400">{cat.name}</p>
                  <p className="text-xs text-slate-600 mt-1">Click to view posts →</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="text-orange-500" size={24} /> Newsletter Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { label: 'Total Subscribers', value: stats.total, color: 'orange', icon: <Mail size={28} /> },
              { label: 'Active', value: stats.active, color: 'green', icon: <CheckCircle size={28} /> },
              { label: 'Unsubscribed', value: stats.unsubscribed, color: 'red', icon: <XCircle size={28} /> },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-${color}-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16`}></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">{label}</p>
                    <p className={`text-2xl md:text-3xl font-bold text-${color === 'orange' ? 'white' : color + '-400'} mt-1`}>{value}</p>
                  </div>
                  <span className={`text-${color}-500`}>{icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="text-purple-500" size={24} /> Quick Stats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-blue-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div><p className="text-slate-400 text-xs md:text-sm">Total Posts</p><p className="text-2xl md:text-3xl font-bold text-white mt-1">{adminStats.totalPosts}</p></div>
                <FileText className="text-blue-500" size={28} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-amber-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div><p className="text-slate-400 text-xs md:text-sm">Total Categories</p><p className="text-2xl md:text-3xl font-bold text-amber-400 mt-1">{adminStats.totalCategories}</p></div>
                <FolderOpen className="text-amber-500" size={28} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-purple-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
              <div className="relative flex items-center justify-between">
                <div><p className="text-slate-400 text-xs md:text-sm">Team Members</p><p className="text-2xl md:text-3xl font-bold text-purple-400 mt-1">{adminStats.teamMembers}</p></div>
                <Users className="text-purple-500" size={28} />
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="text-cyan-500" size={24} /> Post Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Approved', value: adminStats.approvedPosts, color: 'green', icon: <CheckCircle2 size={28} /> },
              { label: 'Pending', value: adminStats.pendingPosts, color: 'yellow', icon: <Clock size={28} /> },
              { label: 'Rejected', value: adminStats.rejectedPosts, color: 'red', icon: <Ban size={28} /> },
              { label: 'Hidden', value: adminStats.hiddenPosts, color: 'slate', icon: <EyeOff size={28} /> },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-${color}-500/10 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16`}></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">{label}</p>
                    <p className={`text-2xl md:text-3xl font-bold text-${color}-400 mt-1`}>{value}</p>
                  </div>
                  <span className={`text-${color}-500`}>{icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;