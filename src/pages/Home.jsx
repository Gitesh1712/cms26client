import { useState, useEffect } from 'react';
import {
    ArrowRight, ChevronLeft, ChevronRight, Calendar,
    Play, TrendingUp, X, Check, Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
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
    const id   = String(cat.id   || '').toLowerCase().replace(/[\s-_]/g, '');
    return name === 'topstories' || id === 'topstories' || name === 'top-stories' || id === 'top-stories';
};

const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000)    return (views / 1000).toFixed(0) + 'K';
    return String(views);
};


const VIEW_COOLDOWN = 30 * 60 * 1000; 

const hasViewedRecently = (shortId) => {
    try {
        const val = localStorage.getItem(`viewed_short_${shortId}`);
        if (!val) return false;
        return Date.now() - parseInt(val) < VIEW_COOLDOWN;
    } catch { return false; }
};

const markViewed = (shortId) => {
    try { localStorage.setItem(`viewed_short_${shortId}`, String(Date.now())); } catch {}
};

const hasLiked = (shortId) => {
    try { return !!localStorage.getItem(`liked_short_${shortId}`); } catch { return false; }
};

const markLiked = (shortId) => {
    try { localStorage.setItem(`liked_short_${shortId}`, '1'); } catch {}
};

const clearLiked = (shortId) => {
    try { localStorage.removeItem(`liked_short_${shortId}`); } catch {}
};


const Home = () => {
    const navigate = useNavigate();


    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroSlides,   setHeroSlides]   = useState([]);

    
    const [categories,setCategories] = useState([]);
    const [topStories,setTopStories] = useState([]);
    const [filteredTopStories,setFilteredTopStories] = useState([]);
    const [groupedPosts,setGroupedPosts] = useState({});
    const [selectedCategory,setSelectedCategory]= useState(null);
    const [loading,setLoading] = useState(true);

    
    const [topStoriesExpanded, setTopStoriesExpanded] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});

   
    const [shortVideos, setShortVideos] = useState([]);
    const [shortsPage, setShortsPage]= useState(1);
    const [shortsHasMore,setShortsHasMore] = useState(false);
    const [shortsLoading, setShortsLoading] = useState(false);
    const SHORTS_LIMIT = 10;

   
    const [videoModalOpen,setVideoModalOpen]= useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);

   
    const [copiedPostId, setCopiedPostId] = useState(null);

    const POSTS_PER_ROW = 3;

  
    const fetchShorts = async (page = 1, append = false) => {
        try {
            setShortsLoading(true);
            const response = await api.get(`/public/shorts?limit=${SHORTS_LIMIT}&page=${page}`);

            if (response?.shorts) {
                const mapped = response.shorts.map(short => ({
                    id:       short._id,
                    videoUrl: short.videoUrl,
                    title:    short.title,
                    views:    formatViews(short.views || 0),
                    rawViews: short.views || 0,
                    likes:    short.likes || 0,
                
                    liked:    hasLiked(short._id),
                    thumbnail: short.thumbnail,
                    platform:  short.platform || 'youtube'
                }));

                setShortVideos(prev => append ? [...prev, ...mapped] : mapped);
                setShortsHasMore(page < (response.pagination?.pages || 1));
                setShortsPage(page);
            }
        } catch (error) {
            console.error('Failed to fetch shorts:', error);
        } finally {
            setShortsLoading(false);
        }
    };

    useEffect(() => { fetchShorts(1, false); }, []);

   
    const handleVideoClick = async (video) => {
       
        if (!hasViewedRecently(video.id)) {
            
            api.get(`/public/shorts/${video.id}`).catch(() => {});

      
            markViewed(video.id);
            setShortVideos(prev => prev.map(v =>
                v.id === video.id
                    ? { ...v, rawViews: v.rawViews + 1, views: formatViews(v.rawViews + 1) }
                    : v
            ));
        }

        setSelectedVideoUrl(video.videoUrl);
        setVideoModalOpen(true);
    };

    const closeVideoModal = () => {
        setVideoModalOpen(false);
        setSelectedVideoUrl(null);
    };

    const handleLike = async (e, video) => {
        e.stopPropagation();

        const alreadyLiked = hasLiked(video.id) || video.liked;

        if (alreadyLiked) {
           
            try {
                const res = await api.post(`/public/shorts/${video.id}/unlike`);
                clearLiked(video.id);
                setShortVideos(prev => prev.map(v =>
                    v.id === video.id
                        ? { ...v, likes: res.likes ?? Math.max(0, v.likes - 1), liked: false }
                        : v
                ));
            } catch {
              
                clearLiked(video.id);
                setShortVideos(prev => prev.map(v =>
                    v.id === video.id ? { ...v, liked: false } : v
                ));
            }
            return;
        }

      
        try {
            const res = await api.post(`/public/shorts/${video.id}/like`);
            markLiked(video.id);
            setShortVideos(prev => prev.map(v =>
                v.id === video.id
                    ? { ...v, likes: res.likes ?? v.likes + 1, liked: true }
                    : v
            ));
        } catch (err) {
           
            if (err?.alreadyLiked) {
                markLiked(video.id);
                setShortVideos(prev => prev.map(v =>
                    v.id === video.id ? { ...v, liked: true } : v
                ));
            }
        }
    };

    
    const mapPost = (p) => ({
        id:       p._id,
        title:    p.title,
        excerpt:  p.description,
        image:    p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
        mediaUrl: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
        isVideo:  p.media?.[0]?.url ? isVideoUrl(p.media[0].url) : false,
        postType: p.postType,
        category: p.category,
        author:   p.author,
        date:     new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });

    const fetchData = async (filterCategory = null) => {
        setLoading(true);
        setTopStoriesExpanded(false);
        setExpandedCategories({});
        try {
            const catRes         = await api.get('/public/categories');
            const categoriesData = catRes?.data || [];
            setCategories(categoriesData);

            const postsData     = await api.get('/allposts');
            const allHeroSlides = postsData.filter(p => p.heroContent === true).slice(0, 5);

            const heroMapper = (p) => ({
                id:       p._id,
                title:    p.title,
                excerpt:  p.description,
                image:    p.media?.[0]?.url ? getImageUrl(p.media[0].url) : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
                mediaUrl: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
                isVideo:  p.media?.[0]?.url ? isVideoUrl(p.media[0].url) : false,
                postType: p.postType,
                category: p.category,
                author:   p.author,
                date:     new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            });

            setHeroSlides(
                filterCategory
                    ? allHeroSlides.filter(p => p.category?.toLowerCase() === filterCategory.toLowerCase()).map(heroMapper)
                    : allHeroSlides.map(heroMapper)
            );

            const topStoryCat      = categoriesData.find(c => isTopStoriesCategory(c));
            const allTopStoryPosts = postsData
                .filter(p =>
                    p.topStory === true ||
                    (topStoryCat && (
                        String(p.category).toLowerCase() === String(topStoryCat.id).toLowerCase() ||
                        String(p.category).toLowerCase() === String(topStoryCat.name).toLowerCase()
                    ))
                )
                .map(mapPost);

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
                const filteredPosts = postsData.filter(p => p.category?.toLowerCase() === filterCategory.toLowerCase());
                const categoryName  = categoriesData.find(c => c.id === filterCategory)?.name || filterCategory;
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
                    if (catPosts.length) grouped[cat.name] = catPosts.map(mapPost);
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

   
    const getShareUrl = (post) => {
        const categorySlug = generateSlug(post.category);
        const postSlug     = generateSlug(post.title);
        return `${window.location.origin}/${categorySlug}/${postSlug}`;
    };

    const shareOnPlatform = (platform, post, e) => {
        e.stopPropagation();
        const url  = getShareUrl(post);
        const text = post.title;
        switch (platform) {
            case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank'); break;
            case 'twitter':  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank'); break;
            case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
            case 'copy':
                navigator.clipboard.writeText(url);
                setCopiedPostId(post.id);
                setTimeout(() => setCopiedPostId(null), 2000);
                break;
        }
    };

    
    const scrollVideos = (direction) => {
        const container = document.getElementById('short-videos-container');
        if (container) {
            const sw     = window.innerWidth;
            const amount = sw < 640 ? 160 : sw < 768 ? 200 : sw < 1024 ? 220 : 240;
            container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return categoryId;
        const found = categories.find(c => String(c.id).toLowerCase() === String(categoryId).toLowerCase());
        return found ? found.name : categoryId;
    };

   
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
                <p className="text-slate-500 text-sm tracking-widest uppercase" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Loading stories...
                </p>
            </div>
        </div>
    );

    const displayPosts         = Object.entries(groupedPosts);
    const isTopStoriesSelected = filteredTopStories.length > 0;
    const topStoryCat          = categories.find(c => isTopStoriesCategory(c));

   
    const PostCard = ({ post, index = 0 }) => {
        const [shareHovered, setShareHovered] = useState(false);
        const youtubeId    = getYoutubeId(post.mediaUrl);
        const thumbSrc     = post.isVideo && youtubeId
            ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
            : post.image;
        const categorySlug = generateSlug(post.category);
        const postSlug     = generateSlug(post.title);
        const isCopied     = copiedPostId === post.id;

        const socialIcons = [
            {
                key: 'whatsapp', title: 'WhatsApp', bg: '#25D366',
                icon: (
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                )
            },
            {
                key: 'twitter', title: 'Twitter / X', bg: '#000000',
                icon: (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                )
            },
            {
                key: 'facebook', title: 'Facebook', bg: '#1877F2',
                icon: (
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                )
            },
            {
                key: 'copy',
                title: isCopied ? 'Copied!' : 'Copy Link',
                bg: isCopied ? '#22c55e' : '#475569',
                icon: isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />
            },
        ];

        return (
            <div
                onClick={() => navigate(`/${categorySlug}/${postSlug}`)}
                className="hm-card group cursor-pointer flex flex-col rounded-2xl overflow-hidden border border-white/8 hover:border-orange-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                style={{ background: 'rgba(12,10,8,0.9)', animationDelay: `${index * 0.08}s` }}
            >
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
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)' }} />
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
                    <div className="absolute bottom-2.5 right-3 z-10">
                        <span className="text-[10px] text-white/75 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {post.date}
                        </span>
                    </div>
                </div>

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
                            <span className="text-slate-500 text-[11px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {post.author}
                            </span>
                        </div>
                        <div
                            className="relative flex items-center"
                            onMouseEnter={() => setShareHovered(true)}
                            onMouseLeave={() => setShareHovered(false)}
                            onClick={e => e.stopPropagation()}
                        >
                            <div
                                className="flex items-center gap-1.5 overflow-hidden transition-all duration-300 ease-in-out"
                                style={{
                                    maxWidth: shareHovered ? '160px' : '0px',
                                    opacity:  shareHovered ? 1 : 0,
                                    marginRight: shareHovered ? '6px' : '0px',
                                }}
                            >
                                {socialIcons.map(({ key, title, bg, icon }) => (
                                    <button
                                        key={key}
                                        onClick={(e) => shareOnPlatform(key, post, e)}
                                        title={title}
                                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform shadow-md"
                                        style={{ background: bg }}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform shadow-md"
                                style={{ background: '#fb923c' }}
                                title="Share"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                    stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
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
                        <p className="text-slate-600 text-xs tracking-widest uppercase mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
        <div className="flex flex-col">
            <SEO
                title="Home - Top Stories, Travel & Culture"
                description="Discover trending top stories, travel guides, cultural insights, and NNS Shorts. Your gateway to authentic storytelling and quality content."
                image="/logo.png"
                type="website"
            />
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
                .hm-card    { animation: hmFadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
                .hm-section { animation: hmFadeIn 0.6s ease both; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .scroll-smooth  { scroll-behavior: smooth; }
                @media (max-width: 768px) {
                    #short-videos-container { -webkit-overflow-scrolling: touch; }
                }
            `}</style>
            {videoModalOpen && selectedVideoUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
                    onClick={closeVideoModal}>
                    <div className="relative w-full max-w-4xl h-[80vh] sm:h-[85vh] md:h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}>
                        <button
                            onClick={closeVideoModal}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-orange-400 transition-colors z-10">
                            <X size={32} />
                        </button>
                        <div className="flex-1 w-full h-full rounded-2xl overflow-hidden bg-black">
                            {(() => {
                                const youtubeId = getYoutubeId(selectedVideoUrl);
                                if (youtubeId) {
                                    return (
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    );
                                }
                                return (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                        <p className="text-white text-lg">Opening video...</p>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-slate-400 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                Click anywhere outside or press X to close
                            </p>
                        </div>
                    </div>
                </div>
            )}
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
                                                    position: 'absolute', top: '50%', left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    width: '100%', height: '100%',
                                                    minWidth: '177.78vh', minHeight: '56.25vw', border: 'none'
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
                                        onClick={() => navigate(`/${generateSlug(slide.category)}/${generateSlug(slide.title)}`)}
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

            {/* ── NNS Shorts ───────────────────────────────────────────────── */}
            {!selectedCategory && shortVideos.length > 0 && (
                <div className="mx-2 sm:mx-4 md:mx-6 lg:mx-8 mb-14 md:mb-20 hm-section">

                    {/* Heading */}
                    <div className="flex items-center gap-4 mb-7 px-2 sm:px-4">
                        <div className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(to bottom, #FFCC66, #FF7A18)" }} />
                        <h2 className="font-black text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}>
                            NNS <em className="italic text-orange-400">Shorts</em>
                        </h2>
                        <div className="h-px flex-1 max-w-xs" style={{ background: "linear-gradient(to right, rgba(255,122,24,0.35), transparent)" }} />
                    </div>

                    {/* Scrollable row */}
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
                                    const youtubeId   = getYoutubeId(video.videoUrl);
                                    const isInstagram = video.platform === "instagram";

                                    const getThumbUrl = () => {
                                        if (video.thumbnail) {
                                            if (video.thumbnail.startsWith("http")) return video.thumbnail;
                                            return `${API_BASE_URL.replace(/\/api$/, "")}${video.thumbnail}`;
                                        }
                                        if (!isInstagram && youtubeId)
                                            return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
                                        return "https://placehold.co/300x533/1e293b/475569?text=Short+Video";
                                    };

                                    return (
                                        <div
                                            key={video.id}
                                            onClick={() => handleVideoClick(video)}
                                            className="flex-shrink-0 w-[140px] xs:w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] group cursor-pointer"
                                        >
                                            <div className="relative rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/15"
                                                style={{ background: "rgba(15,15,20,0.8)" }}>
                                                <div className="relative aspect-[9/16] overflow-hidden bg-slate-900">
                                                    <img
                                                        src={getThumbUrl()}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            const src = e.target.src;
                                                            if (!isInstagram && youtubeId) {
                                                                if (src.includes("maxresdefault"))  e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                                                                else if (src.includes("hqdefault")) e.target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                                                                else if (src.includes("mqdefault")) e.target.src = `https://img.youtube.com/vi/${youtubeId}/default.jpg`;
                                                                else { e.target.onerror = null; e.target.src = "https://placehold.co/300x533/1e293b/475569?text=Short+Video"; }
                                                            } else {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://placehold.co/300x533/1e293b/475569?text=Short+Video";
                                                            }
                                                        }}
                                                    />

                                                    {/* Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                                                    {/* Card bottom content */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 z-10">
                                                        {/* Title */}
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                                                                style={{ background: "linear-gradient(135deg, #FFCC66, #FF7A18)" }}>
                                                                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                                </svg>
                                                            </div>
                                                            <h3 className="text-white font-bold text-xs line-clamp-2"
                                                                style={{ fontFamily: "'Playfair Display', serif" }}>
                                                                {video.title}
                                                            </h3>
                                                        </div>

                                                        {/* Views + Like */}
                                                        <div className="flex items-center justify-between">
                                                            {/* Views */}
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-400"
                                                                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>{video.views}</span>
                                                            </div>

                                                            {/* Like / Unlike button */}
                                                            <button
                                                                onClick={(e) => handleLike(e, video)}
                                                                className="flex items-center gap-1 text-[10px] transition-all hover:scale-110 active:scale-95"
                                                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                                                                title={video.liked ? 'Unlike' : 'Like'}
                                                            >
                                                                <svg
                                                                    className="w-3.5 h-3.5 transition-all duration-200"
                                                                    fill={video.liked ? '#FF7A18' : 'none'}
                                                                    stroke={video.liked ? '#FF7A18' : '#94a3b8'}
                                                                    strokeWidth="2"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                </svg>
                                                                <span className={video.liked ? 'text-orange-400' : 'text-slate-400'}>
                                                                    {video.likes}
                                                                </span>
                                                            </button>
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

                    {/* Load More */}
                    {shortsHasMore && (
                        <div className="flex justify-center mt-5">
                            <button
                                onClick={() => fetchShorts(shortsPage + 1, true)}
                                disabled={shortsLoading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-orange-500/30 text-orange-400 text-sm font-semibold hover:bg-orange-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                                {shortsLoading ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-orange-400/30 border-t-orange-400 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Load More Shorts
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Posts ────────────────────────────────────────────────────── */}
            <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-16 md:pb-24 w-full" style={{ marginTop: "82px" }}>

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

                {!isTopStoriesSelected && (
                    <>
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