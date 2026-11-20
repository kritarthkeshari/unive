# MongoDB Query API — Cheat Sheet

All queries hit **`GET /api/startups`**. Parameters combine freely (they are
joined with `$and`). Base URL below assumes the server runs on port 4000.

```
BASE=http://localhost:4000/api
```

This single endpoint demonstrates every query concept from Units 4 & 5:
comparison operators, logical operators, array queries, nested/embedded-document
queries, projections, and filter + sort + paginate.

---

## 1. Comparison operators

| Operator | Param | Example | Mongo filter |
|----------|-------|---------|--------------|
| `$eq`  | `domain` | `?domain=FinTech` | `{ domain: { $eq: "FinTech" } }` |
| `$in`  | `domains` (CSV) | `?domains=EdTech,CleanTech` | `{ domain: { $in: ["EdTech","CleanTech"] } }` |
| `$gte` | `minVotes` | `?minVotes=120` | `{ votes: { $gte: 120 } }` |
| `$lte` | `maxVotes` | `?maxVotes=100` | `{ votes: { $lte: 100 } }` |
| `$gte`/`$lte` | `minFunding`/`maxFunding` | `?minFunding=3000000&maxFunding=6000000` | `{ fundingAsk: { $gte: 3000000, $lte: 6000000 } }` |

```bash
curl "$BASE/startups?domain=FinTech"
curl "$BASE/startups?domains=EdTech,CleanTech&limit=50"
curl "$BASE/startups?minVotes=120"
curl "$BASE/startups?minFunding=3000000&maxFunding=6000000"
```

## 2. Logical operators

| Operator | How it's used | Example |
|----------|---------------|---------|
| `$and` | Every param you pass is combined with `$and` | `?domain=FinTech&minVotes=100` |
| `$or`  | `q` searches title/tagline/problem/solution | `?q=solar` |

```bash
# $or — free-text search across multiple fields
curl "$BASE/startups?q=solar"
# $and — multiple conditions together
curl "$BASE/startups?domain=FinTech&minVotes=100"
```

Resulting filter for the `$and` example:
```js
{ $and: [ { domain: { $eq: "FinTech" } }, { votes: { $gte: 100 } } ] }
```

## 3. Array queries

`tags` and `rolesNeeded` are string arrays.

| Need | Param | Example | Mongo filter |
|------|-------|---------|--------------|
| Has **any** tag | `tags` (CSV) | `?tags=AI` | `{ tags: { $in: ["AI"] } }` |
| Has **all** tags | `tags` + `tagsMatch=all` | `?tags=AI,B2C&tagsMatch=all` | `{ tags: { $all: ["AI","B2C"] } }` |
| Array contains element | `role` | `?role=Data Scientist` | `{ rolesNeeded: "Data Scientist" }` |

```bash
curl "$BASE/startups?tags=AI&limit=50"
curl "$BASE/startups?tags=AI,B2C&tagsMatch=all&limit=50"
curl "$BASE/startups?role=Data%20Scientist&limit=50"
```

## 4. Nested / embedded-document queries

`founders` is an **array of embedded documents** (`{ name, college, role }`).
`$elemMatch` finds a startup where **one** founder matches all given criteria.

```bash
# single nested field
curl "$BASE/startups?founderCollege=IIT%20Delhi&limit=50"
# multiple conditions on the SAME embedded founder (college AND role)
curl "$BASE/startups?founderCollege=IIT%20Kanpur&founderRole=CTO&limit=50"
```

Mongo filter:
```js
{ founders: { $elemMatch: { college: "IIT Kanpur", role: "CTO" } } }
```

## 5. Projections

`fields` (CSV) returns only the chosen fields (plus `id`).

```bash
curl "$BASE/startups?fields=title,votes,domain&limit=2"
# -> [{ id, title, votes, domain }, ...]
```

## 6. Sort

`sort` = one of `votes`, `views`, `saves`, `fundingAsk`, `postedAt`, `title`.
`order` = `asc` or `desc` (default `desc`, default field `postedAt`).

```bash
curl "$BASE/startups?sort=votes&order=desc&limit=3"
curl "$BASE/startups?sort=fundingAsk&order=asc&limit=3"
```

## 7. Pagination

`page` (1-based) and `limit` (max 50). The response includes paging metadata.

```bash
curl "$BASE/startups?page=1&limit=5&sort=title&order=asc"
```

Response shape:
```json
{
  "startups": [ ... ],
  "total": 12,
  "page": 1,
  "pages": 3,
  "limit": 5,
  "hasNext": true
}
```

## 8. Everything at once (filter + sort + paginate)

```bash
curl "$BASE/startups?domains=EdTech,FinTech&minVotes=80&sort=votes&order=desc&page=1&limit=3"
```

Builds:
```js
Startup
  .find({ $and: [
    { domain: { $in: ["EdTech","FinTech"] } },
    { votes:  { $gte: 80 } },
  ]})
  .sort({ votes: -1 })
  .skip(0)
  .limit(3)
```

---

### Where this lives in the code
- Filter builder, sort, projection, pagination: [`src/db.js`](src/db.js) — `buildStartupFilter`, `buildStartupSort`, `buildStartupProjection`, `queryStartups`.
- Route: [`src/index.js`](src/index.js) — `GET /api/startups`.
