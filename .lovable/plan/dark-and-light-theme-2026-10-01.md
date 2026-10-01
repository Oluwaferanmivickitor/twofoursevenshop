# Dark and Light Theme

## What will change
- Make the public storefront open in dark mode by default.
- Add a compact sun/moon control to the main header so visitors can switch themes.
- Remember each visitor’s choice on future visits.
- Apply the existing semantic colors across menus, search, cart, product pages, checkout, and footer without changing layouts or store behavior.

## Technical details
- Add a small shared theme control that safely initializes before the page becomes visible, avoiding a light flash.
- Use the existing `.dark` color system and refine dark-mode surfaces where needed.
- Keep the admin dashboard unchanged unless it inherits the selected theme naturally.
- Verify the storefront at mobile and desktop sizes, including a reload after selecting light mode.
