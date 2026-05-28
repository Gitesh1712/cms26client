import { useEffect, useRef } from 'react';
import { parseContentBlocks } from '../utils/contentBlocks';

// ── YouTube embed ──
const YouTubeBlock = ({ url }) => {
  const ytId = url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
  if (!ytId) return null;
  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
      <div className="aspect-video w-full">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${ytId}?rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    </div>
  );
};

// ── Twitter/X embed ──
const TweetBlock = ({ url }) => {
  const ref = useRef(null);

  // Extract tweet ID from URL
  const tweetId = url?.match(/status\/(\d+)/)?.[1];

  useEffect(() => {
    if (!tweetId || !ref.current) return;
    ref.current.innerHTML = '';

    const loadTwitter = () => {
      if (window.twttr?.widgets) {
        window.twttr.widgets.createTweet(tweetId, ref.current, {
          theme: 'dark',
          align: 'center',
          dnt: true,
        });
      }
    };

    if (window.twttr) {
      loadTwitter();
    } else {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = loadTwitter;
      document.body.appendChild(script);
    }
  }, [tweetId]);

  if (!tweetId) return (
    <div className="my-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-400 text-sm">
      Invalid Twitter/X URL
    </div>
  );

  return (
    <div className="my-8 flex justify-center">
      <div ref={ref} className="w-full max-w-xl min-h-[100px] flex items-center justify-center">
        <div className="text-slate-500 text-sm animate-pulse">Loading tweet...</div>
      </div>
    </div>
  );
};

// ── Instagram embed ──
const InstagramBlock = ({ url }) => {
  const ref = useRef(null);

  // Normalize URL — must end with /
  const normalizedUrl = url?.endsWith('/') ? url : url + '/';

  useEffect(() => {
    if (!ref.current) return;

    const loadInstagram = () => {
      if (window.instgrm?.Embeds) {
        window.instgrm.Embeds.process();
      }
    };

    if (window.instgrm) {
      loadInstagram();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = loadInstagram;
      document.body.appendChild(script);
    }
  }, [url]);

  return (
    <div className="my-8 flex justify-center" ref={ref}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={normalizedUrl}
        data-instgrm-version="14"
        style={{ maxWidth: '540px', width: '100%', minWidth: '326px' }}
      />
    </div>
  );
};

// ── Facebook embed ──
const FacebookBlock = ({ url }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const loadFacebook = () => {
      if (window.FB) {
        window.FB.XFBML.parse(ref.current);
      }
    };

    if (window.FB) {
      loadFacebook();
    } else {
      // Load Facebook SDK
      window.fbAsyncInit = function () {
        window.FB.init({ xfbml: true, version: 'v18.0' });
        loadFacebook();
      };
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [url]);

  return (
    <div className="my-8 flex justify-center" ref={ref}>
      <div
        className="fb-post"
        data-href={url}
        data-width="500"
        data-show-text="true"
      />
    </div>
  );
};

// ── Image block ──
const ImageBlock = ({ url }) => (
  <div className="my-8 flex justify-center">
    <img
      src={url}
      alt="Article media"
      className="max-w-full rounded-2xl border border-white/5 shadow-xl"
      style={{ maxHeight: '560px', objectFit: 'contain' }}
      onError={(e) => { e.target.src = 'https://placehold.co/600x400/1e293b/475569?text=Image+Not+Found'; }}
    />
  </div>
);

// ── Text block ──
const TextBlock = ({ content, style }) => {
  if (!content?.trim()) return null;
  return (
    <>
      {content.split('\n').map((para, i) =>
        para.trim()
          ? <p key={i} className="mb-5 md:mb-7 last:mb-0 text-slate-300 whitespace-pre-wrap" style={style}>{para}</p>
          : <div key={i} className="h-3" />
      )}
    </>
  );
};

// ── Main Renderer ──
const PostDescriptionRenderer = ({ description, textStyle, compact = false }) => {
  if (!description) return null;

  const blocks = parseContentBlocks(description);
  const wrapClass = compact ? '' : 'mb-14 md:mb-20';

  // Fallback — plain text
  if (!blocks) {
    const plain = typeof description === 'string' ? description : '';
    return (
      <div className={wrapClass}>
        <TextBlock content={plain} style={textStyle} />
      </div>
    );
  }

  // Render blocks
  return (
    <div className={wrapClass}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return <TextBlock key={block.id || i} content={block.content} style={textStyle} />;
          case 'youtube':
            return <YouTubeBlock key={block.id || i} url={block.url} />;
          case 'tweet':
            return <TweetBlock key={block.id || i} url={block.url} />;
          case 'instagram':
            return <InstagramBlock key={block.id || i} url={block.url} />;
          case 'facebook':
            return <FacebookBlock key={block.id || i} url={block.url} />;
          case 'image':
            return <ImageBlock key={block.id || i} url={block.url} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default PostDescriptionRenderer;