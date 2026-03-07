import { useState, useEffect } from 'react';
import {
    ArrowRight, ChevronLeft, ChevronRight, Calendar,
    User, Share2, X, Mail, Copy, Check, Play, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
};

const getYoutubeId = (url) => {
    if (!url) return null;
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&\/\s]{11})/);
    if (shortsMatch) return shortsMatch[1];
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv'];
    const lowerUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowerUrl.includes(`.${ext}`))) return true;
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com')) return true;
    return false;
};

const isTopStoriesCategory = (cat) => {
    const name = String(cat.name || '').toLowerCase().replace(/[\s-_]/g, '');
    const id = String(cat.id || '').toLowerCase().replace(/[\s-_]/g, '');
    return name === 'topstories' || id === 'topstories' || name === 'top-stories' || id === 'top-stories';
};

const Home = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [categories, setCategories] = useState([]);
    const [heroSlides, setHeroSlides] = useState([]);
    const [topStories, setTopStories] = useState([]);
    const [filteredTopStories, setFilteredTopStories] = useState([]);
    const [groupedPosts, setGroupedPosts] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [copied, setCopied] = useState(false);
    const [shortVideos, setShortVideos] = useState([]);

    // ── NEW: track expanded state per section ──
    const [topStoriesExpanded, setTopStoriesExpanded] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});

    const POSTS_PER_ROW = 3;

    const formatViews = (views) => {
        if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
        if (views >= 1000) return (views / 1000).toFixed(0) + 'K';
        return views.toString();
    };

    const fetchShorts = async () => {
        try {
            const response = await api.get('/public/shorts?limit=20');
            if (response?.shorts) {
                setShortVideos(response.shorts.map(short => ({
                    id: short._id,
                    videoUrl: short.videoUrl,
                    title: short.title,
                    views: formatViews(short.views || 0),
                    thumbnail: short.thumbnail,
                    platform: short.platform || 'youtube'
                })));
            }
        } catch (error) {
            console.error('Failed to fetch shorts:', error);
        }
    };

    useEffect(() => { fetchShorts(); }, []);

    const mapPost = (p) => ({
        id: p._id,
        title: p.title,
        excerpt: p.description,
        image: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
        mediaUrl: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
        isVideo: p.media?.[0]?.url ? isVideoUrl(p.media[0].url) : false,
        postType: p.postType,
        category: p.category,
        author: p.author,
        date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });

    const fetchData = async (filterCategory = null) => {
        setLoading(true);
        // reset expanded states on new fetch
        setTopStoriesExpanded(false);
        setExpandedCategories({});
        try {
            const catRes = await api.get('/public/categories');
            const categoriesData = catRes?.data || [];
            setCategories(categoriesData);

            const postsData = await api.get('/allposts');

            setHeroSlides(
                postsData.filter(p => p.heroContent === true).slice(0, 5).map(p => ({
                    id: p._id,
                    title: p.title,
                    excerpt: p.description,
                    image: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
                    mediaUrl: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
                    isVideo: p.media?.[0]?.url ? isVideoUrl(p.media[0].url) : false,
                    postType: p.postType,
                    category: p.category,
                    author: p.author,
                    date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                }))
            );

            const topStoryCat = categoriesData.find(c => isTopStoriesCategory(c));

            const allTopStoryPosts = postsData
                .filter(p =>
                    p.topStory === true ||
                    (topStoryCat && (
                        String(p.category).toLowerCase() === String(topStoryCat.id).toLowerCase() ||
                        String(p.category).toLowerCase() === String(topStoryCat.name).toLowerCase()
                    ))
                )
                .map(mapPost);

            // ── store ALL top stories (not sliced to 6 anymore) ──
            setTopStories(allTopStoryPosts);

            const isFilteringTopStories = filterCategory && topStoryCat && (
                String(filterCategory).toLowerCase() === String(topStoryCat.id).toLowerCase() ||
                String(filterCategory).toLowerCase() === String(topStoryCat.name).toLowerCase()
            );

            if (isFilteringTopStories) {
                setFilteredTopStories(allTopStoryPosts);
                setGroupedPosts({});
            } else if (filterCategory) {
                setFilteredTopStories([]);
                const filteredPosts = postsData.filter(
                    p => p.category?.toLowerCase() === filterCategory.toLowerCase()
                );
                const categoryName = categoriesData.find(c => c.id === filterCategory)?.name || filterCategory;
                // ── store ALL posts for filtered category ──
                setGroupedPosts(filteredPosts.length > 0 ? { [categoryName]: filteredPosts.map(mapPost) } : {});
            } else {
                setFilteredTopStories([]);
                const grouped = {};
                categoriesData.forEach(cat => {
                    if (isTopStoriesCategory(cat)) return;
                    const catPosts = postsData.filter(
                        p => p.category?.toLowerCase() === cat.id?.toLowerCase() ||
                             p.category?.toLowerCase() === cat.name?.toLowerCase()
                    );
                    if (catPosts.length) {
                        // ── store ALL posts per category ──
                        grouped[cat.name] = catPosts.map(mapPost);
                    }
                });
                setGroupedPosts(grouped);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { window.scrollTo(0, 0); fetchData(); }, []);

    useEffect(() => {
        const handleCategoryFilter = (event) => {
            const { category } = event.detail;
            if (!category) {
                setSelectedCategory(null);
                setFilteredTopStories([]);
                fetchData(null);
            } else {
                setSelectedCategory(category);
                fetchData(category);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        window.addEventListener('categoryFilterChange', handleCategoryFilter);
        return () => window.removeEventListener('categoryFilterChange', handleCategoryFilter);
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
                <p className="text-slate-500 text-sm tracking-widest uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading stories...</p>
            </div>
        </div>
    );

    const displayPosts = Object.entries(groupedPosts);
    const isTopStoriesSelected = filteredTopStories.length > 0;
    const topStoryCat = categories.find(c => isTopStoriesCategory(c));

    const handleShare = (post, e) => {
        e.stopPropagation();
        setSelectedPost(post);
        setShareModalOpen(true);
        setCopied(false);
    };

    const getShareUrl = (postId) => `${window.location.origin}/kaivailayam/post/${postId}`;

    const shareVia = (platform) => {
        const url = getShareUrl(selectedPost.id);
        const text = selectedPost.title;
        switch (platform) {
            case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank'); break;
            case 'email': window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`; break;
            case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank'); break;
            case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
            case 'linkedin': window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank'); break;
            case 'copy':
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                break;
        }
    };

    const handleVideoClick = (videoUrl) => window.open(videoUrl, '_blank');

    const scrollVideos = (direction) => {
        const container = document.getElementById('short-videos-container');
        if (container) {
            const screenWidth = window.innerWidth;
            const scrollAmount = screenWidth < 640 ? 160 : screenWidth < 768 ? 200 : screenWidth < 1024 ? 220 : 240;
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return categoryId;
        const found = categories.find(c => String(c.id).toLowerCase() === String(categoryId).toLowerCase());
        return found ? found.name : categoryId;
    };

    // ── VIEW MORE / LESS — inline in heading row ──

    // ── POST CARD ── news thumbnail style
    const PostCard = ({ post, index = 0 }) => {
        const youtubeId = getYoutubeId(post.mediaUrl);

        const thumbSrc = post.isVideo && youtubeId
            ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            : post.image;

        return (
            <div
                onClick={() => navigate(`/post/${post.id}`)}
                className="hm-card group cursor-pointer flex flex-col rounded-2xl overflow-hidden border border-white/8 hover:border-orange-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                style={{ background: 'rgba(12,10,8,0.9)', animationDelay: `${index * 0.08}s` }}
            >
                {/* ── THUMBNAIL ── */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {thumbSrc ? (
                        <img
                            src={thumbSrc}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={post.title}
                            onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x338/0c0a08/333?text=No+Image'; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(20,12,4,0.95)' }}>
                            <Play size={32} className="text-slate-700" />
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)' }} />

                    {/* Play button bottom-left for videos */}
                    {post.isVideo && (
                        <div className="absolute bottom-2.5 left-3 z-10">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Date bottom-right */}
                    <div className="absolute bottom-2.5 right-3 z-10">
                        <span className="text-[10px] text-white/75 font-medium"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {post.date}
                        </span>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
                    <h3 className="text-white font-semibold mb-3 line-clamp-2 group-hover:text-orange-100 transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', lineHeight: '1.45' }}>
                        {post.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-slate-900 text-[9px] font-black flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                {post.author?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-slate-500 text-[11px]"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {post.author}
                            </span>
                        </div>
                        <button onClick={e => handleShare(post, e)}
                            className="p-1.5 rounded-lg hover:bg-orange-500/10 transition-all group/share"
                            title="Share post">
                            <Share2 size={13} className="text-slate-600 group-hover/share:text-orange-400 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── SECTION HEADING component
    const SectionHeading = ({ children, count, onClick, expanded, onToggle, total }) => (
        <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="flex items-center gap-4">
                <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFCC66, #FF7A18)' }} />
                <div>
                    {onClick ? (
                        <button onClick={onClick} className="group/heading flex items-center gap-3">
                            <h2 className="font-black text-white leading-none group-hover/heading:text-orange-100 transition-colors"
                                style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                                {children}
                            </h2>
                        </button>
                    ) : (
                        <h2 className="font-black text-white leading-none"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                            {children}
                        </h2>
                    )}
                    {count !== undefined && (
                        <p className="text-slate-600 text-xs tracking-widest uppercase mt-1"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {count} {count === 1 ? 'story' : 'stories'}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 ml-6">
                <div className="h-px flex-1 w-16 sm:w-32 hidden sm:block"
                    style={{ background: 'linear-gradient(to right, rgba(255,122,24,0.3), transparent)' }} />
                {onToggle && total > POSTS_PER_ROW && (
                    <button
                        onClick={onToggle}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-orange-500/30 text-orange-400 text-xs font-semibold hover:bg-orange-500/10 transition-all flex-shrink-0"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                        {expanded ? (
                            <>View Less <ChevronLeft size={13} className="rotate-90" /></>
                        ) : (
                            <>View More <ChevronRight size={13} className="rotate-90" /></>
                        )}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col ">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

                @keyframes hmFadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes hmFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes pulseSoftHm {
                    0%,100% { opacity:0.4; transform:scale(1); }
                    50%      { opacity:0.7; transform:scale(1.04); }
                }

                .hm-card {
                    animation: hmFadeUp 0.7s cubic-bezier(.22,1,.36,1) both;
                }
                .hm-section {
                    animation: hmFadeIn 0.6s ease both;
                }

                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .scroll-smooth  { scroll-behavior: smooth; }

                @media (max-width: 768px) {
                    #short-videos-container { -webkit-overflow-scrolling: touch; }
                }
            `}</style>

            {/* ══ SHARE MODAL ══ */}
            {shareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
                    onClick={() => setShareModalOpen(false)}>
                    <div className="relative rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, rgba(20,12,4,0.98), rgba(15,15,20,0.98))' }}
                        onClick={e => e.stopPropagation()}>
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                            style={{ background: 'linear-gradient(to right, transparent, rgba(255,204,102,0.4), transparent)' }} />

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black text-white"
                                    style={{ fontFamily: "'Playfair Display', serif" }}>Share Post</h3>
                                <p className="text-slate-600 text-xs mt-0.5"
                                    style={{ fontFamily: "'DM Sans', sans-serif" }}>Choose a platform</p>
                            </div>
                            <button onClick={() => setShareModalOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-xl transition border border-white/5">
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 mb-3">
                            {[
                                { key: 'whatsapp', label: 'WhatsApp', bg: '#25D366', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg> },
                                { key: 'email',    label: 'Email',    bg: '#475569', icon: <Mail size={18} className="text-white" /> },
                                { key: 'twitter',  label: 'Twitter',  bg: '#000000', icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                                { key: 'facebook', label: 'Facebook', bg: '#1877F2', icon: <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                                { key: 'linkedin', label: 'LinkedIn', bg: '#0A66C2', icon: <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                            ].map(({ key, label, bg, icon }) => (
                                <button key={key} onClick={() => shareVia(key)}
                                    className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
                                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ background: bg }}>
                                        {icon}
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors"
                                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                        {label}
                                    </span>
                                </button>
                            ))}
                            <button onClick={() => shareVia('copy')}
                                className="col-span-2 flex items-center gap-3 p-3.5 rounded-xl border border-white/5 hover:border-orange-500/20 transition-all group"
                                style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)' }}>
                                    {copied
                                        ? <Check size={16} className="text-green-400" />
                                        : <Copy size={16} className="text-slate-400" />
                                    }
                                </div>
                                <span className="text-sm font-medium transition-colors"
                                    style={{ fontFamily: "'DM Sans', sans-serif", color: copied ? '#4ade80' : '#cbd5e1' }}>
                                    {copied ? 'Link Copied!' : 'Copy Link'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ HERO SLIDER ══ */}
            {heroSlides.length > 0 && (
                <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden mb-12 md:mb-20 hm-section">
                    {heroSlides.map((slide, index) => (
                        <div key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'}`}>
                            <div className="absolute inset-0 z-10"
                                style={{ background: 'linear-gradient(105deg, rgba(5,2,0,0.92) 0%, rgba(5,2,0,0.6) 40%, transparent 70%)' }} />

                            {(() => {
                                const youtubeId = getYoutubeId(slide.image);
                                if (youtubeId && index === currentSlide) {
                                    return (
                                        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                                            <iframe
                                                style={{
                                                    position: 'absolute',
                                                    top: '93%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '177.78vh',
                                                    minWidth: '100%',
                                                    height: '56.25vw',
                                                    minHeight: '100%',
                                                    border: 'none'
                                                }}
                                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&iv_load_policy=3&showinfo=0&rel=0`}
                                                allow="autoplay" frameBorder="0" />
                                        </div>
                                    );
                                }
                                return (
                                    <img
                                        src={slide.image.includes('youtube.com') || slide.image.includes('youtu.be')
                                            ? `https://img.youtube.com/vi/${getYoutubeId(slide.image)}/maxresdefault.jpg`
                                            : slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover" />
                                );
                            })()}

                            <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-10 md:px-14 lg:px-20 pb-10 md:pb-14">
                                <span className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-slate-900 w-fit mb-4"
                                    style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                    {getCategoryName(slide.category)}
                                </span>

                                <h2 className="text-white font-black mb-3 md:mb-4 max-w-3xl leading-tight line-clamp-3 md:line-clamp-none"
                                    style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 4.5vw, 3.8rem)', letterSpacing: '-0.02em' }}>
                                    {slide.title}
                                </h2>

                                <p className="text-slate-300 mb-5 md:mb-7 max-w-2xl line-clamp-2"
                                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)', fontWeight: 300 }}>
                                    {slide.excerpt}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                                    <div className="hidden sm:flex items-center gap-4 text-slate-400"
                                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem' }}>
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-900"
                                                style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                                {slide.author?.[0]?.toUpperCase()}
                                            </div>
                                            {slide.author}
                                        </span>
                                        <span className="text-slate-600">·</span>
                                        <span className="flex items-center gap-1"><Calendar size={13} /> {slide.date}</span>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/post/${slide.id}`)}
                                        className="group flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-slate-900 text-sm transition-all hover:scale-105 active:scale-95"
                                        style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #FFCC66, #FF7A18)', boxShadow: '0 0 30px rgba(255,122,24,0.35)' }}>
                                        Read Article
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={() => setCurrentSlide(p => (p - 1 + heroSlides.length) % heroSlides.length)}
                        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-white/10 hover:border-orange-500/30 backdrop-blur-sm transition-all text-white hover:bg-orange-500/10"
                        style={{ background: 'rgba(5,2,0,0.6)' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setCurrentSlide(p => (p + 1) % heroSlides.length)}
                        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-white/10 hover:border-orange-500/30 backdrop-blur-sm transition-all text-white hover:bg-orange-500/10"
                        style={{ background: 'rgba(5,2,0,0.6)' }}>
                        <ChevronRight size={18} />
                    </button>

                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
                        {heroSlides.map((_, index) => (
                            <button key={index} onClick={() => setCurrentSlide(index)}
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: index === currentSlide ? '28px' : '6px',
                                    background: index === currentSlide
                                        ? 'linear-gradient(to right, #FFCC66, #FF7A18)'
                                        : 'rgba(255,255,255,0.25)'
                                }} />
                        ))}
                    </div>
                </div>
            )}

            {/* ══ SHORT VIDEOS ══ */}
            {shortVideos.length > 0 && (
                <div className="mx-2 sm:mx-4 md:mx-6 lg:mx-8 mb-14 md:mb-20 hm-section">
                    <div className="flex items-center gap-4 mb-7 px-2 sm:px-4">
                        <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(to bottom, #FFCC66, #FF7A18)" }} />
                        <h2 className="font-black text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}>
                            NNS <em className="italic text-orange-400">Shorts</em>
                        </h2>
                        <div className="h-px flex-1 max-w-xs" style={{ background: "linear-gradient(to right, rgba(255,122,24,0.35), transparent)" }} />
                    </div>

                    <div className="relative group/scroll">
                        <button onClick={() => scrollVideos("left")}
                            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-white/10 hover:border-orange-500/30 backdrop-blur-sm transition-all text-white opacity-0 group-hover/scroll:opacity-100 shadow-lg"
                            style={{ background: "rgba(5,2,0,0.85)" }}>
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={() => scrollVideos("right")}
                            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-white/10 hover:border-orange-500/30 backdrop-blur-sm transition-all text-white opacity-0 group-hover/scroll:opacity-100 shadow-lg"
                            style={{ background: "rgba(5,2,0,0.85)" }}>
                            <ChevronRight size={18} />
                        </button>

                        <div className="overflow-x-auto scrollbar-hide scroll-smooth" id="short-videos-container">
                            <div className="flex gap-3 sm:gap-4 pb-4 px-2 sm:px-4">
                                {shortVideos.map((video) => {
                                    const youtubeId = getYoutubeId(video.videoUrl);
                                    const isInstagram = video.platform === "instagram";
                                    const getThumbnailUrl = () => {
                                        if (video.thumbnail) {
                                            if (video.thumbnail.startsWith("http")) return video.thumbnail;
                                            return `${API_BASE_URL.replace(/\/api$/, "")}${video.thumbnail}`;
                                        }
                                        if (!isInstagram && youtubeId) return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
                                        return "https://placehold.co/300x533/1e293b/475569?text=Short+Video";
                                    };
                                    return (
                                        <div key={video.id} onClick={() => handleVideoClick(video.videoUrl)}
                                            className="flex-shrink-0 w-[140px] xs:w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] group cursor-pointer">
                                            <div className="relative rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/15"
                                                style={{ background: "rgba(15,15,20,0.8)" }}>
                                                <div className="relative aspect-[9/16] overflow-hidden bg-slate-900">
                                                    <img src={getThumbnailUrl()} alt={video.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            const src = e.target.src;
                                                            if (!isInstagram && youtubeId) {
                                                                if (src.includes("maxresdefault")) e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                                                                else if (src.includes("hqdefault")) e.target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                                                                else if (src.includes("mqdefault")) e.target.src = `https://img.youtube.com/vi/${youtubeId}/default.jpg`;
                                                                else { e.target.onerror = null; e.target.src = "https://placehold.co/300x533/1e293b/475569?text=Short+Video"; }
                                                            } else { e.target.onerror = null; e.target.src = "https://placehold.co/300x533/1e293b/475569?text=Short+Video"; }
                                                        }} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                                                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 z-10">
                                                        <div className="flex items-start gap-2 mb-1">
                                                            <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                                                                style={{ background: "linear-gradient(135deg, #FFCC66, #FF7A18)" }}>
                                                                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                                </svg>
                                                            </div>
                                                            <h3 className="text-white font-bold text-xs line-clamp-2" style={{ fontFamily: "'Playfair Display', serif" }}>{video.title}</h3>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{video.views}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ POSTS SECTIONS ══ */}
            <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-16 md:pb-24 w-full">

                {/* Top stories — filtered view (when category = top stories selected) */}
                {isTopStoriesSelected && (
                    <div className="mb-16 md:mb-24 hm-section">
                        <SectionHeading
                            count={filteredTopStories.length}
                            expanded={topStoriesExpanded}
                            total={filteredTopStories.length}
                            onToggle={() => setTopStoriesExpanded(p => !p)}
                        >
                            <span className="flex items-center gap-3">
                                <TrendingUp size={22} className="text-orange-400" />
                                Top Stories
                            </span>
                        </SectionHeading>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                            {(topStoriesExpanded ? filteredTopStories : filteredTopStories.slice(0, POSTS_PER_ROW)).map((post, i) => (
                                <PostCard key={post.id} post={post} index={i} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Default view */}
                {!isTopStoriesSelected && (
                    <>
                        {/* Top Stories preview (home page) */}
                        {!selectedCategory && topStories.length > 0 && (
                            <div className="mb-16 md:mb-24 hm-section">
                                <SectionHeading
                                    onClick={topStoryCat ? () => {
                                        setSelectedCategory(topStoryCat.id);
                                        fetchData(topStoryCat.id);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    } : undefined}
                                    expanded={topStoriesExpanded}
                                    total={topStories.length}
                                    onToggle={() => setTopStoriesExpanded(p => !p)}
                                >
                                    <span className="flex items-center gap-3">
                                        <TrendingUp size={20} className="text-orange-400" />
                                        Top Stories
                                    </span>
                                </SectionHeading>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                                    {(topStoriesExpanded ? topStories : topStories.slice(0, POSTS_PER_ROW)).map((post, i) => (
                                        <PostCard key={post.id} post={post} index={i} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category sections */}
                        {displayPosts.map(([categoryName, posts]) => (
                            <div key={categoryName} className="mb-16 md:mb-24 hm-section">
                                <SectionHeading
                                    expanded={!!expandedCategories[categoryName]}
                                    total={posts.length}
                                    onToggle={() => setExpandedCategories(prev => ({
                                        ...prev,
                                        [categoryName]: !prev[categoryName]
                                    }))}
                                >
                                    {categoryName}
                                </SectionHeading>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                                    {(expandedCategories[categoryName] ? posts : posts.slice(0, POSTS_PER_ROW)).map((post, i) => (
                                        <PostCard key={post.id} post={post} index={i} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;