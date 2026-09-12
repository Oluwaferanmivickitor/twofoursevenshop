/**
 * Resolves image sources so they work on every host the site is deployed to.
 *
 * Bundled brand/campaign images live on Lovable's asset CDN and are stored as
 * host-relative paths ("/__l5e/assets-v1/..."). Those only resolve on a
 * Lovable-served origin, so on other hosts (e.g. Vercel) they 404 and render
 * as broken images. Prefixing them with the canonical origin makes them
 * absolute and host-independent.
 */
const ASSET_ORIGIN = "https://twofourseven.store";

export function resolveImageUrl(src: string | null | undefined): string {
  if (!src) return "";
  const url = src.trim();
  if (!url) return "";
  if (url.startsWith("/__l5e/")) return `${ASSET_ORIGIN}${url}`;
  return url;
}

export function resolveImageUrls(list: readonly (string | null | undefined)[]): string[] {
  return list.map(resolveImageUrl).filter((u) => u.length > 0);
}
