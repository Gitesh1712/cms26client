import { useState, useEffect } from 'react';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    Share2,
    X,
    Mail,
    Copy,
    Check
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
    const regExp =
        /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
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


const getYoutubeThumbnail = (url) => {
    const youtubeId = getYoutubeId(url);
    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;
};


const Home = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [categories, setCategories] = useState([]);
    const [heroSlides, setHeroSlides] = useState([]);
    const [groupedPosts, setGroupedPosts] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [copied, setCopied] = useState(false);

  
    useEffect(() => {
        
    }, [heroSlides.length]);

    
    const fetchData = async (filterCategory = null) => {
        setLoading(true);
        try {
            const catRes = await api.get('/public/categories');
            const categoriesData = catRes?.data || [];
            setCategories(categoriesData);

            const postsData = await api.get('/allposts');

          
            const heroPosts = postsData
                .filter(p => p.heroContent === true)
                .slice(0, 5);

            setHeroSlides(
                heroPosts.map(p => ({
                    id: p._id,
                    title: p.title,
                    excerpt: p.description,
                    image: p.media?.[0]?.url
                        ? getImageUrl(p.media[0].url)
                        : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
                    mediaUrl: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
                    isVideo: p.media?.[0]?.url ? isVideoUrl(p.media[0].url) : false,
                    postType: p.postType,
                    category: p.category,
                    author: p.author,
                    date: new Date(p.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                }))
            );

           
            let filteredPosts = postsData;
            
           
            if (filterCategory) {
                filteredPosts = postsData.filter(
                    p => p.category?.toLowerCase() === filterCategory.toLowerCase()
                );
            }

            const grouped = {};
            
            if (filterCategory) {
             
                const categoryName = categoriesData.find(c => c.id === filterCategory)?.name || filterCategory;
                if (filteredPosts.length > 0) {
                    grouped[categoryName] = filteredPosts.slice(0, 12).map(p => ({
                        id: p._id,
                        title: p.title,
                        excerpt: p.description,
                        image: p.media?.[0]?.url
                            ? getImageUrl(p.media[0].url)
                            : null,
                        mediaUrl: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
                        isVideo: p.media?.[0]?.url ? isVideoUrl(p.media[0].url) : false,
                        postType: p.postType,
                        author: p.author,
                        date: new Date(p.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        }),
                    }));
                }
            } else {
             
                categoriesData.forEach(cat => {
                    const catPosts = postsData.filter(
                        p =>
                            p.category?.toLowerCase() === cat.id?.toLowerCase() ||
                            p.category?.toLowerCase() === cat.name?.toLowerCase()
                    );

                    if (catPosts.length) {
                        grouped[cat.name] = catPosts.slice(0, 3).map(p => ({
                            id: p._id,
                            title: p.title,
                            excerpt: p.description,
                            image: p.media?.[0]?.url
                                ? getImageUrl(p.media[0].url)
                                : null,
                            mediaUrl: p.media?.[0]?.url ? getImageUrl(p.media[0].url) : null,
                            isVideo: p.media?.[0]?.url ? isVideoUrl(p.media[0].url) : false,
                            postType: p.postType,
                            author: p.author,
                            date: new Date(p.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            }),
                        }));
                    }
                });
            }

            setGroupedPosts(grouped);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

  
    useEffect(() => {
        const handleCategoryFilter = (event) => {
            const { category } = event.detail;
            setSelectedCategory(category);
            fetchData(category);
        };

        window.addEventListener('categoryFilterChange', handleCategoryFilter);
        
        return () => {
            window.removeEventListener('categoryFilterChange', handleCategoryFilter);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                Loading content...
            </div>
        );
    }

    const displayPosts = Object.entries(groupedPosts);

    const handleShare = (post, e) => {
        e.stopPropagation();
        setSelectedPost(post);
        setShareModalOpen(true);
        setCopied(false);
    };

    const getShareUrl = (postId) => {
        return `${window.location.origin}/kaivailayam/post/${postId}`;
    };

    const shareVia = (platform) => {
        const url = getShareUrl(selectedPost.id);
        const text = selectedPost.title;

        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
            case 'email':
                window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
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

    return (
        <div className="flex flex-col">
            {shareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => setShareModalOpen(false)}>
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Share Post</h3>
                            <button
                                onClick={() => setShareModalOpen(false)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => shareVia('whatsapp')}
                                className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition border border-white/5"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </div>
                                <span className="text-white font-medium">WhatsApp</span>
                            </button>

                            <button
                                onClick={() => shareVia('email')}
                                className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition border border-white/5"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                    <Mail size={20} className="text-white" />
                                </div>
                                <span className="text-white font-medium">Email</span>
                            </button>

                            <button
                                onClick={() => shareVia('twitter')}
                                className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition border border-white/5"
                            >
                                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </div>
                                <span className="text-white font-medium">Twitter</span>
                            </button>

                            <button
                                onClick={() => shareVia('facebook')}
                                className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition border border-white/5"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </div>
                                <span className="text-white font-medium">Facebook</span>
                            </button>

                            <button
                                onClick={() => shareVia('linkedin')}
                                className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition border border-white/5"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </div>
                                <span className="text-white font-medium">LinkedIn</span>
                            </button>

                            <button
                                onClick={() => shareVia('copy')}
                                className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition border border-white/5 col-span-2"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-white" />}
                                </div>
                                <span className="text-white font-medium">{copied ? 'Link Copied!' : 'Copy Link'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

          
            {heroSlides.length > 0 && (
                <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden rounded-2xl md:rounded-3xl mb-10 md:mb-20 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
                                }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent z-10" />
                            {(() => {
                                const youtubeId = getYoutubeId(slide.image);
                                if (youtubeId && index === currentSlide) {
                                    return (
                                        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                                            <iframe
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[100%] min-h-[100%] h-[120vh] w-[120vw] object-cover scale-[1.35]"
                                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&iv_load_policy=3&showinfo=0&rel=0`}
                                                allow="autoplay"
                                                frameBorder="0"
                                            />
                                        </div>
                                    );
                                }
                                return (
                                    <img
                                        src={slide.image.includes('youtube.com') || slide.image.includes('youtu.be')
                                            ? `https://img.youtube.com/vi/${getYoutubeId(slide.image)}/maxresdefault.jpg`
                                            : slide.image}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                    />
                                );
                            })()}

                            <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-20">
                                <span className="px-3 py-1 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] text-slate-900 font-bold text-xs sm:text-sm rounded-full w-fit mb-3 md:mb-4 capitalize">
                                    {slide.category}
                                </span>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-3 md:mb-6 max-w-3xl leading-tight line-clamp-3 md:line-clamp-none">
                                    {slide.title}
                                </h2>
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 mb-4 md:mb-8 max-w-2xl line-clamp-2">
                                    {slide.excerpt}
                                </p>

                                <div className="hidden sm:flex items-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400 mb-4 md:mb-8">
                                    <span className="flex items-center gap-2">
                                        <User size={16} /> {slide.author}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar size={16} /> {slide.date}
                                    </span>
                                </div>

                                <button
                                    onClick={() => navigate(`/post/${slide.id}`)}
                                    className="group px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold text-sm md:text-base rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,122,24,0.3)] w-fit flex items-center gap-2"
                                >
                                    Read Article
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                                </button>
                            </div>
                        </div>
                    ))}

                  
                    <button
                        onClick={() =>
                            setCurrentSlide((p) =>
                                (p - 1 + heroSlides.length) % heroSlides.length
                            )
                        }
                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-full backdrop-blur-sm transition-all text-white border border-white/5 hover:border-orange-500/30"
                    >
                        <ChevronLeft size={20} className="md:w-6 md:h-6" />
                    </button>
                    <button
                        onClick={() =>
                            setCurrentSlide((p) => (p + 1) % heroSlides.length)
                        }
                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-full backdrop-blur-sm transition-all text-white border border-white/5 hover:border-orange-500/30"
                    >
                        <ChevronRight size={20} className="md:w-6 md:h-6" />
                    </button>

                  
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-[#FF7A18]' : 'w-2 bg-slate-500'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}








          
            <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-12 md:pb-20 w-full">
                {displayPosts.map(([categoryName, posts]) => (
                    <div key={categoryName} className="mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-10 text-orange-400">
                            {categoryName}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {posts.map(post => {
                                const youtubeId =
                                    post.postType === 'video'
                                        ? getYoutubeId(post.image)
                                        : null;

                                return (
                                    <div
                                        key={post.id}
                                        onClick={() => navigate(`/post/${post.id}`)}
                                        className="group rounded-3xl bg-slate-800/20 border border-white/5 overflow-hidden hover:-translate-y-1 transition cursor-pointer"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            {post.isVideo ? (
                                                (() => {
                                                    const youtubeId = getYoutubeId(post.mediaUrl);
                                                    if (youtubeId) {
                                                      
                                                        return (
                                                            <>
                                                                <img
                                                                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                                                    className="w-full h-full object-cover"
                                                                    alt={post.title}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                                                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <iframe
                                                                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition"
                                                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}`}
                                                                    allow="autoplay"
                                                                />
                                                            </>
                                                        );
                                                    } else {
                                                       
                                                        return (
                                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                                                                <div className="text-center">
                                                                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                                        </svg>
                                                                    </div>
                                                                    <p className="text-slate-400 text-sm">Video Content</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                })()
                                            ) : (
                                                <img
                                                    src={post.image}
                                                    className="w-full h-full object-cover"
                                                    alt={post.title}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/600x400/1e293b/475569?text=No+Image';
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-3">
                                                {post.title}
                                            </h3>
                                            <p className="text-slate-400 line-clamp-3 mb-4">
                                                {post.excerpt}
                                            </p>

                                            <div className="flex justify-between items-center text-sm text-slate-500">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-2">
                                                        <User size={14} /> {post.author}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Calendar size={14} /> {post.date}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => handleShare(post, e)}
                                                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors group/share"
                                                    title="Share post"
                                                >
                                                    <Share2 size={16} className="text-slate-400 group-hover/share:text-orange-400 transition-colors" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
