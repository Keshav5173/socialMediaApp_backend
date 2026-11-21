# Connecto: User Service

**A social platform for creators, with real-time chat, video calls and live contest leaderboards.**

Connecto lets people share photos and videos, like and comment on posts, chat with friends, make video calls, and compete across five automatically-ranked contest categories. This repository is the **User Service**, one part of a microservice architecture.

**🔴 Live Demo:** [https://connectoo.duckdns.org](https://connectoo.duckdns.org) (served over HTTPS from AWS EC2)

---

## 🏗️ Architecture

Connecto is split into independent services:

| Service | Responsibility |
|---|---|
| **User Service** (this repo) | Auth, profiles, posts, feed, likes, comments, friends, real-time chat, video call signaling, leaderboards |
| **Admin Service** | Admin dashboard API: manage every user and every post (view, search, moderate, delete) |
| **Frontend** | React client that talks to both services |

Nginx sits in front on EC2: it serves the frontend build, terminates HTTPS, and proxies `/api/` and `/socket.io/` to the Node.js service.

```
Browser ──HTTPS──► Nginx ──┬── /            → React build (static)
                           ├── /api/        → User Service (Express, :3000)
                           └── /socket.io/  → User Service (Socket.IO)
```

---

## ✨ Features

### 🔐 Secure Authentication
- Sign up, log in and log out with bcrypt-hashed passwords
- JWT access + refresh token rotation delivered through cookies
- Socket connections are authenticated with the same JWT cookie

### 📸 Share Photos & Videos
- File uploads through a Multer → Cloudinary pipeline, served from Cloudinary's CDN
- Photo and video posts with captions

### 📰 Smart Feed
- Randomized post sampling so every refresh feels fresh
- Pagination for infinite scroll
- Like counts and "already liked by me" status returned inline

### ❤️ Likes & Comments
- Like posts and comments
- Idempotent likes: double-liking is a harmless no-op
- Comments loaded oldest-first

### 👥 Friends & Real-Time Chat
- Add friends by searching usernames
- One-to-one chat over Socket.IO with delivery acknowledgements
- Text, image, video and document messages (up to 25 MB, only accepted from your own Cloudinary account)
- Messages are saved to MongoDB, and only friends can message each other
- Multi-tab and multi-device delivery through per-user rooms
- Live online-users list

### 📹 Video & Voice Calls
- WebRTC peer-to-peer calls with Socket.IO signaling (offer, answer, ICE candidates)
- Incoming-call ringing, accept, reject and end
- Voice-only and video calls

### 🏆 Live Contest Leaderboards
Five independently computed leaderboards, scoped to **Chhattisgarh-resident** creators:

| Category | What it ranks |
|---|---|
| **Top Creators** | Overall top 3 by a weighted mix of posts, likes and comments |
| **Most Liked Post** | Top 3 posts by like count |
| **Most Commented Post** | Top 3 posts by comment count |
| **Most Active User** | Top 3 by posting + engagement volume |
| **Most Active Contributor** | Top 3 by engagement given (likes + comments made) |

Leaderboards are computed with MongoDB aggregation pipelines, so scoring happens inside the database.

### 📤 Raw Engagement Export
A dedicated endpoint exports the full per-post engagement dataset for dashboards and analytics clients.

---

## 🧱 Tech Stack

- **Runtime:** Node.js + Express 5
- **Real-time:** Socket.IO, WebRTC signaling
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt, cookies
- **Media:** Multer → Cloudinary
- **Deployment:** AWS EC2 (Amazon Linux), Nginx, Let's Encrypt (Certbot), DuckDNS

---



## 🚀 Getting Started

```bash
npm install
npm start
```

Create a `.env` file:

```env
PORT=2000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=https://connectoo.duckdns.org   # use http://localhost:5173 locally
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Never commit `.env`.

---

## ☁️ Deployment Notes

- Behind Nginx, set `app.set("trust proxy", 1)` in Express.
- The Nginx config must proxy `/socket.io/` with the `Upgrade` and `Connection` headers for WebSockets.
- `getUserMedia` (camera and microphone) only works over HTTPS, so HTTPS is required for calls.
- Auth cookies are set with `secure: true` and `sameSite: "strict"`.
- Restart after changing `.env`: `pm2 restart all --update-env`.


## 🔗 Related

**🔴 Live:** [https://connectoo.duckdns.org](https://connectoo.duckdns.org)


Made with ❤️ by Keshav Bhardwaj