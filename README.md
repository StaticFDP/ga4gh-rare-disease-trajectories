# Describing Rare Disease Trajectories: Bring Your Own Disease

**GA4GH Session — April 16, 2026 | 2:00–3:30 PM**

This repository captures structured disease narratives, ontology mappings, and gap analyses produced during the "Bring Your Own Disease" biohackathon session. All collected material is intended to become FAIR-compliant and ultimately expressed as RDF via the [FAIR Data Point](https://docs.fairdatapoint.org/) framework.

## Session goal

Pair structured phenotype features (HPO, Phenopackets, Mondo) with the clinical narratives that make rare disease cases understandable — and identify what is missing.

## Quick start for session participants

You do not need to know Git to contribute. Three options, easiest first:

### Option A — GitHub Issue (recommended during the live session)
Open a new Issue using one of the templates:
- **[Submit a disease case](../../issues/new?template=01-disease-case.yml)** — narrative, timeline, key data types
- **[Report an ontology gap](../../issues/new?template=02-ontology-gap.yml)** — missing terms, poor coverage
- **[Report a data/model gap](../../issues/new?template=03-data-gap.yml)** — gaps in Phenopackets, registries, PROs

### Option B — Edit a template file directly on GitHub
Go to `cases/_template/`, click a file, then click the pencil icon to edit. Copy the template into a new file under `cases/your-disease-name/`.

### Option C — Pull request
Clone the repo, fill in the templates, open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Repository structure

```
cases/             Disease case folders (one per disease/registry)
  _template/       Blank templates — copy these
  als-tdi/         ALS TDI Registry
  rare-x/          RARE-X PRO Surveys
  iamrare/         IAMRARE Registries
  phenodb/         PhenoDB
gaps/              Identified ontology and data model gaps
alignment/         Mapping of clinical narratives to existing standards
outputs/           Session deliverables (template drafts, recommendations)
metadata/fdp/      FAIR Data Point catalog metadata (DCAT-aligned YAML + Turtle stubs)
```

## Standards and resources

| Resource | URL |
|----------|-----|
| Mondo Disease Ontology | https://mondo.monarchinitiative.org/ |
| Human Phenotype Ontology | https://hpo.jax.org/ |
| Phenopackets | https://www.ga4gh.org/product/phenopackets/ |
| GestaltMatcher | https://www.gestaltmatcher.org/ |
| ALS TDI | https://www.als.net/ |
| Global Genes / IAMRARE | https://iamrare.org/ |
| FAIR Data Point spec | https://docs.fairdatapoint.org/ |

## Agenda (April 16, 2026)

| Time | Item | Who |
|------|------|-----|
| 2:00 | Introduction & framing | Andra & Ada |
| 2:10 | Disease terminologies + ECTO | Nicole |
| 2:20 | HPO — purpose and boundaries | Jules |
| 2:25 | Phenopackets — purpose and boundaries | Jules |
| 2:35 | Facial image–based phenotyping (GestaltMatcher) | Tzung-Chien Hsieh |
| 2:45 | Structured phenotyping in clinical genetics | Orion |
| 2:55 | Use case presentations (10 min each) | Danielle, Zohreh, Janine, Ada |
| 3:35 | Group work & mapping | All |
| _break_ | | |
| 4:35 | Wrap-up & next steps | All |

## Outputs we aim to produce

- [ ] Structured narrative template for rare disease cases
- [ ] Ontology alignment map (what HPO/Phenopackets/Mondo covers, what is missing)
- [ ] Prioritized gap list
- [ ] Initial FDP catalog metadata for each case dataset
- [ ] Plan for next community meeting
