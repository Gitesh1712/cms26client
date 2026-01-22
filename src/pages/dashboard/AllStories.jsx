import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const AllStories = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if user is admin
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const { role } = JSON.parse(userInfo);
                setIsAdmin(role === 'admin');
            } catch (err) {
                console.error('Failed to parse user info:', err);
            }
        }
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            const response = await api.get('/posts', { Authorization: `Bearer ${token}` });
            setPosts(Array.isArray(response) ? response : (response.data || []));
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError("Failed to load stories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPosts();
    }, []);

    const handleEditStory = (id) => {
        navigate(`edit/${id}`);
    };

    const handleDeleteStory = async (id) => {
        if (confirm("Are you sure you want to delete this story?")) {
            try {
                const token = sessionStorage.getItem('token');
                await api.delete(`/posts/${id}`, { Authorization: `Bearer ${token}` });

                // Refresh the list after successful deletion
                fetchPosts();
            } catch (err) {
                console.error("Failed to delete post:", err);
                alert("Failed to delete story. Please try again.");
            }
        }
    };

    const isEmbedVideo = (url) => {
        return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
    };

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


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">All Stories</h2>
                    <p className="text-slate-400 mt-1 text-sm md:text-base">Manage your content library</p>
                </div>
                <button
                    onClick={() => navigate('add')}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] hover:shadow-[0_0_30px_rgba(255,122,24,0.5)] flex items-center justify-center gap-2 text-sm md:text-base"
                >
                    <Plus size={20} />
                    New Story
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
                    <p className="text-slate-400">Loading stories...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertCircle size={24} />
                        <span className="font-semibold">Error</span>
                    </div>
                    {error}
                </div>
            ) : posts.length === 0 ? (
                <div className="p-12 bg-slate-900 border border-white/10 rounded-2xl text-center text-slate-500">
                    <div className="flex justify-center mb-4">
                        <ImageIcon size={48} className="opacity-20" />
                    </div>
                    <p className="text-lg mb-4">No stories found</p>
                    <button
                        onClick={() => navigate('add')}
                        className="text-orange-400 hover:text-orange-300 font-medium"
                    >
                        Create your first story
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {posts.map((post) => (
                        <div key={post._id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-orange-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col h-full">
                            {/* Image Section */}
                            {/* <div className="aspect-video relative overflow-hidden bg-slate-800">
                                {post.media && post.media.length > 0 && post.media[0].url ? (
                                    <img
                                        src={post.media[0].url.startsWith('http') ? post.media[0].url : `${import.meta.env.VITE_API_URL}${post.media[0].url}`}
                                        alt={post.title}
                                        className="w-full h-full object-contain bg-slate-950 transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400/1e293b/475569?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <ImageIcon size={32} />
                                    </div>
                                )}

                                <div className="absolute top-4 left-4">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-md ${post.postType === 'article'
                                        ? 'bg-blue-500/80 border-blue-500/20 text-white'
                                        : 'bg-purple-500/80 border-purple-500/20 text-white'
                                        }`}>
                                        {post.postType || 'article'}
                                    </span>
                                </div>

                                {post.featured && (
                                    <div className="absolute top-4 right-4">
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/80 border border-amber-500/20 text-white backdrop-blur-md shadow-lg">
                                            Featured
                                        </span>
                                    </div>
                                )}
                            </div> */}
                            <div className="aspect-video relative overflow-hidden bg-slate-800">
                                {post.media?.[0]?.url ? (
                                    post.postType === 'video' ? (
                                        isEmbedVideo(post.media[0].url) ? (
                                            <iframe
                                                src={getEmbedUrl(post.media[0].url)}
                                                className="w-full h-full"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                loading="lazy"
                                            />
                                        ) : (
                                            <>
                                                <video
                                                    src={
                                                        post.media[0].url.startsWith('http')
                                                            ? post.media[0].url
                                                            : `${import.meta.env.VITE_API_URL}${post.media[0].url}`
                                                    }
                                                    className="w-full h-full object-cover bg-black"
                                                    muted
                                                    preload="metadata"
                                                />

                                                {/* Play Overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                                    <div className="w-14 h-14 rounded-full bg-orange-500/90 flex items-center justify-center text-white text-xl">
                                                        ▶
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    ) : (
                                        <img
                                            src={
                                                post.media[0].url.startsWith('http')
                                                    ? post.media[0].url
                                                    : `${import.meta.env.VITE_API_URL}${post.media[0].url}`
                                            }
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    'https://placehold.co/600x400/1e293b/475569?text=No+Image';
                                            }}
                                        />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                            </div>


                            {/* Content Section */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20 uppercase tracking-wider">
                                            {post.category}
                                        </span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-md border ${post.status === 1
                                            ? 'text-green-400 bg-green-500/10 border-green-500/20'
                                            : post.status === 2
                                                ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                                : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                                            }`}>
                                            {post.status === 1 ? 'Approved' : post.status === 2 ? 'Rejected' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                                        <Eye size={14} />
                                        <span>{post.views || 0}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-orange-400 transition-colors">
                                    {post.title}
                                </h3>

                                <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                                    {post.description || "No description available."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                    <div className="text-xs text-slate-500 font-medium">
                                        By <span className="text-slate-300">{post.author}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditStory(post._id)}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-blue-500 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteStory(post._id)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default AllStories;
