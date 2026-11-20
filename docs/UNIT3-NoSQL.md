# Unit 3 — Database & the NoSQL Approach

Theory notes + sample-problem answers, grounded in the **UniVenture** project
(a MongoDB-backed Express API). Use this for the Unit 3 written deliverables.

---

## 1. What is a Database? Database Engineering

A **database** is an organised collection of data stored so it can be queried,
updated and managed efficiently. **Database engineering** is the discipline of
designing how that data is modelled, stored, indexed and accessed so the system
stays correct, fast and scalable as data grows.

**Database categories**
- **Relational (RDBMS / SQL):** data in tables of rows and columns, with a fixed
  schema and relationships enforced by foreign keys (MySQL, PostgreSQL, Oracle).
- **Non-relational (NoSQL):** flexible, schema-less models built for large scale
  and varied data (MongoDB, Redis, Cassandra, Neo4j).

---

## 2. What is NoSQL? Why NoSQL?

**NoSQL** ("Not Only SQL") is a family of databases that store data in formats
other than relational tables. They arose because web-scale applications needed to
handle **huge volumes**, **high velocity**, and **varied (unstructured) data** —
things rigid relational schemas and single-server scaling struggle with.

**Why use the NoSQL approach**
- **Flexible schema** — documents in the same collection can have different
  fields; you can evolve the shape of data without migrations.
- **Horizontal scaling** — scale *out* across many commodity servers (sharding)
  instead of scaling *up* one expensive server.
- **High performance** at large read/write volumes.
- **Natural fit for app objects** — a document maps directly to a JSON object
  your code already uses, avoiding object-relational mapping friction.

---

## 3. NoSQL vs RDBMS (SQL)

| Aspect | SQL (RDBMS) | NoSQL |
|--------|-------------|-------|
| Data model | Tables (rows & columns) | Documents, key-value, wide-column, graph |
| Schema | Fixed, defined up front | Dynamic / flexible |
| Relationships | Joins via foreign keys | Embedding or references (usually no joins) |
| Scaling | Vertical (bigger server) | Horizontal (sharding across servers) |
| Transactions | Strong ACID | BASE; many support ACID at document level |
| Query language | SQL (standardised) | Database-specific (e.g. MongoDB Query API) |
| Best for | Structured data, complex joins, strong consistency | Large-scale, evolving, semi-structured data |

**BASE vs ACID:** RDBMS favours **ACID** (Atomicity, Consistency, Isolation,
Durability). Many NoSQL systems favour **BASE** (Basically Available, Soft state,
Eventual consistency) to gain availability and scale — a reflection of the **CAP
theorem** (you can't fully have Consistency, Availability and Partition-tolerance
at the same time).

---

## 4. Types of NoSQL Databases

| Type | Stores data as | Example DBs | Good for |
|------|----------------|-------------|----------|
| **Key-Value** | `key → value` pairs | Redis, DynamoDB | Caching, sessions, fast lookups |
| **Document** | self-describing documents (JSON/BSON) | **MongoDB**, CouchDB | App data, content, catalogs |
| **Wide-Column / Columnar** | rows with dynamic columns grouped in families | Cassandra, HBase | Time-series, analytics at scale |
| **Graph** | nodes + edges (relationships) | Neo4j, Amazon Neptune | Social networks, recommendations |

**UniVenture uses the Document model (MongoDB)** — each startup, user, request
and activity is one JSON-like document.

---

## 5. Database Properties, Benefits & Limitations of NoSQL

**Benefits**
- Flexible, evolving schema.
- Horizontal scalability and high availability.
- High throughput for large data.
- Developer-friendly (documents ≈ application objects).

**Limitations**
- Weaker/looser consistency guarantees in some systems (eventual consistency).
- No standard query language across products.
- Joins are limited or must be done in application code / with `$lookup`.
- Data is often **denormalised** (duplicated), which can mean larger storage and
  more care on updates.
- Less mature tooling for complex ad-hoc reporting than decades-old SQL.

---

## 6. Sharding in NoSQL

**Sharding** is horizontal partitioning: splitting one large dataset across
multiple servers (**shards**), each holding a subset of the data chosen by a
**shard key**. It lets a database scale beyond one machine's capacity and spreads
read/write load.

```
                 ┌─────────── Router (mongos) ───────────┐
   client  ──►   │  routes each query by the shard key   │
                 └───┬───────────────┬───────────────┬───┘
                     ▼               ▼               ▼
                 Shard A         Shard B         Shard C
              (ids a–h)       (ids i–p)       (ids q–z)
```

Example: shard the `startups` collection by `domain` or `_id` so no single server
holds every document. (On MongoDB Atlas, sharding is a cluster-tier feature; the
free M0 tier used here is a single replica set, not sharded.)

---

## Sample Problem 1 — Compare

### a) SQL vs NoSQL
See the table in **Section 3** above. In one line: *SQL gives you fixed schemas,
joins and strong consistency on a scaled-up server; NoSQL gives you flexible
schemas and horizontal scale for large, varied, fast-changing data.*

### b) Advantages of NoSQL
1. **Flexible / dynamic schema** — no migrations to add a field.
2. **Horizontal scalability** via sharding.
3. **High performance** at large volume and velocity.
4. **High availability** through replication.
5. **Natural object mapping** — documents match application JSON objects.
6. **Handles unstructured/semi-structured data** (text, nested objects, arrays).

---

## Sample Problem 2 — Design

### a) A key-value database model
A key-value store maps a unique **key** to an opaque **value**. For UniVenture,
a sensible use is **caching a user's session**:

```
KEY                                  VALUE
session:user-001            →  { "token": "eyJhbGci...", "name": "Ayush Singh",
                                 "role": "Entrepreneur", "expires": 1731830400 }
votes:startup-001           →  127
trending:startups           →  ["startup-001","startup-003","startup-006"]
```

Characteristics:
- Lookup is **O(1)** by exact key — extremely fast.
- The value is not queryable by its internal fields (you fetch the whole blob).
- Perfect for sessions, counters, caches, feature flags (e.g. Redis).

### b) A document-based data structure
A document database stores rich, nested documents. This is the actual shape
UniVenture persists for a **startup** in the `startups` collection — note the
**embedded array of sub-documents** (`comments`, `founders`) and the
**scalar arrays** (`tags`, `rolesNeeded`, `voters`):

```json
{
  "_id": "startup-001",
  "title": "EduBot AI",
  "tagline": "Personalized tutoring powered by AI for tier-2 India",
  "domain": "EdTech",
  "tags": ["AI", "B2C", "Education"],
  "fundingAsk": 2000000,
  "votes": 127,
  "views": 893,
  "rolesNeeded": ["Developer", "Designer"],
  "founders": [
    { "name": "Priya Sharma", "college": "IIT Kanpur", "role": "CEO" },
    { "name": "Arjun Mehta",  "college": "IIT Kanpur", "role": "CTO" }
  ],
  "comments": [
    { "id": "c1", "author": "Vikram M", "text": "Love the language support!",
      "date": "2024-01-18T10:00:00Z" }
  ],
  "voters": ["user-001"],
  "isTrending": true,
  "postedAt": "2024-01-15T10:30:00Z"
}
```

Why this design:
- **Embedding** comments/founders inside the startup keeps all data for one pitch
  in a single document → one read fetches everything, no joins.
- **Arrays** (`tags`, `voters`) model one-to-many cleanly and are directly
  queryable with MongoDB array operators (`$in`, `$all`, `$elemMatch`).
- The **same document** maps straight onto the JSON the frontend renders.

> The live query operators that run against exactly this structure are documented
> in [`../server/QUERIES.md`](../server/QUERIES.md).
