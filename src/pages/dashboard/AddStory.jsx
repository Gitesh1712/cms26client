import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, Link as LinkIcon, ArrowLeft, X, Save } from 'lucide-react';
import { api } from '../../services/api';
import LexicalEditor from '../../components/LexicalEditor';
import Swal from 'sweetalert2';

const AddStory = () => {
    const navigate = useNavigate();
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
        heroDisplayType: 'image',
        heroVideoUrl: ''
    });
    const [mediaType, setMediaType] = useState('file');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [thumbnailMode, setThumbnailMode] = useState('url');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
            if (userInfo.name) setFormData(prev => ({ ...prev, author: userInfo.name }));
        } catch (_) {}

        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const token = sessionStorage.getItem('token');
                const response = await api.get('/public/categories', {
                    Authorization: `Bearer ${token}`
                });

                let categoriesData = response?.data || [];

                try {
                    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
                    if (userInfo.role !== 'admin') {
                        const RESTRICTED = ["Editor's Take"];
                        categoriesData = categoriesData.filter(c => !RESTRICTED.includes(c.name));
                    }
                } catch (_) {}

                setCategories(categoriesData);
                if (categoriesData.length > 0) {
                    setFormData(prev => ({ ...prev, category: categoriesData[0].id }));
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        const fetchAuthors = async () => {
            try {
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');

                if (userInfo.role !== 'admin') {
                    setLoadingAuthors(false);
                    return;
                }

                setLoadingAuthors(true);
                const token = sessionStorage.getItem('token');
                const response = await api.get('/users', {
                    Authorization: `Bearer ${token}`
                });

                const usersData = response?.data?.users || [];
                setAuthorsList(usersData);

                const matchedUser = usersData.find(
                    (u) => u.name === userInfo.name || u._id === userInfo._id || u.email === userInfo.email
                );
                if (matchedUser?.name) {
                    setFormData(prev => ({ ...prev, author: matchedUser.name }));
                }
            } catch (err) {
                console.error('Failed to fetch authors:', err);
            } finally {
                setLoadingAuthors(false);
            }
        };

        fetchCategories();
        fetchAuthors();
    }, []);

    const prevTypeRef = useRef(formData.type);
    useEffect(() => {
        if (prevTypeRef.current === formData.type) return;
        prevTypeRef.current = formData.type;
        setFormData(prev => ({ ...prev, description: '' }));
    }, [formData.type]);

    const handleThumbnailFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
        setFormData(prev => ({ ...prev, thumbnail: '' }));
    };

    const clearThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview('');
        setFormData(prev => ({ ...prev, thumbnail: '' }));
    };

    const handleAddStory = async (e, saveAsDraft = false) => {
        if (e) e.preventDefault();

        if (!saveAsDraft) {
            if (!formData.tags || formData.tags.trim() === '') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Tags Required',
                    text: 'Please add at least one tag (comma separated) before submitting.',
                    confirmButtonColor: '#FF7A18',
                    background: '#0f172a',
                    color: '#e2e8f0',
                });
                return;
            }
        }

        const liveBlocks = window.__lexicalBlocks || [];

        setSubmitLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const data = new FormData();

            data.append('title', formData.title);

            const serialisableBlocks = liveBlocks.map(b => {
                if (b.type === 'uploadedPhoto' || b.type === 'uploadedVideo') {
                    const { file, url, fileName, ...rest } = b;
                    return { ...rest, url: '', fileName: '' };
                }
                return b;
            });
            const cleanDescription = JSON.stringify(serialisableBlocks);
            data.append('description', cleanDescription);

            data.append('category', formData.category);
            data.append('postType', formData.type);
            data.append('author', formData.author);
            data.append('tags', formData.tags);

            data.append('featured', String(formData.featured));
            data.append('heroContent', String(formData.heroContent));
            data.append('topStory', String(formData.topStory));
            data.append('categoryHighlight', String(formData.categoryHighlight));

            if (formData.order !== '' && formData.order !== undefined && formData.order !== null) {
                data.append('order', String(formData.order));
            }

          
            data.append('heroDisplayType', formData.type === 'video' ? 'image' : formData.heroDisplayType);
            if (formData.type !== 'video' && formData.heroDisplayType === 'video' && formData.heroVideoUrl.trim()) {
                data.append('heroVideoUrl', formData.heroVideoUrl.trim());
            }

            if (saveAsDraft) {
                data.append('status', '3');
            } else {
                try {
                    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
                    if (userInfo.role === 'admin') {
                        data.append('status', '1');
                    } else {
                        data.append('status', '0');
                    }
                } catch {
                    data.append('status', '0');
                }
            }

            if (mediaType === 'url' && formData.mediaUrl.trim()) {
                data.append('mediaUrl', formData.mediaUrl.trim());
            } else if (mediaType === 'file' && selectedFiles.length > 0) {
                selectedFiles.forEach(file => {
                    const isVideo = file.type.startsWith('video/') ||
                                   /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
                    data.append(isVideo ? 'videos' : 'images', file);
                });
            }

            if (thumbnailFile) {
                data.append('thumbnailImage', thumbnailFile);
            } else if (formData.thumbnail.trim()) {
                data.append('thumbnail', formData.thumbnail.trim());
            }

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

            await api.post('/posts', data, {
                Authorization: `Bearer ${token}`
            }, {
                timeout: 120000
            });

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: saveAsDraft ? 'Story saved as draft successfully!' : 'Story created successfully!',
                confirmButtonColor: '#FF7A18',
                background: '#0f172a',
                color: '#e2e8f0',
                timer: 2000,
                showConfirmButton: false
            });

            navigate('/dashboard/stories');

        } catch (err) {
            console.error('❌ Failed to create post:', err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.response?.data?.error || err.message || 'Failed to create post.',
                confirmButtonColor: '#FF7A18',
                background: '#0f172a',
                color: '#e2e8f0',
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) setSelectedFiles(Array.from(e.target.files));
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const isAdmin = (() => {
        try {
            return JSON.parse(sessionStorage.getItem('userInfo') || '{}')?.role === 'admin';
        } catch { return false; }
    })();

    const thumbSrc = thumbnailPreview || formData.thumbnail;
    const isVideo = formData.type === 'video';
    const isArticle = formData.type === 'article';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-white">Create New Story</h2>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl max-w-4xl">
                <form onSubmit={(e) => handleAddStory(e, false)} className="space-y-6">

                
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                Title <span className="text-red-400">*</span>
                            </label>
                            <input name="title" value={formData.title} onChange={handleInputChange} required
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                placeholder="Enter story title" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Category</label>
                            {loadingCategories ? (
                                <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-500 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" /> Loading categories...
                                </div>
                            ) : (
                                <select name="category" value={formData.category} onChange={handleInputChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50">
                                    {categories.length > 0 ? (
                                        categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    ) : (
                                        <option value=" ">No categories available</option>
                                    )}
                                </select>
                            )}
                        </div>
                    </div>

                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Post Type</label>
                            <select name="type" value={formData.type} onChange={handleInputChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50">
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
                                <select name="author" value={formData.author} onChange={handleInputChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50">
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
                                <input name="author" value={formData.author} onChange={handleInputChange}
                                    disabled={!isAdmin}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed" />
                            )}
                        </div>
                    </div>

                   
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                            Description <span className="text-red-400">*</span>
                        </label>
                        <LexicalEditor
                            value={formData.description}
                            onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                            placeholder="Enter story description..."
                            videoMode={isVideo}
                        />
                    </div>

                  
{!isVideo && (
    <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 block">
            Hero Banner Display
            
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
                        <label className="text-sm font-medium text-slate-300">
                            Tags (comma separated) <span className="text-red-400">*</span>
                        </label>
                        <input name="tags" value={formData.tags} onChange={handleInputChange} required
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                            placeholder="news, trending, viral" />
                        <p className="text-xs text-slate-500 mt-1">
                            💡 Add at least one tag to help categorize your story
                        </p>
                    </div>

                    {isVideo && (
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-300 block">Media Upload</label>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => setMediaType('file')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                        mediaType === 'file'
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-transparent'
                                    }`}>
                                    <Upload size={16} /> Video File Upload
                                </button>
                                <button type="button" onClick={() => setMediaType('url')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                        mediaType === 'url'
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-transparent'
                                    }`}>
                                    <LinkIcon size={16} /> Video URL
                                </button>
                            </div>

                            {mediaType === 'file' ? (
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-orange-500/30 transition-colors bg-slate-950/30">
                                    <input type="file" multiple
                                        accept="video/*,image/*"
                                        onChange={handleFileChange}
                                        className="hidden" id="file-upload" />
                                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <Upload size={32} className="text-slate-500" />
                                        <span className="text-slate-300 font-medium">
                                            Click to upload video
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {selectedFiles.length > 0
                                                ? `${selectedFiles.length} file(s) selected`
                                                : 'MP4, WebM, MOV, JPG, PNG supported'}
                                        </span>
                                    </label>

                                    {selectedFiles.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                                            {selectedFiles.map((file, index) => {
                                                const isVideoFile =
                                                    file.type.startsWith('video/') ||
                                                    /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
                                                return (
                                                    <div key={index} className="relative group">
                                                        {isVideoFile ? (
                                                            <video src={URL.createObjectURL(file)}
                                                                className="w-full aspect-video object-cover rounded-lg border border-slate-700 bg-black"
                                                                controls muted />
                                                        ) : (
                                                            <img src={URL.createObjectURL(file)}
                                                                alt={`Preview ${index}`}
                                                                className="w-full aspect-square object-cover rounded-lg border border-slate-700" />
                                                        )}
                                                        <button type="button" onClick={() => removeFile(index)}
                                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors shadow-lg opacity-0 group-hover:opacity-100">
                                                            <X size={14} className="text-white" />
                                                        </button>
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity pointer-events-none">
                                                            <span className="text-white text-xs font-medium">{Math.round(file.size / 1024)} KB</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {selectedFiles.length > 0 && (
                                        <button type="button" onClick={() => setSelectedFiles([])}
                                            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto">
                                            <X size={16} /> Clear All Files
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <input name="mediaUrl" value={formData.mediaUrl} onChange={handleInputChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..." />
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
                            <label key={name}
                                className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all">
                                <input type="checkbox" name={name} checked={formData[name]} onChange={handleInputChange}
                                    className="rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-offset-slate-900 focus:ring-orange-500" />
                                <span className="text-sm text-slate-300">{label}</span>
                            </label>
                        ))}
                    </div>
                    

                    <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                        <button type="button" onClick={() => navigate(-1)}
                            className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors">
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() => handleAddStory(null, true)}
                            disabled={submitLoading || !formData.title}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {submitLoading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Save as Draft</>}
                        </button>

                        <button type="submit"
                            disabled={submitLoading || !formData.category || !formData.tags || formData.tags.trim() === ''}
                            className="px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {submitLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Story'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStory;