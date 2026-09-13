/**
 * Resolves image sources so they work on every host the site is deployed to.
 *
 * Bundled brand/campaign images live on Lovable's asset CDN and are stored as
 * host-relative paths ("/__l5e/assets-v1/..."). Those only resolve on a
 * Lovable-served origin, so on other hosts (e.g. Vercel) they 404 and render
 * as broken images. Prefixing them with the canonical origin makes them
 * absolute and host-independent.
 *
 * Uploaded product photos live in a private storage bucket and are served
 * through our own endpoint (/api/public/product-image/<path>) instead of
 * long-lived signed links, which fail with signature errors whenever the
 * project's signing keys change.
 */
// Immutable project URL that always serves the published deployment,
// regardless of domain renames or custom-domain DNS state.
const ASSET_ORIGIN =
  "https://project--07b5cb66-7891-4df1-bfe0-6d65612a75d5.lovable.app";

export const PRODUCT_IMAGE_ROUTE = "/api/public/product-image/";

/** Converts a stored value into a storage object path, when it is one. */
function toStoragePath(url: string): string | null {
  // Legacy signed URLs: .../storage/v1/object/sign/product-images/<path>?token=...
  const signIdx = url.indexOf("/storage/v1/object/");
  if (signIdx !== -1) {
    const rest = url.slice(signIdx + "/storage/v1/object/".length).split("?")[0];
    const withoutMode = rest.replace(/^(sign|public|authenticated)\//, "");
    if (withoutMode.startsWith("product-images/")) {
      return withoutMode.slice("product-images/".length);
    }
    return null;
  }
  // Already our own endpoint.
  if (url.startsWith(PRODUCT_IMAGE_ROUTE)) return url.slice(PRODUCT_IMAGE_ROUTE.length);
  return null;
}

export function resolveImageUrl(src: string | null | undefined): string {
  if (!src) return "";
  const url = src.trim();
  if (!url) return "";

  const storagePath = toStoragePath(url);
  if (storagePath) {
    return PRODUCT_IMAGE_ROUTE + storagePath.split("/").map(encodeURIComponent).join("/");
  }

  // Asset-CDN paths may be stored host-relative ("/__l5e/...") or baked into
  // the database with an absolute origin (e.g. the custom domain). Normalise
  // both to the stable project origin.
  const idx = url.indexOf("/__l5e/");
  if (idx !== -1) return `${ASSET_ORIGIN}${url.slice(idx)}`;
  return url;
}

export function resolveImageUrls(list: readonly (string | null | undefined)[]): string[] {
  return list.map(resolveImageUrl).filter((u) => u.length > 0);
}
