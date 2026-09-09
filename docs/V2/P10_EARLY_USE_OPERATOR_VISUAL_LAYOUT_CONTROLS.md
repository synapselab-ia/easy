# P10 early-use — operator visual layout controls

**Date:** 2026-09-09  
**Scope:** explicit operator follow-up to the accepted PR #142 / PR #144 visual-personalization work during `P10-S3-I2-I3-D` controlled early use.  
**Status:** `AUTHORIZED / NOT YET IMPLEMENTED`

## Trigger

After accepting operator-scoped visual personalization and custom image selection, the operator explicitly authorized a further bounded presentation refinement so the eligible operator can place a fun decorative image — for example a character, artist or meme — where it is pleasant rather than distracting during day-to-day work.

This is optional quality-of-life personalization only. It is not historical early-use change #16, D-035 `DR-10`, a general theme builder, branding redesign, page-layout editor, business-data feature or D-030 resumption.

## Authorized product result

The next implementation may extend only the existing `Personalização visual` feature with the following account-scoped controls:

1. **Position:** exactly nine fixed viewport anchors:
   - superior esquerda;
   - superior centro;
   - superior direita;
   - centro esquerda;
   - centro;
   - centro direita;
   - inferior esquerda;
   - inferior centro;
   - inferior direita.
2. **Size:** exactly three bounded presets: `Pequeno`, `Médio` and `Grande`.
3. **Opacity:** operator-selectable through a compact slider/control, bounded to **5%–50%** in predictable increments; the implementation must expose the current numeric percentage in the UI.
4. **Layer:** exactly two choices:
   - `Atrás do conteúdo`;
   - `Sobre o conteúdo`.
5. The selected position, size, opacity and layer persist with the same eligible operator account across browser/device sessions.
6. The existing image choice, fallback image, enable/disable control and private Storage behavior remain unchanged.
7. Changes should preview immediately inside the existing personalization flow so the operator can judge readability before saving.

## Safety and usability boundaries

Regardless of layer, the decorative image must remain presentation-only:

- always `pointer-events: none`, so it can never block buttons, fields, navigation or gestures;
- always ignored by assistive technology (`aria-hidden` or equivalent decorative semantics);
- always excluded from print/PDF/export surfaces;
- must not alter document flow, table widths, scroll calculations or business-component geometry;
- must remain bounded to the viewport/application shell rather than becoming draggable arbitrary content;
- responsive behavior may adapt the physical pixel dimensions of `Pequeno` / `Médio` / `Grande`, but the three product choices remain stable;
- `Sobre o conteúdo` may visually cross application surfaces by design, but the operator retains opacity/position/size controls and can switch to `Atrás do conteúdo` whenever readability is worse;
- no free dragging, arbitrary X/Y coordinates, rotation, crop/editor, animation, multiple simultaneous images, per-page layouts or additional theme system is authorized.

## Persistence/security direction

The implementation should extend the existing operator-scoped preference row rather than create a separate identity/profile system.

It is authorized to add the minimum preference fields needed for position, size, opacity and layer to `public.easy_operators`, provided the existing security boundary is preserved:

- only the authenticated user's own active and eligible row may be updated;
- browser `UPDATE` privileges remain column-scoped to presentation-preference fields only;
- `user_id`, `is_active`, `visual_personalization_allowed` and authorization-related fields remain non-updatable by the browser;
- existing RLS `USING` / `WITH CHECK` ownership + eligibility requirements remain mandatory;
- no `service_role`, secret key, client-selected identity or hardcoded person identity may be introduced;
- no financial, transaction, recovery or Backup v2 schema semantics may depend on these fields.

If the existing preference model can support the controls without a schema extension, prefer the simpler compatible path. Any schema change must be minimal and migration-backed.

## Preserved invariants

Preserve all accepted V2 and PR #142 / PR #144 invariants, including Supabase Auth/RLS/operator authorization, server-derived transaction actor attribution, D-014 occurrence semantics, reversal-zero-effect behavior, D-015 FIFO aging, immutable historical classification, screen/PDF report parity, Backup v2 schema 7, D-032 recovery fail-closed behavior, manual deployment and untouched `main`.

Decorative-image presentation state remains outside Backup v2 and is never canonical business data.

## QA/closure requirement

Before integration:

- add focused component/service coverage for all nine positions, the three sizes, opacity bounds/persistence and both layer modes;
- prove overlay remains non-interactive and print-hidden;
- prove ineligible operators still receive no personalization control;
- if database preference fields change, inspect grants/RLS and run Supabase advisors after the migration;
- require the complete D-019 `npm run qa:critical` gate;
- record exact PR/tree/CI/migration evidence in the focused closure and `STATUS.md`;
- after acceptance, restore `NEXT_ACTION` to controlled early-use observation.

No implementation, database mutation, Vercel publication or `main` change is performed by this authorization-only documentation step.
