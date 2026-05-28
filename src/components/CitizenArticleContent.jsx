import { useState } from 'react';
import { Copy, Check, Link2, ExternalLink } from 'lucide-react';
import { parseContentBlocks, extractMediaUrls } from '../utils/contentBlocks';

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

function CopyUrlButton({ url, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
      } ${className}`}
      title="Copy URL"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function MediaUrlRow({ item }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-900/60 rounded-lg border border-white/5">
      <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 shrink-0 w-24">
        {item.label}
      </span>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-slate-300 text-xs break-all hover:text-orange-400 transition-colors min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {item.url}
      </a>
      <div className="flex items-center gap-2 shrink-0">
        <CopyUrlButton url={item.url} />
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
          title="Open in new tab"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

function MediaLinksPanel({ urls }) {
  const [allCopied, setAllCopied] = useState(false);

  if (!urls.length) return null;

  const copyAll = async (e) => {
    e.stopPropagation();
    const text = urls.map((u) => `${u.label}: ${u.url}`).join('\n');
    const ok = await copyToClipboard(text);
    if (ok) {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    }
  };

  return (
    <div className="mb-4 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Link2 size={16} className="text-orange-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Media links — copy for post review
          </span>
        </div>
        <button
          type="button"
          onClick={copyAll}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            allCopied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {allCopied ? <Check size={14} /> : <Copy size={14} />}
          {allCopied ? 'All copied' : 'Copy all links'}
        </button>
      </div>
      <div className="space-y-2">
        {urls.map((item) => (
          <MediaUrlRow key={item.url} item={item} />
        ))}
      </div>
    </div>
  );
}

const YouTubeEmbed = ({ url }) => {
  const ytId = url?.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )?.[1];
  if (!ytId) return null;
  return (
    <div className="my-2 rounded-xl overflow-hidden border border-white/10">
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

function MediaBlockPreview({ block }) {
  const url = block.url;
  if (!url) return null;

  if (block.type === 'youtube') {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
        <YouTubeEmbed url={url} />
      </div>
    );
  }
  if (block.type === 'image') {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
        <img src={url} alt="Submission media" className="max-w-full rounded-lg border border-white/10 max-h-80 object-contain" />
      </div>
    );
  }
  return null;
}

/**
 * Renders citizen journalist content with copyable media URLs for editorial review.
 */
export default function CitizenArticleContent({
  value,
  textClassName = 'text-slate-200 text-sm leading-relaxed',
  showMediaLinks = true,
}) {
  const mediaUrls = showMediaLinks ? extractMediaUrls(value) : [];
  const blocks = parseContentBlocks(value);

  if (!blocks?.length) {
    const fallback = typeof value === 'string' ? value : '';
    return (
      <div>
        {mediaUrls.length > 0 && <MediaLinksPanel urls={mediaUrls} />}
        {!fallback.trim() ? (
          <p className="text-slate-500 text-sm italic">No content</p>
        ) : (
          <p className={`${textClassName} whitespace-pre-wrap`}>{fallback}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {mediaUrls.length > 0 && <MediaLinksPanel urls={mediaUrls} />}
      <div className="space-y-3">
        {blocks.map((block, i) => {
          if (block.type === 'text' && block.content?.trim()) {
            return (
              <p key={block.id || i} className={`${textClassName} whitespace-pre-wrap`}>
                {block.content}
              </p>
            );
          }
          if (block.url && block.type !== 'text') {
            return <MediaBlockPreview key={block.id || i} block={block} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}
