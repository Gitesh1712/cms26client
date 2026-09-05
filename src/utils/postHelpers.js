// Shared helpers for mapping/rendering post data.
// Extracted from Home.jsx so Home.jsx and CategoryPage.jsx (and any future page)
// can reuse the exact same logic instead of duplicating it.

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const POSTS_PER_ROW = 3;

export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    if (url.startsWith('/uploads')) {
        return `${API_BASE_URL}${url}`;
    }

    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${url}`;
};

export const getYoutubeId = (url) => {
    if (!url) return null;
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&\/\s]{11})/);
    if (shortsMatch) return shortsMatch[1];
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

export const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv'];
    const lowerUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowerUrl.includes(`.${ext}`))) return true;
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com')) return true;
    return false;
};

export const isSocialEmbed = (url) => {
    if (!url) return false;
    return (
        url.includes('twitter.com') || url.includes('x.com') ||
        url.includes('instagram.com') ||
        url.includes('facebook.com') || url.includes('fb.com') ||
        isVideoUrl(url)
    );
};

export const isTopStoriesCategory = (cat) => {
    const name = String(cat.name || '').toLowerCase().replace(/[\s-_]/g, '');
    const id   = String(cat.id   || '').toLowerCase().replace(/[\s-_]/g, '');
    return name === 'topstories' || id === 'topstories' || name === 'top-stories' || id === 'top-stories';
};

export const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000)    return (views / 1000).toFixed(0) + 'K';
    return String(views);
};

export const getFirstEmbedFromDescription = (description) => {
    if (!description) return null;
    try {
        const blocks = JSON.parse(description);
        if (Array.isArray(blocks)) {
            const embedBlock = blocks.find(b =>
                ['youtube', 'tweet', 'instagram', 'facebook'].includes(b.type) && b.url
            );
            return embedBlock || null;
        }
    } catch {}
    return null;
};

export const getSocialThumbnail = (url) => {
    if (!url) return null;
    const ytId = getYoutubeId(url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return null;
};

export const extractTextFromLexical = (content) => {
    if (!content) return '';

    if (typeof content === 'string') return content;

    try {
        const root = content.root || content;
        let text = '';

        const walk = (node) => {
            if (!node) return;
            if (node.type === 'text' && node.text) {
                text += node.text;
            }
            if (node.type === 'linebreak') {
                text += ' ';
            }
            if (Array.isArray(node.children)) {
                node.children.forEach(walk);
            }
        };

        if (Array.isArray(root.children)) {
            root.children.forEach(walk);
        }

        return text.trim();
    } catch {
        return '';
    }
};

export const resolvePostThumbnail = (p) => {
    const mediaItem = p.media?.[0];
    const mediaUrl = mediaItem?.url ? getImageUrl(mediaItem.url) : null;
    const mediaType = mediaItem?.mediaType;
    const videoThumbnail = mediaItem?.thumbnail ? getImageUrl(mediaItem.thumbnail) : null;

    const customThumb = p.thumbnail && p.thumbnail.trim()
        ? getImageUrl(p.thumbnail)
        : null;

    const isYouTubeUrl = mediaUrl && (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be'));
    const isImageFileUrl = mediaUrl && /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(mediaUrl);
    const isCommonImageHost = mediaUrl && (
        mediaUrl.includes('unsplash.com') ||
        mediaUrl.includes('images.unsplash.com') ||
        mediaUrl.includes('imgur.com') ||
        mediaUrl.includes('i.imgur.com') ||
        mediaUrl.includes('cloudinary.com') ||
        mediaUrl.includes('images.pexels.com') ||
        mediaUrl.includes('pixabay.com')
    );
    const isMediaImage = mediaType === 'image' || isImageFileUrl || isCommonImageHost;

    let thumbnail = null;
    let hasImage = false;

    if (customThumb) {
        thumbnail = customThumb;
        hasImage = true;
    } else if (isMediaImage && mediaUrl) {
        thumbnail = mediaUrl;
        hasImage = true;
    }

    if (!thumbnail && p.description) {
        try {
            const blocks = JSON.parse(p.description);
            if (Array.isArray(blocks)) {
                const photoBlock = blocks.find(b => b.type === 'uploadedPhoto' && b.url);
                if (photoBlock?.url) {
                    thumbnail = photoBlock.url.startsWith('http')
                        ? photoBlock.url
                        : `${API_BASE_URL}${photoBlock.url}`;
                    hasImage = true;
                }
            }
        } catch (e) {
            console.error('Failed to parse description for thumbnail:', e);
        }
    }

    if (!thumbnail) {
        if (videoThumbnail) {
            thumbnail = videoThumbnail;
        } else if (isYouTubeUrl) {
            const ytId = getYoutubeId(mediaUrl);
            thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
        } else if (mediaUrl) {
            thumbnail = mediaUrl;
        } else if (p.description) {
            try {
                const blocks = JSON.parse(p.description);
                if (Array.isArray(blocks)) {
                    const embedBlock = blocks.find(b =>
                        ['youtube', 'tweet', 'instagram', 'facebook'].includes(b.type) && b.url
                    );
                    const videoBlock = blocks.find(b => b.type === 'uploadedVideo' && b.url);

                    if (embedBlock?.type === 'youtube') {
                        const ytId = getYoutubeId(embedBlock.url);
                        thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
                    } else if (videoBlock) {
                        thumbnail = videoBlock.url.startsWith('http')
                            ? videoBlock.url
                            : `${API_BASE_URL}${videoBlock.url}`;
                    }
                }
            } catch (e) {}
        }
    }

    return { thumbnail, hasImage };
};

// Normalizes a raw post object from the API into the shape PostCard expects.
export const mapPost = (p) => {
    const mediaItem = p.media?.[0];
    const mediaUrl = mediaItem?.url ? getImageUrl(mediaItem.url) : null;
    const mediaType = mediaItem?.mediaType;
    const videoThumbnail = mediaItem?.thumbnail ? getImageUrl(mediaItem.thumbnail) : null;

    const embedBlock    = getFirstEmbedFromDescription(p.description);
    const embedUrl      = !mediaUrl ? (embedBlock?.url || null) : null;
    const embedType     = embedBlock?.type || null;

    const finalMediaUrl = mediaUrl || embedUrl;

    const isYouTubeUrl = finalMediaUrl && (
        finalMediaUrl.includes('youtube.com') ||
        finalMediaUrl.includes('youtu.be')
    );

    const isVideoFileUrl = finalMediaUrl && /\.(mp4|webm|mov|mkv|avi|wmv)$/i.test(finalMediaUrl);
    const isImageFileUrl = finalMediaUrl && /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(finalMediaUrl);

    const isCommonImageHost = finalMediaUrl && (
        finalMediaUrl.includes('unsplash.com') ||
        finalMediaUrl.includes('images.unsplash.com') ||
        finalMediaUrl.includes('imgur.com') ||
        finalMediaUrl.includes('i.imgur.com') ||
        finalMediaUrl.includes('cloudinary.com') ||
        finalMediaUrl.includes('images.pexels.com') ||
        finalMediaUrl.includes('pixabay.com')
    );

    const actuallyIsVideo = mediaType === 'video' && (isVideoFileUrl || isYouTubeUrl);
    const actuallyIsImage = mediaType === 'image' || isImageFileUrl || isCommonImageHost;

    const detectedIsVideo = !mediaType && (isVideoFileUrl || isYouTubeUrl);
    const detectedIsImage = !mediaType && (isImageFileUrl || isCommonImageHost);

    const finalIsVideo = actuallyIsVideo || detectedIsVideo;
    const finalIsImage = actuallyIsImage || detectedIsImage;

    const { thumbnail, hasImage } = resolvePostThumbnail(p);

    const finalIsVideoForCard = hasImage ? false : finalIsVideo;
    const finalIsImageForCard = hasImage ? true : finalIsImage;
    const finalIsYouTubeForCard = hasImage ? false : isYouTubeUrl;

    return {
        id:        p._id,
        title:     p.title,
        excerpt:   p.description,
        image:     thumbnail,
        mediaUrl:  finalMediaUrl,
        embedType: hasImage ? null : embedType,
        isVideo:   finalIsVideoForCard && !finalIsImageForCard,
        isImage:   finalIsImageForCard,
        isYouTube: finalIsYouTubeForCard,
        hasVideoThumbnail: !!videoThumbnail,
        postType:  p.postType,
        category:  p.category,
        author:    p.author,
        date:      new Date(p.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }),
    };
};
