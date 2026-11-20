# UniVenture — Backend API

A small REST API for the UniVenture pitching platform. Built with **Express** and
**MongoDB** via [Mongoose](https://mongoosejs.com/). Passwords are hashed with
bcrypt and sessions use JWTs.

## Requirements

- Node.js 18+ (tested on Node 24).
- A reachable MongoDB instance — either a local server
  (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas cluster.

## Setup

```bash
cd server
npm install
```

Create a `.env` file (copy `.env.example`) and set your connection string:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=univenture
```

If `MONGODB_URI` is unset it falls back to a local MongoDB at
`mongodb://127.0.0.1:27017/univenture`.

```bash
npm start          # http://localhost:4000
```

On first start, if the collections are empty they are seeded with the same 12
startups, demo user, requests, and activity the frontend shipped with.

Scripts:

- `npm start` — run the server
- `npm run dev` — run with `--watch` (auto-restart on changes)
- `npm run seed` — seed only if empty
- `npm run seed:force` — wipe and reseed (also `npm run seed -- --force`)

Configuration (all optional except the connection string — see `.env.example`):
`PORT`, `JWT_SECRET`, `MONGODB_URI`, `MONGODB_DB`, `CLIENT_ORIGIN`.

## Demo account

```
email:    ayush@univenture.com
password: password123
```

## API

Auth is a Bearer token: `Authorization: Bearer <token>`. `GET` endpoints are public;
mutations require a token.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | — | Create account → `{ token, user }` |
| POST | `/api/auth/login` | — | Log in → `{ token, user }` |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/users/:id` | — | Public user profile |
| GET | `/api/startups` | optional | List startups (+ `hasVoted`/`isSaved` when authed) |
| GET | `/api/startups/:id` | optional | One startup (increments views) |
| POST | `/api/startups` | ✓ | Create a pitch |
| DELETE | `/api/startups/:id` | ✓ | Delete own pitch |
| POST | `/api/startups/:id/vote` | ✓ | Toggle upvote → `{ votes, hasVoted }` |
| POST | `/api/startups/:id/save` | ✓ | Toggle save → `{ saved, saves }` |
| POST | `/api/startups/:id/comments` | ✓ | Add a comment |
| POST | `/api/startups/:id/apply` | ✓ | Apply for a role (creates a request) |
| GET | `/api/requests` | ✓ | Collaboration requests |
| PATCH | `/api/requests/:id` | ✓ | Update request status |
| GET | `/api/activity` | ✓ | Activity feed |
| GET | `/api/health` | — | Health check |

## Project layout

```
server/
  src/
    index.js      Express app + routes
    db.js         Mongoose connection + repository helpers
    models.js     Mongoose schemas/models
    seedData.js   Initial data
    seed.js       Standalone seed script
    auth.js       JWT + auth middleware
    config.js     Environment config
```
