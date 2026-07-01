# Copilot Prompt — CoreClip Bug Fix (Credits/Subscription + AI Integration)

---

## ROLE

You are debugging a specific, scoped part of an existing production-structure codebase (CoreClip.ai — MERN + TypeScript + Clerk + Cloudinary + Google GenAI). Do NOT refactor, redesign, rename, or "improve" anything outside the exact scope below. Do not touch UI styling, unrelated routes, or files not listed.

## PROJECT CONTEXT (for reference only — don't re-derive this)

- Backend: Express + TypeScript + Mongoose (MongoDB)
- Auth/Billing: Clerk (`@clerk/express`), plans handled via Clerk webhooks
- AI: `@google/genai` — image model `gemini-3-pro-image-preview`, video model `veo-3.1-generate-preview`
- Credit system: Free = 20 (or 40, confirm in code) credits/mo, Pro = 200, Premium = unlimited. Image gen = 5 credits, Video gen = 10 credits, refund on generation failure.
- Relevant models: `User` (fields: id, email, credits), `Project` (fields: isGenerating, isPublished, error, etc.)
- Relevant controllers: `userController.ts`, `projectController.ts`, `clerk.ts` (webhook handler for `user.created`, `user.updated`, `paymentAttempt.updated`)

## SCOPE — ONLY these files/areas

1. `server/controllers/projectController.ts` — `createProject`, `createVideo` (credit deduction + AI calls)
2. `server/controllers/clerk.ts` — webhook handling for plan/credit assignment
3. `server/models/User.ts` and `server/models/Project.ts` — schema fields tied to credits/plan/generation state
4. `server/configs/` — any AI client config (API key, model names)
5. `client/src/pages/Plans.tsx` and any plan-selection/checkout component
6. `.env` / `.env.example` — variable names only (do not print secret values)

Do not open or modify any file outside this list unless a fix genuinely requires it — if so, state why before editing.

## KNOWN SYMPTOMS (fill in real details)

### Bug 1 — Credits/Subscription

- Exact error message / stack trace: `[PASTE ERROR HERE]`
- Where it happens (endpoint, button, or webhook event): `[PASTE]`
- Expected behavior vs actual behavior: `[PASTE]`
- Relevant server log lines around the failure: `[PASTE]`

### Bug 2 — AI Integration

- Exact error message / stack trace: `[PASTE ERROR HERE]`
- Is this happening on image generation, video generation, or both: `[PASTE]`
- HTTP status code returned by Google GenAI (e.g. 429, 401, 403, 400): `[PASTE]`
- Confirm: is billing enabled on the Google Cloud project tied to `GOOGLE_CLOUD_API_KEY`? `[YES/NO/UNSURE]`

## TASK

1. First, just read the SCOPE files listed above and the two error traces. Do not run a full repo scan.
2. Identify root cause for each bug separately. State the root cause in one sentence before writing any fix.
3. Propose the smallest possible diff that fixes each bug — no unrelated cleanup, no touching working code.
4. If Bug 2 turns out to be a billing/quota issue rather than a code bug, say so explicitly and suggest free-tier-compatible alternatives (e.g. Gemini's free-tier image models, or an open-source/free video generation API) instead of writing code that can't work without billing.
5. After proposing fixes, list exactly which files you changed and why — nothing else.

## CONSTRAINTS

- No token-heavy exploratory reading of the whole repo — stay inside SCOPE.
- No new dependencies unless strictly required to fix the bug (state why if so).
- Preserve existing code style and patterns already used in the file.
- If credit deduction has a race condition (e.g. deduct-then-generate vs generate-then-deduct), flag it explicitly even if not the reported bug, since it's a common source of both symptom categories.
