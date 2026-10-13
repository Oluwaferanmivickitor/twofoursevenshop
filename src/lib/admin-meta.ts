export function adminHead(page: string) {
  const title = `${page} — TwoFourSeven Studio`;
  const description = `Manage TwoFourSeven ${page.toLowerCase()} securely.`;
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex,nofollow" }] };
}