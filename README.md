# NutsDorlingCartogram
Dorling cartogram from NUTS regions with Eurostat statistics

<div>
<img src="assets/images/preview.png" alt="preview"/>
<div>

## Installation

'npm install nutsdorlingcartogram'

then 
```javascript
NutsDorlingCartogram = require("nutsdorlingcartogram")
```

or

```javascript
<script src="https://unpkg.com/nutsdorlingcartogram/build/dorling.min.js"></script>
```

## Usage

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

# Parameters

Name | Description | Type | Required | Default
:-------------: | :-------------: | :-------------: | :-------------: | :-------------:
svgId | Identifier of an SVG element | string | true | null
width | Width of the visualization | number | false | 900
height | Height of the visualization | number | false | 500
nutsLvl | NUTS level | number | false | 2
colorScheme | d3 scale chromatic function name | string | false | "interpolateRdYlBu"
zoom | Enable d3 zoom | boolean | false | true
legendTitle | Title text for the color legend | string | false | "Legend"
legendOrientation | Accepted values: "vertical" or "horizontal" | string | false | "vertical"
legendWidth | Width of the legend | number | false | 200
legendCells | Number of cells to be shown in the legend (see d3-svg-legend) | number | false | 5
sizeDatasetId | Eurobase Dataset identifier used to determine circle sizes  | string | false | "demo_r_pjangrp3"
sizeDatasetFilters | URL parameter string to apply to the sizeDataset request  | string | false | "sex=T&age=TOTAL&unit=NR&time=2018"
colorDatasetId | Eurobase Dataset identifier used to determine circle colors | number | false | 200
colorDatasetFilters | URL parameter string to apply to the colorDataset request  | string | false | "indic_de=GROWRT&time=2018"

