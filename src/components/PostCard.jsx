import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Image, Check, Copy } from 'lucide-react';
import { generateSlug } from '../utils/slugify';
import { getYoutubeId } from '../utils/postHelpers';

// Only used here, so it stays local instead of living in the pure-JS postHelpers file.
const getPlatformOverlay = (mediaUrl, embedType) => {
    const url  = mediaUrl || '';
    const type = embedType;

    if (type === 'tweet' || url.includes('twitter.com') || url.includes('x.com')) {
        return {
            bg: 'rgba(0,0,0,0.93)',
            accentColor: '#1d9bf0',
            logo: (
                <svg className="w-20 h-20 opacity-10" fill="white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            ),
            badge: (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: '#000', border: '1.5px solid #1d9bf0' }}>
                    <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                </div>
            ),
        };
    }

    if (type === 'instagram' || url.includes('instagram.com')) {
        return {
            bg: 'linear-gradient(135deg, rgba(131,58,180,0.95) 0%, rgba(253,29,29,0.95) 50%, rgba(252,176,69,0.95) 100%)',
            accentColor: '#e1306c',
            logo: (
                <svg className="w-20 h-20 opacity-10" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
            ),
            badge: (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                    <svg className="w-3.5 h-3.5" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                </div>
            ),
        };
    }

    if (type === 'facebook' || url.includes('facebook.com') || url.includes('fb.com')) {
        return {
            bg: 'linear-gradient(135deg, rgba(24,119,242,0.95) 0%, rgba(13,71,161,0.95) 100%)',
            accentColor: '#1877f2',
            logo: (
                <svg className="w-20 h-20 opacity-10" fill="white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
            badge: (
                <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: '#1877f2' }}>
                    <svg className="w-3.5 h-3.5" fill="white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                </div>
            ),
        };
    }

    return null;
};

const PostCard = ({ post, index = 0, copiedPostId, onShare }) => {
    const navigate = useNavigate();
    const [shareHovered, setShareHovered] = useState(false);
    const [thumbError, setThumbError] = useState(false);
    const youtubeId       = getYoutubeId(post.mediaUrl);
    const isCopied        = copiedPostId === post.id;

    const thumbSrc = !thumbError
        ? (post.image || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null))
        : null;

    const platformOverlay = !thumbSrc
        ? getPlatformOverlay(post.mediaUrl, post.embedType)
        : null;

    const categorySlug = generateSlug(post.category);
    const postSlug     = generateSlug(post.title);

    const socialIcons = [
        {
            key: 'whatsapp', title: 'WhatsApp', bg: '#25D366',
            icon: (
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
            ),
        },
        {
            key: 'twitter', title: 'Twitter / X', bg: '#000000',
            icon: (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            ),
        },
        {
            key: 'facebook', title: 'Facebook', bg: '#1877F2',
            icon: (
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
        },
        {
            key: 'copy',
            title: isCopied ? 'Copied!' : 'Copy Link',
            bg:    isCopied ? '#22c55e' : '#475569',
            icon:  isCopied
                ? <Check className="w-3.5 h-3.5 text-white" />
                : <Copy  className="w-3.5 h-3.5 text-white" />,
        },
    ];

    return (
        <div
            onClick={() => navigate(`/${categorySlug}/${postSlug}`)}
            className="hm-card group  cursor-pointer flex flex-col rounded-2xl overflow-hidden border border-white/8 hover:border-orange-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
            style={{ background: 'rgba(12,10,8,0.9)', animationDelay: `${index * 0.08}s` }}
        >
            <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {thumbSrc ? (
                    post.isYouTube ? (
                        <img
                            src={thumbSrc}
                            className="w-full h-full  group-hover:scale-105 transition-transform duration-500 object-cover"
                            alt={post.title}
                            onError={() => setThumbError(true)}
                        />
                    ) : post.isVideo && !post.isImage ? (
                        <div className="relative w-full h-full ">
                            <video
                                src={post.mediaUrl}
                                className="w-full h-full  "
                                muted
                                preload="metadata"
                                poster={post.hasVideoThumbnail ? thumbSrc : undefined}
                            />
                        </div>
                    ) : (
                        <img
                            src={thumbSrc}
                            className=" w-full h-full  group-hover:scale-105 transition-transform duration-500"
                            alt={post.title}
                            onError={() => setThumbError(true)}
                        />
                    )
                ) : platformOverlay ? (
                    <div
                        className="w-full h-full flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500"
                        style={{ background: platformOverlay.bg }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {platformOverlay.logo}
                        </div>
                        <div className="relative z-10 px-5 text-center">
                            <p
                                className="text-white font-bold text-sm line-clamp-3 leading-snug"
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                                }}
                            >
                                {post.title}
                            </p>
                        </div>
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center bg-slate-800"
                        style={{ background: 'rgba(20,12,4,0.95)' }}
                    >
                        {post.isVideo ? (
                            <Play size={32} className="text-slate-600" />
                        ) : (
                            <Image size={32} className="text-slate-600" />
                        )}
                    </div>
                )}

                {thumbSrc && !post.isVideo && (
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 100%)',
                        }}
                    />
                )}

                <div className="absolute bottom-2.5 left-3 z-10">
                    {platformOverlay
                        ? platformOverlay.badge
                        : (post.isVideo || post.isYouTube) && !post.isImage
                            ? (
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}
                                >
                                    <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                    </svg>
                                </div>
                            )
                            : null}
                </div>

                <div className="absolute bottom-3 right-12 z-20">
                    <span
                        className="text-[10px] text-white font-medium px-2 py-1  rounded-full backdrop-blur-sm inline-block"
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            background: 'rgba(0,0,0,0.6)',
                            lineHeight: '1'
                        }}
                    >
                        {post.date}
                    </span>
                </div>
            </div>

            <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
                <h3
                    className="text-white font-semibold mb-3 line-clamp-2 group-hover:text-orange-100 transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', lineHeight: '1.45', minHeight: '2.62rem' }}
                >
                    {post.title}
                </h3>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-slate-900 text-[9px] font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}
                        >
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
                                maxWidth:    shareHovered ? '160px' : '0px',
                                opacity:     shareHovered ? 1 : 0,
                                marginRight: shareHovered ? '6px' : '0px',
                            }}
                        >
                            {socialIcons.map(({ key, title, bg, icon }) => (
                                <button
                                    key={key}
                                    onClick={e => onShare(key, post, e)}
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

export default PostCard;
