import { useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getResolvedImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
};

export const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

export const renderTextBlockContent = (content) => {
    if (!content) return '';
    const extractFromNode = (node) => {
        if (!node) return '';
        if (node.type === 'text') return node.text || '';
        if (node.children) return node.children.map(extractFromNode).join(' ');
        return '';
    };
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        if (parsed?.root) {
            return extractFromNode(parsed.root).replace(/\s+/g, ' ').trim();
        }
        return typeof content === 'string' ? content : '';
    } catch {
        return typeof content === 'string' ? content : '';
    }
};

export const TextBlock = ({ content }) => (
    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
        {renderTextBlockContent(content)}
    </p>
);

export const YouTubePreviewEmbed = ({ url }) => {
    const ytId = getYoutubeId(url);
    if (!ytId) return null;
    return (
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${ytId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export const LocalVideoPreviewEmbed = ({ url, poster }) => (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
        <video src={url} className="w-full h-full " controls poster={poster || undefined} preload="metadata" />
    </div>
);

export const ImagePreviewEmbed = ({ url, alt }) => (
    <div className="rounded-xl overflow-hidden">
        <img
            src={url}
            alt={alt || 'Image'}
            className="w-full h-auto "
            style={{ maxHeight: '420px' }}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1e293b/475569?text=Image+Not+Found'; }}
        />
    </div>
);

export const TweetPreviewEmbed = ({ url }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        const load = () => { if (window.twttr?.widgets) window.twttr.widgets.load(ref.current); };
        if (window.twttr?.widgets) {
            load();
        } else if (!document.getElementById('twitter-widget-script')) {
            const s = document.createElement('script');
            s.id = 'twitter-widget-script';
            s.src = 'https://platform.twitter.com/widgets.js';
            s.async = true;
            s.onload = load;
            document.body.appendChild(s);
        } else {
            const wait = setInterval(() => { if (window.twttr?.widgets) { clearInterval(wait); load(); } }, 100);
            return () => clearInterval(wait);
        }
    }, [url]);
    return (
        <div ref={ref} className="flex justify-center">
            <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true" data-align="center">
                <a href={url.replace('x.com', 'twitter.com')}>Loading tweet...</a>
            </blockquote>
        </div>
    );
};

export const FacebookPreviewEmbed = ({ url }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        const load = () => { if (window.FB) window.FB.XFBML.parse(ref.current); };
        if (window.FB) {
            load();
        } else {
            window.fbAsyncInit = () => { window.FB.init({ xfbml: true, version: 'v18.0' }); load(); };
            if (!document.getElementById('facebook-jssdk')) {
                const s = document.createElement('script');
                s.id = 'facebook-jssdk';
                s.src = 'https://connect.facebook.net/en_US/sdk.js';
                s.async = true;
                s.defer = true;
                document.body.appendChild(s);
            }
        }
    }, [url]);
    return (
        <div ref={ref} className="flex justify-center">
            <div className="fb-post" data-href={url} data-width="500" data-show-text="true" />
        </div>
    );
};

export const InstagramPreviewEmbed = ({ url }) => {
    const ref = useRef(null);
    const normalizedUrl = url?.endsWith('/') ? url : url + '/';
    useEffect(() => {
        if (!ref.current) return;
        const load = () => { if (window.instgrm?.Embeds) window.instgrm.Embeds.process(); };
        if (window.instgrm) {
            load();
        } else if (!document.getElementById('instagram-embed-script')) {
            const s = document.createElement('script');
            s.id = 'instagram-embed-script';
            s.src = 'https://www.instagram.com/embed.js';
            s.async = true;
            s.onload = load;
            document.body.appendChild(s);
        }
    }, [url]);
    return (
        <div ref={ref} className="flex justify-center">
            <blockquote
                className="instagram-media"
                data-instgrm-permalink={normalizedUrl}
                data-instgrm-version="14"
                style={{ maxWidth: '500px', width: '100%', minWidth: '300px' }}
            />
        </div>
    );
};

export const parsePreviewBlocks = (description) => {
    if (!description) return [];
    try {
        const parsed = JSON.parse(description);
        if (Array.isArray(parsed)) {
            return parsed
                .filter(block => !(block.url && block.url.startsWith('blob:')))
                .map(block => {
                    if (block.type === 'uploadedPhoto' || block.type === 'uploadedVideo') {
                        return {
                            type: block.type === 'uploadedVideo' ? 'video' : 'image',
                            url: getResolvedImageUrl(block.url),
                            id: block.id,
                        };
                    }
                    return block;
                });
        }
        return [];
    } catch {
        return [{ type: 'text', content: description }];
    }
};

export const buildUnifiedContent = (post) => {
    const contentBlocks = parsePreviewBlocks(post.description);

    const mediaUrl = post.media?.[0]?.url ? getResolvedImageUrl(post.media[0].url) : '';
    const thumbnailUrl = post.thumbnail ? getResolvedImageUrl(post.thumbnail) : '';
    const youtubeId = getYoutubeId(mediaUrl);
    const isVideo = mediaUrl
        ? (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ||
           mediaUrl.includes('vimeo.com') || !!mediaUrl.match(/\.(mp4|webm|ogg|mov|avi|wmv)$/i))
        : false;
    const isLocalVideo = isVideo && !youtubeId && !!mediaUrl.match(/\.(mp4|webm|mov|mkv|avi|wmv)$/i);

    const mediaAlreadyInBlocks = mediaUrl && contentBlocks.some(b => {
        if (!b.url) return false;
        if (b.url === mediaUrl) return true;
        if (youtubeId) {
            const bYtId = getYoutubeId(b.url);
            if (bYtId && bYtId === youtubeId) return true;
        }
        return false;
    });

    let mediaBlock = null;
    if (mediaUrl && !mediaAlreadyInBlocks) {
        if (isVideo && youtubeId) mediaBlock = { type: 'youtube', url: mediaUrl };
        else if (isLocalVideo) mediaBlock = { type: 'video', url: mediaUrl, poster: thumbnailUrl };
        else mediaBlock = { type: 'image', url: thumbnailUrl || mediaUrl };
    }

    if (mediaBlock) {
        return [...contentBlocks.slice(0, 1), mediaBlock, ...contentBlocks.slice(1)];
    }
    return contentBlocks;
};

export const KNOWN_TYPES = ['text', 'youtube', 'video', 'image', 'tweet', 'facebook', 'instagram'];

export const resolveBlockType = (block) => {
    if (!block) return null;
    if (KNOWN_TYPES.includes(block.type)) return block.type;

    const url = (block.url || '').toLowerCase();
    if (!url) return block.type || null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('twitter.com') || url.includes('x.com/')) return 'tweet';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
    if (url.match(/\.(mp4|webm|ogg|mov|avi|wmv|mkv)(\?|$)/)) return 'video';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/)) return 'image';

    return block.type || 'unknown';
};