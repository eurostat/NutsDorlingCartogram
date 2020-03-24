# NutsDorlingCartogram
Dorling cartogram from NUTS regions with Eurostat statistics

```javascript
NutsDorlingCartogram.dorling({
  svgId: "dorlingSvg",
  width: 800,
  height: 500,
  nutsLvl: 2,
  colorScheme: "interpolateRdYlBu",
  zoom: true,
  legendTitle: "Population change (‰)",
  legendOrientation: "vertical",
  legendWidth: 200,
  legendCells: 5,
  sizeDatasetId: "demo_r_pjangrp3",
  sizeDatasetFilters: "sex=T&age=TOTAL&unit=NR&time=2018",
  colorDatasetId: "demo_r_gind3",
  colorDatasetFilters: "indic_de=GROWRT&time=2018"
});
```
