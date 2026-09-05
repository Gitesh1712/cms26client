import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import SEO from '../components/SEO';
import PostCard from '../components/PostCard';
import { generateSlug } from '../utils/slugify';
import { mapPost } from '../utils/postHelpers';

const CategoryPage = () => {
    const { category: categorySlug } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [posts, setPosts] = useState([]);
    const [copiedPostId, setCopiedPostId] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchCategoryPosts = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                // Categories are stored with their real display value (e.g. "Noise Check"),
                // while the URL uses a slug (e.g. "noise-check") — resolve slug -> actual value first.
                const catRes = await api.get('/public/categories');
                const categories = catRes?.data || [];
                const matchedCategory = categories.find(
                    (c) => generateSlug(c.name) === categorySlug
                );

                if (!matchedCategory) {
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                setCategoryName(matchedCategory.name);

                const postsData = await api.get(
                    `/allposts?category=${encodeURIComponent(matchedCategory.id)}&limit=100&page=1`
                );

                const sorted = [...postsData].sort((a, b) => {
                    if (a.order !== b.order) return (a.order || 999999) - (b.order || 999999);
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setPosts(sorted.map(mapPost));
            } catch (error) {
                console.error('Failed to fetch category posts:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryPosts();
    }, [categorySlug]);

    const getShareUrl = (post) => {
        const slug = generateSlug(post.category);
        const postSlug = generateSlug(post.title);
        return `${window.location.origin}/${slug}/${postSlug}`;
    };

    const shareOnPlatform = (platform, post, e) => {
        e.stopPropagation();
        const url = getShareUrl(post);
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

    if (loading) {
        return (
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
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-white text-xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Category not found
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-semibold"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <SEO
                title={categoryName}
                description={`Browse all ${categoryName} stories on NoNoiseStories.`}
                type="website"
            />

            <div
                className="mx-auto px-3 sm:px-6 md:px-10 lg:px-20 xl:px-32 2xl:px-48 pb-16 md:pb-24 w-full"
                style={{ marginTop: '82px' }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm font-semibold mb-8 transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="flex items-center gap-4 mb-8 md:mb-10">
                    <div className="w-1 h-8 rounded-full"
                        style={{ background: 'linear-gradient(to bottom, #FFCC66, #FF7A18)' }} />
                    <div>
                        <h1
                            className="font-black text-white leading-none uppercase"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                        >
                            {categoryName}
                        </h1>
                        <p className="text-slate-600 text-xs tracking-widest uppercase mt-1"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {posts.length} {posts.length === 1 ? 'story' : 'stories'}
                        </p>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            No stories in this category yet.
                        </p>
                    </div>
                ) : (
                    <div
                        className="grid gap-5 md:gap-7"
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                    >
                        {posts.map((post, i) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                index={i}
                                copiedPostId={copiedPostId}
                                onShare={shareOnPlatform}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
