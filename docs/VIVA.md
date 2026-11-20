# UniVenture — Viva Preparation Guide

Everything you need to defend this project orally, mapped to the syllabus
(Units 2–5). Each section has **likely questions + the answer you give**, plus
pointers to the exact file so you can show code if asked.

> **Project in one line:** *UniVenture is a collaborative startup-pitching
> platform — a React frontend with an Express REST API backed by MongoDB Atlas,
> secured with JWT authentication.*

---

## 0. Start here — your 45-second introduction

> "UniVenture lets college students post startup pitches, and others can upvote,
> comment, save, and apply to collaborate. The backend is a **REST API built with
> Express (Node.js)**. Data is stored in **MongoDB Atlas**, a cloud NoSQL document
> database, accessed through **Mongoose**. Authentication uses **JWT**, and
> protected routes are guarded by middleware. I also wrote custom **logging** and
> **error-handling** middleware. The API supports full **CRUD** plus advanced
> **query features** — filtering, sorting, pagination, projections, and MongoDB
> operators like `$in`, `$or` and `$elemMatch`."

Then be ready to go deeper on any word you just said.

---

## Architecture & request lifecycle (know this cold)

```
Browser (React)  ──HTTP──►  Express app
                            │
                            ▼
                1. requestLogger   (logs method/url/status/time)
                2. CORS            (allow frontend origin)
                3. express.json()  (parse JSON body)
                4. route match     (e.g. POST /api/startups)
                5. auth middleware (requireAuth / optionalAuth → verify JWT)
                6. route handler   (calls db.js)
                            │
                            ▼
                Mongoose models ──► MongoDB Atlas
                            │
                            ▼
                7. res.json(...)   → back to the browser
                (errors fall through to the error-handling middleware)
```

**Q: Walk me through what happens when a user upvotes a startup.**
> The browser sends `POST /api/startups/startup-002/vote` with the JWT in the
> `Authorization: Bearer` header. `requestLogger` logs it, `requireAuth` verifies
> the token and loads the user, then the handler calls `db.toggleVote(id, userId)`.
> That reads the startup from MongoDB, checks if the user's id is already in the
> `voters` array — if yes it removes it and decrements `votes`, if no it pushes
> and increments — saves the document, and returns the new count and `hasVoted`.
> *(Files: `src/index.js`, `src/auth.js`, `src/db.js`.)*

---

## UNIT 2 — REST API & Express

**Q: What is a REST API?**
> REST (REpresentational State Transfer) is an architectural style for web APIs.
> Clients act on **resources** (like `startups`, `users`) identified by **URLs**,
> using standard **HTTP methods**. It's **stateless** — every request carries all
> the info needed; the server stores no client session between requests.

**Q: What is an API? What is CRUD?**
> An **API** (Application Programming Interface) is a contract that lets two
> programs talk. **CRUD** = Create, Read, Update, Delete — the four basic data
> operations, which map to HTTP methods:

| CRUD | HTTP | UniVenture example |
|------|------|--------------------|
| Create | `POST` | `POST /api/startups` |
| Read   | `GET`  | `GET /api/startups`, `GET /api/startups/:id` |
| Update | `PUT`/`PATCH` | `PATCH /api/requests/:id` (change status) |
| Delete | `DELETE` | `DELETE /api/startups/:id` |

**Q: What is Node.js? What is Express? Why Express?**
> **Node.js** runs JavaScript on the server (outside the browser) using the V8
> engine; it's event-driven and non-blocking. **Express** is a minimal web
> framework for Node. We use it because it makes **routing**, **middleware** and
> request/response handling simple instead of writing raw `http` server code.

**Q: How do you install and start Express?**
> `npm install express`, then `import express` and `const app = express()`.
> In this project you run `npm run dev` (which runs `node --watch src/index.js`).

**Q: What is routing?**
> Mapping an HTTP **method + URL path** to a handler function.
> e.g. `app.get('/api/startups/:id', handler)`. `:id` is a **route parameter**,
> read via `req.params.id`.

**Q: Explain the request and response objects.**
> `req` holds the incoming data — `req.params` (URL params), `req.query` (query
> string like `?sort=votes`), `req.body` (JSON body), `req.headers`. `res` sends
> the reply — `res.status(201).json({...})`.

**Q: What is middleware?**
> A function with signature `(req, res, next)` that runs **between** the request
> arriving and the response being sent. It can inspect/modify req/res, end the
> request, or call `next()` to pass control to the next middleware/handler.

**Q: Explain YOUR logging middleware.** *(src/logger.js)*
> `requestLogger` records a start time, then listens for the response's
> **`finish`** event. When the response is sent, it logs the method, URL, status
> code (colour-coded) and how long it took, then calls `next()` immediately so it
> never blocks the request. It's mounted **first** so it sees every request.

**Q: Explain YOUR error-handling middleware.** *(src/index.js, bottom)*
> It's a special middleware with **four** arguments `(err, req, res, next)` —
> Express recognises that signature as the error handler. It's registered **last**,
> catches anything that throws, logs it, and returns a `500`. Async handlers are
> wrapped in a `wrap()` helper so rejected promises also reach it.

**Q: What was AJAX's role in API history?**
> AJAX (Asynchronous JavaScript and XML) let browsers fetch data in the background
> without reloading the page. It made single-page apps possible and drove the rise
> of JSON REST APIs — which is exactly how the React frontend talks to this API
> via `fetch()`.

---

## UNIT 3 — Database & NoSQL

**Q: What is NoSQL? Why did you choose it?**
> NoSQL = "Not Only SQL" — non-relational databases with flexible schemas built
> to scale horizontally. I chose MongoDB (document NoSQL) because a startup pitch
> is naturally a **nested JSON object** — it has arrays of `tags`, `founders`,
> `comments` — which maps directly to one document, with no joins.

**Q: SQL vs NoSQL?** (one-liner, then the table)
> SQL = fixed schema, tables, joins, vertical scaling, strong ACID. NoSQL =
> flexible schema, documents, horizontal scaling (sharding), often BASE/eventual
> consistency. *(Full table in `UNIT3-NoSQL.md`.)*

**Q: Types of NoSQL databases?**
> Key-Value (Redis), Document (MongoDB), Wide-Column (Cassandra), Graph (Neo4j).

**Q: What is sharding?**
> Horizontal partitioning — splitting data across multiple servers (shards) by a
> **shard key** so the DB scales beyond one machine.

**Q: ACID vs BASE?**
> ACID = Atomicity, Consistency, Isolation, Durability (RDBMS guarantees).
> BASE = Basically Available, Soft state, Eventual consistency (many NoSQL),
> trading strict consistency for availability and scale (CAP theorem).

**Q: Limitations of NoSQL?**
> Looser consistency in some systems, no standard query language, limited joins,
> data duplication from denormalisation.

---

## UNIT 4 — MongoDB

**Q: What is MongoDB? Key features?**
> A document-oriented NoSQL database. Data lives in **collections** of **documents**
> stored as **BSON** (binary JSON). Features: flexible schema, rich query language,
> indexing, replication (high availability), sharding (scale), aggregation.

**Q: Document vs row, Collection vs table?**
> A **document** ≈ a row but is a self-contained JSON object (can nest). A
> **collection** ≈ a table but schema-less.

**Q: What is Mongoose?**
> An **ODM** (Object Data Modeling) library for MongoDB in Node. It lets you define
> **schemas** and **models**, gives validation, and provides a clean API
> (`.find()`, `.create()`, `.save()`). *(src/models.js)*

**Q: How did you connect Node.js to MongoDB?**
> `mongoose.connect(config.mongoUri, { dbName })` in `connectDB()` (src/db.js).
> The URI is my **MongoDB Atlas** connection string, kept in `server/.env` (not in
> git). The server only starts listening *after* the DB connection succeeds.

**Q: What is MongoDB Atlas? What is Compass?**
> **Atlas** is MongoDB's cloud-hosted database service — my cluster runs there.
> **Compass** is the GUI to browse the database and verify documents.
> *(Verification steps in `COMPASS.md`.)*

**Q: Show the basic CRUD commands in Mongoose.**
> - Create: `Startup.create({...})` / `insertMany([...])`
> - Read: `Startup.find(filter)`, `Startup.findById(id)`
> - Update: `Startup.updateOne({_id:id}, {$inc:{views:1}})`, `findByIdAndUpdate`
> - Delete: `Startup.deleteOne({_id:id})`

**Q: Why does the server start only after connecting?**
> Because the routes need the DB. `connectDB().then(() => app.listen(...))` ensures
> we don't accept requests we can't serve; if the connection fails we exit.

**Q: What's an in-memory store, and how does this relate?**
> An in-memory store keeps data in RAM (like a JS array/Map) — fast but lost on
> restart. The syllabus task is migrating that to MongoDB so data **persists**.
> This project did exactly that kind of migration (from a file DB to MongoDB).

---

## UNIT 5 — Read & Query Operations + JWT

> All of this is live on `GET /api/startups`. Examples: `server/QUERIES.md`.

**Q: Comparison operators you used?**
> `$eq` (exact domain), `$in` (any of several domains/tags), `$gte`/`$lte`
> (vote and funding ranges).

**Q: Logical operators?**
> `$and` combines all my filter conditions; `$or` powers the text search across
> title/tagline/problem/solution.

**Q: How do you query arrays?**
> `tags` is an array. `{ tags: { $in: [...] } }` = has any; `{ tags: { $all: [...] } }`
> = has all; `{ rolesNeeded: "Developer" }` = array contains that element.

**Q: How do you query nested / embedded documents?**
> `founders` is an **array of embedded documents**. `$elemMatch` finds a startup
> where **one** founder matches multiple criteria at once:
> `{ founders: { $elemMatch: { college: "IIT Kanpur", role: "CTO" } } }`.
> You can also use **dot notation**: `{ "founders.college": "IIT Delhi" }`.

**Q: What is a projection?**
> Choosing which fields to return. `?fields=title,votes` → Mongoose
> `.find(filter, { title:1, votes:1 })`. Reduces payload size.

**Q: How does sorting and pagination work?**
> Sort: `.sort({ votes: -1 })` (-1 desc, 1 asc). Pagination: **skip/limit** —
> `page` and `limit` params compute `skip = (page-1)*limit`, then
> `.skip(skip).limit(limit)`. I also return `total`, `pages`, `hasNext`.

**Q: What is JWT? How does your auth work?**
> **JWT** (JSON Web Token) is a signed token that carries claims. On login I verify
> the password (bcrypt) and `jwt.sign({ sub: userId }, secret, { expiresIn:'7d' })`.
> The client sends it back as `Authorization: Bearer <token>`. `requireAuth`
> middleware does `jwt.verify`, loads the user, and attaches `req.user`; if the
> token is missing/invalid it returns **401**. *(src/auth.js)*

**Q: requireAuth vs optionalAuth?**
> `requireAuth` **blocks** with 401 if there's no valid token (used for voting,
> posting). `optionalAuth` attaches the user **if** a token is present but never
> blocks — used on public lists so logged-in users also get their `hasVoted` flags.

**Q: How are passwords stored?**
> Hashed with **bcrypt** (`bcrypt.hashSync(password, 10)` — 10 salt rounds). I
> never store plain passwords; login compares with `bcrypt.compareSync`.

**Q: Is JWT encryption?**
> No — a standard JWT is **signed**, not encrypted. The payload is only
> base64-encoded (readable), but the signature prevents tampering. So never put
> secrets in it; I only put the user id.

---

## Project-specific deep-dive (they often ask these)

**Q: Why do your documents have string `_id`s like "startup-001"?**
> To stay compatible with the original frontend and seed data. MongoDB normally
> uses `ObjectId`, but `_id` can be any unique value, so I set human-readable ids.

**Q: Why embed comments/founders instead of separate collections?**
> They're always read together with the startup and belong to it. Embedding means
> one query fetches everything — no joins. This is the document-model advantage.

**Q: How do you track who voted without a join table?**
> Each startup has a `voters` array of user ids. `hasVoted` = does that array
> include the current user's id. The `votes` number is the display count.

**Q: Where are secrets kept? Is the DB password in git?**
> No. The Atlas URI and JWT secret live in `server/.env`, which is in `.gitignore`.
> `.env.example` shows the format without real values.

**Q: What is CORS and why is it configured?**
> Cross-Origin Resource Sharing. The React dev server (port 5173) and API (port
> 4000) are different origins, so the browser blocks requests unless the API sends
> CORS headers. `app.use(cors({ origin: clientOrigins }))` allows the frontend.

**Q: What status codes do you return?**
> 200 OK, 201 Created (new startup/comment), 400 Bad Request (validation), 401
> Unauthorized (no/invalid token), 403 Forbidden (deleting someone else's startup),
> 404 Not Found, 500 Internal Server Error.

**Q: How did you migrate from SQLite to MongoDB?**
> The data layer was isolated in `db.js` with repository functions. I rewrote that
> file to use Mongoose models instead of SQL, kept the **same function names and
> response shapes**, made the handlers `async/await`, and reseeded into Atlas — so
> the frontend needed zero changes.

---

## Quick-fire definitions (rapid round)

- **REST** — stateless architecture for resource-based web APIs over HTTP.
- **Middleware** — `(req,res,next)` function in the request pipeline.
- **Endpoint** — a specific URL + method the API exposes.
- **Schema** — the shape/rules for a document (Mongoose).
- **Model** — the object you use to query a collection.
- **BSON** — binary JSON, MongoDB's storage format.
- **ODM** — Object Data Modeling (Mongoose) ≈ ORM for documents.
- **JWT** — signed token for stateless auth.
- **bcrypt** — password-hashing algorithm with salting.
- **Projection** — selecting which fields a query returns.
- **Sharding** — splitting data across servers to scale horizontally.
- **Seeding** — loading initial data into the database.

---

## Live demo script (if asked to run it)

```bash
cd server
npm run dev                      # starts API on :4000, connects to Atlas
# in another terminal:
curl http://localhost:4000/api/health
curl "http://localhost:4000/api/startups?domain=FinTech"
curl "http://localhost:4000/api/startups?tags=AI,B2C&tagsMatch=all"
curl "http://localhost:4000/api/startups?founderCollege=IIT%20Delhi"
curl "http://localhost:4000/api/startups?sort=votes&order=desc&page=1&limit=3"
```
Then open **Compass** and show the same data / run the same filters.

---

## Most likely "gotcha" follow-ups — have an answer ready

1. *Why not SQL for this?* → nested, evolving data; document model fits.
2. *What if two users vote at once?* → each reads/writes its own id in `voters`;
   for very high concurrency I'd use an atomic `$addToSet`/`$pull` update.
3. *How do you scale this?* → Atlas replication now; sharding by `_id`/`domain`
   later; add indexes on filtered fields (`domain`, `votes`).
4. *Is the token safe in localStorage?* → it's signed and expires in 7 days;
   for production I'd consider httpOnly cookies to reduce XSS risk.
5. *What happens if MongoDB is down?* → `connectDB()` rejects and the server
   exits with an error instead of serving broken requests.
