import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import LexicalEditor from '../../components/LexicalEditor';
import Swal from 'sweetalert2';

const AddStory = () => {
    const navigate = useNavigate();
    const [submitLoading, setSubmitLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

 
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

   
    const [mediaType, setMediaType] = useState('file'); 
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        
      
        if (import.meta.env.DEV) {
            console.log('SweetAlert2 loaded successfully');
        }
        
       
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const { name } = JSON.parse(userInfo);
                if (name) {
                    setFormData(prev => ({ ...prev, author: name }));
                }
                console.log("Author name set to:", userInfo);
            } catch (err) {
                console.error('Failed to parse user info:', err);
            }
        }
        
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await api.get('/public/categories');
                const categoriesData = response?.data || [];
                setCategories(categoriesData);

              
                if (categoriesData.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: categoriesData[0].id }));
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    

    const handleAddStory = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const token = sessionStorage.getItem('token');
            const data = new FormData();

            
            Object.keys(formData).forEach(key => {
                if (key !== 'mediaUrl') { 
                    data.append(key, formData[key]);
                }
            });

            
            if (mediaType === 'url' && formData.mediaUrl) {
                data.append('mediaUrl', formData.mediaUrl);
            } else if (mediaType === 'file' && selectedFiles.length > 0) {
                
                Array.from(selectedFiles).forEach(file => {
                    data.append('images', file);
                });
            }

            await api.post('/posts', data, { Authorization: `Bearer ${token}` });

            navigate('/dashboard/stories');
        } catch (err) {
            console.error("Failed to create post:", err);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to create post. Please try again.',
                confirmButtonColor: '#FF7A18'
            });
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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/stories')}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-white">Create New Story</h2>
            </div>


            

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl max-w-4xl">
                <form onSubmit={handleAddStory} className="space-y-6">
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

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-300 block">Media Upload</label>
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

                        {mediaType === 'file' ? (
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-orange-500/30 transition-colors bg-slate-950/30">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload size={32} className="text-slate-500" />
                                    <span className="text-slate-300 font-medium">Click to upload files</span>
                                    <span className="text-slate-500 text-xs">
                                        {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : `Support for JPG, PNG, WebP, MP4, MOV, AVI`}
                                    </span>
                                </label>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                                        {Array.from(selectedFiles).map((file, index) => (
                                            <div key={index} className="relative group">
                                                {file.type.startsWith('video/') ? (
                                                    <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                                                        <div className="text-center">
                                                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                                </svg>
                                                            </div>
                                                            <p className="text-xs text-slate-400 truncate px-1">{file.name}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index}`}
                                                        className="w-full aspect-square object-cover rounded-lg border border-slate-700"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                                                    <span className="text-white text-xs font-medium">{Math.round(file.size / 1024)} KB</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <input
                                name="mediaUrl"
                                value={formData.mediaUrl}
                                onChange={handleInputChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                                placeholder="https://example.com/media.jpg or https://youtube.com/watch?v=..."
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
                            {submitLoading ? <Loader2 size={20} className="animate-spin" /> : "Create Story"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStory;
