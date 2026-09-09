# P10 early-use — operator visual image selection

**Date:** 2026-09-09  
**Scope:** explicit operator follow-up to the accepted PR #142 visual personalization during `P10-S3-I2-I3-D` controlled early use.  
**Status:** `AUTHORIZED / IN_PROGRESS`

## Trigger

After validating the integrated PR #142 control, the operator explicitly clarified the intended product behavior: the eligible operator must be able to **choose the decorative image from the Easy interface**, rather than being permanently bound to the bundled `src/assets/hero.png` asset.

This is a bounded follow-up to the already accepted operator-scoped visual personalization. It is not historical early-use change #16, D-035 `DR-10`, a general theme builder, branding redesign, document-upload subsystem or D-030 resumption.

## Authorized result

The next implementation may add only the image-selection lifecycle required by the existing personalization control:

1. the already eligible authenticated operator may select a local image from inside `Personalização visual`;
2. accepted formats are bounded to PNG, JPEG and WebP;
3. file size is bounded to 5 MB;
4. the selected asset must persist across browser/device sessions for that operator account;
5. another operator must not be able to list, read, replace or delete that asset;
6. the existing bundled `hero.png` remains a safe fallback when no custom image exists or after the operator removes it;
7. the existing `Canto` / `Marca d'água`, intensity, opt-in and print-hidden contracts remain unchanged;
8. the custom image remains decorative/non-interactive and is never business data;
9. PDFs, reports, reseller statements, Backup v2 and other exports remain unchanged and do not embed the custom asset;
10. no arbitrary gallery, multiple saved images, crop/editor, animation controls, public media library or page-specific skinning is authorized.

## Persistence/security direction

Cross-session image persistence requires object storage rather than browser-local state or database-embedded binary data. The bounded design is therefore authorized to use one **private Supabase Storage bucket** dedicated to this feature.

The storage boundary must be:

- one deterministic object per operator, under an authenticated-user-owned path;
- private bucket;
- Storage RLS for `SELECT`, `INSERT`, `UPDATE` and `DELETE` limited to the operator's own path;
- eligibility must still require the existing active `easy_operators` row with `visual_personalization_allowed = true`;
- no `service_role`, secret key, `SECURITY DEFINER` upload helper or hardcoded person identity in the browser;
- the frontend may obtain a time-limited signed URL for display;
- removing/replacing the custom asset must never alter financial/business/recovery records.

Current Supabase guidance confirms private-bucket reads remain subject to RLS and can be served through authenticated download or time-limited signed URLs. Bucket-level MIME/size restrictions should additionally enforce the accepted input boundary.

## Invariants

Preserve all accepted PR #142 and V2 invariants, including Auth/RLS/operator authorization, server-derived transaction actor attribution, D-014 occurrence semantics, reversal-zero-effect, D-015 FIFO aging, immutable historical classification, screen/PDF report parity, Backup v2 schema 7, D-032 recovery fail-closed behavior, manual deployment and untouched `main`.

The custom decorative asset is explicitly outside Backup v2 because it is optional presentation state, not canonical business data. Loss/unavailability of the asset must degrade to the bundled fallback rather than affect Easy business operation.

## QA/closure requirement

Before integration, require focused service/component coverage plus the complete D-019 gate. Apply and verify the Storage migration in `easy-v2`, run Supabase security advisors after DDL/policy changes, prove cross-user isolation through policy/grant inspection or a transaction-safe equivalent, then document exact acceptance evidence and restore `NEXT_ACTION` to controlled observation.