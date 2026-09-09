# P10 early-use — operator visual image selection

**Date:** 2026-09-09  
**Scope:** explicit operator follow-up to the accepted PR #142 visual personalization during `P10-S3-I2-I3-D` controlled early use.  
**Status:** `DONE / ACCEPTED / INTEGRATED — PR #144`

## Trigger

After validating the integrated PR #142 control, the operator explicitly clarified the intended product behavior: the eligible operator must be able to **choose the decorative image from the Easy interface**, rather than being permanently bound to the bundled `src/assets/hero.png` asset.

This is a bounded follow-up to the already accepted operator-scoped visual personalization. It is not historical early-use change #16, D-035 `DR-10`, a general theme builder, branding redesign, document-upload subsystem or D-030 resumption.

## Accepted product result

PR #144 adds only the image-selection lifecycle required by the existing personalization control:

1. the eligible authenticated operator can choose a local image from inside `Personalização visual`;
2. accepted formats are PNG, JPEG and WebP only;
3. file size is bounded to 5 MB in both the browser validation and Storage bucket configuration;
4. the selected asset persists across browser/device sessions for that operator account;
5. the dialog shows a preview and exposes `Escolher imagem`;
6. selecting another valid image replaces the same account-owned object rather than accumulating a gallery;
7. `Usar imagem padrão` removes the custom object and returns to the bundled `src/assets/hero.png` fallback;
8. the existing `Canto` / `Marca d'água`, bounded intensity, opt-in and `print:hidden` contracts remain unchanged;
9. the custom asset stays decorative/non-interactive and never participates in business calculations, navigation or authorization;
10. PDFs, Reports, reseller statements, Backup v2 and other exports remain unchanged and do not embed the custom asset;
11. no gallery, crop/editor, animation controls, public media library or page-specific theme system was added.

## Persistence and security acceptance

Cross-session persistence is implemented through one dedicated **private Supabase Storage bucket**:

- bucket: `operator-visual-personalization`;
- migration: `20260909151557_operator_visual_image_selection`;
- bucket is private (`public = false`);
- bucket enforces `5 MiB` maximum object size;
- bucket MIME allow-list is exactly `image/png`, `image/jpeg`, `image/webp`;
- one deterministic object path is used per operator: `${auth.uid()}/decoration`;
- display uses a time-limited signed URL rather than a public object URL;
- `storage.objects` RLS remains enabled;
- dedicated `SELECT`, `INSERT`, `UPDATE` and `DELETE` policies require the first/only folder segment to equal `auth.uid()`, the filename to equal `decoration`, and an active `easy_operators` row with `visual_personalization_allowed = true` for the same user;
- the UPDATE policy has both `USING` and `WITH CHECK` ownership/elegibility predicates;
- no `service_role`, secret key, browser-supplied user identity, hardcoded person e-mail/name or `SECURITY DEFINER` upload helper was introduced.

Post-migration inspection confirmed the bucket restrictions and all four policies. Supabase security advisors reported no new finding attributable to PR #144; the only remaining warnings are the previously known intentional authenticated `SECURITY DEFINER` transaction/restore RPCs and disabled leaked-password protection.

At closure time the bucket contained **0 custom image objects**. Therefore no user received a custom image implicitly; the first custom object appears only after the eligible operator explicitly chooses an image in the UI.

The custom decorative asset remains deliberately outside Backup v2 because it is optional presentation state, not canonical business data. Storage unavailability or absence of the object degrades to the bundled fallback and cannot affect Easy business operation.

## QA acceptance evidence

Repository evidence for PR #144:

- final feature head: `f1967f37307e6516635cc72ac1a695196efc4f92`;
- exact GitHub-generated merge ref checked out by Actions: `a06ded6f1445e63e6c464819be039db1ad15f4b1`;
- validated tree: `3904c6833fc589478477d7ade60804fc36768621`;
- D-019 run/job: `34369323612` / `102526152622`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **78 files / 333 tests PASS**;
- focused component coverage: `OperatorVisualPersonalization.test.tsx` **6/6 PASS**;
- focused service coverage: `operatorVisualPersonalization.test.ts` **5/5 PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**;
- PR #144 squash-integrated `develop`: `d4b59ab733876af1df2d9a294f3668c5f421bc18`;
- integrated tree: `3904c6833fc589478477d7ade60804fc36768621` — exact tree equivalence **PASS**;
- post-integration `develop` Critical QA run/job: `34370060092` / `102528684256` — **PASS**.

No failed D-019 gate was waived. The final feature gate passed on its first attempt.

## Preserved invariants

PR #144 preserves all accepted PR #142 and V2 invariants, including Supabase Auth/RLS/operator authorization, server-derived transaction actor attribution, D-014 occurrence semantics, reversal-zero-effect, D-015 FIFO aging, immutable historical classification, canonical screen/PDF report parity, Backup v2 schema 7 and the D-032 recovery fail-closed boundary.

The stale D-032 checkpoint was not refreshed, bypassed or treated as satisfied by this Storage migration. D-030 remains on hold. No legacy real-data import occurred. No automatic Vercel publication occurred and `main` was not targeted.

## Closure

The operator-requested ability to choose the decorative image is **DONE / ACCEPTED / INTEGRATED** through PR #144. There is no further executable work implied by this item. The canonical `NEXT_ACTION` returns to controlled early-use observation until new observed evidence or a new explicit operator instruction authorizes another bounded change.