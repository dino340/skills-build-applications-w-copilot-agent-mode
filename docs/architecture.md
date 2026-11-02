# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep React pages focused on rendering and user interaction. Use the shared API client with relative `/api` paths; each capability page must expose accessible loading, empty, and error states and must not access persistence directly.
- Logic tier decision: Keep request validation, business rules, and response shaping in the Express API. Validate request fields and referenced IDs before database operations, return deliberate 4xx responses for invalid or missing resources, and do not add authentication.
- Data tier decision: Define required fields, references, and defaults in the Mongoose models. Keep seed data representative and idempotent, updating only the seeded records and preserving unrelated data.
- Activity tracking approach: Validate activity type, positive minutes, and well-formed IDs that reference an existing user and team. Compute points on the server with one deterministic rule, store them with the submitted references and activity details, and set `occurredAt` when the activity is created.
- Team management approach: List and create teams with their name, mascot, and member references. Reject a missing name with `400`, and keep the member list defaulted to an empty array.
- Leaderboard approach: Sum stored activity points by team, sort from highest total to lowest, and return `teamName`, `totalPoints`, and sequential 1-based ranks.
- Workout suggestions approach: Find the user by email, then rank available workouts using the user's fitness goal and recent activity. Include an explanatory reason for each suggestion, ensure the first suggestion matches the goal or recent activity, and return a deliberate 4xx when no user matches.

## Test plan

Run the focused contract tests while implementing each tier, then run both builds. Baseline on the starter branch:

- Data tier: `npm run test:data --prefix octofit-tracker/backend` — 4 of 5 tests fail because required user, team, activity, and workout schema validation is missing; the idempotent seed test passes.
- API tier: `npm run test:api --prefix octofit-tracker/backend` — all 4 tests fail: invalid activity/team input returns `501` rather than `400`, the leaderboard is empty, and suggestions do not match the user's goal/activity. These failures indicate incomplete route behavior and business logic.
- Presentation tier: `npm test --prefix octofit-tracker/frontend` — all 15 tests fail. The pages do not yet satisfy API-data rendering, user-specific suggestion requests, or the accessible loading, empty, and error-state contracts.
- Backend build: `npm run build --prefix octofit-tracker/backend` — passes on the baseline; rerun after implementation to catch TypeScript errors.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` — passes on the baseline; rerun after implementation to verify type-checking and production bundling.

Implementation order: make the data contract tests pass first, then the API contract tests, then the frontend contract tests. Finish by rerunning all three test commands and both builds.
