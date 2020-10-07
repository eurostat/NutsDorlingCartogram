const NutsDorlingCartogram = require("nutsdorlingcartogram")
const d3Format = require("d3-format")

var dorling = NutsDorlingCartogram.dorling()
    .containerId("containerDiv")
    .nutsLevel(2)
    .colors(["#2d50a0", "#6487c3", "#aab9e1", "#f0cd91", "#e6a532", "#d76e2d"])
    .thresholdValues([-15, -10, 0, 10, 15, 20])
    .sizeDatasetCode("demo_r_pjangrp3")
    .sizeDatasetFilters("sex=T&age=TOTAL&unit=NR&time=2019")
    .colorDatasetCode("demo_r_gind3")
    .sizeDatasetName("population")
    .colorDatasetName("population change")
    .colorDatasetFilters("indic_de=GROWRT&time=2018")
    .positionStrength(0.1)
    .maxCircleRadius({ 0: 65, 1: 25, 2: 25, 3: 20 })
    .colorLegend({
        titleWidth: 230,
        title: "Population change 2018 - 2019 (per 1 000 inhabitants)",
        orient: "vertical",
        shapeRadius: 10,
        shapePadding: 5,
        labelAlign: "middle",
        labelUnit: " ",
        labelOffset: 10,
        shape: "circle",
        labelFormat: d3Format.format(".0f"),
        titleYOffset: { 0: 220, 1: 150, 2: 150, 3: 130 }, // translate Y for legend title from sizeLegend Y
    })
    .nutsSelectorTranslateY({ 0: 465, 1: 405, 2: 400, 3: 395 })
    .sizeLegend({
        title: "Total population (million)",
        textFunction: function (d) {
            let n = d / 1000000;
            return n;
        },
        values: {
            0: [85e6, 40e6, 10e6],
            1: [20e6, 10e6, 1e6],
            2: [15e6, 5e6, 1e6],
            3: [7e6, 3e6, 5e5]
        },
        bodyXOffset: { 0: 85, 1: 50, 2: 50, 3: 50 },
        bodyYOffset: { 0: 170, 1: 105, 2: 105, 3: 85 },
        labelsTranslateX: { 0: 75, 1: 45, 2: 40, 3: 40 }
    })
    .tooltip({
        colorLabel: "Population change",
        colorUnit: "per 1 000 inhabitants",
        sizeLabel: "Total population",
        shareLabel: "Share of national population",
    })
    .showSources(true)
    .showFootnotes(true)
    .footnotesText("Data on population change refer to the changes between 1 January 2018 and 1 January 2019 and data on total population refer to 1 January 2019.")
    .exclude(["MK", "ME", "TR", "AL", "RS"])
    .seaColor("white")
    .graticule(false)
    .loop(false)
    .pauseButton(false)
    .showBorders(true)
    .build();