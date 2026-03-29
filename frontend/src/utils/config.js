const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim() || '';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export function resolveAssetUrl(assetPath) {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}
