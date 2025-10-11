const FALLBACK_POSTER_IMAGE = '/assets/textures/resistance-poster.jpg';

export function sanitizePosterImageUrl(url?: string | null): string {
  if (!url) {
    return FALLBACK_POSTER_IMAGE;
  }

  // Allow data URIs (base64 encoded images from file uploads)
  if (url.startsWith('data:image/')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return FALLBACK_POSTER_IMAGE;
    }

    if (parsed.hostname === 'www.etsy.com') {
      return FALLBACK_POSTER_IMAGE;
    }

    return url;
  } catch {
    return FALLBACK_POSTER_IMAGE;
  }
}

export { FALLBACK_POSTER_IMAGE };
