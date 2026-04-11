# Metadata

FAIR Data Point (FDP) catalog metadata for this repository's datasets.

| File | Format | Description |
|------|--------|-------------|
| `fdp/catalog.yaml` | YAML (DCAT-aligned) | Human-editable source — add new datasets here |
| `fdp/catalog.ttl` | Turtle/RDF | Machine-readable FDP catalog — regenerate from YAML |

## DCAT field mapping cheat sheet

| DCAT property | YAML key | Example |
|--------------|----------|---------|
| `dcterms:title` | `dcterms:title` | "ALS TDI Registry" |
| `dcterms:description` | `dcterms:description` | Free text |
| `dcterms:subject` | `dcterms:subject` | `mondo: "0004976"` |
| `dcat:keyword` | `dcat:keyword` | `["ALS", "registry"]` |
| `dcterms:license` | `dcterms:license` | CC-BY-4.0 |
| `dcterms:issued` | `dcterms:issued` | 2026-04-16 |
| `dcat:accessURL` | `dcat:accessURL` | Path to file in repo |

## Registering with a live FDP instance

Once the repo is public, datasets can be registered with a FAIR Data Point server by:
1. Pointing to the Turtle catalog at `metadata/fdp/catalog.ttl`
2. Or using the FDP client: `fdp-client --catalog metadata/fdp/catalog.ttl --server <FDP_URL>`

See: https://docs.fairdatapoint.org/
