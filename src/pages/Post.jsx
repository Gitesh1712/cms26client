import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Heart, MessageCircle, Eye,
    ArrowLeft, Send, Loader2, AlertCircle, Check, Copy
} from 'lucide-react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slugify';

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

// ── Inline Share Bar (NDTV style) ─────────────────────────────
const ShareBar = ({ url, title }) => {
    const [hovered, setHovered] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareOnPlatform = (platform, e) => {
        e.stopPropagation();
        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                break;
        }
    };

    const socialIcons = [
        {
            key: 'whatsapp',
            title: 'WhatsApp',
            bg: '#25D366',
            icon: (
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            )
        },
        {
            key: 'twitter',
            title: 'Twitter / X',
            bg: '#000000',
            icon: (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        },
        {
            key: 'facebook',
            title: 'Facebook',
            bg: '#1877F2',
            icon: (
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            )
        },
        {
            key: 'linkedin',
            title: 'LinkedIn',
            bg: '#0A66C2',
            icon: (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            )
        },
        {
            key: 'copy',
            title: copied ? 'Copied!' : 'Copy Link',
            bg: copied ? '#22c55e' : '#475569',
            icon: copied
                ? <Check className="w-3.5 h-3.5 text-white" />
                : <Copy className="w-3.5 h-3.5 text-white" />
        },
    ];

    return (
        <div
            className="flex items-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Social icons — slide in on hover */}
            <div
                className="flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxWidth: hovered ? '200px' : '0px',
                    opacity: hovered ? 1 : 0,
                    marginRight: hovered ? '8px' : '0px',
                }}
            >
                {socialIcons.map(({ key, title, bg, icon }) => (
                    <button
                        key={key}
                        onClick={(e) => shareOnPlatform(key, e)}
                        title={title}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform shadow-md"
                        style={{ background: bg }}
                    >
                        {icon}
                    </button>
                ))}
            </div>

            {/* Share trigger button — orange circle, black icon */}
            <button
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform shadow-md"
                style={{ background: '#fb923c' }}
                title="Share"
            >
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#000000"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
            </button>
        </div>
    );
};

// ── Main Post Component ────────────────────────────────────────
const Post = () => {
    const { category, slug } = useParams();
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
                const postsData = await api.get('/allposts');
                const foundPost = postsData.find(p => generateSlug(p.title) === slug);
                const fallbackPost = !foundPost
                    ? postsData.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === slug)
                    : null;

                if (foundPost) setPost(foundPost);
                else if (fallbackPost) setPost(fallbackPost);
                else setError('Post not found');
            } catch (err) {
                console.error("Failed to fetch post:", err);
                setError("Post not found or failed to load.");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleLike = async () => {
        if (likeLoading || !post) return;
        setLikeLoading(true);
        try {
            const endpoint = isLiked
                ? `/public/posts/${post._id}/unlike`
                : `/public/posts/${post._id}/like`;
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
        if (!commentUser.trim() || !commentText.trim() || commentLoading || !post) return;
        setCommentLoading(true);
        try {
            const data = await api.post(`/public/posts/${post._id}/comment`, {
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

    const getShareUrl = () => {
        if (!post) return '';
        return `${window.location.origin}/${generateSlug(post.category)}/${generateSlug(post.title)}`;
    };

    // Loading
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin mb-5" />
            <p className="text-slate-500 text-sm tracking-widest uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Loading story...
            </p>
        </div>
    );

    // Error
    if (error || !post) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-12 h-12 mb-5" style={{ color: 'rgba(239,68,68,0.6)' }} />
            <h2 className="font-black text-white mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem' }}>
                Story Not Found
            </h2>
            <p className="text-slate-500 mb-8 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {error || 'Something went wrong'}
            </p>
            <button
                onClick={() => navigate('/')}
                className="px-7 py-3 rounded-full font-semibold text-slate-900 transition-all hover:scale-105"
                style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                Back to Home
            </button>
        </div>
    );

    const mediaUrl = post.media?.[0]?.url ? getImageUrl(post.media[0].url) : '';
    const isVideo = mediaUrl
        ? (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ||
           mediaUrl.includes('vimeo.com') || mediaUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv)$/i))
        : false;
    const youtubeId = getYoutubeId(mediaUrl);

    return (
        <div className="min-h-screen text-slate-200">
            <SEO
                title={post.title}
                description={post.excerpt || post.content?.substring(0, 150) + '...'}
                image={post.image?.startsWith('http') ? post.image : `/logo.png`}
                type="article"
            />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');

                @keyframes postFadeUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes postFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                .p-fu   { animation: postFadeUp 0.8s cubic-bezier(.22,1,.36,1) both; }
                .p-fu-1 { animation: postFadeUp 0.8s 0.12s cubic-bezier(.22,1,.36,1) both; }
                .p-fu-2 { animation: postFadeUp 0.8s 0.22s cubic-bezier(.22,1,.36,1) both; }
                .p-fu-3 { animation: postFadeUp 0.8s 0.32s cubic-bezier(.22,1,.36,1) both; }
                .p-fi   { animation: postFadeIn 1s 0.15s both; }

                .post-input {
                    width: 100%;
                    background: rgba(15,15,20,0.8);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: #e2e8f0;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 300;
                    outline: none;
                    transition: all 0.3s;
                }
                .post-input::placeholder { color: rgba(148,163,184,0.5); }
                .post-input:focus {
                    border-color: rgba(255,122,24,0.45);
                    box-shadow: 0 0 0 3px rgba(255,122,24,0.07);
                    background: rgba(20,12,4,0.6);
                }
            `}</style>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
                <main className="w-full">

                    {/* Back button */}
                    <button onClick={() => navigate(-1)}
                        className="p-fu mb-10 flex items-center gap-2.5 group"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <div className="w-8 h-8 rounded-full border border-white/10 group-hover:border-orange-500/30 flex items-center justify-center transition-all group-hover:bg-orange-500/8">
                            <ArrowLeft size={15} className="text-slate-500 group-hover:text-orange-400 group-hover:-translate-x-0.5 transition-all" />
                        </div>
                        <span className="text-xs tracking-widest uppercase group-hover:text-slate-200 transition-colors" style={{ color: '#94a3b8' }}>Back</span>
                    </button>

                    {/* Category badge */}
                    <div className="p-fu mb-5">
                        <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-slate-900"
                            style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                            {post.category}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="p-fu-1 text-white font-black mb-7 leading-none"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: 'clamp(2rem, 5.5vw, 3.5rem)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.08
                        }}>
                        {post.title}
                    </h1>

                    {/* Meta row — author, date, views, share */}
                    <div className="p-fu-2 flex flex-wrap items-center gap-4 md:gap-5 mb-10 pb-8 border-b border-white/5">

                        {/* Author */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-900 text-xs font-black flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)', fontFamily: "'Playfair Display', serif" }}>
                                {post.author?.[0]?.toUpperCase()}
                            </div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                <p className="text-slate-200 text-sm font-medium leading-none">{post.author}</p>
                                <p className="text-[11px] mt-0.5 leading-none" style={{ color: '#94a3b8' }}>Author</p>
                            </div>
                        </div>

                        <div className="w-px h-5 bg-white/8 hidden sm:block" />

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-xs"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#94a3b8' }}>
                            <Calendar size={12} style={{ color: '#fb923c' }} />
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>

                        {/* Views */}
                        <div className="flex items-center gap-1.5 text-xs"
                            style={{ fontFamily: "'DM Sans', sans-serif", color: '#94a3b8' }}>
                            <Eye size={12} style={{ color: '#fb923c' }} />
                            <span>{post.views || 0} views</span>
                        </div>

                        {/* ===== NDTV-style Share Bar ===== */}
                        <div className="ml-auto">
                            <ShareBar url={getShareUrl()} title={post.title} />
                        </div>
                    </div>

                    {/* Media */}
                    <div className="p-fi relative rounded-2xl md:rounded-3xl overflow-hidden mb-12 md:mb-16 border border-white/5 shadow-2xl"
                        style={{ background: 'rgba(15,15,20,0.8)' }}>
                        <div className="absolute top-0 left-0 right-0 h-px z-10"
                            style={{ background: 'linear-gradient(to right, transparent, rgba(255,204,102,0.2), transparent)' }} />

                        {isVideo ? (
                            youtubeId ? (
                                <div className="aspect-video w-full">
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen />
                                </div>
                            ) : (
                                <div className="aspect-video w-full flex items-center justify-center"
                                    style={{ background: 'rgba(20,12,4,0.9)' }}>
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                            style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                            <svg className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>Video Content</p>
                                        <p className="text-slate-600 text-sm mt-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>Direct playback not supported</p>
                                    </div>
                                </div>
                            )
                        ) : mediaUrl ? (
                            <img src={mediaUrl} alt={post.title}
                                className="w-full h-auto object-cover" style={{ maxHeight: '560px' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e293b/475569?text=Image+Not+Found'; }} />
                        ) : (
                            <div className="h-56 flex items-center justify-center" style={{ background: 'rgba(20,12,4,0.8)' }}>
                                <AlertCircle className="text-slate-700" size={40} />
                            </div>
                        )}
                    </div>

                    {/* Post content */}
                    <div className="p-fu-3 mb-14 md:mb-20">
                        {post.description?.split('\n').map((para, i) => (
                            para.trim()
                                ? <p key={i} className="mb-5 md:mb-7 last:mb-0 text-slate-300 whitespace-pre-wrap"
                                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(0.95rem, 1.5vw, 1.08rem)', fontWeight: 300, lineHeight: 1.85 }}>
                                    {para}
                                  </p>
                                : <div key={i} className="h-3" />
                        ))}
                    </div>

                    {/* Like + comment count */}
                    <div className="flex items-center justify-between py-5 mb-14 border-y border-white/5">
                        <div className="flex items-center gap-2.5">
                            <button onClick={handleLike} disabled={likeLoading}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all group ${
                                    isLiked
                                        ? 'border-red-500/30 text-red-400'
                                        : 'border-white/8 hover:border-red-500/20 hover:bg-red-500/5 text-slate-500 hover:text-red-400'
                                }`}
                                style={{ background: isLiked ? 'rgba(239,68,68,0.07)' : undefined }}>
                                <Heart size={15} fill={isLiked ? "currentColor" : "none"}
                                    className={`transition-transform ${isLiked ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                    {post.likes || 0}
                                </span>
                            </button>

                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                                <MessageCircle size={15} />
                                <span className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                    {post.comments?.length || 0}
                                </span>
                            </div>
                        </div>

                        {/* Share bar in bottom row too */}
                        <ShareBar url={getShareUrl()} title={post.title} />
                    </div>

                    {/* Comments section */}
                    <div className="space-y-7 md:space-y-9">

                        <div className="flex items-center gap-4">
                            <div className="w-1 h-7 rounded-full"
                                style={{ background: 'linear-gradient(to bottom, #FFCC66, #FF7A18)' }} />
                            <h3 className="font-black text-white"
                                style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem' }}>
                                Comments
                            </h3>
                            <span className="text-xs px-2.5 py-1 rounded-full border border-white/8"
                                style={{ fontFamily: "'DM Sans', sans-serif", color: '#94a3b8', borderColor: 'rgba(255,180,50,0.15)', background: 'rgba(255,255,255,0.02)' }}>
                                {post.comments?.length || 0}
                            </span>
                        </div>

                        {/* Comment form */}
                        <div className="relative rounded-2xl p-5 md:p-6 border border-white/5"
                            style={{ background: 'linear-gradient(135deg, rgba(20,12,4,0.6), rgba(15,15,20,0.8))' }}>
                            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                                style={{ background: 'linear-gradient(to right, transparent, rgba(255,204,102,0.15), transparent)' }} />

                            <p className="text-xs tracking-widest uppercase mb-4" style={{ fontFamily: "'DM Sans', sans-serif", color: '#f59e0b' }}>Leave a comment</p>

                            <form onSubmit={handleCommentSubmit} className="space-y-3">
                                <input type="text" placeholder="Your name"
                                    value={commentUser} onChange={(e) => setCommentUser(e.target.value)}
                                    className="post-input" />
                                <div className="relative">
                                    <textarea rows="4" placeholder="Write your thoughts..."
                                        value={commentText} onChange={(e) => setCommentText(e.target.value)}
                                        className="post-input resize-none" style={{ paddingBottom: '52px' }} />
                                    <button type="submit" disabled={commentLoading}
                                        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-slate-900 text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                        {commentLoading
                                            ? <Loader2 size={14} className="animate-spin" />
                                            : <><Send size={13} /> Post</>}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Comment list */}
                        <div className="space-y-3">
                            {post.comments && post.comments.length > 0 ? (
                                [...post.comments].reverse().map((comment, index) => (
                                    <div key={index}
                                        className="flex gap-4 p-4 md:p-5 rounded-2xl border border-white/5 hover:border-white/8 transition-all"
                                        style={{ background: 'rgba(255,255,255,0.015)' }}>
                                        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black uppercase border"
                                            style={{ color: '#FFCC66', background: 'rgba(255,122,24,0.08)', borderColor: 'rgba(255,122,24,0.15)' }}>
                                            {comment.user?.[0] || '?'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="font-bold text-white text-sm"
                                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                                    {comment.user}
                                                </span>
                                                <span className="text-[11px]"
                                                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#94a3b8' }}>
                                                    {new Date(comment.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="leading-relaxed text-sm break-words" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: '#cbd5e1' }}>
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 rounded-2xl border border-dashed border-white/5"
                                    style={{ background: 'rgba(255,255,255,0.01)' }}>
                                    <MessageCircle size={26} className="text-slate-700 mx-auto mb-3" />
                                    <p className="text-sm italic" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, color: '#94a3b8' }}>
                                        No comments yet. Be the first to start the conversation.
                                    </p>
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