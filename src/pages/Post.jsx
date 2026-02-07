import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, User, Heart, MessageCircle, Eye,
    ArrowLeft, Send, Loader2, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
};

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

const Post = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [commentUser, setCommentUser] = useState('');
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const [isLiked, setIsLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const data = await api.get(`/public/posts/${id}`);
                setPost(data);
               
            } catch (err) {
                console.error("Failed to fetch post:", err);
                setError("Post not found or failed to load.");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
        window.scrollTo(0, 0);
    }, [id]);

    const handleLike = async () => {
        if (likeLoading) return;
        setLikeLoading(true);
        try {
            const endpoint = isLiked ? `/public/posts/${id}/unlike` : `/public/posts/${id}/like`;
            const data = await api.post(endpoint);
            setPost(prev => ({ ...prev, likes: data.likes }));
            setIsLiked(!isLiked);
        } catch (err) {
            console.error("Failed to like post:", err);
        } finally {
            setLikeLoading(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentUser.trim() || !commentText.trim() || commentLoading) return;

        setCommentLoading(true);
        try {
            const data = await api.post(`/public/posts/${id}/comment`, {
                user: commentUser,
                text: commentText
            });
            setPost(prev => ({ ...prev, comments: data.comments }));
            setCommentText('');
            setCommentUser('');
        } catch (err) {
            console.error("Failed to add comment:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to add comment. Please try again.',
                confirmButtonColor: '#FF7A18'
            });
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Loading Nexus Data...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Error Occurred</h2>
                <p className="text-slate-400 mb-8">{error || 'Something went wrong'}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-full transition-all hover:scale-105"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    
    const mediaUrl = post.media?.[0]?.url ? getImageUrl(post.media[0].url) : '';
    const isVideo = mediaUrl ? (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') || mediaUrl.includes('vimeo.com') || mediaUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv)$/i)) : false;
    const youtubeId = getYoutubeId(mediaUrl);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Centered Container with Max Width */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
                <main className="w-full">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 p-2 px-4 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-white group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                
                    {/* Category Badge */}
                    <span className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-xs rounded-full mb-6 uppercase tracking-wider">
                        {post.category}
                    </span>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 md:mb-8 leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 md:mb-12 text-xs md:text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                                {post.author?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-200">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-orange-500" />
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye size={16} className="text-orange-400" />
                            <span>{post.views || 0} views</span>
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl bg-slate-900 border border-white/5">
                        {isVideo ? (
                            youtubeId ? (
                                <div className="aspect-video w-full relative">
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video w-full flex items-center justify-center bg-slate-800 relative">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400 text-lg">Video Content</p>
                                        <p className="text-slate-500 text-sm mt-2">Direct video playback not supported</p>
                                    </div>
                                </div>
                            )
                        ) : mediaUrl ? (
                            <img
                                src={mediaUrl}
                                alt={post.title}
                                className="w-full h-auto object-cover max-h-[600px] md:rounded-3xl"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/600x400/1e293b/475569?text=Image+Not+Found';
                                }}
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center bg-slate-800">
                                <AlertCircle className="text-slate-600" size={48} />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="prose prose-invert prose-orange max-w-none text-base md:text-lg leading-relaxed text-slate-300 mb-10 md:mb-16">
                        {post.description?.split('\n').map((para, i) => (
                            <p key={i} className="mb-4 md:mb-6 last:mb-0 whitespace-pre-wrap">{para}</p>
                        ))}
                    </div>

                    {/* Like & Comment Stats */}
                    <div className="flex items-center justify-between py-6 md:py-8 border-y border-white/5 mb-10 md:mb-16">
                        <div className="flex items-center gap-4 md:gap-8">
                            <button
                                onClick={handleLike}
                                disabled={likeLoading}
                                className={`flex items-center gap-1 md:gap-2 group transition-all ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                            >
                                <div className={`p-2 md:p-3 rounded-full transition-all ${isLiked ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'}`}>
                                    <Heart size={20} className="md:w-6 md:h-6" fill={isLiked ? "currentColor" : "none"} />
                                </div>
                                <span className="font-bold text-base md:text-lg">{post.likes || 0}</span>
                            </button>

                            <div className="flex items-center gap-1 md:gap-2 text-slate-400">
                                <div className="p-2 md:p-3">
                                    <MessageCircle size={20} className="md:w-6 md:h-6" />
                                </div>
                                <span className="font-bold text-base md:text-lg">{post.comments?.length || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-8 md:space-y-12">
                        <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3">
                            Comments
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs md:text-sm rounded-lg">
                                {post.comments?.length || 0}
                            </span>
                        </h3>

                        {/* Comment Form */}
                        <form onSubmit={handleCommentSubmit} className="bg-slate-900/50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={commentUser}
                                    onChange={(e) => setCommentUser(e.target.value)}
                                    className="bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/70 focus:outline-none focus:border-orange-500/50 text-sm md:text-base"
                                />
                            </div>
                            <div className="relative">
                                <textarea
                                    rows="3"
                                    placeholder="Write your thoughts..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl md:rounded-2xl px-4 py-3 md:py-4 text-white placeholder:text-white/70 focus:outline-none focus:border-orange-500/50 resize-none text-sm md:text-base"
                                />
                                <button
                                    type="submit"
                                    disabled={commentLoading}
                                    className="absolute bottom-3 md:bottom-4 right-3 md:right-4 p-2 bg-orange-500 hover:bg-orange-600 text-slate-950 rounded-lg md:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {commentLoading ? <Loader2 size={16} className="animate-spin md:w-[18px] md:h-[18px]" /> : <Send size={16} className="md:w-[18px] md:h-[18px]" />}
                                </button>
                            </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-4 md:space-y-6">
                            {post.comments && post.comments.length > 0 ? (
                                [...post.comments].reverse().map((comment, index) => (
                                    <div key={index} className="flex gap-3 md:gap-4 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/2 hover:bg-white/5 transition-all">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-400 font-bold uppercase text-sm md:text-base">
                                            {comment.user?.[0] || '?'}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-white text-sm md:text-base">{comment.user}</span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(comment.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 leading-relaxed text-sm md:text-base break-words">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 md:py-12 bg-white/2 rounded-2xl md:rounded-3xl border border-dashed border-white/5">
                                    <p className="text-slate-500 italic text-sm md:text-base">No comments yet. Be the first to start the conversation.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Post;
