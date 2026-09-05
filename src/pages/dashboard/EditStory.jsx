import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Upload, Link as LinkIcon, ArrowLeft, X } from 'lucide-react';
import { api } from '../../services/api';
import LexicalEditor from '../../components/LexicalEditor';
import Swal from 'sweetalert2';

const EditStory = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [authorsList, setAuthorsList] = useState([]);
    const [loadingAuthors, setLoadingAuthors] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        type: 'article',
        author: 'Admin',
        tags: '',
        featured: false,
        heroContent: false,
        topStory: false,
        categoryHighlight: false,
        mediaUrl: '',
        thumbnail: '',
        order: '',
        status: 0,
        heroDisplayType: 'image',
        heroVideoUrl: ''
    });

    const [mediaType, setMediaType] = useState('file');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingMedia, setExistingMedia] = useState([]);
    const [thumbnailMode, setThumbnailMode] = useState('url');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const prevTypeRef = useRef(formData.type);

    const isEmbedVideo = (url) =>
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('vimeo.com');

    const getEmbedUrl = (url) => {
        if (url.includes('youtu.be')) {
            return `https://www.youtube.com/embed/${url.split('/').pop()}`;
        }
        if (url.includes('youtube.com')) {
            try {
                return `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}`;
            } catch { return url; }
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
                const rawType = response.postType || response.type || 'article';
                const mediaUrl = response.media?.[0]?.url || '';
                const isYoutubeOrVimeo = mediaUrl.includes('youtube.com') ||
                    mediaUrl.includes('youtu.be') ||
                    mediaUrl.includes('vimeo.com');

                // const postType = isYoutubeOrVimeo ? 'video' : rawType.toLowerCase().trim();
                const postType = (response.postType || response.type || 'article').toLowerCase().trim();

                let descriptionBlocks = response.description || '';
                if (descriptionBlocks) {
                    try {
                        const parsed = JSON.parse(descriptionBlocks);
                        if (Array.isArray(parsed)) {
                            const API_BASE_URL = import.meta.env.VITE_API_URL || '';
                            const getResolvedImageUrl = (url) => {
                                if (!url) return '';
                                if (url.startsWith('http')) return url;
                                return `${API_BASE_URL.replace(/\/api$/, '')}${url}`;
                            };

                            const updatedBlocks = parsed.map(block => {
                                if (block.type === 'uploadedPhoto' || block.type === 'uploadedVideo') {
                                    let resolvedUrl = block.url;
                                    if (!resolvedUrl && block.fileName && response.media) {
                                        const matched = response.media.find(m =>
                                            m.url && m.url.endsWith(block.fileName)
                                        );
                                        if (matched) {
                                            resolvedUrl = getResolvedImageUrl(matched.url);
                                        }
                                    } else if (resolvedUrl && resolvedUrl.startsWith('/uploads/')) {
                                        resolvedUrl = getResolvedImageUrl(resolvedUrl);
                                    }
                                    return { ...block, url: resolvedUrl };
                                }
                                return block;
                            });
                            descriptionBlocks = JSON.stringify(updatedBlocks);
                        }
                    } catch (e) {
                        console.error('Failed to resolve blocks:', e);
                    }
                }

                setFormData({
                    title: response.title || '',
                    description: descriptionBlocks,
                    category: response.category || '',
                    type: postType,
                    author: response.author || 'Admin',
                    tags: response.tags ? response.tags.join(', ') : '',
                    featured: response.featured || false,
                    heroContent: response.heroContent || false,
                    topStory: response.topStory || false,
                    categoryHighlight: response.categoryHighlight || false,
                    mediaUrl: response.media?.[0]?.url || '',
                    thumbnail: response.thumbnail || '',
                    order: response.order || '',
                    status: response.status || 0,
                    heroDisplayType: response.heroDisplayType || 'image',
                    heroVideoUrl: response.heroVideoUrl || ''
                });

                if (response.thumbnail) {
                    const thumb = response.thumbnail.startsWith('http')
                        ? response.thumbnail
                        : `${import.meta.env.VITE_API_URL}${response.thumbnail}`;
                    setThumbnailPreview(thumb);
                }
                if (postType === 'video') {
                    setMediaType('url');
                } else if (response.media?.[0]?.url && !response.media[0].url.startsWith('/uploads')) {
                    setMediaType('url');
                } else {
                    setMediaType('file');
                }
                prevTypeRef.current = postType;
                setExistingMedia(response.media || []);
            } catch (err) {
                console.error('Failed to fetch post:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load story. Redirecting...',
                    confirmButtonColor: '#FF7A18',
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => navigate('/dashboard/stories'));
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await api.get('/public/categories');
                setCategories(response?.data || []);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        const fetchAuthors = async () => {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
                // Author selection list is admin-only. Members/editors keep
                // their own name locked, so skip fetching the full list.
                if (userInfo.role !== 'admin') {
                    setLoadingAuthors(false);
                    return;
                }

                const token = sessionStorage.getItem('token');
                const response = await api.get('/users', {
                    Authorization: `Bearer ${token}`
                });
                setAuthorsList(response?.data?.users || []);
            } catch (err) {
                console.error('Failed to fetch authors:', err);
            } finally {
                setLoadingAuthors(false);
            }
        };

        fetchPost();
        fetchCategories();
        fetchAuthors();
    }, [id, navigate]);

    useEffect(() => {
        if (prevTypeRef.current === formData.type) return;
        prevTypeRef.current = formData.type;
        if (formData.type === 'video') setMediaType('url');
    }, [formData.type]);

    const clearThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview('');
        setFormData(prev => ({ ...prev, thumbnail: '' }));
    };

    const handleThumbnailFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
        setFormData(prev => ({ ...prev, thumbnail: '' }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) setSelectedFiles(Array.from(e.target.files));
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateStory = async (e, saveAsDraft = false) => {
        if (e) e.preventDefault();
        setSubmitLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (key !== 'mediaUrl' && key !== 'thumbnail' && key !== 'status') {
                    data.append(key, formData[key]);
                }
            });

            data.append('status', saveAsDraft ? '3' : (isAdmin ? '1' : '0'));

            if (isVideo) {
                if (mediaType === 'url' && formData.mediaUrl.trim()) {
                    data.append('mediaUrl', formData.mediaUrl.trim());
                } else if (mediaType === 'file' && selectedFiles.length > 0) {
                    selectedFiles.forEach(file => {
                        const isVideoFile = file.type.startsWith('video/') ||
                            /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
                        data.append(isVideoFile ? 'videos' : 'images', file);
                    });
                }
            }

            if (thumbnailFile) {
                data.append('thumbnailImage', thumbnailFile);
            } else if (formData.thumbnail.trim()) {
                data.append('thumbnail', formData.thumbnail.trim());
            }

            const liveBlocks = window.__lexicalBlocks || [];
            let photoIdx = 0;
            liveBlocks.forEach(block => {
                if (block.type === 'uploadedPhoto' || block.type === 'uploadedVideo') {
                    if (block.file instanceof File) {
                        data.append(`inlinePhoto_${photoIdx}`, block.file);
                        data.append(`inlinePhotoId_${photoIdx}`, block.id);
                        photoIdx++;
                    }
                }
            });

            await api.put(`/posts/${id}`, data, { Authorization: `Bearer ${token}` });

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: saveAsDraft ? 'Story saved as draft.' : 'Story updated successfully.',
                confirmButtonColor: '#FF7A18',
                timer: 1500,
                timerProgressBar: true
            }).then(() => navigate('/dashboard/stories'));
        } catch (err) {
            console.error('Failed to update post:', err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response?.data?.error || err.message || 'Failed to update post.',
                confirmButtonColor: '#FF7A18',
                background: '#0f172a',
                color: '#e2e8f0',
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const isAdmin = (() => {
        try {
            const userInfo = sessionStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo)?.role === 'admin' : false;
        } catch { return false; }
    })();

    const isArticle = formData.type === 'article';
    const isVideo = formData.type === 'video';
    const thumbSrc = thumbnailPreview || formData.thumbnail;

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
                <form onSubmit={(e) => handleUpdateStory(e, false)} className="space-y-6">
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
                            {loadingCategories ? (
                                <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-500 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" /> Loading categories...
                                </div>
                            ) : (
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                >
                                    {categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    ) : (
                                        <option value="">No categories available</option>
                                    )}
                                </select>
                            )}
                        </div>
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
                            {isAdmin && loadingAuthors ? (
                                <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-500">
                                    Loading authors...
                                </div>
                            ) : isAdmin && authorsList.length > 0 ? (
                                <select
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                >
                                    {!authorsList.some(u => u.name === formData.author) && formData.author && (
                                        <option value={formData.author}>{formData.author}</option>
                                    )}
                                    {authorsList.map((u) => (
                                        <option key={u._id} value={u.name}>
                                            {u.name}{u.email ? ` (${u.email})` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    disabled={!isAdmin}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            )}
                        </div>
                    </div>

                    

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                            Display Position
                            <span className="text-slate-500 text-xs ml-2">
                                (Lower number = appears first, leave empty for auto)
                            </span>
                        </label>
                        <input
                            name="order"
                            type="number"
                            min="0"
                            value={formData.order}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                            placeholder="Auto (leave empty) or enter position number"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            💡 Posts with lower numbers appear first. Leave empty for automatic ordering.
                        </p>
                    </div>




                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                            Description <span className="text-red-400">*</span>
                        </label>
                        {isArticle ? (
                            <LexicalEditor
                                value={formData.description}
                                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                placeholder="Enter story description..."
                            />
                        ) : (
                            <LexicalEditor
                                value={formData.description}
                                onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                                placeholder="Enter story description..."
                                videoMode={true}
                            />
                        )}
                    </div>

                    {/* Hero Banner Display — sirf Article posts ke liye, simple toggle, koi extra thumbnail input nahi */}
                    {!isVideo && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300 block">
                                Hero Banner Display
                                <span className="text-slate-500 text-xs ml-2">(Homepage banner me is post ko kaise dikhana hai)</span>
                            </label>

                            <div className="flex gap-4">
                                <button type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, heroDisplayType: 'image' }))}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                        formData.heroDisplayType === 'image'
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-transparent'
                                    }`}>
                                    Image
                                </button>
                                <button type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, heroDisplayType: 'video' }))}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                        formData.heroDisplayType === 'video'
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-transparent'
                                    }`}>
                                    Video
                                </button>
                            </div>




                            {formData.heroDisplayType === 'video' && (
                                <input
                                    name="heroVideoUrl"
                                    value={formData.heroVideoUrl}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                    placeholder="https://youtube.com/watch?v=... (hero banner me ye video autoplay hoga)"
                                />
                            )}





{formData.heroDisplayType === 'image' && (
    <div className="space-y-3 pt-1">
        <div className="flex gap-4">
            <button type="button" onClick={() => setThumbnailMode('url')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    thumbnailMode === 'url'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-800 text-slate-400 border border-transparent'
                }`}>
                <LinkIcon size={16} /> Image URL
            </button>
            <button type="button" onClick={() => setThumbnailMode('file')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    thumbnailMode === 'file'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-800 text-slate-400 border border-transparent'
                }`}>
                <Upload size={16} /> Upload Image
            </button>
        </div>

        {thumbnailMode === 'url' ? (
            <input
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                placeholder="https://example.com/image.jpg"
            />
        ) : (
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-orange-500/30 transition-colors bg-slate-950/30">
                <input type="file" accept="image/*" onChange={handleThumbnailFileChange}
                    className="hidden" id="hero-thumbnail-upload" />
                <label htmlFor="hero-thumbnail-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload size={28} className="text-slate-500" />
                    <span className="text-slate-300 font-medium text-sm">Click to upload image</span>
                </label>
            </div>
        )}

        {thumbSrc && (
            <div className="relative w-full max-w-xs">
                <img src={thumbSrc} alt="Hero image preview"
                    className="w-full aspect-video object-cover rounded-lg border border-slate-700" />
                <button type="button" onClick={clearThumbnail}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <X size={14} className="text-white" />
                </button>
            </div>
        )}
    </div>
)}












                        </div>
                    )}

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

                    {isVideo && existingMedia.length > 0 && mediaType === 'file' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300 block">Current Media</label>
                                <button
                                    type="button"
                                    onClick={() => setExistingMedia([])}
                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                                >
                                    <X size={12} /> Remove All
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {existingMedia.map((media, idx) => (
                                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-700 bg-black group">
                                        {media.mediaType === 'video' ? (
                                            media.url.match(/\.(mp4|webm|mov|mkv|avi)$/i) ? (
                                                <video
                                                    src={media.url.startsWith('http') ? media.url : `${import.meta.env.VITE_API_URL}${media.url}`}
                                                    className="w-full aspect-video object-cover"
                                                    controls
                                                    muted
                                                />
                                            ) : isEmbedVideo(media.url) ? (
                                                <iframe
                                                    src={getEmbedUrl(media.url)}
                                                    className="w-full aspect-video"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="relative w-full aspect-video bg-slate-800 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-xs text-slate-400 px-2 truncate">Video Content</p>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <img
                                                src={media.url.startsWith('http') ? media.url : `${import.meta.env.VITE_API_URL}${media.url}`}
                                                alt="Media"
                                                className="w-full aspect-square object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newMedia = existingMedia.filter((_, i) => i !== idx);
                                                setExistingMedia(newMedia);
                                            }}
                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={14} className="text-white" />
                                        </button>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="text-white text-sm font-medium bg-black/70 px-3 py-1 rounded-lg">
                                                {media.mediaType === 'video' ? 'Video' : 'Image'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500">Upload new media to replace existing, or remove above</p>
                        </div>
                    )}

                    {isVideo && (
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-300 block">
                                Update Media
                            </label>

                            <div className="flex gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setMediaType('url')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                        mediaType === 'url'
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-transparent'
                                    }`}
                                >
                                    <LinkIcon size={16} /> Video URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMediaType('file')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                        mediaType === 'file'
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-transparent'
                                    }`}
                                >
                                    <Upload size={16} /> Upload Video File
                                </button>
                            </div>

                            {mediaType === 'url' ? (
                                <input
                                    name="mediaUrl"
                                    value={formData.mediaUrl}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                />
                            ) : (
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-orange-500/30 transition-colors bg-slate-950/30">
                                    <input
                                        type="file"
                                        multiple
                                        accept="video/*,image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="video-file-upload"
                                    />
                                    <label
                                        htmlFor="video-file-upload"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Upload size={32} className="text-slate-500" />
                                        <span className="text-slate-300 font-medium">
                                            Click to upload video files
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {selectedFiles.length > 0
                                                ? `${selectedFiles.length} file(s) selected`
                                                : 'MP4, WebM, MOV supported'}
                                        </span>
                                    </label>

                                    {selectedFiles.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {Array.from(selectedFiles).map((file, index) => (
                                                <div key={index} className="relative group">
                                                    <video
                                                        src={URL.createObjectURL(file)}
                                                        className="w-full aspect-video object-cover rounded-lg border border-slate-700 bg-black"
                                                        controls
                                                        muted
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X size={14} className="text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedFiles.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFiles([])}
                                            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Clear All Files
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        {[
                            { name: 'featured', label: 'Featured' },
                            { name: 'heroContent', label: 'Hero Content' },
                            { name: 'topStory', label: 'Top Story' },
                            { name: 'categoryHighlight', label: 'Highlight' },
                        ].map(({ name, label }) => (
                            <label key={name} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all">
                                <input type="checkbox" name={name} checked={formData[name]} onChange={handleInputChange}
                                    className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-offset-slate-900 focus:ring-orange-500" />
                                <span className="text-sm text-slate-300">{label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                        <button type="button" onClick={() => navigate('/dashboard/stories')}
                            className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleUpdateStory(null, true)}
                            disabled={submitLoading}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {submitLoading ? <Loader2 size={20} className="animate-spin" /> : '💾 Save as Draft'}
                        </button>
                        <button type="submit" disabled={submitLoading}
                            className="px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {submitLoading ? <Loader2 size={20} className="animate-spin" /> : 'Update Story'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStory;