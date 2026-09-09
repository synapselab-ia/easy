# P10 early-use — operator-scoped visual personalization

**Date:** 2026-09-09  
**Scope:** explicitly operator-authorized presentation/personalization refinement during `P10-S3-I2-I3-D` controlled early use.  
**Status:** `AUTHORIZED / NOT IMPLEMENTED`

## Trigger

The operator explicitly requested an optional decorative image in the Easy interface, either as a small corner element or as a discreet watermark/background element, with the important requirement that the personalization apply only to one designated operator account rather than globally to every Easy user.

This is a new bounded operator instruction after the closure of PR #139. It is **not** historical early-use change #16, D-035 `DR-10`, D-030 resumption, a branding redesign or authorization for a general theme-builder subsystem.

## Product goal

Allow one designated authenticated operator to make Easy visually personal without changing the business interface for other operators and without reducing readability, accessibility or operational efficiency.

The feature is ornamental only. Financial data, transaction behavior, reports, PDFs, recovery and authorization semantics remain independent from the decorative image.

## Authorized behavior

The implementation target is:

1. **Per-operator and opt-in.** The decorative image preference is scoped to the authenticated operator, is disabled by default and must not become a store-global setting.
2. **Initial designated account only.** The first accepted use is for one designated operator account. Do not hardcode a person's display name or e-mail in presentation code. The implementation must bind eligibility/state to authenticated operator identity through an appropriate existing or deliberately scoped preference mechanism.
3. **Explicit toggle.** The designated operator can enable/disable the decorative image without affecting other operators.
4. **Two bounded presentation modes.** The intended first implementation supports a discreet corner image and a low-opacity watermark/background presentation. A large theme/skin system is out of scope.
5. **Safe visual hierarchy.** The image must not cover controls, tables, text, alerts, forms or navigation; must not cause layout shift or horizontal overflow; and must remain visually subordinate to business content.
6. **Decorative semantics.** When the image conveys no business information it should be ignored by assistive technology and should not intercept pointer/keyboard interaction.
7. **Constrained intensity.** Watermark opacity/size must use safe bounded values or presets rather than allowing settings that can make business content unreadable.
8. **No document/export contamination.** The decorative image must not appear in reseller statements, financial PDFs, backups, data exports or print-oriented output unless a later explicit instruction changes that boundary.
9. **No generalized upload/storage subsystem by default.** The first implementation may use one supplied/bundled decorative asset. Building arbitrary image upload, Supabase Storage, asset galleries or image-management lifecycle is outside this authorization unless implementation evidence shows it is genuinely required and the operator explicitly expands scope.
10. **No effect when unavailable/off.** Operators who are not eligible, or the designated operator with the option disabled, must see the normal existing Easy interface with no visual or behavioral delta.

## Persistence/auth boundary to verify before coding

The product requirement is cross-session **operator-scoped preference**, not a hardcoded client identity check. Before implementation, inspect the current authenticated-operator/profile model and choose the smallest safe persistence mechanism that satisfies that requirement.

Do not introduce a database/schema migration merely for convenience if the current model already provides a suitable operator-scoped preference location. Conversely, do not pretend a browser-global preference is per-operator if it can leak across accounts using the same browser.

If satisfying the per-operator/cross-session requirement would materially broaden database/Auth/RLS scope beyond a small isolated preference, stop and document the dependency for a new operator decision rather than silently expanding the task.

## Suggested UI location

Prefer a compact setting under an existing or appropriately bounded `Configurações` / `Aparência` surface rather than placing configuration controls in operational pages.

The minimum useful controls are:

- ativar/desativar imagem personalizada;
- modo `Canto` ou `Marca d'água`;
- a bounded visual intensity required for legibility.

Additional page-by-page selectors, arbitrary positioning, animation, theme colors or a general design editor are not required for the first accepted version.

## Acceptance criteria

Implementation acceptance must demonstrate that:

- the designated authenticated operator can enable and disable the image;
- another authenticated operator does not receive the personalization;
- the setting does not rely on a hardcoded person's name/e-mail in UI logic;
- corner mode remains outside interactive/content-critical regions across representative desktop and mobile widths;
- watermark mode remains sufficiently faint and behind business content;
- the image is non-interactive/decorative and does not alter keyboard/focus behavior;
- PDFs/exports remain unchanged;
- normal transaction/report/history/recovery behavior remains unchanged;
- the complete D-019 gate passes before executable integration.

## Boundaries preserved

This authorization does not change or weaken:

- Supabase/Postgres canonical business persistence;
- Supabase Auth, RLS or active `easy_operators` authorization;
- server-derived transaction actor attribution;
- D-014 occurrence semantics;
- reversal-zero-effect behavior;
- D-015 FIFO aging;
- immutable historical classification snapshots;
- canonical screen/PDF financial-report parity;
- Backup v2 schema/recovery guard;
- manual Vercel publication;
- `main` stability;
- D-030 hold or definitive-cutover status.

## Canonical next step

Verify the current operator/auth preference surface and layout shell, then implement **only** this bounded operator-scoped decorative-image personalization on an isolated branch from current `develop`. Do not bundle unrelated usability changes, a general theme system, arbitrary uploads/storage or another early-use initiative.
