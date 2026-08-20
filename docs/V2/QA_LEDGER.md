# Easy V2 — QA Ledger

**Updated:** 2026-08-20

D-019 remains the mandatory V2 integration/publication gate:

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

Objective failures block integration. Existing warning/harness/dependency debt remains visible and does not redefine a passing gate.

## Accepted baseline through P9-S2

- P1 validations: `32037965651`, `32038951903`, `32039763539`.
- P2: `32041280504`, `32042373332`.
- P3: `32052076684`, `32053837309`.
- P5: `32058028793`, `32060729538`.
- P6: `32064801009`, `32065331102`, `32065713920`.
- P7 final: `32145620210`.
- P8-S1/S2: `32149199373` / `95750510692`; `32158395391` / `95781056589`.
- P9-S1: `32166330198` / `95806665221`.
- P9-S2 accepted runtime: `32180250834` / `95851336506`.

## P9-S3 accepted validation

- Contract / D-025: `32185226251` / `95867186002`; PR #44.
- I1 persistence/migration/backup: final `32191707306` / `95887236403`; PR #45.
- I2 lifecycle/classification/order snapshots: final `32202876262` / `95920142630`; PR #46; closure #47.
- I3 category reporting: authoritative final `32262877105` / `96100129962`; 51 files / 210 Vitest, 17/17 Playwright, build PASS; PR #48.

## P9-S4 accepted validation

Initial evidence/source gate: D-019 `32265612927` / `96109244644`; PR #50 integrated as `35a2e0d7495791dfda7f02e045067a85bad4aed9`.

D-026 decision gate: D-019 `32277770945` / `96149101495`; PR #52 integrated as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`.

P9-S4-I1 full-field audited replacement:

- PR #54 D-019 run `32285620846`, job `96174326588`.
- Validated merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3`.
- ESLint: 0 errors / 82 warnings.
- Vitest: 52 files / 216 tests PASS.
- Playwright: 17/17 PASS.
- Production build: PASS.
- PR #54 squash-integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`.
- Validated/integrated tree: `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

## P9-S5 occurrence-date usability verification — PASS / DONE / INTEGRATED

Source verification established that the normal `TransactionForm` already defaults `Data da ocorrência` to today's browser-local date, displays it in the primary transaction-entry block, permits direct pre-save editing, distinguishes financial occurrence from automatic registration time, and persists selected `occurredAt` independently from generated `createdAt` under D-014/P3.

No evidence-backed runtime gap was found and no production source file was changed.

Authoritative proof:

- PR #56 D-019 run `32287018048`, job `96178850066`.
- Validated PR merge ref `9459285920cfbd784a652e9db97cf40741977edf`.
- ESLint: 0 errors / 82 warnings.
- Vitest: 52 files / 217 tests PASS.
- Playwright: 17/17 PASS.
- Production build: PASS.
- PR #56 integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`.
- Validated/integrated tree: `97a78d3e4d78a54ad117440c160920343513ba9f`.

P9 canonical closure integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

## P10-S1 pre-cutover contract — PASS / INTEGRATED

P10-S1 reconstructed the stable/integration/deployment/recovery boundary before authorizing any data movement and accepted D-027 fail-closed sequencing.

Authoritative contract proof:

- PR #58 D-019 run **`32290159119`**, job **`96188851730`**.
- Validated PR merge ref **`dbacda8893c6d1073ba130440ef5bcc6ab11af75`**.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **52 files / 217 tests PASS**.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.
- PR #58 squash-integrated as **`5c7a5dc23af435711059deff75cf7862972662a1`**.
- Validated/integrated tree **`6afb4e77eecb97d2092d209b12c054ce2b1952db`**.

## P10-S1-I1 — backup/correction compatibility hardening

### Initial D-019 — FAIL / BLOCKING

- Run `32292405631`, job `96196002726`.
- Five new P10-S1-I1 focused tests passed.
- Full Vitest failed one existing P9-S3 regression: `rejects a linked order correction that rewrites the historical category snapshot`.
- Cause: the first implementation removed category-snapshot equality unconditionally, over-relaxing D-025 for an order correction keeping the same item.
- Because `npm run qa:critical` is chained, this objective Vitest failure blocked integration.

The validator was narrowed: type, `occurredAt` and item changes remain allowed under D-026, but order→order correction keeping the same `itemId` must preserve the original D-025 category snapshot. Changed-item order replacements may carry the new target item's valid snapshot.

### Authoritative D-019 — PASS / DONE / INTEGRATED

- PR #60 D-019 run **`32292888925`**, job **`96197514379`**.
- Validated PR merge ref **`d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`**.
- Validated head `666e4c86df7c6328289d489db7c8eebcb714aad1` over base `a549ce79925aad0cae9e964babd28879e8ad1c15`.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **53 files / 222 tests PASS**.
- Focused `backupService.p10s1.test.ts`: **5/5 PASS**.
- Existing `categoryBackupService.test.ts`: **8/8 PASS**, including same-item historical snapshot rejection.
- Existing backup-v1 and v2/schema4 migration compatibility coverage remained passing.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.
- PR #60 squash-integrated into `develop` as **`71b939b4c938288efb0f3c51e300e5c5541ee8c3`**.
- Validated/integrated tree: **`06d1f8c4582b5dcabd02b633c8597852b1cedfa4`**.

P10-S1-I1 satisfied all exit criteria. No schema, backup-envelope, Vercel, live-store-data, `main` or D-016 change occurred.

## P10-S1-I2 — non-production migration/recovery rehearsal — PASS / DONE

### Candidate identity

The rehearsed candidate was verified independently of browser aliasing:

- Vercel project: `easy-v2`;
- READY deployment: **`dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki`**;
- exact Git SHA: **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**;
- integrated candidate tree: **`8d6479ce00caabce528c6971fbc1034bc1eabbcc`**;
- prior accepted candidate closure D-019: `32294362895` / `96202149317`.

The immutable deployment URL `easy-v2-lvbggu5ji-synapselabia-8285s-projects.vercel.app` requires Vercel SSO for `/backup`. Vercel metadata attaches public alias `easy-v2-tau.vercel.app` to this same deployment, so the public alias was used only as browser access while deployment ID + SHA remained the candidate identity proof.

### Evidence-only PR

PR #62 was created only to run a branch-local remote Playwright rehearsal after normal D-019. It contained no intended product change and was explicitly marked `DO NOT MERGE`.

After evidence capture, PR #62 was **closed without merge**, ensuring no temporary rehearsal config/workflow/test entered `develop`.

### Diagnostic attempt 1 — non-authoritative

- Run **`32297959050`**, job **`96213645569`**.
- Ordinary D-019 passed.
- The remote scenario stopped before application access because the immutable deployment URL redirected `/backup` to Vercel SSO.
- No synthetic backup upload or restore occurred.
- Classification: access-path/harness discovery, not product acceptance evidence.

### Diagnostic attempt 2 — non-authoritative

- Run **`32298286885`**, job **`96214717360`**.
- Ordinary D-019 passed.
- Public alias reached the application and v1 preflight.
- Playwright pointer actionability considered the already visible/enabled Restore button outside the runner viewport, so no restore was dispatched.
- Harness-only mechanics were narrowed to trigger the visible/enabled DOM button handler; product/runtime code was unchanged.
- Classification: harness actionability issue, not product acceptance evidence.

### Authoritative run — PASS

- Run **`32298906351`**, job **`96216688953`**.
- Exact PR merge ref **`b99a11e586c05322c8f6665770135cb8d6047172`**.
- Harness head **`5e5eaea8fbc51bf52c3e5bfc927b6da178082bda`** over candidate base **`2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`**.

Ordinary D-019 passed first:

- ESLint: **0 errors / 82 warnings**.
- Vitest: **53 files / 222 tests PASS**.
- Repository Playwright: **17/17 PASS**.
- Production build: **PASS**.

Then the remote candidate rehearsal passed **1/1**.

### Operational assertions proven by the authoritative remote scenario

Synthetic stable-v1 fixture only; no store data was used.

1. `/backup` loaded on the candidate origin.
2. Initial D-024 recovery state was unknown.
3. Backup-v1 preflight reported v1→v2 in-memory migration.
4. Preflight exposed two unclassified items and one historical order lacking category snapshot, without inventing category history.
5. Restore completed and produced the checkpoint download required by D-018.
6. Normal write attempted before D-024 setup was rejected.
7. Fresh V2 export proved normalized counts: **2 items / 2 resellers / 3 legacy transactions / 0 categories**.
8. Legacy items/resellers normalized active; absent `occurredAt` normalized to historical `createdAt`; historical category fields remained absent.
9. Fresh backup export plus explicit synchronized-copy verification established current recovery health.
10. A migrated active but unclassified item remained blocked from new order creation.
11. A representative category was created and both legacy items classified.
12. A supported new order was recorded.
13. A D-026 audited correction changed the order item and occurrence date while preserving original/replacement linkage.
14. Final V2 export contained **1 category / 2 items / 2 resellers / 5 transactions** and valid correction/reversal links.
15. A disposable fresh browser context preflighted/restored that final V2 backup and re-exported **identical business data**.

### P10-S1-I2 acceptance result

**GO only for defining the next bounded P10-S2 copied-live-data beta gate.**

The rehearsal does not authorize exporting/importing the actual store backup, actual production-data reconciliation, stable `main` publication, canonical URL switch, production cutover or D-016 change.

## P10-S2 copied-live-data beta contract — PASS / ACCEPTED

P10-S2 defined D-028 only. The contract branch moved no live-store data and changed no runtime, schema, backup envelope, deployment configuration, `main` or D-016 topology.

Authoritative contract proof before the QA-ledger evidence-only append:

- PR **#64** D-019 run **`32380195551`**, job **`96461233352`**.
- Validated PR merge ref **`3945e8b2778b6233f6a5af0984bb06084ebfa6cd`**.
- Validated branch head **`13ef59181d2ca1ce916d43c564068e710de3d73f`** over base **`816794694d0a9b6c92da273a81ee745c2f53ecdc`**.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **53 files / 222 tests PASS**.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.

The accepted contract requires exact candidate/deployment identity before export, isolated single-operator handling, no raw/identifiable data in repository evidence, exact structural and zero-cent-tolerance financial reconciliation, D-018/D-024 readiness before beta writes, an explicit rollback baseline, fail-closed NO-GO behavior, minimum disposable beta checks, final fresh-context round-trip and 24-hour disposal of beta-specific copied data.

A P10-S2-I1 PASS may authorize only defining the later production-cutover gate. It does not authorize cutover itself.

## Known non-blocking debt

Existing mocked-select hydration warnings, React `act(...)` warnings, `set-state-in-effect` warnings, dependency audit findings, Actions/runtime deprecation notices, lint warning debt and Vite large-chunk warning remain visible and non-blocking only when the accepted D-019 objective commands pass.
