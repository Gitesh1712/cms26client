import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Upload, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import LexicalEditor from '../../components/LexicalEditor';

const EditStory = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'entertainment',
        type: 'article',
        author: 'Admin',
        tags: '',
        featured: false,
        heroContent: false,
        topStory: false,
        categoryHighlight: false,
        mediaUrl: ''
    });

    // Media State
    const [mediaType, setMediaType] = useState('file'); // 'file' or 'url'
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingMedia, setExistingMedia] = useState([]);
    //helper functions for video embed
    const isEmbedVideo = (url) =>
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('vimeo.com');

    const getEmbedUrl = (url) => {
        if (url.includes('youtu.be')) {
            return `https://www.youtube.com/embed/${url.split('/').pop()}`;
        }
        if (url.includes('youtube.com')) {
            return `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}`;
        }
        if (url.includes('vimeo.com')) {
            return `https://player.vimeo.com/video/${url.split('/').pop()}`;
        }
        return url;
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchPost = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem('token');
                const response = await api.get(`/posts/${id}`, { Authorization: `Bearer ${token}` });

                // Populate form with existing data
                setFormData({
                    title: response.title || '',
                    description: response.description || '',
                    category: response.category || 'entertainment',
                    type: response.postType || 'article',
                    author: response.author || 'Admin',
                    tags: response.tags ? response.tags.join(', ') : '',
                    featured: response.featured || false,
                    heroContent: response.heroContent || false,
                    topStory: response.topStory || false,
                    categoryHighlight: response.categoryHighlight || false,
                    mediaUrl: response.media[0]?.url || ''
                });

                setExistingMedia(response.media || []);
            } catch (err) {
                console.error("Failed to fetch post:", err);
                alert("Failed to load story. Redirecting...");
                navigate('/dashboard/stories');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();

        // Fetch categories
        const fetchCategories = async () => {
            try {
                const response = await api.get('/public/categories');
                const categoriesData = response?.data || [];
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, [id, navigate]);

    // Auto-switch to URL mode when video type is selected
    useEffect(() => {
        if (formData.type === 'video') {
            setMediaType('url');
        }
    }, [formData.type]);

    const handleUpdateStory = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const token = sessionStorage.getItem('token');
            const data = new FormData();

            // Append simple fields
            Object.keys(formData).forEach(key => {
                if (key !== 'mediaUrl') {
                    data.append(key, formData[key]);
                }
            });

            // Handle Media
            if (mediaType === 'url' && formData.mediaUrl) {
                data.append('mediaUrl', formData.mediaUrl);
            } else if (mediaType === 'file' && selectedFiles.length > 0) {
                const fieldName = formData.type === 'video' ? 'videos' : 'images';
                Array.from(selectedFiles).forEach(file => {
                    data.append(fieldName, file);
                });
            }

            await api.put(`/posts/${id}`, data, { Authorization: `Bearer ${token}` });

            navigate('/dashboard/stories');
        } catch (err) {
            console.error("Failed to update post:", err);
            alert("Failed to update post. Please try again.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFiles(e.target.files);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
                <p className="text-slate-400">Loading story...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/stories')}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-white">Edit Story</h2>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl max-w-4xl">
                <form onSubmit={handleUpdateStory} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Title <span className="text-red-400">*</span></label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                placeholder="Enter story title"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                            >
                                {loadingCategories ? (
                                    <option>Loading categories...</option>
                                ) : categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No categories available</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Description <span className="text-red-400">*</span></label>
                        <LexicalEditor
                            value={formData.description}
                            onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                            placeholder="Enter story description..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Post Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                            >
                                <option value="article">Article</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Author</label>
                            <input
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                disabled={(() => {
                                    const userInfo = sessionStorage.getItem('userInfo');
                                    if (userInfo) {
                                        try {
                                            const { role } = JSON.parse(userInfo);
                                            return role !== 'admin';
                                        } catch (err) {
                                            return true;
                                        }
                                    }
                                    return true;
                                })()}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Tags (comma separated)</label>
                        <input
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                            placeholder="news, trending, viral"
                        />
                    </div>

                    {existingMedia.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 block">Current Media</label>
                            <div className="flex gap-4 flex-wrap">
                                {existingMedia.map((media, idx) => (
                                    // <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-700">
                                    //     {media.mediaType === 'video' ? (
                                    //         <video src={media.url.startsWith('http') ? media.url : `${import.meta.env.VITE_API_URL}${media.url}`} className="w-full h-full object-cover" />
                                    //     ) : (
                                    //         <img src={media.url.startsWith('http') ? media.url : `${import.meta.env.VITE_API_URL}${media.url}`} alt="Media" className="w-full h-full object-cover" />
                                    //     )}
                                    // </div>
                                    // <div
                                    //     key={idx}
                                    //     className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-700 bg-black"
                                    // >
                                    <div
                                        key={idx}
                                        className="relative w-56 h-56 md:w-64 md:h-64 rounded-xl overflow-hidden border border-slate-700 bg-black"
                                    >

                                        {media.mediaType === 'video' ? (
                                            isEmbedVideo(media.url) ? (
                                                <iframe
                                                    src={getEmbedUrl(media.url)}
                                                    className="w-full h-full"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <video
                                                    src={
                                                        media.url.startsWith('http')
                                                            ? media.url
                                                            : `${import.meta.env.VITE_API_URL}${media.url}`
                                                    }
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    preload="metadata"
                                                />
                                            )
                                        ) : (
                                            <img
                                                src={
                                                    media.url.startsWith('http')
                                                        ? media.url
                                                        : `${import.meta.env.VITE_API_URL}${media.url}`
                                                }
                                                alt="Media"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                ))}
                            </div>
                            <p className="text-xs text-slate-500">Upload new media to replace existing</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-300 block">Update Media (Optional)</label>
                        {formData.type === 'article' ? (
                            <div className="flex gap-4 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setMediaType('file')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${mediaType === 'file' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-800 text-slate-400 border border-transparent'}`}
                                >
                                    <Upload size={16} /> File Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMediaType('url')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${mediaType === 'url' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-800 text-slate-400 border border-transparent'}`}
                                >
                                    <LinkIcon size={16} /> URL
                                </button>
                            </div>
                        ) : (
                            <div className="mb-2">
                                <div className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-2 w-fit">
                                    <LinkIcon size={16} /> Video URL (Required)
                                </div>
                            </div>
                        )}

                        {mediaType === 'file' && formData.type === 'article' ? (
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-orange-500/30 transition-colors bg-slate-950/30">
                                <input
                                    type="file"
                                    multiple
                                    accept={formData.type === 'video' ? "video/*" : "image/*"}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload size={32} className="text-slate-500" />
                                    <span className="text-slate-300 font-medium">Click to upload files</span>
                                    <span className="text-slate-500 text-xs">
                                        {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : `Support for JPG, PNG, WebP`}
                                    </span>
                                </label>
                            </div>
                        ) : (
                            <input
                                name="mediaUrl"
                                value={formData.mediaUrl}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                placeholder={formData.type === 'video' ? "https://youtube.com/watch?v=... or https://youtu.be/..." : "https://example.com/image.jpg"}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all">
                            <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-offset-slate-900 focus:ring-orange-500" />
                            <span className="text-sm text-slate-300">Featured</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all">
                            <input type="checkbox" name="heroContent" checked={formData.heroContent} onChange={handleInputChange} className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-offset-slate-900 focus:ring-orange-500" />
                            <span className="text-sm text-slate-300">Hero Content</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all">
                            <input type="checkbox" name="topStory" checked={formData.topStory} onChange={handleInputChange} className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-offset-slate-900 focus:ring-orange-500" />
                            <span className="text-sm text-slate-300">Top Story</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all">
                            <input type="checkbox" name="categoryHighlight" checked={formData.categoryHighlight} onChange={handleInputChange} className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-offset-slate-900 focus:ring-orange-500" />
                            <span className="text-sm text-slate-300">Highlight</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/stories')}
                            className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitLoading}
                            className="px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitLoading ? <Loader2 size={20} className="animate-spin" /> : "Update Story"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStory;
