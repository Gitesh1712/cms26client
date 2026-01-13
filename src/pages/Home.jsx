import { useState, useEffect } from 'react';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ---------------- helpers ----------------
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
};

const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};
// -----------------------------------------

const Home = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [categories, setCategories] = useState([]);
    const [heroSlides, setHeroSlides] = useState([]);
    const [groupedPosts, setGroupedPosts] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ---------------- Hero autoplay ---------------- */
    useEffect(() => {
        // const timer = setInterval(() => {
        //     if (heroSlides.length) {
        //         setCurrentSlide((p) => (p + 1) % heroSlides.length);
        //     }
        // }, 10000);
        // return () => clearInterval(timer);
    }, [heroSlides.length]);

    /* ---------------- Data fetch ---------------- */
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            setLoading(true);
            try {
                const catRes = await api.get('/public/categories');
                const categoriesData = catRes?.data || [];
                setCategories(categoriesData);

                const postsData = await api.get('/allposts');

                /* Hero posts */
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

                /* Grouped posts */
                const grouped = {};
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

                setGroupedPosts(grouped);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                Loading content...
            </div>
        );
    }

    const filteredGroupedPosts = selectedCategory
        ? Object.entries(groupedPosts).filter(([n]) => n === selectedCategory)
        : Object.entries(groupedPosts);

    return (
        <div className="flex flex-col">

            {/* ================= HERO SECTION ================= */}
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

                    {/* Controls */}
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

                    {/* Slider Indicators */}
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

            {/* ================= POSTS ================= */}
            <div className="mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-12 md:pb-20 w-full">
                {filteredGroupedPosts.map(([categoryName, posts]) => (
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
                                            {youtubeId ? (
                                                <>
                                                    <img
                                                        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <iframe
                                                        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition"
                                                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}`}
                                                        allow="autoplay"
                                                    />
                                                </>
                                            ) : (
                                                <img
                                                    src={post.image}
                                                    className="w-full h-full object-cover"
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

                                            <div className="flex justify-between text-sm text-slate-500">
                                                <span className="flex items-center gap-2">
                                                    <User size={14} /> {post.author}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Calendar size={14} /> {post.date}
                                                </span>
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
