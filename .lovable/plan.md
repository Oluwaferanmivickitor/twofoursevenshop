
# Admin Suite for TWOFOURSEVEN

## Overview
Add a password-protected admin area at `/admin` where you can manage the product catalog (add, edit, delete, update stock, change prices). Changes reflect immediately on the public homepage and shop.

## Approach

### 1. Backend (Lovable Cloud)
Enable Lovable Cloud to get a database + authentication. Create:
- **`products` table** — stores name, slug, price, description, sizes, colors, images, stock status, display order, etc.
- **`user_roles` table** + `admin` role — only users with the admin role can write to products (enforced by database policies).
- Public read access so the shop/homepage stays fast and SSR-friendly.

The existing static product catalog in `src/lib/products.ts` is migrated into the `products` table (seed migration) so nothing on the site changes visually on day one.

### 2. Admin authentication
- Email + password sign-in at `/admin/login`.
- First-run: you provide an admin email; I create the account and grant the admin role. Only that account (and any future admins you promote) can access `/admin`.
- Session-based — a normal visitor hitting `/admin` is redirected to login. Non-admin signed-in users are refused.

### 3. Admin dashboard (`/admin`)
- Products table with columns: image, name, price, stock status, colors, actions.
- **Add product** modal — name, slug, price, description, sizes, colors (with hex + stock per color), image URLs, category.
- **Edit product** modal — same fields, prefilled.
- **Delete** with confirm.
- **Quick stock toggle** — mark a whole product or an individual color variant in/out of stock without opening the edit modal.
- **Quick price edit** — inline price field.

Images: for v1, images are entered as URLs (you can upload to any host or keep using the existing bundled images by pasting their public URLs). File upload to Lovable Cloud storage can be added in a follow-up if you want it.

### 4. Public site integration
- `src/lib/products.ts` becomes a thin wrapper that reads from the database (server function, cached per request) instead of a static array.
- Homepage `NewReleases`, `/shop`, `/product/$slug`, and `/category/$slug` all read from the same source — no component changes needed beyond swapping the data source.
- Bundled image imports stay usable as fallbacks; new products use URL-based images.

### 5. Security
- Row-Level Security on `products`: anyone can read, only admins can insert/update/delete.
- `/admin/*` routes gated server-side — checked on every request, not just in the UI.
- Admin role stored in a separate `user_roles` table (never on the user record) to prevent privilege-escalation bugs.
- Passwords handled by Lovable Cloud auth (bcrypt, leaked-password check enabled).

## What I need from you
- **Admin email address** (the one login that gets created initially). You'll set the password on first sign-in via a secure form.

## Out of scope for v1 (can add later)
- Image upload UI (URLs only for now)
- Order management / customers
- Multi-admin invite flow (you can promote more admins via the database)
- Audit log of admin changes
