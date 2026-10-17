#!/usr/bin/env python3
"""Offline SQLite snapshot of UnGesto's public petition catalog. No signer PII."""
import json, sqlite3
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data"
DATA.mkdir(parents=True, exist_ok=True)
local = json.loads((ROOT / "catalog" / "causes.json").read_text(encoding="utf8"))["causes"]
official = json.loads((DATA / "uk-petitions.json").read_text(encoding="utf8"))["records"]
db = DATA / "ungesto-catalog.sqlite"
db.unlink(missing_ok=True)
con=sqlite3.connect(str(db))
con.executescript("""
CREATE TABLE campaigns(
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
  platform TEXT NOT NULL, category TEXT NOT NULL, source_url TEXT NOT NULL UNIQUE,
  country TEXT, eligibility TEXT NOT NULL, status TEXT NOT NULL,
  closing_date TEXT, signature_count INTEGER, consent_text TEXT,
  imported_at TEXT, signing_channel TEXT NOT NULL
);
CREATE INDEX campaigns_by_platform ON campaigns(platform);
CREATE INDEX campaigns_by_country ON campaigns(country, status);
CREATE INDEX campaigns_by_signatures ON campaigns(signature_count DESC);
CREATE INDEX campaigns_by_category ON campaigns(category);
CREATE INDEX campaigns_by_eligibility ON campaigns(eligibility);
""")
entries=[]
for c in local:
 entries.append((c["id"],c["title"],c["description"],c["organization"],c["category"],c["source_url"],None,
    "review_provider_rules","source_listed",None,None,c.get("consent_text"),None,c.get("signature_delivery","provider_hosted_form")))
for c in official:
 entries.append((c["id"],c["title"],c["description"],c["source"],c["category"],c["url"],"GB",
    "british_citizen_or_uk_resident","open",c["closing_date"],c["signature_count"],None,c.get("updated_at"),"official_hosted_petition"))
con.executemany("INSERT INTO campaigns VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",entries)
try:
 con.executescript("""
 CREATE VIRTUAL TABLE campaigns_fts USING fts5(title,description,content='campaigns',content_rowid='rowid');
 INSERT INTO campaigns_fts(campaigns_fts) VALUES('rebuild');
 """)
except sqlite3.OperationalError as e:
 print("FTS5 unavailable, ordinary indices remain:",str(e))
con.commit()
count=con.execute("SELECT COUNT(*) FROM campaigns").fetchone()[0]
expected=len(local)+len(official)
if count!=expected: raise RuntimeError(f"Expected {expected} entries, inserted {count}")
ok=con.execute("PRAGMA integrity_check").fetchone()[0]
if ok!="ok":raise RuntimeError("DB integrity failed")
con.execute("PRAGMA wal_checkpoint(TRUNCATE)") if False else None
con.close()
print(json.dumps({"sqlite_campaign_count":count,"sqlite_bytes":db.stat().st_size}))
