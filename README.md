# NutsDorlingCartogram
Dorling cartogram from NUTS regions with Eurostat statistics

<div>
<img src="assets/images/preview.png" alt="preview"/>
<div>
  
## [Live Demo](https://eurostat.github.io/NutsDorlingCartogram/examples/basic/)

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
        NutsDorlingCartogram.dorling()
            .containerId("containerDiv")
            .nutsLevel(2)
            .colors(["#2d50a0", "#6487c3", "#aab9e1", "#f0cd91", "#e6a532", "#d76e2d"])
            .thresholdValues([-15, -10, 0, 10, 15, 20])
            .sizeDatasetCode("demo_r_pjangrp3")
            .sizeDatasetFilters("sex=T&age=TOTAL&unit=NR&time=2019")
            .colorDatasetCode("demo_r_gind3")
            .colorDatasetFilters("indic_de=GROWRT&time=2018")
            .circleExaggerationFactor(1.9)
            .positionStrength(0.5)
            .colorLegend({
                titleWidth: 200,
                title: "Population change 2018-2019 (per 1 000 inhabitants)",
                orient: "vertical",
                shapeRadius: 10,
                shapePadding: 5,
                labelAlign: "middle",
                labelUnit: " ",
                labelOffset: 10,
                shape: "circle",
                labelFormat: d3.format(".0f")
            })
            .sizeLegend({
                title: "Total population",
                titleYOffset: 3,
                titleXOffset: 23,
                bodyYOffset: 110,
                textFunction: function (d) { return d / 1000000 + " million" },
                values: [20e6, 10e6, 1e6]
            })
            .tooltip({
                colorLabel: "Population change per 1 000 inhabitants",
                sizeLabel: "Total population",
                shareLabel: "Share of national population",
            })
            .coastalMargins(true)
            .graticule(false)
            .animate(true)
            .loop(false)
            .pauseButton(false)
            .showBorders(false)
            .seaColor("white")
            .build();
```
Check out [this notebook](https://observablehq.com/@joewdavies/nuts-dorling-cartogram-npm-package) for an interactive example.

# Cartogram Definition

Method | Description | Type | Required | Default Value
:--------- | :--------- | :--------- | :--------- | :---------
dorling.**containerId** | Identifier of the container upon which the cartogram will be appended | string | true | null
dorling.**width** | SVG viewbox width attribute | number | false | 1000
dorling.**height** | SVG viewbox height attribute | number | false | 1000
dorling.**nutsLevel** | NUTS level | number | false | 2
dorling.**sizeDatasetCode** | [Eurostat database](https://ec.europa.eu/eurostat/data/database) dataset identifier used to determine circle sizes  | string | false | "demo_r_pjangrp3"
dorling.**sizeDatasetFilters** | URL parameter string to apply to the sizeDataset request  | string | false | "sex=T&age=TOTAL&unit=NR&time=2018"
dorling.**colorDatasetCode** | Eurostat dataset identifier used to determine circle colors | number | false | 200
dorling.**colorDatasetFilters** | URL parameter string to apply to the colorDataset request  | string | false | "indic_de=GROWRT&time=2018"
dorling.**colorScheme** | [d3 scale chromatic](https://github.com/d3/d3-scale-chromatic) function name. Only used when a 'colors' array is not specified | string | false | "interpolateRdYlBu"
dorling.**colors** | An array of hex values to use for colouring the circles | []string | false | null
dorling.**thresholdValues** | An array of threshold values to use for categorising the data | []number | false | null
dorling.**zoom** | Enable d3 zoom | boolean | false | true
dorling.**colorLegend** | Object which stores the configuration parameters for the circle-color legend. See [here](https://d3-legend.susielu.com/#color) for more details on the following legend options. | object | false | See [here](https://d3-legend.susielu.com/#color) 
&nbsp;&nbsp; colorLegend.orient | Accepted values: "vertical" or "horizontal" | string | false | "vertical"
&nbsp;&nbsp; colorLegend.title | Legend title text | string | false | "Legend"
&nbsp;&nbsp; colorLegend.titleWidth | Width of the legend title | number | false | 200
&nbsp;&nbsp; colorLegend.cells | Number of cells to be shown in the legend | number | false | 5
&nbsp;&nbsp; colorLegend.shape | Shape of the legend cells ("circle" or "rect") | string | false | "rect"
&nbsp;&nbsp; colorLegend.shapeRadius | Radius of the circle when colorLegend.shape is set to "circle" | string | false | null
&nbsp;&nbsp; colorLegend.shapePadding | Padding to be applied to the legend cells for spacing | number | false | 5
&nbsp;&nbsp; colorLegend.labelAlign | Alignment of the legend cell labels. | string | false | "middle"
&nbsp;&nbsp; colorLegend.labelOffset | Distance in pixels from legend label to its corresponding cell | number | false | 5
dorling.**sizeLegend** | Object which stores the configuration parameters for the circle-size legend | object | false |  
&nbsp;&nbsp; sizeLegend.title | Legend title | string | false | "Size Legend"  
&nbsp;&nbsp; sizeLegend.values | Array of values used in the legend | array | false | null    
&nbsp;&nbsp; sizeLegend.textFunction | Function used to manipulate legend labels | function | false |  function (value) { return value.toLocaleString() }    
&nbsp;&nbsp; sizeLegend.titleYOffset | Y Offset in pixels applied to the legend's title | string | false | 0
&nbsp;&nbsp; sizeLegend.titleXOffset | X Offset in pixels applied to the legend's title | string | false | 23  
&nbsp;&nbsp; sizeLegend.translateY | Y value to be applied to the translate transform of the size legend within the parent "legends" container | number | false | 215  
&nbsp;&nbsp; sizeLegend.bodyXOffset | Legend title | string | false | 50  
&nbsp;&nbsp; sizeLegend.bodyYOffset | Legend title | string | false | 90  
dorling.**tooltip** | Object which stores the configuration parameters for the circle-size legend | object | false |  
&nbsp;&nbsp; tooltip.colorLabel | Label used to describe the color value of the feature | string | false | "Color value:"  
&nbsp;&nbsp; tooltip.colorUnit | Unit label to be added after the color value | string | false | ""    
&nbsp;&nbsp; tooltip.sizeLabel | Label used to describe the size value of the feature | string | false |  "Size value:"  
&nbsp;&nbsp; tooltip.sizeUnit | Unit label to be added after the size value | string | false | ""
&nbsp;&nbsp; tooltip.shareLabel | Label used to describe the percentage share value of the feature | string | false | "Share value:"  
dorling.**circleExaggerationFactor** | Value used to exaggerate circle radiuses | number | false | 0.8
dorling.**collisionPadding** | Padding to apply between each circle. Used in [d3's force simulation](https://github.com/d3/d3-force). | number | false | 0.2
dorling.**positionStrength** | The strength of the forces used to maintain the circle at its original position. | number | false | 3
dorling.**collisionStrength** | The strength of the collisions between circle during the d3 force simulation | number | false | 0.1
dorling.**scale** | d3-geo projection.scale() value | number | false | 0.000206
dorling.**rotateX** | d3-geo projection.rotate() X value | number | false | -13
dorling.**translateX** | d3-geo projection.translate() X value | number | false | -500
dorling.**translateY** | d3-geo projection.translate() Y value | number | false | 1126

