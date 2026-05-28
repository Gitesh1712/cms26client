/**
 * Parse LexicalEditor / citizen journalist article blocks.
 * Supports string JSON, arrays, double-encoded strings, and HTML-escaped quotes.
 */
export function parseContentBlocks(description) {
  if (description == null || description === '') return null;

  if (Array.isArray(description)) {
    return isBlockArray(description) ? description : null;
  }

  if (typeof description === 'object') {
    if (Array.isArray(description.blocks)) return description.blocks;
    return null;
  }

  if (typeof description !== 'string') return null;

  let raw = description.trim();
  if (!raw) return null;

  raw = raw
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");

  // HTML entities from some APIs
  if (raw.includes('&quot;') || raw.includes('&#34;')) {
    raw = raw
      .replace(/&quot;/g, '"')
      .replace(/&#34;/g, '"')
      .replace(/&amp;/g, '&');
  }

  const attempts = [raw];
  if (raw.startsWith('"') && raw.endsWith('"')) {
    attempts.push(raw.slice(1, -1).replace(/\\"/g, '"'));
  }
  const bracket = raw.match(/\[[\s\S]*\]/);
  if (bracket) attempts.push(bracket[0]);

  for (const candidate of attempts) {
    try {
      let parsed = JSON.parse(candidate);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (isBlockArray(parsed)) return parsed;
    } catch {
      /* try next */
    }
  }

  return null;
}

function isBlockArray(arr) {
  return (
    Array.isArray(arr) &&
    arr.length > 0 &&
    arr.some((b) => b && typeof b === 'object' && typeof b.type === 'string')
  );
}

export function looksLikeBlockContent(value) {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) return isBlockArray(value);
  if (typeof value === 'object') return Array.isArray(value.blocks);
  if (typeof value === 'string') {
    const t = value.trim();
    return t.startsWith('[{') || t.startsWith('"[{') || parseContentBlocks(t) != null;
  }
  return false;
}

export function getLeadArticleBody(lead) {
  const raw = lead?.storyContent ?? lead?.message ?? lead?.content ?? '';
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.blocks)) return raw.blocks;
    return raw;
  }
  return typeof raw === 'string' ? raw : '';
}

const MEDIA_TYPE_LABELS = {
  youtube: 'YouTube',
  image: 'Image',
  tweet: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  video: 'Video',
  link: 'Link',
};

/** URLs from JSON blocks + plain text (for dashboard copy when creating posts). */
export function extractMediaUrls(value) {
  const items = [];
  const seen = new Set();

  const add = (type, url) => {
    const u = String(url || '').trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    items.push({
      type,
      label: MEDIA_TYPE_LABELS[type] || 'Link',
      url: u,
    });
  };

  const blocks = parseContentBlocks(value);
  if (blocks) {
    blocks.forEach((b) => {
      if (b?.url) add(b.type || 'link', b.url);
    });
  }

  const text = typeof value === 'string' ? value : '';
  if (text) {
    const matches = text.match(/https?:\/\/[^\s<>"']+/gi) || [];
    matches.forEach((raw) => {
      const u = raw.replace(/[.,;:!?)]+$/g, '');
      let type = 'link';
      if (/youtube\.com|youtu\.be/i.test(u)) type = 'youtube';
      else if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i.test(u)) type = 'image';
      else if (/twitter\.com|x\.com/i.test(u)) type = 'tweet';
      else if (/instagram\.com/i.test(u)) type = 'instagram';
      else if (/facebook\.com|fb\.watch/i.test(u)) type = 'facebook';
      else if (/vimeo\.com|\.mp4|\.webm|\.mov/i.test(u)) type = 'video';
      add(type, u);
    });
  }

  return items;
}

/** Match dashboard / API filter to a lead (inquiryType or submissionType). */
export function leadMatchesFilter(lead, filterType) {
  if (!filterType || filterType === 'all') return true;
  const t = String(lead?.inquiryType || lead?.submissionType || '').trim();
  if (filterType === 'Full Article') {
    return t === 'Full Article' || t === 'Story Submission';
  }
  return t === filterType;
}
