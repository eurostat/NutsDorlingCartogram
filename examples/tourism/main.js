const NutsDorlingCartogram = require("nutsdorlingcartogram")

let dorling = NutsDorlingCartogram.dorling()
    .containerId("containerDiv")
    .title("Foreign tourism dependency")
    .nutsLevel(2)
    .nutsAvailable([0, 1, 2])
    // .colors(["#3A6ABD", "#789BD8", "#D1D9F1", "#EBC2DE", "#E18FC8", "#A74177"])
    .colors(["#2d50a0", "#6487c3", "#aab9e1", "#f0cd91", "#e6a532", "#d76e2d"])
    .thresholdValues([20, 40, 50, 60, 80, 1000000])
    .sizeDatasetCode("tour_occ_nin2")
    .sizeDatasetFilters("c_resid=TOTAL&unit=NR&precision=1&time=2018&nace_r2=I551-I553")
    .colorDatasetCode("tour_occ_nin2")
    .colorDatasetName("tourism")
    .colorDatasetFilters("c_resid=FOR&unit=PC_TOT&precision=1&time=2018&nace_r2=I551-I553")
    .maxCircleRadius({ 0: 70, 1: 35, 2: 30 })
    .colorLegend({
        //https://d3-legend.susielu.com/#color
        titleWidth: 250,
        title: "Foreign tourism dependency (% share of foreign tourists in total nights spent)",
        orient: "vertical",
        shapeRadius: 10,
        shapePadding: 5,
        labelAlign: "middle",
        labelFormat: ".0f",
        labelUnit: " ",
        labelOffset: 10,
        shape: "circle",
        titleYOffset: { 0: 210, 1: 160, 2: 160, 3: 160 }, // translate Y for legend title from sizeLegend Y
        bodyYOffset: { 0: 75, 1: 70, 2: 70, 3: 70 }, // translate Y for legend body from titleYOffset
    })
    .nutsSelectorTranslateY({ 0: 480, 1: 420, 2: 425 })
    .sizeLegend({
        title: "Total number of nights spent (million)",
        textFunction: function (d) {
            let n = d / 1000000;
            return n;

        },
        values: {
            0: [300000000, 100000000, 1000000],
            1: [150000000, 50000000, 1000000],
            2: [50000000, 20000000, 1000000],
            3: [5000000, 2000000, 100000]
        },
        bodyXOffset: { 0: 85, 1: 55, 2: 50 },
        bodyYOffset: { 0: 165, 1: 110, 2: 105 },
        labelsTranslateX: { 0: 90, 1: 45, 2: 40 }
    })
    .tooltip({
        colorLabel: "Foreign tourism dependency (share of total nights spent by non-residents)",
        colorUnit: "%",
        sizeLabel: "Total number of nights spent",
        sizeUnit: "million",
        sizeValueTextFunction: function (d) {
            let m = (d / 1000000);
            let n = Math.round(m * 10) / 10;
            return n.toLocaleString("en").replace(/,/gi, " ");
        },
        shareLabel: "Share of total nights spent in national total",
    })
    .showFootnotes(true)
    .footnotesText("Data not available for Ireland, Slovenia and the French regions: Bourgogne, Haute-Normandie, Picardie, Champagne-Ardenne, Limousin as well as at country level.")
    .exclude(["MK", "ME", "TR", "AL", "RS"])
    .graticule(false)
    .loop(false)
    .pauseButton(false)
    .showBorders(true)
    .positionStrength(0.3)
    .build();