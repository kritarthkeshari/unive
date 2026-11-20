# Verifying the Database with MongoDB Compass

MongoDB Compass is the official GUI for browsing a MongoDB database. This guide
shows how to connect it to the UniVenture Atlas cluster and verify that the API's
writes actually land in the database — the verification step asked for in Unit 4.

---

## 1. Install & connect

1. Download **MongoDB Compass** from <https://www.mongodb.com/products/compass>.
2. Open Compass → **New Connection**.
3. Paste the **same connection string** used by the server (the `MONGODB_URI`
   value in `server/.env`), for example:
   ```
   mongodb+srv://<user>:<password>@cluster0.ezndokd.mongodb.net/
   ```
4. Click **Connect**.

> Tip: if Compass can't connect, check that your current IP is allowed under
> Atlas → **Network Access** (add `0.0.0.0/0` for development).

---

## 2. Find the database and collections

- In the left sidebar, open the **`univenture`** database.
- You should see four collections (Mongoose pluralises the model names):

| Model (`src/models.js`) | Collection in Compass |
|-------------------------|-----------------------|
| `User`    | `users` |
| `Startup` | `startups` |
| `Request` | `requests` |
| `Activity`| `activities` |

After seeding (`npm run seed:force`) you should see **1 user**, **12 startups**,
**3 requests**, and **5 activities**.

---

## 3. Verify documents & nested structure

1. Open the **`startups`** collection → **Documents** tab.
2. Expand `startup-001` ("EduBot AI"). Confirm the nested shape:
   - `tags`, `rolesNeeded`, `voters` → arrays
   - `founders`, `comments` → arrays of embedded documents
3. Open the **`users`** collection and confirm the demo user `user-001`
   (`ayush@univenture.com`) stores a **bcrypt `passwordHash`**, not a plain
   password.

---

## 4. Verify that API writes persist

This proves the full path **Node.js → MongoDB** works end to end.

1. Start the server: `npm run dev` (from `server/`).
2. Log in and cast a vote (replace `<TOKEN>` with the login token):
   ```bash
   # login
   curl -s -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"ayush@univenture.com","password":"password123"}'

   # vote on startup-002
   curl -s -X POST http://localhost:4000/api/startups/startup-002/vote \
     -H "Authorization: Bearer <TOKEN>"
   ```
3. In Compass, open `startups` → `startup-002` and click **Refresh (⟳)**.
   - `votes` increased by 1.
   - `voters` now contains `"user-001"`.
4. Add a comment via the API, refresh in Compass, and watch a new object appear
   inside that startup's `comments` array.

---

## 5. Run queries inside Compass (optional)

Compass has a **Filter** bar that takes the same MongoDB query documents the API
builds. Paste these into the `startups` collection filter box:

```js
// comparison + logical ($and is implicit between fields)
{ domain: "FinTech", votes: { $gte: 100 } }

// $in across multiple domains
{ domain: { $in: ["EdTech", "CleanTech"] } }

// array: has ALL of these tags
{ tags: { $all: ["AI", "B2C"] } }

// nested array of embedded docs: a founder from IIT Delhi
{ founders: { $elemMatch: { college: "IIT Delhi" } } }

// $or free-text (regex)
{ $or: [ { title: /solar/i }, { problem: /solar/i } ] }
```

Use the **Sort** box (e.g. `{ votes: -1 }`) and the **Project** box
(e.g. `{ title: 1, votes: 1 }`) to mirror the API's sort and projection features.

The equivalent HTTP calls for every one of these are in
[`../server/QUERIES.md`](../server/QUERIES.md).
