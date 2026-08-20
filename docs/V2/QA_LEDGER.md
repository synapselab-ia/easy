# Easy V2 — QA Ledger

**Updated:** 2026-08-20

D-019 remains the mandatory repository integration/publication gate:

```text
npm run qa:critical
= npm run lint
+ npm run test:run
+ npm run test:e2e
+ npm run build
```

Objective failures block integration. Supabase-bearing implementation gates additionally require database/policy tests and Supabase advisor review; repository D-019 remains necessary but is not sufficient by itself for cloud-production acceptance.

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

- D-025 contract: `32185226251` / `95867186002`; PR #44.
- I1 persistence/migration/backup: `32191707306` / `95887236403`; PR #45.
- I2 lifecycle/classification/order snapshots: `32202876262` / `95920142630`; PR #46; closure #47.
- I3 category reporting: `32262877105` / `96100129962`; 51 files / 210 Vitest PASS; 17/17 Playwright PASS; build PASS; PR #48.

## P9-S4 accepted validation

- evidence/source gate: `32265612927` / `96109244644`; PR #50 integrated as `35a2e0d7495791dfda7f02e045067a85bad4aed9`.
- D-026 decision gate: `32277770945` / `96149101495`; PR #52 integrated as `51f7ffae46432e0b82a696c1ebc07c275d733ed4`.
- P9-S4-I1: PR #54 D-019 `32285620846` / `96174326588`; validated merge ref `4b51a5f35c2104d636903ce89eecbc995a0f3ce3`; 0 lint errors / 82 warnings; 52 files / 216 Vitest PASS; 17/17 Playwright PASS; build PASS; integrated as `f1cfd126c18691da1256a1d3f918158d7aa9495a`, tree `5679693b5f588f58404050cfca8ffd17a9a49fb3`.

## P9-S5 occurrence-date usability — PASS / INTEGRATED

Source verification established that the normal transaction form already defaults financial occurrence to browser-local today, exposes it in the primary entry block, permits pre-save editing and persists `occurredAt` independently from generated `createdAt`.

- PR #56 D-019 `32287018048` / `96178850066`.
- validated merge ref `9459285920cfbd784a652e9db97cf40741977edf`.
- 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; build PASS.
- integrated as `88c70a20071bd97ef3a08285128756e2ce484a74`, tree `97a78d3e4d78a54ad117440c160920343513ba9f`.
- canonical P9 closure integrated as `88224b9f4bc2f1df37ed5bbb999f5d260f3acd3a`.

## P10-S1 pre-cutover contract — PASS / INTEGRATED

D-027 established fail-closed non-production sequencing before any live-store data movement.

- PR #58 D-019 `32290159119` / `96188851730`.
- validated merge ref `dbacda8893c6d1073ba130440ef5bcc6ab11af75`.
- 0 lint errors / 82 warnings; 52 files / 217 Vitest PASS; 17/17 Playwright PASS; build PASS.
- integrated as `5c7a5dc23af435711059deff75cf7862972662a1`, tree `6afb4e77eecb97d2092d209b12c054ce2b1952db`.

## P10-S1-I1 backup/correction compatibility

Initial D-019 `32292405631` / `96196002726` correctly failed one D-025 same-item historical category-snapshot regression after the first implementation over-relaxed correction-pair validation. The implementation was narrowed rather than weakening D-025.

Authoritative acceptance:

- PR #60 D-019 `32292888925` / `96197514379`.
- validated merge ref `d3165a79d98e4ecde08d894ec2bd6a2bab882b4d`.
- validated head `666e4c86df7c6328289d489db7c8eebcb714aad1` over base `a549ce79925aad0cae9e964babd28879e8ad1c15`.
- 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; focused P10-S1 tests 5/5; existing category backup tests 8/8; 17/17 Playwright PASS; build PASS.
- integrated as `71b939b4c938288efb0f3c51e300e5c5541ee8c3`, tree `06d1f8c4582b5dcabd02b633c8597852b1cedfa4`.

No schema, backup-envelope or live-store-data change occurred.

## P10-S1-I2 synthetic migration/recovery rehearsal — PASS

Candidate identity:

- Vercel deployment `dpl_EPD3vYXKC7smebtn7GZ5syiYJ8ki` — READY;
- Git SHA `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`;
- tree `8d6479ce00caabce528c6971fbc1034bc1eabbcc`;
- prior candidate closure D-019 `32294362895` / `96202149317`.

Evidence-only PR #62 was deliberately closed without merge. Diagnostic runs `32297959050` / `96213645569` and `32298286885` / `96214717360` identified only access/harness issues and are non-authoritative.

Authoritative run:

- `32298906351` / `96216688953`;
- exact PR merge ref `b99a11e586c05322c8f6665770135cb8d6047172`;
- harness head `5e5eaea8fbc51bf52c3e5bfc927b6da178082bda` over candidate base `2b6c1e5f4e58790c9c805fed8cadda3484acfa0e`;
- normal D-019 passed: 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 repository Playwright PASS; build PASS;
- remote synthetic candidate scenario then passed 1/1.

Using synthetic stable-v1 data only, the scenario proved accepted v1→v2 normalization, no invented category history, restore/checkpoint, D-024 write blocking/setup, fresh backup/recovery verification, unclassified-item blocking, representative classification, order + D-026 correction, V2 export and fresh-context identical business-data round-trip.

**Result:** evidence supported defining P10-S2 only; no actual store backup was used.

P10-S1 canonical closure: PR #63 D-019 `32299844759` / `96219639912`, merge ref `ee08bf5a8682ad9ba06e52368f2ac422d401d080`; integrated as `816794694d0a9b6c92da273a81ee745c2f53ecdc`, tree `417dd4097144d9f69124161b34747b3e81244ae7`.

## P10-S2 copied-live-data beta contract — PASS / ACCEPTED HISTORICALLY

D-028 defined an isolated disposable IndexedDB beta with exact candidate identity, copied-data handling, structural/zero-cent-tolerance financial reconciliation, D-018/D-024 readiness, rollback baseline, minimum beta mutations, final fresh-context round-trip and 24-hour disposal.

Authoritative contract proof before its QA-ledger evidence append:

- PR #64 D-019 `32380195551` / `96461233352`.
- validated merge ref `3945e8b2778b6233f6a5af0984bb06084ebfa6cd`.
- validated branch head `13ef59181d2ca1ce916d43c564068e710de3d73f` over base `816794694d0a9b6c92da273a81ee745c2f53ecdc`.
- 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; build PASS.
- final PR-head D-019 `32380528003` / `96462340384` passed.
- integrated as `4fe31b4ca09a4b89a5cf76e3d31765c0d59abee3`, tree `2ab1e7b476ef620cf067faecd7c996fcf362c88a`.

D-029 later supersedes resuming this IndexedDB real-data beta route; D-028 remains historical safety evidence.

## P10-S2-I1 pre-export execution — FAIL-CLOSED NO-GO / LATER SUPERSEDED

P10-S2-I1 executed only the D-028 pre-export gate. Candidate/deployment identity passed, but operator-local browser isolation and D-024 recovery-location proof remained unavailable remotely, so execution stopped before any live-store backup moved.

Substantive documentation proof:

- PR #65 D-019 `32382362960` / `96468435138`.
- validated merge ref `b72bd60542fecc06fc28748aba8e216a55928029`.
- validated branch head `2bd4d18cea9a8419749443bb1dadf5850706814d` over base `4fe31b4ca09a4b89a5cf76e3d31765c0d59abee3`.
- 0 lint errors / 82 warnings; 53 files / 222 Vitest PASS; 17/17 Playwright PASS; build PASS.
- final D-019 `32382928429` / `96470305608` passed on merge ref `af01a7f8ac280305f5ff86c06416127321580ec2`.
- PR #65 integrated as `e06c659ecdb3aee79e2e451b00eb85d63c8b8612`, tree `4da05cdda530b1e7000d01460201dff1daf65910`.

Data boundary:

- live-store backup exported for beta: **NO**;
- live-store backup imported into V2: **NO**;
- copied real data entered GitHub/chat/CI/docs: **NO**;
- real-data beta artifacts/IndexedDB created: **NO**;
- D-028 24-hour disposal clock: **NOT STARTED / NOT APPLICABLE**.

Detailed record: `docs/V2/P10_S2_I1_EXECUTION.md`.

## D-029 / P10-S3 architecture redirect — PASS / INTEGRATED

D-029 changes only the accepted **future persistence architecture**. It reopens/supersedes D-016 for final production persistence, selects Supabase/Postgres as canonical final datastore and Vercel as final frontend host, retains manual/logical Easy backup as independent secondary protection, and keeps the current stable/D-024 boundary in place until cloud cutover.

The architecture gate also requires Auth + RLS, publishable-key-only client configuration, one server/database transaction boundary for D-013/D-026 correction/reversal, no first-pass offline multi-master writes, a dedicated Easy Supabase project and synthetic-only foundation proof before any real-data import.

Authoritative substantive documentation proof **before this QA-ledger evidence-only append**:

- PR **#66** D-019 run **`32385468857`**, job **`96478768306`**.
- Exact validated PR merge ref **`a488e5f60ea975c360aff0fb72aa5be2a2e8f064`**.
- Validated branch head **`041920af7453d124484b873ef172aaee573ffc0b`** over base **`e06c659ecdb3aee79e2e451b00eb85d63c8b8612`**.
- ESLint: **0 errors / 82 warnings**.
- Vitest: **53 files / 222 tests PASS**.
- Playwright: **17/17 PASS**.
- Production build: **PASS**.

Scope proof:

- substantive D-029 diff contained only canonical `docs/V2/` files;
- no runtime, dependency, schema, workflow or deployment configuration changed;
- no Supabase project/schema/client implementation was created by this architecture gate;
- no real store data moved;
- `main`, stable publication and canonical URL remained untouched;
- P10-S2-I1 becomes `ABANDONED / SUPERSEDED BEFORE EXPORT` only because the final persistence route changed before data movement;
- P10-S3-I1 synthetic Supabase foundation is the next bounded action and is not executed by D-029 acceptance itself.

Final D-019 `32386064578` / `96480732008` passed on exact validated merge ref `2d6936cd8f74d2205f1c0b0a2f696287b66ae2dc`. PR #66 squash-integrated to `develop` as `0e054bc5e640c35ce567ccd710d9574cf1a93454`, tree `fe92fb0626449ba30456e85f37152e43f1faf864`. No real store data moved and `main` remained untouched.

## Known non-blocking debt

## P10-S3-I1 Supabase foundation — PASS / ACCEPTED

P10-S3-I1 used synthetic data only against dedicated project `easy-v2` (`hrmkkhqfyfoqucwbcszq`) in `sa-east-1`. Live/repository migrations are `20260820154034_p10_s3_i1_foundation` and `20260820154402_harden_transaction_rpc_boundary`.

Database/security proof:

- RLS enabled on `easy_operators`, `categories`, `items`, `resellers`, `transactions`;
- `anon` has no application-table grant; authenticated category/item/reseller CRUD requires approved-operator RLS; transaction direct DML is SELECT-only;
- synthetic authorized UUID passed the allow-list predicate; unauthorized UUID saw no rows and could not call financial mutations;
- public financial RPC wrappers are invoker functions; privileged implementations are confined to the non-exposed `private` schema with explicit operator assertion;
- changed-item correction captured replacement-time snapshot; same-item correction preserved historical D-025 category snapshot;
- intentionally invalid correction rolled back atomically with no partial reversal/link;
- final Security Advisor: **0 lints**;
- Performance Advisor: INFO-only `unused_index` notices expected on the empty/tiny synthetic dataset;
- synthetic cleanup verified 0 rows in all five application/authorization tables.

Repository validation:

- diagnostic D-019 `32388839983` / `96489804473` correctly blocked TS2559 in the new Supabase env typing after lint (0/82), Vitest (54/225) and Playwright (17/17) had passed;
- minimal explicit-env-boundary fix committed as `3f1f49c002c3c1a8531181ec66e995e7f753da8e`;
- authoritative substantive D-019 **`32394126648`** / **`96506890991`** passed on exact PR merge ref **`c12a535b665eb25626a1b3bb0aa15cd034808e00`**: 0 lint errors / 82 warnings; 54 files / 225 Vitest PASS; 17/17 Playwright PASS; production build PASS.

Data/cutover boundary: no real store data, real operator cutover, `main` publication, canonical URL switch or production cutover occurred. Current user-facing runtime remains Dexie. Detailed evidence: `docs/V2/P10_S3_I1_EXECUTION.md`.


Existing mocked-select hydration warnings, React `act(...)` warnings, `set-state-in-effect` warnings, dependency audit findings, Actions/runtime deprecation notices, lint warning debt and Vite large-chunk warning remain visible and non-blocking only when the accepted D-019 objective commands pass.
