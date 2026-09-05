import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Eye } from 'lucide-react';
import { api } from '../../services/api';
import {
    buildUnifiedContent,
    resolveBlockType,
    TextBlock,
    YouTubePreviewEmbed,
    LocalVideoPreviewEmbed,
    ImagePreviewEmbed,
    TweetPreviewEmbed,
    FacebookPreviewEmbed,
    InstagramPreviewEmbed,
} from '../../components/previewBlocks';

const PreviewPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem('token');
                const [postRes, categoriesRes] = await Promise.all([
                    api.get(`/posts/${id}`, { Authorization: `Bearer ${token}` }),
                    api.get('/public/categories'),
                ]);
                setPost(postRes.data || postRes);
                setCategories(categoriesRes?.data || []);
            } catch (err) {
                console.error('Failed to fetch post:', err);
                setError('Failed to load story.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getCategoryName = (categoryId) => {
        if (!categoryId) return categoryId;
        const found = categories.find(
            c => String(c.id).toLowerCase() === String(categoryId).toLowerCase()
        );
        return found ? found.name : categoryId;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
                <p className="text-slate-400">Loading preview...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="p-6 text-center text-red-400">
                {error || 'Post not found.'}
            </div>
        );
    }

    const unifiedContent = buildUnifiedContent(post);
    const hasStatus = post.status === 1 || post.status === 2 || post.status === 0;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-orange-400 mb-6 text-sm font-medium transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </button>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20 uppercase tracking-wider">
                        {getCategoryName(post.category)}
                    </span>

                    {hasStatus ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-md border ${
                            post.status === 1
                                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                                : post.status === 2
                                    ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                    : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                        }`}>
                            {post.status === 1 ? 'Approved' : post.status === 2 ? 'Rejected' : 'Pending'}
                        </span>
                    ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-md border text-slate-400 bg-slate-500/10 border-slate-500/20">
                            Draft
                        </span>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{post.title}</h2>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
                    <span>By <span className="text-slate-300">{post.author}</span></span>
                    {post.createdAt && (
                        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                    {typeof post.views === 'number' && (
                        <span className="flex items-center gap-1 ml-auto">
                            <Eye size={14} /> {post.views} views
                        </span>
                    )}
                </div>

                <div className="space-y-5">
                    {unifiedContent.length === 0 ? (
                        <p className="text-slate-500 text-sm italic">No content available.</p>
                    ) : (
                        unifiedContent.map((block, index) => {
                            if (!block) return null;
                            const resolvedType = resolveBlockType(block);
                            switch (resolvedType) {
                                case 'text':
                                    return <TextBlock key={index} content={block.content || block.text} />;
                                case 'youtube':
                                    return <YouTubePreviewEmbed key={index} url={block.url} />;
                                case 'video':
                                    return <LocalVideoPreviewEmbed key={index} url={block.url} poster={block.poster} />;
                                case 'image':
                                    return <ImagePreviewEmbed key={index} url={block.url} alt={post.title} />;
                                case 'tweet':
                                    return <TweetPreviewEmbed key={index} url={block.url} />;
                                case 'facebook':
                                    return <FacebookPreviewEmbed key={index} url={block.url} />;
                                case 'instagram':
                                    return <InstagramPreviewEmbed key={index} url={block.url} />;
                                default:
                                    return null;
                            }
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewPost;