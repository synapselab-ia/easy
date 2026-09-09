# P10 early-use — operator-scoped visual personalization

**Date:** 2026-09-09  
**Scope:** explicitly operator-authorized presentation/personalization refinement during `P10-S3-I2-I3-D` controlled early use.  
**Status:** `DONE / ACCEPTED / INTEGRATED — PR #142`

## Trigger

The operator explicitly requested an optional decorative image in the Easy interface, either as a small corner element or as a discreet watermark/background element, with the important requirement that the personalization apply only to one designated operator account rather than globally to every Easy user.

This is a bounded operator instruction after the closure of PR #139. It is **not** historical early-use change #16, D-035 `DR-10`, D-030 resumption, a branding redesign or authorization for a general theme-builder subsystem.

## Accepted result

PR #142 implements the authorized behavior without introducing a competing business/runtime subsystem:

1. **Per-operator and opt-in.** The preference is stored on the authenticated operator's existing `public.easy_operators` row and is disabled by default.
2. **Initial designated account only.** Eligibility is database state. The production migration designates the sole active operator only when exactly one active operator exists. No person's display name, e-mail or UUID is hardcoded in presentation logic.
3. **Explicit toggle.** The eligible operator can enable/disable the decoration without affecting another operator.
4. **Two bounded presentation modes.** The implementation supports `Canto` and `Marca d'água` only.
5. **Bounded intensity.** The only intensity presets are `Bem discreta` and `Suave`; no arbitrary opacity/size editor exists.
6. **Existing bundled asset.** The implementation reuses `src/assets/hero.png`. No upload, Supabase Storage, asset gallery or image lifecycle was added.
7. **Safe visual hierarchy.** Business content and navigation render above the decoration. The shell prevents the decorative layer from becoming an interactive or layout-driving surface.
8. **Decorative semantics.** The image is `aria-hidden` and `pointer-events-none`; it cannot receive keyboard/pointer interaction or communicate business information.
9. **No document/export contamination.** The decoration is `print:hidden` and no PDF, reseller-statement, Backup v2, report-export or data-export path was changed.
10. **No effect when unavailable/off.** Ineligible operators, and the eligible operator while the preference remains disabled, receive the normal Easy interface.

The control is exposed in the existing authenticated shell on desktop and mobile rather than in business-operation pages.

## Persistence and authorization boundary

The existing operator allow-list table was extended minimally rather than creating a new preference subsystem:

- `visual_personalization_allowed boolean not null default false`;
- `visual_personalization_enabled boolean not null default false`;
- `visual_personalization_mode text not null default 'corner'`, constrained to `corner|watermark`;
- `visual_personalization_intensity text not null default 'subtle'`, constrained to `subtle|soft`.

Production migration:

- `20260909135441_operator_visual_personalization` — **APPLIED** to `easy-v2`.

Security boundary:

- `authenticated` receives column-level `UPDATE` only for `visual_personalization_enabled`, `visual_personalization_mode` and `visual_personalization_intensity`;
- `authenticated` does **not** receive update privilege for `visual_personalization_allowed`, `is_active` or `user_id`;
- RLS policy `easy_operators_update_visual_preferences` uses both `USING` and `WITH CHECK` and requires `user_id = auth.uid()`, `is_active` and `visual_personalization_allowed`;
- existing `easy_operators_select_self` remains the SELECT boundary for the operator's own row;
- no `SECURITY DEFINER` helper, new Auth claim, browser-global identity check or client-selected authorization field was introduced.

Live post-integration verification on 2026-09-09 found:

- active operators: **1**;
- eligible operators: **1**;
- enabled operators: **0**;
- `authenticated` can update enabled/mode/intensity: **true**;
- `authenticated` can update allowed/is_active/user_id: **false**;
- update RLS policy present: **true**.

A prior transaction-scoped RLS proof also exercised a real authenticated preference update and rolled the transaction back, leaving production disabled.

## Supabase advisor review

Post-DDL security advisors produced no new finding attributable to this feature.

Existing unrelated warnings remain:

- signed-in execution of the intentionally exposed `SECURITY DEFINER` transaction/restore RPCs (`create_transaction`, `correct_transaction`, `restore_easy_backup`), governed by their existing accepted boundaries;
- leaked-password protection is disabled in Supabase Auth.

Those pre-existing findings were not changed or waived as part of this presentation-only product authorization.

Reference remediation documentation:

- `https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable`
- `https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection`

## Acceptance evidence

### Focused coverage

New coverage verifies:

- an ineligible operator receives no personalization control;
- an eligible operator can save only enabled/mode/intensity preference values;
- decoration is absent while disabled;
- enabled decoration uses decorative/non-interactive/print-hidden semantics;
- service mapping rejects unsupported mode/intensity values and preserves the bounded defaults.

### Final PR D-019 — PASS

- feature head: `7462a8a5f235691a8381587429715c22cc2f7242`;
- GitHub-generated merge ref checked out by Actions: `c8aa4482eee0364a155d213cac5252dccfedec3c`;
- validated tree: `eeab347c5f701fe7ef6e2a6bd1400bc07f9bdcbd`;
- run/job: `34360454611` / `102495778094`;
- ESLint: **0 errors / 108 warnings**;
- Vitest: **78 files / 329 tests PASS**;
- feature component coverage: **4/4 PASS**;
- feature service coverage: **3/3 PASS**;
- Playwright: **21/21 PASS**;
- TypeScript + production Vite build: **PASS**.

No failed executable gate was waived.

### Integration — PASS

PR #142 was squash-integrated into `develop` as:

- `3b3ba1f3eb280a552a806dda0f0752f21900c263`.

The integrated commit tree is:

- `eeab347c5f701fe7ef6e2a6bd1400bc07f9bdcbd`.

That exactly equals the D-019-validated merge-ref tree. **Exact tree equivalence: PASS.**

Post-integration `develop` Critical QA:

- run/job `34364762432` / `102510503835`: **PASS**.

No automatic Vercel publication occurred and `main` was not targeted.

## Recovery boundary

PR #142 does not modify D-032/D-030 recovery behavior.

The latest observed real manual recovery events on 2026-09-09 are:

- export: `2026-09-04 14:36:06.332805+00`;
- confirmation: `2026-09-04 14:36:14.282849+00`.

The checkpoint is therefore older than the strict accepted `<24h` write window. Normal hosted business writes must remain fail-closed until an approved operator creates and confirms a fresh Backup v2 stored outside Easy. This feature neither bypasses nor satisfies that recovery requirement.

D-030 unattended off-site automation/retention/restore acceptance remains `ON_HOLD`.

## Boundaries preserved

This completed refinement does not change or weaken:

- Supabase/Postgres canonical business persistence;
- Supabase Auth, RLS or active `easy_operators` authorization;
- server-derived transaction actor attribution;
- D-014 occurrence semantics;
- reversal-zero-effect behavior;
- D-015 FIFO aging;
- immutable historical classification snapshots;
- canonical screen/PDF financial-report parity;
- Backup v2 schema 7 or recovery guard;
- manual Vercel publication;
- `main` stability;
- D-030 hold or definitive-cutover status.

It also does not authorize arbitrary uploads, Supabase Storage, animation, page-by-page skins, theme colors, a design editor, early-use change #16 or `DR-10`.

## Closure

The explicitly authorized operator-scoped visual personalization is **DONE / ACCEPTED / INTEGRATED**.

The project returns to `P10-S3-I2-I3-D` controlled clean-start early-use observation. There is no additional authorized executable product item. Before normal hosted writes, the D-032 recovery checkpoint must first be refreshed and confirmed. Any later product change requires new observed evidence or a new explicit operator instruction and must be canonically authorized before coding.