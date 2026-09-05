import { useState, useEffect, useRef } from 'react';
import ComingSoon from './Comingsoon';
import './ComingSoon.css';

import {
    ArrowRight, ChevronLeft, ChevronRight, Calendar,
    Play, Pause, TrendingUp, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slugify';
import PostCard from '../components/PostCard';
import PostSlider from '../components/PostSlider';
import {
    API_BASE_URL,
    POSTS_PER_ROW,
    getImageUrl,
    getYoutubeId,
    formatViews,
    extractTextFromLexical,
    isTopStoriesCategory,
    mapPost,
    resolvePostThumbnail,
} from '../utils/postHelpers';


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



const SectionHeading = ({ children, count, onClick, expanded, onToggle, onViewAll, total }) => (
    <div className="flex items-center justify-between mb-8 md:mb-10">
        <div className="flex items-center gap-4">
            <div className="w-1 h-8 rounded-full"
                style={{ background: 'linear-gradient(to bottom, #FFCC66, #FF7A18)' }} />
            <div>
                {onClick ? (
                    <button onClick={onClick} className="group/heading flex items-center gap-3">
                        <h2
                            className="font-black text-white leading-none group-hover/heading:text-orange-100 transition-colors"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                        >
                            {children}
                        </h2>
                    </button>
                ) : (
                    <h2
                        className="font-black text-white leading-none"
                        style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                    >
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
            <div
                className="h-px flex-1 w-16 sm:w-32 hidden sm:block"
                style={{ background: 'linear-gradient(to right, rgba(255,122,24,0.3), transparent)' }}
            />
            {onViewAll && total > POSTS_PER_ROW && (
                <button
                    onClick={onViewAll}
                    className="flex items-center gap-1.5 px-4 py-1.5  rounded-full border border-orange-500/30 text-orange-400 text-xs font-semibold hover:bg-orange-500/10 transition-all flex-shrink-0"
                    style={{ fontFamily: "'DM Sans', sans-serif",fontSize:"17px" }}
                >
                    View All <ChevronRight size={13} className="rotate-90" />
                </button>
            )}
            {onToggle && total > POSTS_PER_ROW && (
                <button
                    onClick={onToggle}
                    className="flex items-center gap-1.5 px-4 py-1.5  rounded-full border border-orange-500/30 text-orange-400 text-xs font-semibold hover:bg-orange-500/10 transition-all flex-shrink-0"
                    style={{ fontFamily: "'DM Sans', sans-serif",fontSize:"17px" }}
                >
                    {expanded
                        ? <>View Less  <ChevronLeft size={13} className="rotate-90" /></>
                        : <>View More  <ChevronRight size={13} className="rotate-90" /></>
                    }
                </button>
            )}
        </div>
    </div>
);



const Home = () => {

// return <ComingSoon />; 

    const navigate = useNavigate();

    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroSlides,   setHeroSlides]   = useState([]);
    const heroSectionRef = useRef(null);
    const [heroVideoScale, setHeroVideoScale] = useState({ scaleX: 1, scaleY: 1 });
    const [heroVideoPlaying, setHeroVideoPlaying] = useState(true);
    const heroPlayerRef = useRef(null);

    const [categories,           setCategories]           = useState([]);
    const [topStories,           setTopStories]           = useState([]);
    const [filteredTopStories,   setFilteredTopStories]   = useState([]);
    const [groupedPosts,         setGroupedPosts]         = useState({});
    const [selectedCategory,     setSelectedCategory]     = useState(null);
    const [loading,              setLoading]              = useState(true);

    const [topStoriesExpanded,   setTopStoriesExpanded]   = useState(false);

    const [shortVideos,   setShortVideos]   = useState([]);
    const [shortsPage,    setShortsPage]    = useState(1);
    const [shortsHasMore, setShortsHasMore] = useState(false);
    const [shortsLoading, setShortsLoading] = useState(false);
    const SHORTS_LIMIT = 10;

    const [videoModalOpen,    setVideoModalOpen]    = useState(false);
    const [selectedVideoUrl,  setSelectedVideoUrl]  = useState(null);

    const [copiedPostId, setCopiedPostId] = useState(null);





    const fetchShorts = async (page = 1, append = false) => {
        try {
            setShortsLoading(true);
            const response = await api.get(`/public/shorts?limit=${SHORTS_LIMIT}&page=${page}`);
            if (response?.shorts) {
                const mapped = response.shorts.map(short => ({
                    id:        short._id,
                    videoUrl:  short.videoUrl,
                    title:     short.title,
                    views:     formatViews(short.views || 0),
                    rawViews:  short.views || 0,
                    likes:     short.likes || 0,
                    liked:     hasLiked(short._id),
                    thumbnail: short.thumbnail,
                    platform:  short.platform || 'youtube',
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



    const fetchData = async (filterCategory = null) => {
    setLoading(true);
    setTopStoriesExpanded(false);
    try {
        const catRes = await api.get('/public/categories');
        const categoriesData = catRes?.data || [];
        setCategories(categoriesData);

        const postsData = await api.get('/allposts');


        const sortedPosts = postsData.sort((a, b) => {

            if (a.order !== b.order) {
                return (a.order || 999999) - (b.order || 999999);
            }

            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // const allHeroSlides = sortedPosts.filter(p => p.heroContent === true).slice(0, 5);

const heroContentPosts = sortedPosts.filter(p => p.heroContent === true);
const categoryHeroPosts = filterCategory
    ? heroContentPosts.filter(p => p.category?.toLowerCase() === filterCategory.toLowerCase())
    : heroContentPosts;
const allHeroSlides = categoryHeroPosts.slice(0, 5);



const heroMapper = (p) => {
    const { thumbnail } = resolvePostThumbnail(p);

    let heroMediaUrl = null;

    if (p.postType === 'video') {
   
        heroMediaUrl = p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null;
    } else {
       
        const heroDisplayType = p.heroDisplayType || 'image';
        if (heroDisplayType === 'video' && p.heroVideoUrl) {
            heroMediaUrl = getImageUrl(p.heroVideoUrl);
        }
    }

    return {
        id:       p._id,
        title:    p.title,

      excerpt: (() => {
          if (!p.description) return '';
          try {
              const blocks = JSON.parse(p.description);
              if (Array.isArray(blocks)) {
                  const firstTextBlock = blocks.find(b => b.type === 'text' && b.content);
                  const text = firstTextBlock ? extractTextFromLexical(firstTextBlock.content) : '';
                  return text.substring(0, 150);
              }
          } catch {}
          return typeof p.description === 'string' ? p.description.substring(0, 150) : '';
      })(),

        image: thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
        mediaUrl: heroMediaUrl,
        isVideo:  !!heroMediaUrl,
        postType: p.postType,
        category: p.category,
        author:   p.author,
        date:     new Date(p.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }),
    };
};

           setHeroSlides(allHeroSlides.map(heroMapper));
        setCurrentSlide(0);

        const topStoryCat = categoriesData.find(c => isTopStoriesCategory(c));
        const allTopStoryPosts = sortedPosts  
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
                const filteredPosts = postsData.filter(
                    p => p.category?.toLowerCase() === filterCategory.toLowerCase()
                );
                const categoryName = categoriesData.find(c => c.id === filterCategory)?.name || filterCategory;
                setGroupedPosts(
                    filteredPosts.length > 0 ? { [categoryName]: filteredPosts.map(mapPost) } : {}
                );
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
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
}, [heroSlides.length]);

   
    useEffect(() => {
        setHeroVideoPlaying(true);
        heroPlayerRef.current = null;
    }, [currentSlide]);


    useEffect(() => {
        const activeSlide = heroSlides[currentSlide];
        if (!activeSlide) return;
        const ytId = getYoutubeId(activeSlide.mediaUrl);
        if (!ytId) return;

        const iframeElId = `hero-yt-iframe-${activeSlide.id}`;
        let cancelled = false;

        const bindPlayer = () => {
            if (cancelled) return;
            const el = document.getElementById(iframeElId);
            if (!el || !window.YT || !window.YT.Player) return;
            heroPlayerRef.current = new window.YT.Player(iframeElId, {
                events: {
                    onReady: () => { if (!cancelled) setHeroVideoPlaying(true); },
                    onStateChange: (e) => {
                        if (cancelled || !window.YT) return;
                        if (e.data === window.YT.PlayerState.PLAYING) setHeroVideoPlaying(true);
                        else if (e.data === window.YT.PlayerState.PAUSED) setHeroVideoPlaying(false);
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            bindPlayer();
        } else {
            const existingScript = document.getElementById('youtube-iframe-api-script');
            const prevReadyCb = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof prevReadyCb === 'function') prevReadyCb();
                bindPlayer();
            };
            if (!existingScript) {
                const tag = document.createElement('script');
                tag.id = 'youtube-iframe-api-script';
                tag.src = 'https://www.youtube.com/iframe_api';
                document.body.appendChild(tag);
            }
        }

        return () => { cancelled = true; };
    }, [currentSlide, heroSlides]);

    const toggleHeroVideo = () => {
        const player = heroPlayerRef.current;
        if (!player || typeof player.pauseVideo !== 'function') return;
        if (heroVideoPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
        setHeroVideoPlaying(prev => !prev);
    };


    useEffect(() => {
        const HERO_VIDEO_BASE_WIDTH = 1280;
        const HERO_VIDEO_BASE_HEIGHT = 720;
        const updateHeroVideoScale = () => {
            const el = heroSectionRef.current;
            if (!el) return;
            const { width, height } = el.getBoundingClientRect();
            if (!width || !height) return;
            setHeroVideoScale({
                scaleX: width / HERO_VIDEO_BASE_WIDTH,
                scaleY: height / HERO_VIDEO_BASE_HEIGHT,
            });
        };
        updateHeroVideoScale();
        window.addEventListener('resize', updateHeroVideoScale);
        return () => window.removeEventListener('resize', updateHeroVideoScale);
    }, [heroSlides.length, currentSlide]);

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
        const found = categories.find(
            c => String(c.id).toLowerCase() === String(categoryId).toLowerCase()
        );
        return found ? found.name : categoryId;
    };



    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
                <p className="text-slate-500 text-sm tracking-widest uppercase"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Loading stories...
                </p>
            </div>
        </div>
    );

    const displayPosts         = Object.entries(groupedPosts);
    const isTopStoriesSelected = filteredTopStories.length > 0;
    const topStoryCat          = categories.find(c => isTopStoriesCategory(c));







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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
                    onClick={closeVideoModal}
                >
                    <div
                        className="relative w-full max-w-4xl h-[80vh] sm:h-[85vh] md:h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closeVideoModal}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-orange-400 transition-colors z-10"
                        >
                            <X size={32} />
                        </button>
                        <div className="flex-1 w-full h-full rounded-2xl overflow-hidden bg-black">
                            {(() => {
                                const ytId = getYoutubeId(selectedVideoUrl);
                                if (ytId) {
                                    return (
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0`}
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
                <div ref={heroSectionRef} className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden mb-12 md:mb-20 hm-section">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'}`}
                        >
                            <div
                                className="absolute inset-0 z-10"
                                style={{ background: 'linear-gradient(105deg, rgba(5,2,0,0.92) 0%, rgba(5,2,0,0.6) 40%, transparent 70%)' }}
                            />
                            {(() => {

                                const ytId = getYoutubeId(slide.mediaUrl);
                                if (ytId && index === currentSlide) {
                                    return (
                                        <>
                                        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                                            <iframe
                                                id={`hero-yt-iframe-${slide.id}`}
                                                style={{
                                                    position: 'absolute', top: 0, left: 0,
                                                    width: '1280px', height: '720px',
                                                    transform: `scale(${heroVideoScale.scaleX}, ${heroVideoScale.scaleY})`,
                                                    transformOrigin: 'top left',
                                                    border: 'none',
                                                }}
                                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&iv_load_policy=3&showinfo=0&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                                                allow="autoplay"
                                                frameBorder="0"
                                            />
                                        </div>
                                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                            <button
                                                onClick={toggleHeroVideo}
                                                aria-label={heroVideoPlaying ? 'Pause video' : 'Play video'}
                                                className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all hover:scale-110 hover:bg-orange-500/20"
                                                style={{ background: 'rgba(5,2,0,0.45)' }}
                                            >
                                                {heroVideoPlaying
                                                    ? <Pause size={30} className="text-white" fill="white" />
                                                    : <Play size={30} className="text-white ml-1" fill="white" />}
                                            </button>
                                        </div>
                                        </>
                                    );
                                }
                                return (
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                         fetchPriority="high"
                                         loading="eager"
                                   className=" w-full h-full object-fill"
                                    />
                                );
                            })()}


                            {/* <div className="absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-10 md:px-14 lg:px-20 pb-10 md:pb-14 pointer-events-none"> */}
                            <div className="absolute inset-0 z-20 flex flex-col justify-end px-14 sm:px-16 md:px-14 lg:px-20 pb-10 md:pb-14 pointer-events-none">
                                
                                <span
                                    className="inline-block text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full text-slate-900 w-fit mb-4"
                                    style={{ fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}
                                >
                                    {getCategoryName(slide.category)}
                                </span>
                                <h2
                                    className="text-white font-black mb-3 md:mb-4 max-w-3xl leading-tight line-clamp-3 md:line-clamp-none"
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: 'clamp(1.6rem, 4.5vw, 3.8rem)',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {slide.title}
                                </h2>
                                <p
                                    className="text-slate-300 mb-5 md:mb-7 max-w-2xl line-clamp-2"
                                    style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
                                        fontWeight: 300,
                                    }}
                                >
                                    {slide.excerpt}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                                    <div
                                        className="hidden sm:flex items-center gap-4 text-slate-400"
                                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem' }}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <div
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-900"
                                                style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}
                                            >
                                                {slide.author?.[0]?.toUpperCase()}
                                            </div>
                                            {slide.author}
                                        </span>
                                        <span className="text-slate-600">·</span>
                                        <span className="flex items-center gap-1"><Calendar size={13} /> {slide.date}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/${generateSlug(slide.category)}/${generateSlug(slide.title)}`)}
                                        className="pointer-events-auto group flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-slate-900 text-sm transition-all hover:scale-105 active:scale-95"
                                        style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            background: 'linear-gradient(135deg, #FFCC66, #FF7A18)',
                                            boxShadow: '0 0 30px rgba(255,122,24,0.35)',
                                        }}
                                    >
                                        Read Article
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}


                    <button
                        onClick={() => setCurrentSlide(p => (p - 1 + heroSlides.length) % heroSlides.length)}
                        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-white/10 hover:border-orange-500/30 backdrop-blur-sm transition-all text-white hover:bg-orange-500/10"
                        style={{ background: 'rgba(5,2,0,0.6)' }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => setCurrentSlide(p => (p + 1) % heroSlides.length)}
                        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-white/10 hover:border-orange-500/30 backdrop-blur-sm transition-all text-white hover:bg-orange-500/10"
                        style={{ background: 'rgba(5,2,0,0.6)' }}
                    >
                        <ChevronRight size={18} />
                    </button>

                   



                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className="h-1.5 rounded-full transition-all duration-300"
                                style={{
                                    width: index === currentSlide ? '28px' : '6px',
                                    background: index === currentSlide
                                        ? 'linear-gradient(to right, #FFCC66, #FF7A18)'
                                        : 'rgba(255,255,255,0.25)',
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}


            {!selectedCategory && shortVideos.length > 0 && (
              <div className="px-3 sm:px-4 md:px-6 lg:px-8 mb-14 md:mb-20 hm-section">
                    <div className="flex items-center gap-4 mb-7 px-2 sm:px-4">
                        <div className="w-1 h-7 rounded-full"
                            style={{ background: 'linear-gradient(to bottom, #FFCC66, #161514)' }} />
                        <h2
                            className="font-black text-white"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem, 3vw, 1.9rem)' }}
                        >
                            NNS <em className="italic text-orange-400">Shorts</em>
                        </h2>
                        <div
                            className="h-px flex-1 max-w-xs"
                            style={{ background: 'linear-gradient(to right, rgba(255,122,24,0.35), transparent)' }}
                        />
                    </div>

                    <div className="relative group/scroll">
                        <button
                            onClick={() => scrollVideos('left')}
                            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-white/10 hover:border-orange-500/30 backdrop-blur-sm transition-all text-white opacity-0 group-hover/scroll:opacity-100 shadow-lg"
                            style={{ background: 'rgba(5,2,0,0.85)' }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => scrollVideos('right')}
                            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-white/10 hover:border-orange-500/30 backdrop-blur-sm transition-all text-white opacity-0 group-hover/scroll:opacity-100 shadow-lg"
                            style={{ background: 'rgba(5,2,0,0.85)' }}
                        >
                            <ChevronRight size={18} />
                        </button>

                        <div className="overflow-x-auto scrollbar-hide scroll-smooth" id="short-videos-container">
                            <div className="flex gap-3 sm:gap-4 pb-4 px-2 sm:px-4">
                                {shortVideos.map((video) => {
                                    const ytId        = getYoutubeId(video.videoUrl);
                                    const isInstagram = video.platform === 'instagram';

                                    const getThumbUrl = () => {
                                        if (video.thumbnail) {
                                            if (video.thumbnail.startsWith('http')) return video.thumbnail;
                                           
                                            if (video.thumbnail.startsWith('/uploads')) {
                                                return `${API_BASE_URL}${video.thumbnail}`;
                                            }
                                            return `${API_BASE_URL.replace(/\/api$/, '')}${video.thumbnail}`;
                                        }
                                        if (!isInstagram && ytId)
                                            return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
                                        return 'https://placehold.co/300x533/1e293b/475569?text=Short+Video';
                                    };

                                    return (
                                        <div
                                            key={video.id}
                                            onClick={() => handleVideoClick(video)}
                                            className="flex-shrink-0 w-[140px] xs:w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] group cursor-pointer"
                                        >
                                            <div
                                                className="relative rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/15"
                                                style={{ background: 'rgba(15,15,20,0.8)' }}
                                            >
                                               <div className="relative overflow-hidden bg-slate-900" style={{ paddingTop: '177.78%' }}>
                                                    <img
                                                        src={getThumbUrl()}
                                                        alt={video.title}
                                                        className="  absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            const src = e.target.src;
                                                            if (!isInstagram && ytId) {
                                                                if      (src.includes('maxresdefault')) e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                                                                else if (src.includes('hqdefault'))     e.target.src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
                                                                else if (src.includes('mqdefault'))     e.target.src = `https://img.youtube.com/vi/${ytId}/default.jpg`;
                                                                else { e.target.onerror = null; e.target.src = 'https://placehold.co/300x533/1e293b/475569?text=Short+Video'; }
                                                            } else {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://placehold.co/300x533/1e293b/475569?text=Short+Video';
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                                                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 z-10">
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <div
                                                                className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                                                                style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}
                                                            >
                                                                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                                                </svg>
                                                            </div>
                                                            <h3
                                                                className="text-white font-bold text-xs line-clamp-2"
                                                                style={{ fontFamily: "'Playfair Display', serif" }}
                                                            >
                                                                {video.title}
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div
                                                                className="flex items-center gap-1 text-[10px] text-slate-400"
                                                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                                                            >
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                                                </svg>
                                                                <span>{video.views}</span>
                                                            </div>
                                                            <button
                                                                onClick={e => handleLike(e, video)}
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
                                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
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

                    {shortsHasMore && (
                        <div className="flex justify-center mt-5">
                            <button
                                onClick={() => navigate('/shorts')}
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
                                    <>View All Shorts <ArrowRight size={16} /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div
    className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-16 md:pb-24 w-full"
    style={{ marginTop: '82px' }}
>
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
                            {(topStoriesExpanded
                                ? filteredTopStories
                                : filteredTopStories.slice(0, POSTS_PER_ROW)
                            ).map((post, i) => (
                             
                                <PostCard key={post.id} post={post} index={i} copiedPostId={copiedPostId} onShare={shareOnPlatform} />
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
                                    {(topStoriesExpanded
                                        ? topStories
                                        : topStories.slice(0, POSTS_PER_ROW)
                                    ).map((post, i) => (
                                       
                                        <PostCard key={post.id} post={post} index={i} copiedPostId={copiedPostId} onShare={shareOnPlatform} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayPosts.map(([categoryName, posts]) => (
                            <div key={categoryName} className="mb-16 md:mb-24 hm-section">

<SectionHeading
    total={posts.length}
    onViewAll={() => navigate(`/${generateSlug(categoryName)}`)}
>
    <span className="uppercase">{categoryName}</span>
</SectionHeading>

                                <PostSlider posts={posts} copiedPostId={copiedPostId} onShare={shareOnPlatform} />
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;      