# Disease Cases

Each subfolder contains one disease / registry case. Use the `_template/` folder to start a new case.

| Folder | Disease / Registry | Presenter | Status |
|--------|--------------------|-----------|--------|
| `als-tdi/` | ALS (MONDO:0004976) | Danielle Boyce | Bronze |
| `rare-x/` | Multiple (RARE-X PROs) | Zohreh Talebizadeh | Bronze |
| `iamrare/` | Multiple (IAMRARE) | Janine Lewis | Bronze |
| `phenodb/` | Multiple (PhenoDB) | Ada Hamosh | Bronze |
| `_template/` | — blank template — | — | — |

## Adding a new case

```
cp -r cases/_template cases/your-disease-name
# edit the three files inside
```

Completeness levels: **Bronze** = narrative only · **Silver** = + timeline + HPO terms · **Gold** = + phenotype-map.yaml + FDP metadata
