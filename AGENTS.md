<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Storefront theming is class-based on the document element, defaults to dark, and persists the visitor's explicit choice; this prevents theme flashes while preserving semantic tokens.

- Admin pages use a scoped admin theme and shared shell, preserving the independent storefront theme.
- Order lifecycle rules and audit records are enforced by database triggers; UI transitions use the shared lifecycle module so payment gating cannot be bypassed.
- Public order tracking verifies reference plus checkout email and returns a narrow projection without contact details, proof URLs, or internal notes.
- Sortable admin lists use touch and keyboard-enabled drag handles; editor changes are persisted only through authenticated owner functions.
