import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, Loader2, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import Swal from 'sweetalert2';


import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
    arrayMove,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv'];
    const lowerUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowerUrl.includes(`.${ext}`))) return true;
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com')) return true;
    return false;
};

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

const isEmbedVideo = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

const getEmbedUrl = (url) => {
    if (url.includes('youtu.be')) return `https://www.youtube.com/embed/${url.split('/').pop()}`;
    if (url.includes('youtube.com')) return `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}`;
    if (url.includes('vimeo.com')) return `https://player.vimeo.com/video/${url.split('/').pop()}`;
    return url;
};


const SortableCard = ({ post, getCategoryName, handleEditStory, handleDeleteStory, isAdmin }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: post._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style}>
          
            <div
                className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-orange-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col h-full"
                style={{ cursor: isDragging ? 'grabbing' : 'default' }}
            >
           
                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-center py-1.5 bg-slate-800/50 border-b border-white/5 cursor-grab active:cursor-grabbing hover:bg-slate-700/50 transition-colors"
                    title="Drag to reorder"
                >
                    <div className="flex gap-0.5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-1 h-1 rounded-full bg-slate-500" />
                        ))}
                    </div>
                </div>

             
                <div className="aspect-video relative overflow-hidden bg-slate-800">
                    {post.media?.[0]?.url ? (
                        isVideoUrl(post.media[0].url) ? (
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
                                        src={post.media[0].url.startsWith('http')
                                            ? post.media[0].url
                                            : `${import.meta.env.VITE_API_URL}${post.media[0].url}`}
                                        className="w-full h-full object-cover bg-black"
                                        muted preload="metadata"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                        <div className="w-14 h-14 rounded-full bg-orange-500/90 flex items-center justify-center text-white text-xl">▶</div>
                                    </div>
                                </>
                            )
                        ) : (
                            (() => {
                                const imageUrl = post.media[0].url.startsWith('http')
                                    ? post.media[0].url
                                    : `${import.meta.env.VITE_API_URL}${post.media[0].url}`;
                                const youtubeId = getYoutubeId(imageUrl);
                                if (youtubeId) {
                                    return (
                                        <img
                                            src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    );
                                }

                                return (
                                    <img
                                        src={imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400/1e293b/475569?text=No+Image';
                                        }}
                                    />
                                );
                            })()
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon size={32} />
                        </div>
                    )}
                </div>




                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20 uppercase tracking-wider">
                                {getCategoryName(post.category)}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-md border ${
                                post.status === 1
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
        </div>
    );
};

const AllStories = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const activeCategoryId = searchParams.get('category') || '';

   
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }, 
        })
    );

    useEffect(() => {
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
            const [postsRes, categoriesRes] = await Promise.all([
                api.get('/posts', { Authorization: `Bearer ${token}` }),
                api.get('/public/categories'),
            ]);
            setPosts(Array.isArray(postsRes) ? postsRes : (postsRes?.data || []));
            setCategories(categoriesRes?.data || []);
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

    const getCategoryName = (categoryId) => {
        if (!categoryId) return categoryId;
        const found = categories.find(
            c => String(c.id).toLowerCase() === String(categoryId).toLowerCase()
        );
        return found ? found.name : categoryId;
    };

    const filteredPosts = activeCategoryId
        ? posts.filter(p =>
            String(p.category).toLowerCase() === String(activeCategoryId).toLowerCase()
          )
        : posts;

    const activeCategoryName = activeCategoryId ? getCategoryName(activeCategoryId) : '';

    const clearFilter = () => {
        setSearchParams({});
    };

    const handleEditStory = (id) => {
        navigate(`edit/${id}`);
    };

    const handleDeleteStory = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF7A18',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            background: '#0f172a',
            color: '#e2e8f0',
        });

        if (result.isConfirmed) {
            try {
                const token = sessionStorage.getItem('token');
                await api.delete(`/posts/${id}`, { Authorization: `Bearer ${token}` });
                fetchPosts();
            } catch (err) {
                console.error("Failed to delete post:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete story. Please try again.',
                    confirmButtonColor: '#FF7A18',
                    background: '#0f172a',
                    color: '#e2e8f0',
                });
            }
        }
    };


  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredPosts.findIndex(p => p._id === active.id);
    const newIndex = filteredPosts.findIndex(p => p._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredPosts, oldIndex, newIndex);

   
    if (activeCategoryId) {
        setPosts(prev => {
            const reorderedIds = reordered.map(p => p._id);
            return [
                ...prev.filter(p => !reorderedIds.includes(p._id)),
                ...reordered
            ];
        });
    } else {
        setPosts(arrayMove(posts, 
            posts.findIndex(p => p._id === active.id),
            posts.findIndex(p => p._id === over.id)
        ));
    }

   
    try {
        const token = sessionStorage.getItem('token');
        await api.put(
            '/posts/reorder',
            { orderedIds: reordered.map(p => p._id) },
            { Authorization: `Bearer ${token}` }
        );
    } catch (err) {
        console.error('Reorder failed:', err);
        fetchPosts();
    }
};

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                        {activeCategoryName ? `${activeCategoryName} Stories` : 'All Stories'}
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm md:text-base">
                        {activeCategoryName
                            ? `Showing posts in "${activeCategoryName}"`
                            : 'Manage your content library'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {activeCategoryId && (
                        <button
                            onClick={clearFilter}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-all flex items-center gap-2 text-sm border border-white/10"
                        >
                            <X size={16} />
                            Clear Filter
                        </button>
                    )}
                    <button
                        onClick={() => navigate('add')}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] hover:shadow-[0_0_30px_rgba(255,122,24,0.5)] flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <Plus size={20} />
                        New Story
                    </button>
                </div>
            </div>

            {!loading && categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={clearFilter}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            !activeCategoryId
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                : 'bg-slate-800 text-slate-400 border-white/5 hover:border-white/20'
                        }`}
                    >
                        All ({posts.length})
                    </button>
                    {categories.map(cat => {
                        const count = posts.filter(
                            p => String(p.category).toLowerCase() === String(cat.id).toLowerCase()
                        ).length;
                        const isActive = String(activeCategoryId).toLowerCase() === String(cat.id).toLowerCase();
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSearchParams({ category: cat.id })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                    isActive
                                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                        : 'bg-slate-800 text-slate-400 border-white/5 hover:border-white/20'
                                }`}
                            >
                                {cat.name} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

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
            ) : filteredPosts.length === 0 ? (
                <div className="p-12 bg-slate-900 border border-white/10 rounded-2xl text-center text-slate-500">
                    <div className="flex justify-center mb-4">
                        <ImageIcon size={48} className="opacity-20" />
                    </div>
                    <p className="text-lg mb-4">
                        {activeCategoryName
                            ? `No stories found in "${activeCategoryName}"`
                            : 'No stories found'}
                    </p>
                    <button
                        onClick={() => navigate('add')}
                        className="text-orange-400 hover:text-orange-300 font-medium"
                    >
                        Create your first story
                    </button>
                </div>
            ) : (
             
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredPosts.map(p => p._id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {filteredPosts.map((post) => (
                                <SortableCard
                                    key={post._id}
                                    post={post}
                                    getCategoryName={getCategoryName}
                                    handleEditStory={handleEditStory}
                                    handleDeleteStory={handleDeleteStory}
                                    isAdmin={isAdmin}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

export default AllStories;