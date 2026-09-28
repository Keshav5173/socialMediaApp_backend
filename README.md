# User Service — Creator Contest Platform

The core social + contest-data service for the EMILO Creator Contest Platform. Built as an independent microservice with its own database, this service owns authentication, the social graph (posts/likes/comments), and a set of live contest leaderboards that a separate Admin Service consumes to run the rewards program.

**🔴 Live Deployment:** Backend + database + frontend are all deployed and running on AWS EC2 — not just local/demo code.
- API base: `http://65.2.69.203:3000/api`
- Frontend: `http://65.2.69.203`
*(Single EC2 instance; if the reviewer is checking this after some time has passed, ping me — instances/IPs can go down or get reassigned.)*

## Why This Architecture
Two services, two databases, zero shared DB access — the User Service and Admin Service only ever talk over a REST API contract. This mirrors how contest/rewards logic is split from core product logic in real social platforms: the User Service can scale independently around read-heavy feed/social traffic, while the Admin Service scales independently around the much lower-throughput, write-light winner/KYC workflow. Adding a third consumer of contest data later (e.g. a public leaderboard page) means adding a new client of the existing API — no schema coupling, no new DB grants.

## Tech Stack
- **Runtime:** Node.js + Express 5
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT (short-lived access token + refresh token), bcrypt password hashing, HTTP-only cookies
- **Media:** Multer for multipart intake → Cloudinary for storage/CDN delivery
- **Deployment:** AWS EC2 (Linux), Node app + MongoDB + frontend co-located

## Features Implemented

**Auth & Profile**
- Signup / login / logout with hashed passwords and JWT access + refresh token rotation
- Session-aware profile fetch (`/viewProfile`)
- Residency captured at signup (`state`/`city`) and used to gate contest eligibility to Chhattisgarh users

**Social Core**
- Post creation with real file upload (not a text URL field) — Multer → Cloudinary pipeline
- Feed with randomized sampling + pagination (`exclude`/`limit`), returning like counts and per-user "already liked" status inline so the frontend doesn't need a second round trip
- Likes (idempotent — double-liking is a no-op, not an error) and comments, with dedicated "already liked?" check endpoints

**Contest Leaderboards — 5 live categories**
Rather than a single generic ranking, the contest module exposes five distinct, independently-computed leaderboards, all scoped to Chhattisgarh-resident creators:

| Category | What it ranks |
|---|---|
| **Top Creators** | Overall top 3 by a weighted mix of posts, likes, and comments |
| **Most Liked Post** | Top 3 posts by raw like count |
| **Most Commented Post** | Top 3 posts by raw comment count |
| **Most Active User** | Top 3 by posting + engagement volume |
| **Most Active Contributor** | Top 3 by engagement given (likes + comments made), independent of post count |

Each is computed via a MongoDB aggregation pipeline (`$lookup` + `$addFields` + `$sort` + `$limit`), so scoring happens in the database rather than pulling documents into application memory — this keeps the endpoints fast even as post/interaction volume grows. A sixth endpoint, `getAllPostData`, exports the full raw per-post engagement dataset for Chhattisgarh users, giving the Admin Service (or any future consumer) everything needed to build additional rankings without a new User Service endpoint.

## Data Model

### `User`
| Field | Type | Notes |
|---|---|---|
| `username` | String | unique, lowercase, indexed |
| `email` | String | unique, lowercase |
| `password` | String | bcrypt-hashed on save |
| `fullName` | String | |
| `state` | String | contest-eligibility gate — `"Chhattisgarh"` residents qualify |
| `city` | String | |
| `coverImage` | String | optional |
| `refereshToken` | String | current refresh token |

### `Post`
| Field | Type | Notes |
|---|---|---|
| `postFile` | String | Cloudinary secure URL |
| `owner` | ObjectId → User | |
| `caption` | String | required |
| `type` | String enum | `"Photo"` \| `"Video"` |
| `size` | String | client-reported file size |

### `Like`
`postId` (→ Post), `owner` (→ User) — double-like guarded at the application level.

### `Comment`
`postId` (→ Post), `owner` (→ User), `content` (String).

## API Endpoints

All routes are mounted under `/api`.

### Auth — `/api/users`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | `{ fullName, username, email, state, city, password }` |
| POST | `/login` | — | sets `accessToken`/`refreshToken` cookies |
| POST | `/logout` | ✅ | clears cookies + stored refresh token |
| POST | `/refreshToken` | — | issues a new token pair |
| GET | `/viewProfile` | ✅ | current user, credentials excluded |

### Posts — `/api/post`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/create-post` | ✅ | multipart, field `post` → Cloudinary |
| GET | `/load-post` | ✅ | randomized feed page with like counts + like status |
| POST | `/create-comment` | ✅ | `{ postId, content }` |
| GET | `/load-comment` | ✅ | `?postId=`, oldest-first |
| POST | `/like-post` | ✅ | `{ postId }`, idempotent |
| GET | `/check-post-like` | ✅ | `?postId=` |
| POST | `/like-comment` | ✅ | `{ commentId }` |
| GET | `/check-comment-like` | ✅ | `?commentId=` |

### Contest / Leaderboards — `/api/contest`
| Method | Route | Category |
|---|---|---|
| GET | `/top3-creater` | Top Creators |
| GET | `/mostlikedpost` | Most Liked Post |
| GET | `/mostcommentpost` | Most Commented Post |
| GET | `/most-active-user` | Most Active User |
| GET | `/most-active-contributer` | Most Active Contributor |
| GET | `/getAllPostData` | Raw engagement export (for Admin Service consumption) |





## Running Locally
```bash
npm install
npm start        # nodemon index.js
```

