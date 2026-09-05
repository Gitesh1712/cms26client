import { useRef, useEffect, useState } from 'react';
import PostCard from './PostCard';

const STEP_PX = 320;              // roughly one card + gap
const AUTO_SLIDE_INTERVAL_MS = 3000;

// Horizontal auto-sliding row of PostCards.
// Auto-advances every few seconds; pauses while the cursor is over any card
// and resumes automatically once the cursor leaves. Manual scroll/drag still works.
const PostSlider = ({ posts, copiedPostId, onShare }) => {
    const containerRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused || !posts || posts.length <= 1) return;

        const interval = setInterval(() => {
            const el = containerRef.current;
            if (!el) return;

            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
            if (atEnd) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: STEP_PX, behavior: 'smooth' });
            }
        }, AUTO_SLIDE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isPaused, posts]);

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-5 md:gap-7 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        >
            {posts.map((post, i) => (
                <div key={post.id} className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-[320px]">
                    <PostCard post={post} index={i} copiedPostId={copiedPostId} onShare={onShare} />
                </div>
            ))}
        </div>
    );
};

export default PostSlider;
