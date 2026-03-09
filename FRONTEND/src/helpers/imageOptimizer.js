const EDGE_FUNCTION_URL = '/api/optimize-image';

export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  const {
    width = 800,
    quality = 80,
  } = options;

  if (!originalUrl) return '';

  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    url: originalUrl,
    w: width.toString(),
    q: quality.toString(),
  });

  return `${baseUrl}${EDGE_FUNCTION_URL}?${params.toString()}`;
};

export const getSrcSet = (originalUrl, widths = [400, 800, 1200]) => {
  if (!originalUrl) return '';

  return widths
    .map(w => `${getOptimizedImageUrl(originalUrl, { width: w })} ${w}w`)
    .join(', ');
};

export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  className,
  loading = 'lazy',
  sizes,
  srcSet 
}) => {
  const optimizedSrc = getOptimizedImageUrl(src, { width: width || 800 });
  const generatedSrcSet = srcSet !== false ? getSrcSet(src) : undefined;

  return (
    <img
      src={optimizedSrc}
      srcSet={generatedSrcSet}
      alt={alt}
      width={width}
      className={className}
      loading={loading}
      sizes={sizes}
    />
  );
};

export default getOptimizedImageUrl;
