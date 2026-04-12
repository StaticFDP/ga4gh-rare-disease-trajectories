# Describing Rare Disease Trajectories: Bring Your Own Disease

**GA4GH Session — April 16, 2026 | 2:00–4:45 PM**

This repository captures structured disease narratives, ontology mappings, and gap analyses from the "Bring Your Own Disease" biohackathon session. All contributions become FAIR-compliant open data published via a [FAIR Data Point](https://docs.fairdatapoint.org/) and indexed in the [StaticFDP Index](https://staticfdp.github.io/fdp-index/).

## Session goal

Pair the clinical narratives that make rare disease cases understandable with structured phenotype and disease identifiers — then identify what is missing in current ontologies and data models.

Disease identification uses whichever ontology the contributor knows: **Orphanet (ORDO)** is the primary rare disease classification, alongside OMIM, GARD, ICD-11, ICD-10, SNOMED CT, Mondo, NANDO, and others. No single ontology is required or assumed.

## How to contribute

**No GitHub account?** Use the web forms directly — no login needed:

| Form | Direct link |
|------|-------------|
| Submit a disease case | https://byod-form-receiver.andra-76d.workers.dev/forms/disease-case |
| Report an ontology gap | https://byod-form-receiver.andra-76d.workers.dev/forms/ontology-gap |
| Report a data / model gap | https://byod-form-receiver.andra-76d.workers.dev/forms/data-gap |
| Feedback on these forms | https://byod-form-receiver.andra-76d.workers.dev/forms/form-feedback |

Or start at the session landing page:
👉 **https://fdp.semscape.org/ga4gh-rare-disease-trajectories/**

**Have a GitHub account?** Use the issue templates directly (fastest during the live session):

| Form | What it captures |
|------|-----------------|
| [Submit a disease case](../../issues/new?template=01-disease-case.yml) | Narrative, timeline, data types, disease identifiers across any ontology |
| [Report an ontology gap](../../issues/new?template=02-ontology-gap.yml) | Missing or misaligned terms across ORDO, HPO, SNOMED, ICD, Mondo, and others |
| [Report a data / model gap](../../issues/new?template=03-data-gap.yml) | Gaps in Phenopackets, FHIR, OMOP, rare disease registries, and exchange standards |
| [Feedback on these forms](../../issues/new?template=04-form-feedback.yml) | Missing fields, wrong framing, or a proposal for an entirely new form |

**Bioinformatician or data engineer?** Clone the repo, add Turtle files in `cases/`, open a PR. Validation runs automatically via ShEx on every PR. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Repository structure

```
cases/             Disease case folders (one per disease or registry)
  _template/       Blank templates — copy these to start
  als-tdi/         ALS TDI Registry
  rare-x/          RARE-X PRO Surveys
  iamrare/         IAMRARE Registries
  phenodb/         PhenoDB
gaps/              Identified ontology and data model gaps
alignment/         Mapping of clinical narratives to existing standards
outputs/           Session deliverables (narrative template, recommendations)
metadata/fdp/      FAIR Data Point catalog metadata (DCAT-aligned YAML + Turtle)
profiles/          ShEx validation schemas (FairDataPoint, Catalog, Dataset)
generated/         SHACL derived from ShEx — auto-generated, do not edit
docs/              GitHub Pages landing page (served at fdp.semscape.org)
```

## Disease identifiers

Any ontology is accepted. The forms accept identifiers in `PREFIX:ID` format, one per line:

| Ontology | Scope | Example |
|----------|-------|---------|
| **Orphanet (ORDO)** | Rare diseases — primary classification | `ORPHA:803` |
| **OMIM** | Mendelian / genetic disease | `OMIM:105400` |
| **GARD** | NIH rare disease catalogue | `GARD:0005765` |
| **ICD-11** | WHO clinical classification (current) | `ICD-11:8B60` |
| **ICD-10** | WHO clinical classification (legacy) | `ICD-10:G12.2` |
| **SNOMED CT** | Clinical terminology | `SNOMED:37340000` |
| **Mondo** | Cross-ontology harmonisation | `MONDO:0004976` |
| **NANDO** | Neurological & neuromuscular diseases | `NANDO:1200263` |
| **HPO** | Phenotype features | `HP:0003473` |

## FAIR Data

Contributions are published as a FAIR Data Point and indexed automatically:

- **FDP root**: https://staticfdp.github.io/ga4gh-rare-disease-trajectories/
- **FDP Index**: https://staticfdp.github.io/fdp-index/
- **Catalog metadata**: [`metadata/fdp/catalog.ttl`](metadata/fdp/catalog.ttl)
- **ShEx profiles**: [`profiles/`](profiles/)

All Turtle files are validated against ShEx on every pull request. SHACL is auto-generated from ShEx and committed as a derived artifact.

## Standards and resources

| Resource | Description |
|----------|-------------|
| [Orphanet / ORDO](https://www.orphanet.net/) | Primary rare disease ontology and classification |
| [OMIM](https://www.omim.org/) | Mendelian inheritance and genetic disease |
| [GARD](https://rarediseases.info.nih.gov/) | NIH Genetic and Rare Diseases catalogue |
| [Human Phenotype Ontology](https://hpo.jax.org/) | Standardised phenotype vocabulary |
| [Phenopackets](https://www.ga4gh.org/product/phenopackets/) | GA4GH structured phenotype exchange format |
| [GestaltMatcher](https://www.gestaltmatcher.org/) | Facial image–based phenotype recognition |
| [RD-Connect / GPAP](https://rd-connect.eu/) | International rare disease genomics platform |
| [IAMRARE / Global Genes](https://iamrare.org/) | Patient-led rare disease registries |
| [ALS TDI](https://www.als.net/) | ALS patient registry and biobank |
| [FAIR Data Point spec](https://docs.fairdatapoint.org/) | Protocol and metadata schema |
| [ShEx](https://shex.io/) | Shape Expressions — RDF validation language |

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
| *break* | | |
| 4:35 | Wrap-up & next steps | All |

## Outputs we aim to produce

- [ ] Structured narrative template for rare disease cases
- [ ] Multi-ontology alignment map (coverage and gaps across ORDO, HPO, Phenopackets, ICD, SNOMED)
- [ ] Prioritised gap list
- [ ] FAIR Data Point catalog metadata for each case dataset
- [ ] Plan for next community meeting
