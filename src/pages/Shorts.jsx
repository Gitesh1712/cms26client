import { useState, useEffect } from 'react';
import { ArrowLeft, X, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SEO from '../components/SEO';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getYoutubeId = (url) => {
    if (!url) return null;
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&\/\s]{11})/);
    if (shortsMatch) return shortsMatch[1];
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000)    return (views / 1000).toFixed(0) + 'K';
    return String(views);
};

const hasViewedRecently = (shortId) => {
    try {
        const val = localStorage.getItem(`viewed_short_${shortId}`);
        if (!val) return false;
        return Date.now() - parseInt(val) < 30 * 60 * 1000;
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


const isLocalUpload = (url) => !!url && url.startsWith('/uploads/');


const getFullMediaUrl = (url) => {
    if (!url) return url;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL.replace(/\/api$/, '')}${url}`;
};

const Shorts = () => {
    const navigate = useNavigate();
    const [shortVideos, setShortVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
    const [selectedVideoPlatform, setSelectedVideoPlatform] = useState(null);

    const fetchAllShorts = async () => {
        try {
            setLoading(true);
            let page = 1;
            let allShorts = [];
            let hasMore = true;

            while (hasMore && page <= 10) {
                const response = await api.get(`/public/shorts?limit=10&page=${page}`);
                if (response?.shorts) {
                    const mapped = response.shorts.map(short => ({
                        id: short._id,
                        videoUrl: short.videoUrl,
                        title: short.title,
                        views: formatViews(short.views || 0),
                        rawViews: short.views || 0,
                        likes: short.likes || 0,
                        liked: hasLiked(short._id),
                        thumbnail: short.thumbnail,
                        platform: short.platform || 'youtube'
                    }));
                    allShorts = [...allShorts, ...mapped];
                    hasMore = page < (response.pagination?.pages || 1);      
                    page++;
                } else {
                    hasMore = false;
                }
            }
            setShortVideos(allShorts);
        } catch (error) {
            console.error('Failed to fetch shorts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAllShorts();
    }, []);

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
        setSelectedVideoPlatform(video.platform);
        setVideoModalOpen(true);
    };

    const closeVideoModal = () => {
        setVideoModalOpen(false);
        setSelectedVideoUrl(null);
        setSelectedVideoPlatform(null);
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

    const isInstagramUrl = (url) =>
        url && (url.includes('instagram.com') || selectedVideoPlatform === 'instagram');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
                    <p className="text-slate-500 text-sm tracking-widest uppercase">Loading shorts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050200]">
            <SEO
                title="NNS Shorts - All Short Videos"
                description="Watch all NNS Shorts - trending short videos, viral content, and quick entertainment."
                type="website"
            />

      
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

                            
                                if (isLocalUpload(selectedVideoUrl)) {
                                    return (
                                        <video
                                            className="w-full h-full object-contain bg-black"
                                            src={getFullMediaUrl(selectedVideoUrl)}
                                            controls
                                            autoPlay
                                            playsInline
                                        />
                                    );
                                }

                              
                                if (isInstagramUrl(selectedVideoUrl)) {
                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
                                          
                                            <div
                                                className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                                                style={{
                                                    background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
                                                }}
                                            >
                                                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                                    <circle cx="12" cy="12" r="4" />
                                                    <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
                                                </svg>
                                            </div>

                                            <p className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                Instagram Reel
                                            </p>
                                            <p className="text-sm text-slate-400 text-center mb-8 max-w-xs leading-relaxed">
                                                Instagram videos can't be played here directly. Tap below to open it on Instagram.
                                            </p>

                                            <button
                                                onClick={() => window.open(selectedVideoUrl, '_blank', 'noopener,noreferrer')}
                                                className="w-full max-w-xs px-6 py-3 text-white rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95 mb-3"
                                                style={{
                                                    background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
                                                }}
                                            >
                                                Open on Instagram ↗
                                            </button>

                                            <button
                                                onClick={closeVideoModal}
                                                className="w-full max-w-xs px-6 py-3 border border-white/10 text-slate-400 rounded-full text-sm transition-all hover:border-white/20 hover:text-slate-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    );
                                }

                             
                                return (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
                                        <Play size={48} className="mb-4 text-orange-500" />
                                        <p className="text-lg mb-2">Video Platform Not Supported</p>
                                        <p className="text-sm text-slate-400 text-center mb-4">
                                            This video can only be viewed on its original platform.
                                        </p>
                                        <button
                                            onClick={() => window.open(selectedVideoUrl, '_blank', 'noopener,noreferrer')}
                                            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition-all"
                                        >
                                            Open in New Tab
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-slate-400 text-sm">
                                Click anywhere outside or press X to close
                            </p>
                        </div>
                    </div>
                </div>
            )}

          
            <div className="sticky top-0 z-40 bg-[#050200]/95 backdrop-blur-md border-b border-white/5">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-full border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/10 transition-all text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #FFCC66, #FF7A18)" }} />
                            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                NNS <em className="italic text-orange-400">Shorts</em>
                            </h1>
                        </div>
                        <div className="ml-auto text-slate-400 text-sm">
                            {shortVideos.length} videos
                        </div>
                    </div>
                </div>
            </div>

         
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
                {shortVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Play size={64} className="text-slate-700 mb-4" />
                        <p className="text-slate-400 text-lg">No shorts available</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                        {shortVideos.map((video) => {
                            const youtubeId = getYoutubeId(video.videoUrl);
                            const isInstagram = video.platform === "instagram" || video.videoUrl.includes('instagram.com');

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
                                    className="group cursor-pointer"
                                >
                                    <div
                                        className="relative rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/15"
                                        style={{ background: "rgba(15,15,20,0.8)" }}
                                    >
                                        <div className="relative aspect-[9/16] overflow-hidden bg-slate-900">
                                            <img
                                                src={getThumbUrl()}
                                                alt={video.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    const src = e.target.src;
                                                    if (!isInstagram && youtubeId) {
                                                        if (src.includes("maxresdefault")) e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                                                        else if (src.includes("hqdefault")) e.target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                                                        else if (src.includes("mqdefault")) e.target.src = `https://img.youtube.com/vi/${youtubeId}/default.jpg`;
                                                        else { e.target.onerror = null; e.target.src = "https://placehold.co/300x533/1e293b/475569?text=Short+Video"; }
                                                    } else {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://placehold.co/300x533/1e293b/475569?text=Short+Video";
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                                         
                                            {isInstagram && (
                                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                                                    style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                                        <circle cx="12" cy="12" r="4" />
                                                        <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
                                                    </svg>
                                                </div>
                                            )}

                                            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 z-10">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                                                        style={{ background: "linear-gradient(135deg, #FFCC66, #FF7A18)" }}
                                                    >
                                                        <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
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
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{video.views}</span>
                                                    </div>

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
                )}
            </div>
        </div>
    );
};

export default Shorts;