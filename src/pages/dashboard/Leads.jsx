import { useState, useEffect } from "react";
import { Mail, Phone, Calendar, MessageSquare, Search, Filter, Download, Trash2, Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { api } from "../../services/api";
import Swal from "sweetalert2";
import CitizenArticleContent from "../../components/CitizenArticleContent";
import { getLeadArticleBody, looksLikeBlockContent, leadMatchesFilter } from "../../utils/contentBlocks";

const CONTACT_INQUIRY_TYPES = ["General", "Partnership", "Support"];
const CITIZEN_JOURNALIST_INQUIRY_TYPES = ["Story Idea", "Video Suggestion", "Story Submission", "Full Article"];
const STORY_TYPES = ["Story Submission", "Story Idea", "Video Suggestion", "Full Article"];

const parseLeadsResponse = (response) => {
    if (response?.success) return Array.isArray(response.data) ? response.data : [];
    if (Array.isArray(response)) return response;
    if (response?.data) return Array.isArray(response.data) ? response.data : [];
    if (response?.leads) return Array.isArray(response.leads) ? response.leads : [];
    return [];
};

const Leads = ({ mode }) => {
    const [leads, setLeads]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [searchTerm, setSearchTerm]     = useState("");
    const [filterType, setFilterType]     = useState("all");
    const [selectedLead, setSelectedLead] = useState(null);
    const [modalOpen, setModalOpen]       = useState(false);
    const [currentPage, setCurrentPage]   = useState(1);
    const [leadsPerPage]                  = useState(10);
    const [pagination, setPagination]     = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const typePool     = mode === "citizen" ? CITIZEN_JOURNALIST_INQUIRY_TYPES : CONTACT_INQUIRY_TYPES;
    const pageTitle    = mode === "citizen" ? "Citizen Journalist" : "Leads Management";
    const pageSubtitle = mode === "citizen"
        ? "Submissions from the Citizen Journalist page"
        : "Contact form submissions (General, Partnership, Support)";
    const emptyHint    = mode === "citizen"
        ? "Citizen Journalist submissions will appear here"
        : "Contact form submissions will appear here";

    useEffect(() => {
        const timer = setTimeout(() => fetchLeads(1), 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filterType, mode]);

    const fetchLeads = async (page = 1) => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", leadsPerPage);
            if (searchTerm) params.append("search", searchTerm);
            
            if (mode === "citizen") {
                params.append("inquiryType", typePool.join(","));
            } else if (mode === "contact") {
                params.append("inquiryType", filterType === "all" ? typePool.join(",") : filterType);
            } else if (filterType !== "all") {
                params.append("inquiryType", filterType);
            }
            const response = await api.get(`/public/leads/leads?${params.toString()}`, { Authorization: `Bearer ${token}` });
            const rows = parseLeadsResponse(response);
            setLeads(mode === "citizen" ? rows.filter((l) => leadMatchesFilter(l, filterType)) : rows);
            setPagination({ page: response?.page || 1, limit: response?.limit || 10, total: response?.total || 0, totalPages: response?.totalPages || 0 });
            setCurrentPage(page);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch leads:", err);
            if (err?.response?.status === 401) setError("Authentication failed. Please login again.");
            else if (err?.response?.status === 403) setError("Access denied.");
            else if (err?.response?.status === 404) setError("API endpoint not found.");
            else if (err?.request) setError("Network error. Please check your connection.");
            else setError("Failed to load leads. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (leadId, leadName) => {
        const result = await Swal.fire({
            title: "Delete Lead?", html: `Are you sure you want to delete the lead from <strong>"${leadName}"</strong>?`,
            icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete", cancelButtonText: "Cancel", background: "#1e293b", color: "#fff",
        });
        if (result.isConfirmed) {
            try {
                const token = sessionStorage.getItem("token");
                await api.delete(`/leads/delete/${leadId}`, { Authorization: `Bearer ${token}` });
                await Swal.fire({ title: "Deleted!", text: "Lead deleted successfully.", icon: "success", background: "#1e293b", color: "#fff" });
                fetchLeads(currentPage);
            } catch {
                await Swal.fire({ title: "Error!", text: "Failed to delete lead.", icon: "error", background: "#1e293b", color: "#fff" });
            }
        }
    };

    const leadType = (lead) => lead?.inquiryType || lead?.submissionType || "";
    const isStoryLead  = (lead) => STORY_TYPES.includes(lead?.inquiryType) || STORY_TYPES.includes(lead?.submissionType);
    const isFullArticle = (lead) =>
        ["Story Submission", "Full Article"].includes(lead?.inquiryType) ||
        ["Story Submission", "Full Article"].includes(lead?.submissionType);

    const getLeadBody = (lead) => getLeadArticleBody(lead);

    const contentLabel = (lead) => {
        const type = leadType(lead);
        if (type === "Story Idea") return "Idea Description";
        if (type === "Video Suggestion") return "Video Description / Link";
        if (isFullArticle(lead)) return "Article Content";
        return "Message";
    };

    const hasBlockContent = (lead) => looksLikeBlockContent(getLeadBody(lead));

    const exportToCSV = () => {
        const headers = ["Name", "Email", "Mobile", "Inquiry Type", "Story Title", "Category", "Message", "Date"];
        const csvData = leads.map((lead) => [
            lead.name, lead.email, lead.mobile, lead.inquiryType,
            lead.storyTitle || "", lead.storyCategory || "",
            `"${String(getLeadBody(lead) || "").replace(/"/g, '""')}"`,
            new Date(lead.createdAt).toLocaleString(),
        ]);
        const csvContent = [headers.join(","), ...csvData.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${mode === "citizen" ? "citizen_journalist" : "leads"}_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    const filterOptions = (mode === "contact" || mode === "citizen")
        ? typePool
        : [...new Set(leads.map((l) => l.inquiryType).filter(Boolean))];

    const effectiveTotalPages = pagination.totalPages;
    const effectiveTotal      = pagination.total;

    return (
        <div className="p-6 md:p-8 min-h-screen">

            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{pageTitle}</h1>
                    <p className="text-slate-400 text-sm">{pageSubtitle}</p>
                </div>
                <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-medium text-sm">
                    <Download size={18} /> Export CSV
                </button>
            </div>

          
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="text" placeholder="Search by name, email, or message..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer">
                            <option value="all">All types in this section</option>
                            {filterOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
            </div>

        
            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 size={40} className="animate-spin text-orange-500" /></div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500" /><p className="text-red-400">{error}</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center">
                    <Mail size={64} className="mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 text-lg mb-2">No leads found</p>
                    <p className="text-slate-500 text-sm">{searchTerm || filterType !== "all" ? "Try adjusting your filters" : emptyHint}</p>
                </div>
            ) : (
                <>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
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
                                    {leads.map((lead, index) => (
                                        <tr key={lead._id} className="hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => { setSelectedLead(lead); setModalOpen(true); }}>
                                            <td className="p-4 text-slate-500 text-sm">{(currentPage - 1) * leadsPerPage + index + 1}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {lead.name?.[0]?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <span className="text-white font-medium block">{lead.name}</span>
                                                        {isStoryLead(lead) && lead.storyTitle && (
                                                            <span className="text-slate-500 text-xs truncate max-w-[160px] block">{lead.storyTitle}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300 text-sm">{lead.email}</td>
                                            <td className="p-4 text-slate-300 text-sm">{lead.mobile || "-"}</td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isStoryLead(lead) ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                                                    {leadType(lead) || "General"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                                                {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setModalOpen(true); }}
                                                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-400"><Eye size={18} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(lead._id, lead.name); }}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {effectiveTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-slate-400 text-sm">
                                Showing {(currentPage - 1) * leadsPerPage + 1} to {Math.min(currentPage * leadsPerPage, effectiveTotal)} of {effectiveTotal} leads
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => fetchLeads(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white"><ChevronLeft size={20} /></button>
                                <span className="text-white text-sm px-4">Page {currentPage} of {effectiveTotalPages}</span>
                                <button onClick={() => fetchLeads(Math.min(effectiveTotalPages, currentPage + 1))} disabled={currentPage === effectiveTotalPages}
                                    className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                    )}
                </>
            )}

            
            {modalOpen && selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
               
                    <div className={`bg-slate-900 border border-white/10 rounded-2xl w-full max-h-[90vh] overflow-y-auto ${isFullArticle(selectedLead) ? "max-w-3xl" : "max-w-2xl"}`}
                        onClick={(e) => e.stopPropagation()}>

                        <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Lead Details</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400"><X size={24} /></button>
                        </div>

                        <div className="p-6 space-y-6">
                           
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                    {selectedLead.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{selectedLead.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isStoryLead(selectedLead) ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"}`}>
                                        {leadType(selectedLead) || "General Inquiry"}
                                    </span>
                                </div>
                            </div>

                           
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2"><Mail size={18} /><span className="text-xs uppercase tracking-wider">Email</span></div>
                                    <p className="text-white font-medium">{selectedLead.email}</p>
                                </div>
                                {selectedLead.mobile && (
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-slate-400 mb-2"><Phone size={18} /><span className="text-xs uppercase tracking-wider">Mobile</span></div>
                                        <p className="text-white font-medium">{selectedLead.mobile}</p>
                                    </div>
                                )}
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2"><Calendar size={18} /><span className="text-xs uppercase tracking-wider">Received On</span></div>
                                    <p className="text-white font-medium">{new Date(selectedLead.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</p>
                                </div>
                            </div>

                            
                            {isStoryLead(selectedLead) && (
                                <div className="space-y-4">
                                    {selectedLead.storyTitle && (
                                        <div className="bg-slate-800/50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2"><span>📰</span><span className="text-xs uppercase tracking-wider">Story Title</span></div>
                                            <p className="text-white font-semibold text-lg leading-snug">{selectedLead.storyTitle}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedLead.submissionType && (
                                            <div className="bg-slate-800/50 rounded-xl p-4">
                                                <div className="flex items-center gap-2 text-slate-400 mb-2"><span>📋</span><span className="text-xs uppercase tracking-wider">Submission Type</span></div>
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">{selectedLead.submissionType}</span>
                                            </div>
                                        )}
                                        {selectedLead.storyCategory && (
                                            <div className="bg-slate-800/50 rounded-xl p-4">
                                                <div className="flex items-center gap-2 text-slate-400 mb-2"><span>🗂️</span><span className="text-xs uppercase tracking-wider">Category</span></div>
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">{selectedLead.storyCategory}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                           
                            {getLeadBody(selectedLead) && (
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                                        <MessageSquare size={18} />
                                        <span className="text-xs uppercase tracking-wider">{contentLabel(selectedLead)}</span>
                                        {hasBlockContent(selectedLead) && (
                                            <span className="ml-auto px-2 py-0.5 rounded text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                Rich Article
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-slate-500 text-xs mb-3">
                                        Use <strong className="text-slate-400">Copy</strong> or <strong className="text-slate-400">Copy all links</strong> on image/video URLs when creating a post in Stories.
                                    </p>
                                    <CitizenArticleContent value={getLeadBody(selectedLead)} showMediaLinks />
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-slate-900 border-t border-white/10 p-6 flex items-center justify-end gap-3">
                            <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">Close</button>
                            <a href={`https://mail.google.com/mail/?view=cm&to=${selectedLead.email}&su=Re: Your ${selectedLead.inquiryType || "Inquiry"} - ${selectedLead.storyTitle || ""}&body=Hi ${selectedLead.name},%0A%0A`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-slate-900 rounded-xl transition-all font-bold">
                                <Mail size={18} /> Reply via Email
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;