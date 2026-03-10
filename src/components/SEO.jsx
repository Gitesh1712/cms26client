import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
 image, 
  url, 
  type = 'website',
  siteName = 'NoNoiseStories'
}) => {
  // Default values
  const defaultTitle = 'NoNoiseStories | Top Stories, NNS Shorts, Travel & Culture';
  const defaultDescription = 'Discover authentic stories, trending news, travel guides, and cultural insights. NoNoiseStories brings you quality content that matters.';
  const defaultImage = '/logo.png';
  const canonicalUrl= url || window.location.href;

 return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content="stories, news, travel, culture, blog, articles, trending, top stories" />
      <meta name="author" content="NoNoiseStories" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title ? `${title} | ${siteName}` : defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image?.startsWith('http') ? image : `${window.location.origin}${image || defaultImage}`} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title ? `${title} | ${siteName}` : defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image?.startsWith('http') ? image : `${window.location.origin}${image || defaultImage}`} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="1 days" />
      <meta name="rating" content="general" />
    </Helmet>
  );
};

export default SEO;
