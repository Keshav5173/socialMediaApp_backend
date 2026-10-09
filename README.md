# Connecto

**A social platform for creators, with built-in live contest leaderboards.**

Connecto lets people share photos and videos, like and comment on posts, and compete for recognition across five automatically-ranked contest categories. Authentication, the social feed and leaderboard scoring all run in one Node.js service backed by MongoDB.

**🔴 Live Demo:** [http://65.2.69.203](http://65.2.69.203) (frontend, backend and database deployed on AWS EC2)

---

## ✨ Features

### 🔐 Secure Authentication
- Sign up, log in and log out with bcrypt-hashed passwords
- JWT access + refresh token rotation, delivered via HTTP-only cookies
- Session-aware profile fetch with credentials never exposed

### 📸 Share Photos & Videos
- Real file uploads through a Multer → Cloudinary pipeline
- Media stored and served through Cloudinary's CDN
- Photo and video posts with captions

### 📰 Smart Feed
- Randomized post sampling so every refresh feels fresh
- Pagination for infinite scroll
- Like counts and "already liked by me" status returned inline, so no extra round trip is needed

### ❤️ Likes & Comments
- Like posts and comments
- Idempotent likes: double-liking is a harmless no-op, not an error
- Comments loaded oldest-first

### 🏆 Live Contest Leaderboards
Five independently computed leaderboards, scoped to **Chhattisgarh-resident** creators (residency is captured at signup):

| Category | What it ranks |
|---|---|
| **Top Creators** | Overall top 3 by a weighted mix of posts, likes and comments |
| **Most Liked Post** | Top 3 posts by like count |
| **Most Commented Post** | Top 3 posts by comment count |
| **Most Active User** | Top 3 by posting + engagement volume |
| **Most Active Contributor** | Top 3 by engagement given (likes + comments made), independent of post count |

### ⚡ Database-Level Scoring
Leaderboards are computed with MongoDB aggregation pipelines, so scoring happens inside the database instead of in application memory. The endpoints stay fast as posts and interactions grow.

### 📤 Raw Engagement Export
A dedicated endpoint exports the full per-post engagement dataset, so any dashboard or analytics client can build additional rankings without new backend work.

---

## 🧱 Tech Stack

- **Runtime:** Node.js + Express 5
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt, HTTP-only cookies
- **Media:** Multer → Cloudinary
- **Deployment:** AWS EC2 (Linux)

---

## 🚀 Getting Started

```bash
npm install
npm start
```

Create a `.env` file with your MongoDB URI, JWT secrets and Cloudinary keys before starting.
