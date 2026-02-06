import { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { api } from "../../services/api";
import Swal from 'sweetalert2';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 });

 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", source: "manual" });

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await api.get(`/newsletter${params}`, {
        Authorization: `Bearer ${token}`,
      });

      setSubscribers(response?.subscribers || []);

   
      const allSubs = await api.get("/newsletter", {
        Authorization: `Bearer ${token}`,
      });
      const total = allSubs?.total || 0;
      const active =
        allSubs?.subscribers?.filter((s) => s.status === "active").length || 0;
      const unsubscribed = total - active;
      setStats({ total, active, unsubscribed });
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
      setError("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSubscribers();
  }, [statusFilter]);

  const openAddModal = () => {
    setFormData({ email: "", source: "manual" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ email: "", source: "manual" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      await api.post("/newsletter", formData, {
        Authorization: `Bearer ${token}`,
      });
      closeModal();
      fetchSubscribers();
    } catch (err) {
      console.error("Failed to add subscriber:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to add subscriber. Please try again.',
        confirmButtonColor: '#FF7A18'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      const newStatus = currentStatus === "active" ? "unsubscribed" : "active";
      await api.put(
        `/newsletter/${id}`,
        { status: newStatus },
        { Authorization: `Bearer ${token}` }
      );
      fetchSubscribers();
    } catch (err) {
      console.error("Failed to update status:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update subscriber status.',
        confirmButtonColor: '#FF7A18'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF7A18',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        const token = sessionStorage.getItem("token");
        await api.delete(`/newsletter/${id}`, {
          Authorization: `Bearer ${token}`,
        });
        fetchSubscribers();
      } catch (err) {
        console.error("Failed to delete subscriber:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete subscriber.',
          confirmButtonColor: '#FF7A18'
        });
      }
    }
  };

  const handleExport = async () => {
    try {
      // Create CSV from current data
      const dataToExport = filteredSubscribers;
      const NEWLINE = "\r\n";

      let csvContent = `Email,Status,Source,Sign-up Date${NEWLINE}`;
      dataToExport.forEach((sub) => {
        csvContent += `"${sub.email}",${sub.status},${sub.source},"${new Date(
          sub.createdAt
        ).toISOString()}"${NEWLINE}`;
      });

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to export subscribers.',
        confirmButtonColor: '#FF7A18'
      });
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
              <Mail className="text-orange-500" size={24} />
              <span className="hidden sm:inline">Newsletter Subscribers</span>
              <span className="sm:hidden">Subscribers</span>
            </h2>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Manage your email subscribers
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10 text-sm"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>

    
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs md:text-sm">
                  Total Subscribers
                </p>
                <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <Mail className="text-orange-500" size={28} />
            </div>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs md:text-sm">Active</p>
                <p className="text-2xl md:text-3xl font-bold text-green-400 mt-1">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={28} />
            </div>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs md:text-sm">
                  Unsubscribed
                </p>
                <p className="text-2xl md:text-3xl font-bold text-red-400 mt-1">
                  {stats.unsubscribed}
                </p>
              </div>
              <XCircle className="text-red-500" size={28} />
            </div>
          </div>
        </div>
      </div>

   
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
          />
        </div>
        <div className="relative w-full md:w-48">
          <Filter
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
          <p className="text-slate-400">Loading subscribers...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle size={24} />
            <span className="font-semibold">Error</span>
          </div>
          {error}
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-white/10 rounded-2xl text-center text-slate-500">
          <div className="flex justify-center mb-4">
            <Mail size={48} className="opacity-20" />
          </div>
          <p className="text-lg mb-4">
            {searchTerm
              ? "No subscribers match your search"
              : "No subscribers found"}
          </p>
          {!searchTerm && (
            <button
              onClick={openAddModal}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              Add your first subscriber
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-800/50 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider hidden sm:table-cell">
                    Source
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider hidden md:table-cell">
                    Subscribed
                  </th>
                  <th className="text-right px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber._id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                          {subscriber.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium text-sm md:text-base truncate max-w-[120px] sm:max-w-none">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <button
                        onClick={() =>
                          handleStatusToggle(subscriber._id, subscriber.status)
                        }
                        className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          subscriber.status === "active"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                        }`}
                      >
                        {subscriber.status === "active" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        <span className="hidden sm:inline">
                          {subscriber.status.charAt(0).toUpperCase() +
                            subscriber.status.slice(1)}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 capitalize">
                        {subscriber.source}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-slate-400 text-xs md:text-sm hidden md:table-cell">
                      {new Date(subscriber.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDelete(subscriber._id)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

   
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Add New Subscriber
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                  placeholder="subscriber@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                >
                  <option value="manual">Manual</option>
                  <option value="footer">Footer</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Plus size={20} />
                  )}
                  Add Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Newsletter;
