/**
 * Generate a URL-friendly slug from a string
 * @param {string} text 
 * @returns {string} 
 */
export const generateSlug = (text) => {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') 
        .replace(/[\s_-]+/g, '-')  
        .replace(/^-+|-+$/g, '');  
};

/**
 * Parse a slug back to readable format (optional utility)
 * @param {string} slug 
 * @returns {string} 
 */
export const parseSlug = (slug) => {
    if (!slug) return '';
    
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
