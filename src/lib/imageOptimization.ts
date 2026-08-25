/**
 * AstroMatch Mobile Image Optimization Utility
 * Automatically attaches optimal width, quality, and modern format parameters
 * for remote CDNs (Unsplash, Firebase, etc.) to minimize network payload on mobile devices.
 */

export interface ImageOptimizationOptions {
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg';
}

export function getOptimizedImageUrl(
  url?: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=75';
  }

  const { width = 400, quality = 75, format = 'auto' } = options;

  // Unsplash dynamic parameter optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      urlObj.searchParams.set('auto', format);
      urlObj.searchParams.set('fit', 'crop');
      return urlObj.toString();
    } catch {
      // Fallback if URL parsing fails
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?auto=${format}&fit=crop&w=${width}&q=${quality}`;
    }
  }

  return url;
}
