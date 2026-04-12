#!/usr/bin/env python3
"""
issues_to_turtle.py
====================
Reads all GitHub Issues labelled ``disease-case`` from the GA4GH repo and
converts them to RDF Turtle, writing docs/fdp/submissions.ttl.

Each issue becomes a dcat:Dataset with:
  - dcterms:title         — disease name from the issue body
  - dcterms:description   — disease narrative
  - dcterms:subject       — parsed disease IDs (ORPHA, OMIM, HP, Mondo, …)
  - dcterms:creator       — contributor name (+ ORCID iD if present)
  - dcterms:created       — issue creation date
  - dcterms:source        — "GitHub Issue" provenance note
  - dcat:landingPage      — URL of the GitHub Issue
  - dcat:keyword          — registry / data source field

Usage (called by the issues-to-turtle workflow):
    python3 scripts/issues_to_turtle.py

Environment variables:
    GITHUB_TOKEN   — PAT with issues:read on the repo (required)
    GITHUB_REPO    — owner/name, default: StaticFDP/ga4gh-rare-disease-trajectories
    OUTPUT_PATH    — output file path, default: docs/fdp/submissions.ttl
"""

import os
import re
import sys
import json
import datetime
import urllib.request
import urllib.parse

# ── Config ────────────────────────────────────────────────────────────────────

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_REPO  = os.environ.get("GITHUB_REPO",  "StaticFDP/ga4gh-rare-disease-trajectories")
OUTPUT_PATH  = os.environ.get("OUTPUT_PATH",  "docs/fdp/submissions.ttl")
BASE_URL     = "https://fdp.semscape.org/ga4gh-rare-disease-trajectories/fdp/submissions/"

LABEL_FILTER = "disease-case"

# ── Ontology prefix → IRI template ───────────────────────────────────────────

ONTOLOGY_IRI = {
    "ORPHA":   "http://www.orpha.net/ORDO/Orphanet_{id}",
    "ORDO":    "http://www.orpha.net/ORDO/Orphanet_{id}",
    "OMIM":    "https://omim.org/entry/{id}",
    "HP":      "http://purl.obolibrary.org/obo/HP_{id}",
    "HPO":     "http://purl.obolibrary.org/obo/HP_{id}",
    "MONDO":   "http://purl.obolibrary.org/obo/MONDO_{id}",
    "GARD":    "https://rarediseases.info.nih.gov/diseases/{id}",
    "ICD10":   "http://id.who.int/icd/release/10/{id}",
    "ICD-10":  "http://id.who.int/icd/release/10/{id}",
    "ICD11":   "http://id.who.int/icd/entity/{id}",
    "ICD-11":  "http://id.who.int/icd/entity/{id}",
    "SNOMED":  "http://snomed.info/id/{id}",
    "SNOMEDCT":"http://snomed.info/id/{id}",
    "NANDO":   "http://nanbyodata.jp/ontology/nando#{id}",
    "MESH":    "http://id.nlm.nih.gov/mesh/{id}",
    "MeSH":    "http://id.nlm.nih.gov/mesh/{id}",
    "DOID":    "http://purl.obolibrary.org/obo/DOID_{id}",
}

# ── GitHub API helpers ────────────────────────────────────────────────────────

def gh_get(path: str) -> list | dict:
    """Paginated GitHub API GET, returns combined list for collections."""
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    results = []
    url = f"https://api.github.com{path}"
    while url:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            if isinstance(data, list):
                results.extend(data)
            else:
                return data  # single object
        # Follow Link: <next_url>; rel="next"
        link_header = resp.headers.get("Link", "")
        next_url = None
        for part in link_header.split(","):
            if 'rel="next"' in part:
                m = re.search(r'<([^>]+)>', part)
                if m:
                    next_url = m.group(1)
        url = next_url
    return results


def fetch_issues() -> list:
    """Fetch all open+closed issues with the disease-case label."""
    label = urllib.parse.quote(LABEL_FILTER)
    path = f"/repos/{GITHUB_REPO}/issues?labels={label}&state=all&per_page=100"
    issues = gh_get(path)
    # Exclude pull requests (GitHub returns PRs in the issues endpoint)
    return [i for i in issues if "pull_request" not in i]


# ── Issue body parser ─────────────────────────────────────────────────────────

def parse_section(body: str, heading: str) -> str:
    """Extract content under a ### Heading from a GitHub issue body."""
    pattern = rf"###\s+{re.escape(heading)}\s*\n(.*?)(?=\n###|\Z)"
    m = re.search(pattern, body, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else ""


def parse_disease_ids(raw: str) -> list[str]:
    """
    Parse lines like 'ORPHA:98895', 'OMIM:310200', 'HP:0001250' from a block
    of text. Returns a list of resolved IRI strings.
    """
    iris = []
    for token in re.finditer(r'([A-Za-z][A-Za-z0-9\-]*)[\s:_](\d+)', raw):
        prefix = token.group(1).upper()
        local  = token.group(2)
        template = ONTOLOGY_IRI.get(prefix)
        if template:
            iris.append(template.format(id=local))
    return iris


def parse_orcid(body: str) -> str | None:
    """Extract ORCID iD from issue body if present (format: 0000-0000-0000-0000)."""
    m = re.search(r'orcid\.org/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])', body, re.IGNORECASE)
    return m.group(1) if m else None


# ── Turtle serialisation ──────────────────────────────────────────────────────

def ttl_str(s: str) -> str:
    """Escape a string for Turtle triple-quoted literals."""
    return s.replace('\\', '\\\\').replace('"""', '\\"\\"\\"')


def issue_to_triples(issue: dict) -> str:
    """Convert one GitHub Issue to Turtle triples."""
    body    = issue.get("body") or ""
    number  = issue["number"]
    html_url = issue["html_url"]
    created = issue["created_at"][:10]  # YYYY-MM-DD

    # Parse body sections
    disease_name   = parse_section(body, "Disease name")
    disease_ids_raw = parse_section(body, "Disease identifiers")
    registry       = parse_section(body, "Registry or data source")
    narrative      = parse_section(body, "Disease narrative")
    contributor    = parse_section(body, "Contributor")

    # Fall back to issue title if no disease name in body
    if not disease_name:
        title_m = re.match(r'\[CASE\]\s*(.+)', issue.get("title", ""), re.IGNORECASE)
        disease_name = title_m.group(1).strip() if title_m else issue.get("title", f"Case #{number}")

    disease_iris = parse_disease_ids(disease_ids_raw)
    orcid_id     = parse_orcid(body)

    subj = f"<{BASE_URL}{number}>"

    lines = [
        f"# ── Issue #{number}: {disease_name} ──",
        f"{subj}",
        f"    a dcat:Dataset ;",
        f'    dcterms:title "{ttl_str(disease_name)}"@en ;',
    ]

    if narrative:
        lines.append(f'    dcterms:description """{ttl_str(narrative)}"""@en ;')

    lines.append(f'    dcterms:created "{created}"^^xsd:date ;')
    lines.append(f'    dcterms:issued  "{created}"^^xsd:date ;')
    lines.append(f'    dcterms:license <https://creativecommons.org/licenses/by/4.0/> ;')
    lines.append(f'    dcat:landingPage <{html_url}> ;')
    lines.append(f'    dcterms:source "GA4GH BYOD web form (ORCID-authenticated)" ;')

    if registry:
        lines.append(f'    dcat:keyword "{ttl_str(registry)}"@en ;')

    # Disease subject IRIs
    for iri in disease_iris:
        lines.append(f'    dcterms:subject <{iri}> ;')

    # Creator — prefer ORCID link, fall back to name literal
    if orcid_id:
        lines.append(f'    dcterms:creator <https://orcid.org/{orcid_id}> ;')
        if contributor:
            lines.append(f'    foaf:name "{ttl_str(contributor)}" ;')
    elif contributor:
        lines.append(f'    dcterms:creator [ foaf:name "{ttl_str(contributor)}" ] ;')

    # Close the block (replace last ' ;' with ' .')
    lines[-1] = lines[-1].rstrip(' ;') + ' .'
    return "\n".join(lines) + "\n"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not GITHUB_TOKEN:
        print("⚠  GITHUB_TOKEN not set — anonymous requests are rate-limited to 60/hr", file=sys.stderr)

    print(f"Fetching issues labelled '{LABEL_FILTER}' from {GITHUB_REPO}…")
    issues = fetch_issues()
    print(f"  Found {len(issues)} issue(s)")

    header = f"""\
@prefix dcat:    <https://www.w3.org/ns/dcat#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix foaf:    <http://xmlns.com/foaf/0.1/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix ordo:    <http://www.orpha.net/ORDO/Orphanet_> .
@prefix omim:    <https://omim.org/entry/> .
@prefix hp:      <http://purl.obolibrary.org/obo/HP_> .
@prefix mondo:   <http://purl.obolibrary.org/obo/MONDO_> .

# ─────────────────────────────────────────────────────────────────────────────
# Community-submitted disease cases
# Auto-generated by scripts/issues_to_turtle.py on {datetime.date.today().isoformat()}
# Source: https://github.com/{GITHUB_REPO}/issues?q=label%3Adisease-case
# ─────────────────────────────────────────────────────────────────────────────

"""

    blocks = [issue_to_triples(iss) for iss in issues]

    os.makedirs(os.path.dirname(OUTPUT_PATH) or ".", exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as fh:
        fh.write(header)
        fh.write("\n\n".join(blocks) if blocks else "# No submissions yet.\n")

    print(f"  Written → {OUTPUT_PATH}  ({len(blocks)} dataset(s))")


if __name__ == "__main__":
    main()
