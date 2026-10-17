# Massive catalog ingestion (verified public data)

UnGesto now ingests the UK Parliament petitions public JSON API.

- Official API: https://petition.parliament.uk/petitions.json?state=open&page=1
- Pagination: `links.last` and individual `data[]` resources.
- Allowed state: `open` and `closing_date >= current UTC date`; stale or closed entries are excluded even if an API cache claims they're open.
- Each record keeps its original action (title), background, full petition URL, number of signatures, last update, closing date, country and provider.
- Source is UK Parliament; catalog is independent from and does not represent UK Parliament.
- **Legal eligibility**: **British citizens or UK residents only** may sign. UnGesto must never default to offering UK signing to others without an eligibility check.
- We never sign petitions automatically, store signer identity or represent opening a form as a completed signature.

Data model:
- `public/data/uk-petitions.json`: current snapshot of official open petitions (source, ingestion timestamp, records).
- `public/data/catalog-stats.json`: derived counts.
- `public/data/ungesto-catalog.sqlite`: indexed SQLite relational catalog (FTS5 title/description when available), merging 34 curated sources with official UK petitions.
- `catalog/causes.json`: remains the manually curated 34 campaigns with explicit consent texts, not overwritten by the bulk import.

Workflow `.github/workflows/mass-catalog.yml` refreshes the data daily and commits snapshot/SQLite to GitHub. Before any snapshot update it requires all page fetches to succeed; on failure the previous snapshot is retained. Snapshot generated on GitHub's build runner; Render publication of data may need its own deploy trigger.

**Quality:** public catalog is a comprehensive index, not an endorsement of every petition. The UK source includes controversial political causes; users must choose for themselves. Content remains attributed and is not translated without human review. Do not display UK-only signing controls for Argentine users by default.
