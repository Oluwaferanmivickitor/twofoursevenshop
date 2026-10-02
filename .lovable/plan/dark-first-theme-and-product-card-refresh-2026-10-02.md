# Dark-first Theme and Product Card Refresh

## What will change
- Make the storefront open in dark mode by default and add a compact sun/moon switch in the main header.
- Remember each visitor’s light or dark choice across future visits without a theme flash on reload.
- Remove borders from storefront product sections and product-card presentation.
- Move discount badges onto product images at the top-left.
- Add an image-level availability marker: green for in stock and red for out of stock.
- Rework details below each image into a consistent hierarchy: product name, sale price, crossed-out original price, EUR conversion, then stock copy.
- Apply the same card presentation on the homepage, Shop, category pages, and search results.

## Technical details
- Initialize the theme on the document before visible content, using the existing semantic light and dark color tokens.
- Add a reusable storefront product-card details treatment so pricing and stock behavior remain consistent.
- Keep product links, sold-out behavior, inventory values, discounts, and checkout logic unchanged.
- Verify dark/light persistence and representative product cards on desktop and mobile.
