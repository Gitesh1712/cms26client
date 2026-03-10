import { useState, useEffect, useRef } from 'react';
import { 
    Plus, 
    Trash2, 
    X, 
    Loader2, 
    AlertCircle, 
    Search, 
    Play,
    Edit3,
    Eye,
    EyeOff,
    ExternalLink,
    GripVertical,
    Upload,
    Image
} from 'lucide-react';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';


const getYoutubeId = (url) => {
    if (!url) return null;
    

    const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&\/\s]{11})/);
    if (shortsMatch) return shortsMatch[1];
    
    
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};


const getInstagramReelId = (url) => {
    if (!url) return null;
    const reelMatch = url.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
    return reelMatch ? reelMatch[1] : null;
};


const detectPlatform = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('instagram.com')) return 'instagram';
    return null;
};


const getYoutubeThumbnail = (videoUrl) => {
    const youtubeId = getYoutubeId(videoUrl);
    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;
};


const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return null;
    if (thumbnail.startsWith('http')) return thumbnail;
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${thumbnail}`;
};

const Shorts = () => {
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editingShort, setEditingShort] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        videoUrl: '',
        status: 1
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const fileInputRef = useRef(null);


    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });

    const fetchShorts = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            let params = `?page=${pagination.page}&limit=${pagination.limit}`;
            if (statusFilter !== '') params += `&status=${statusFilter}`;
            
            const response = await api.get(`/shorts${params}`, { 
                Authorization: `Bearer ${token}` 
            });
            
            setShorts(response?.shorts || []);
            if (response?.pagination) {
                setPagination(prev => ({ ...prev, ...response.pagination }));
            }
        } catch (err) {
            console.error('Failed to fetch shorts:', err);
            setError('Failed to load shorts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchShorts();
    }, [statusFilter, pagination.page]);

    const openAddModal = () => {
        setEditingShort(null);
        setFormData({ title: '', videoUrl: '', status: 1 });
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (short) => {
        setEditingShort(short);
        setFormData({
            title: short.title,
            videoUrl: short.videoUrl,
            status: short.status
        });
        setThumbnailFile(null);
        setThumbnailPreview(short.thumbnail ? getThumbnailUrl(short.thumbnail) : null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingShort(null);
        setFormData({ title: '', videoUrl: '', status: 1 });
        setThumbnailFile(null);
        setThumbnailPreview(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        

        if (name === 'videoUrl') {
            const platform = detectPlatform(value);
            if (platform === 'youtube' && !thumbnailFile) {
                const youtubeThumb = getYoutubeThumbnail(value);
                setThumbnailPreview(youtubeThumb);
            } else if (platform === 'instagram' && !thumbnailFile) {
                setThumbnailPreview(null);
            }
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearThumbnail = () => {
        setThumbnailFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        const platform = detectPlatform(formData.videoUrl);
        if (platform === 'youtube') {
            setThumbnailPreview(getYoutubeThumbnail(formData.videoUrl));
        } else {
            setThumbnailPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
   
        const platform = detectPlatform(formData.videoUrl);
        const youtubeId = getYoutubeId(formData.videoUrl);
        const instagramId = getInstagramReelId(formData.videoUrl);
        
        if (!platform || (!youtubeId && !instagramId)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid URL',
                text: 'Please enter a valid YouTube Shorts or Instagram Reels URL',
                confirmButtonColor: '#FF7A18'
            });
            return;
        }

   
        if (platform === 'instagram' && !thumbnailFile && !thumbnailPreview) {
            Swal.fire({
                icon: 'warning',
                title: 'Thumbnail Required',
                text: 'Instagram Reels require a custom thumbnail. Please upload one.',
                confirmButtonColor: '#FF7A18'
            });
            return;
        }

        setSubmitLoading(true);
        
        try {
            const token = sessionStorage.getItem('token');
            
    
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('videoUrl', formData.videoUrl);
            submitData.append('status', formData.status);
            
            if (thumbnailFile) {
                submitData.append('thumbnail', thumbnailFile);
            }
            
            if (editingShort) {
       
                const response = await fetch(`${API_BASE_URL}/shorts/${editingShort._id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: submitData
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to update short');
                }
                
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Short has been updated successfully.',
                    confirmButtonColor: '#FF7A18',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
      
                const response = await fetch(`${API_BASE_URL}/shorts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: submitData
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create short');
                }
                
                Swal.fire({
                    icon: 'success',
                    title: 'Added!',
                    text: 'New short has been added successfully.',
                    confirmButtonColor: '#FF7A18',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            
            closeModal();
            fetchShorts();
        } catch (err) {
            console.error('Failed to save short:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to save short. Please try again.',
                confirmButtonColor: '#FF7A18'
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        const result = await Swal.fire({
            title: 'Delete Short?',
            text: `Are you sure you want to delete "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            const token = sessionStorage.getItem('token');
            await api.delete(`/shorts/${id}`, { Authorization: `Bearer ${token}` });
            
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Short has been deleted.',
                confirmButtonColor: '#FF7A18',
                timer: 1500,
                showConfirmButton: false
            });
            
            fetchShorts();
        } catch (err) {
            console.error('Failed to delete short:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete short.',
                confirmButtonColor: '#FF7A18'
            });
        }
    };

    const handleStatusToggle = async (short) => {
        const newStatus = short.status === 1 ? 0 : 1;
        
        try {
            const token = sessionStorage.getItem('token');
            await api.patch(`/shorts/${short._id}/status`, { status: newStatus }, { 
                Authorization: `Bearer ${token}` 
            });
            fetchShorts();
        } catch (err) {
            console.error('Failed to update status:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update status.',
                confirmButtonColor: '#FF7A18'
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 1:
                return <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">Active</span>;
            case 0:
                return <span className="px-2 py-1 text-xs font-medium bg-slate-500/20 text-slate-400 rounded-full">Inactive</span>;
            case 2:
                return <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">Hidden</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-slate-500/20 text-slate-400 rounded-full">Unknown</span>;
        }
    };

    const getPlatformBadge = (platform) => {
        switch (platform) {
            case 'youtube':
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-red-600/20 text-red-400 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        YT
                    </span>
                );
            case 'instagram':
                return (
                    <span className="px-2 py-1 text-xs font-medium bg-pink-600/20 text-pink-400 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        IG
                    </span>
                );
            default:
                return null;
        }
    };

 
    const filteredShorts = shorts.filter(short => 
        short.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
     
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Shorts</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage YouTube Shorts & Instagram Reels</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all flex items-center gap-2 justify-center"
                >
                    <Plus size={20} />
                    Add Short
                </button>
            </div>

       
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row gap-4">
             
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search shorts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                    
          
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all min-w-[140px]"
                    >
                        <option value="">All Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                        <option value="2">Hidden</option>
                    </select>
                </div>
            </div>

        
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{pagination.total}</div>
                    <div className="text-sm text-slate-400">Total Shorts</div>
                </div>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{shorts.filter(s => s.status === 1).length}</div>
                    <div className="text-sm text-slate-400">Active</div>
                </div>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-slate-400">{shorts.filter(s => s.status === 0).length}</div>
                    <div className="text-sm text-slate-400">Inactive</div>
                </div>
                <div className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{shorts.filter(s => s.status === 2).length}</div>
                    <div className="text-sm text-slate-400">Hidden</div>
                </div>
            </div>

   
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 size={24} className="animate-spin" /> Loading shorts...
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-400">
                        <div className="flex items-center justify-center gap-2">
                            <AlertCircle size={24} /> {error}
                        </div>
                    </div>
                ) : filteredShorts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <Play size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No shorts found. Add one to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                        {filteredShorts.map((short, index) => {
                         
                            const thumbUrl = short.thumbnail 
                                ? getThumbnailUrl(short.thumbnail) 
                                : (short.platform === 'youtube' ? getYoutubeThumbnail(short.videoUrl) : null);
                            
                            return (
                                <div 
                                    key={short._id} 
                                    className="bg-slate-950/50 border border-white/5 rounded-xl overflow-hidden group hover:border-orange-500/30 transition-all"
                                >
                             
                                    <div className="relative aspect-[9/16] bg-slate-800 overflow-hidden">
                                        {thumbUrl ? (
                                            <img
                                                src={thumbUrl}
                                                alt={short.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/300x533/1e293b/475569?text=Short';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Play size={48} className="text-slate-600" />
                                            </div>
                                        )}
                                        
                                 
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        
                                      
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            {getStatusBadge(short.status)}
                                            {getPlatformBadge(short.platform)}
                                        </div>
                                        
                                  
                                        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-full">
                                            #{index + 1}
                                        </div>
                                        
                                    
                                        <a
                                            href={short.videoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <div className={`w-14 h-14 ${short.platform === 'instagram' ? 'bg-pink-500/90' : 'bg-orange-500/90'} rounded-full flex items-center justify-center`}>
                                                <Play size={24} className="text-white ml-1" fill="white" />
                                            </div>
                                        </a>
                                        
                                    
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <h3 className="text-white font-semibold text-sm line-clamp-2">
                                                {short.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                                                <span>{short.views || 0} views</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                             
                                    <div className="p-3 flex items-center justify-between border-t border-white/5">
                                        <button
                                            onClick={() => handleStatusToggle(short)}
                                            className={`p-2 rounded-lg transition-all ${
                                                short.status === 1 
                                                    ? 'text-green-400 hover:bg-green-500/10' 
                                                    : 'text-slate-400 hover:bg-slate-500/10'
                                            }`}
                                            title={short.status === 1 ? 'Deactivate' : 'Activate'}
                                        >
                                            {short.status === 1 ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                            <a
                                                href={short.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                title="Open in YouTube"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                            <button
                                                onClick={() => openEditModal(short)}
                                                className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(short._id, short.title)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-slate-400">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                        className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all"
                    >
                        Next
                    </button>
                </div>
            )}

      
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden my-8">
                    
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h3 className="text-lg font-semibold text-white">
                                {editingShort ? 'Edit Short' : 'Add New Short'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                       
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter short title"
                                    required
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>
                            
                  
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Video URL *
                                </label>
                                <input
                                    type="url"
                                    name="videoUrl"
                                    value={formData.videoUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://youtube.com/shorts/... or https://instagram.com/reel/..."
                                    required
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                                />
                                <div className="flex items-center gap-2 mt-2">
                                    {detectPlatform(formData.videoUrl) === 'youtube' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-red-600/20 text-red-400 rounded-full flex items-center gap-1">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                            </svg>
                                            YouTube Detected
                                        </span>
                                    )}
                                    {detectPlatform(formData.videoUrl) === 'instagram' && (
                                        <span className="px-2 py-1 text-xs font-medium bg-pink-600/20 text-pink-400 rounded-full flex items-center gap-1">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                            </svg>
                                            Instagram Detected
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Supports YouTube Shorts and Instagram Reels
                                </p>
                            </div>

                
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Thumbnail {detectPlatform(formData.videoUrl) === 'instagram' && !thumbnailFile && !editingShort?.thumbnail && <span className="text-red-400">* (Required for Instagram)</span>}
                                </label>
                                
                      
                                {thumbnailPreview && (
                                    <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden mb-3">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Thumbnail preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/640x360/1e293b/475569?text=Preview';
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className={`w-12 h-12 ${detectPlatform(formData.videoUrl) === 'instagram' ? 'bg-pink-600' : 'bg-red-600'} rounded-full flex items-center justify-center`}>
                                                <Play size={20} className="text-white ml-0.5" fill="white" />
                                            </div>
                                        </div>
                                        {thumbnailFile && (
                                            <button
                                                type="button"
                                                onClick={clearThumbnail}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                                                title="Remove custom thumbnail"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}
                                
                           
                                <div className="flex gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                        id="thumbnail-upload"
                                    />
                                    <label
                                        htmlFor="thumbnail-upload"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl cursor-pointer hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-600"
                                    >
                                        <Upload size={18} />
                                        {thumbnailFile ? 'Change Thumbnail' : 'Upload Thumbnail'}
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {detectPlatform(formData.videoUrl) === 'youtube' 
                                        ? 'Optional - YouTube auto-generates thumbnail' 
                                        : 'Upload a 9:16 image for best results'}
                                </p>
                            </div>
                            
                       
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                                >
                                    <option value={1}>Active (Visible)</option>
                                    <option value={0}>Inactive (Draft)</option>
                                    <option value={2}>Hidden</option>
                                </select>
                            </div>
                            
                              
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading || !formData.title || !formData.videoUrl}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editingShort ? 'Update' : 'Add'} Short
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shorts;
