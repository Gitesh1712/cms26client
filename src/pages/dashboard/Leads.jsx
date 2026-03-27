import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Mail, Phone, User, Calendar, MessageSquare, Search, Filter, Download, Trash2, Eye, Loader2, AlertCircle,ChevronLeft, ChevronRight, X} from "lucide-react";
import { api } from "../../services/api";
import Swal from "sweetalert2";

const Leads = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [selectedLead, setSelectedLead] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    
   
    const [currentPage, setCurrentPage] = useState(1);
    const [leadsPerPage] = useState(10);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchLeads();
    }, []);


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads(1); 
        }, 300); 
        
        return () => clearTimeout(timer);
    }, [searchTerm, filterType]);

    const fetchLeads = async (page = 1) => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            
           
            const queryParams = new URLSearchParams();
            queryParams.append('page', page);
            queryParams.append('limit', leadsPerPage);
            
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }
            if (filterType !== 'all') {
                queryParams.append('inquiryType', filterType);
            }
            
            const response = await api.get(`/public/leads/leads?${queryParams.toString()}`, { 
                Authorization: `Bearer ${token}` 
            });
            
            let leadsData = [];
            let paginationData = { page: 1, limit: 10, total: 0, totalPages: 0 };
            
            if (response?.success) {
                leadsData = Array.isArray(response.data) ? response.data : [];
                paginationData = {
                    page: response.page || 1,
                    limit: response.limit || 10,
                    total: response.total || 0,
                    totalPages: response.totalPages || 0
                };
            } else if (Array.isArray(response)) {
                leadsData = response;
            } else if (response?.data) {
                leadsData = Array.isArray(response.data) ? response.data : [];
            } else if (response?.leads) {
                leadsData = Array.isArray(response.leads) ? response.leads : [];
            }
            
            console.log('Fetched leads:', leadsData);
            console.log('Pagination data:', paginationData);
            
            setLeads(leadsData);
            setPagination(paginationData);
            setCurrentPage(page);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch leads:", err);
            
           
            if (err.response) {
                console.error('Error response:', err.response.status, err.response.data);
                
            
                if (err.response.status === 404) {
                    setError(
                        <div>
                            <p className="mb-2">Backend API endpoint '/public/leads/leads' not found.</p>
                            <p className="text-sm text-slate-400">
                                Please verify the API endpoint is correct and accessible.
                                <code className="block mt-2 p-2 bg-slate-800 rounded">GET /api/public/leads/leads</code>
                            </p>
                        </div>
                    );
                } else if (err.response.status === 401) {
                    setError("Authentication failed. Please login again.");
                } else if (err.response.status === 403) {
                    setError("Access denied. You don't have permission to view leads.");
                } else {
                    setError(`Server error: ${err.response.status}. Please try again.`);
                }
            } else if (err.request) {
                setError("Network error. Please check your internet connection.");
            } else {
                setError("Failed to load leads. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (leadId, leadName) => {
        const result = await Swal.fire({
            title: "Delete Lead?",
            html: `Are you sure you want to delete the lead from <strong>"${leadName}"</strong>?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            background: "#1e293b",
            color: "#fff"
        });

        if (result.isConfirmed) {
            try {
                const token = sessionStorage.getItem("token");
                await api.delete(`/leads/delete/${leadId}`, { 
                    Authorization: `Bearer ${token}` 
                });
                
                await Swal.fire({
                    title: "Deleted!",
                    text: "Lead has been deleted successfully.",
                    icon: "success",
                    background: "#1e293b",
                    color: "#fff"
                });
                
               
                fetchLeads(currentPage);
            } catch (err) {
                console.error("Failed to delete lead:", err);
                await Swal.fire({
                    title: "Error!",
                    text: "Failed to delete lead. Please try again.",
                    icon: "error",
                    background: "#1e293b",
                    color: "#fff"
                });
            }
        }
    };

    const handleViewDetails = (lead) => {
        setSelectedLead(lead);
        setModalOpen(true);
    };

    
    const currentLeads = leads;

    const exportToCSV = () => {
        const headers = ["Name", "Email", "Mobile", "Inquiry Type", "Message", "Date"];
        const csvData = currentLeads.map(lead => [
            lead.name,
            lead.email,
            lead.mobile,
            lead.inquiryType,
            `"${lead.message?.replace(/"/g, '""')}"`,
            new Date(lead.createdAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(","),
            ...csvData.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const inquiryTypes = [...new Set(leads.map(l => l.inquiryType).filter(Boolean))];

    return (
        <div className="p-6 md:p-8 min-h-screen">
           
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Leads Management</h1>
                    <p className="text-slate-400 text-sm">View and manage all contact form submissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-medium text-sm"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>
      
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
                        >
                            <option value="all">All Inquiry Types</option>
                            {inquiryTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>




           
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-orange-500" />
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                    <p className="text-red-400">{error}</p>
                </div>
            ) : currentLeads.length === 0 ? (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
                    <Mail size={64} className="mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 text-lg mb-2">No leads found</p>
                    <p className="text-slate-500 text-sm">
                        {searchTerm || filterType !== "all" 
                            ? "Try adjusting your filters" 
                            : "Contact form submissions will appear here"}
                    </p>
                </div>
            ) : (
                <>
                  
                    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                                        <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                                        <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Mobile</th>
                                        <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentLeads.map((lead, index) => (
                                        <tr 
                                            key={lead._id} 
                                            className="hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => handleViewDetails(lead)}
                                        >
                                            <td className="p-4 text-slate-500 text-sm">{(currentPage - 1) * leadsPerPage + index + 1}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {lead.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="text-white font-medium">{lead.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300 text-sm">{lead.email}</td>
                                            <td className="p-4 text-slate-300 text-sm">{lead.mobile || '-'}</td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                    {lead.inquiryType || 'General'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {new Date(lead.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(lead);
                                                        }}
                                                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-400"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(lead._id, lead.name);
                                                        }}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                 
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-slate-400 text-sm">
                                Showing {(currentPage - 1) * leadsPerPage + 1} to {Math.min(currentPage * leadsPerPage, pagination.total)} of {pagination.total} leads
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const newPage = Math.max(1, currentPage - 1);
                                        fetchLeads(newPage);
                                    }}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-white text-sm px-4">
                                    Page {currentPage} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => {
                                        const newPage = Math.min(pagination.totalPages, currentPage + 1);
                                        fetchLeads(newPage);
                                    }}
                                    disabled={currentPage === pagination.totalPages}
                                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

         
            {modalOpen && selectedLead && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setModalOpen(false)}
                >
                    <div 
                        className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Lead Details</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                           
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                    {selectedLead.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{selectedLead.name}</h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                        {selectedLead.inquiryType || 'General Inquiry'}
                                    </span>
                                </div>
                            </div>

                           
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Mail size={18} />
                                        <span className="text-xs uppercase tracking-wider">Email</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedLead.email}</p>
                                </div>

                                {selectedLead.mobile && (
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                                            <Phone size={18} />
                                            <span className="text-xs uppercase tracking-wider">Mobile</span>
                                        </div>
                                        <p className="text-white font-medium">{selectedLead.mobile}</p>
                                    </div>
                                )}

                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <Calendar size={18} />
                                        <span className="text-xs uppercase tracking-wider">Received On</span>
                                    </div>
                                    <p className="text-white font-medium">
                                        {new Date(selectedLead.createdAt).toLocaleString('en-US', {
                                            dateStyle: 'long',
                                            timeStyle: 'short'
                                        })}
                                    </p>
                                </div>
                            </div>

                           
                            {selectedLead.message && (
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                                        <MessageSquare size={18} />
                                        <span className="text-xs uppercase tracking-wider">Message</span>
                                    </div>
                                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                                        {selectedLead.message}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-slate-900 border-t border-white/10 p-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                Close
                            </button>
                            <a
                                href={`https://mail.google.com/mail/?view=cm&to=${selectedLead.email}&su=Re: Your Inquiry - ${selectedLead.inquiryType || 'General'}&body=Hi ${selectedLead.name},%0A%0A`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-slate-900 rounded-xl transition-all font-bold"
                            >
                                <Mail size={18} />
                                Reply via Email
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
