
import 'bootstrap/dist/css/bootstrap.min.css';
const NutsDorlingCartogram = require("nutsdorlingcartogram")

//standalone config
let simple = getURLParamValue("simple");
if (!simple) {
    let dropdown = document.getElementById("dorling-cereal-select-container");
    dropdown.classList.add("dorling-standalone-dropdown")
}

//indicator configs
let cropConfig = {
    C1110: {
        "maxCircleRadius": { 2: 30 },
        "sizeLegend": { values: { 2: [5000, 2500, 1000] }, bodyYOffset: { 2: 130 }, bodyXOffset: { 2: 55 } },
        "colorLegend": {
            titleYOffset: { 2: 170 }
        }
    },
    C1200: {
        "maxCircleRadius": { 2: 40 },
        "sizeLegend": { values: { 2: [450, 250, 100] }, bodyYOffset: { 2: 135 }, bodyXOffset: { 2: 55 }, labelsTranslateX: { 2: 50 } },
        "colorLegend": {
            titleYOffset: { 2: 170 }
        }
    },
    C1120: {
        "maxCircleRadius": { 2: 30 },
        "sizeLegend": { values: { 2: [1000, 500, 100] }, bodyYOffset: { 2: 130 }, bodyXOffset: { 2: 55 } },
        "colorLegend": {
            titleYOffset: { 2: 170 }
        }
    },
    C1300: {
        "maxCircleRadius": { 2: 40 },
        "sizeLegend": { values: { 2: [2000, 1000, 100] }, bodyYOffset: { 2: 130 }, bodyXOffset: { 2: 55 } },
        "colorLegend": {
            titleYOffset: { 2: 170 }
        }
    },
    C1410: {
        "maxCircleRadius": { 2: 40 },
        "sizeLegend": { values: { 2: [1000, 500, 100] }, bodyYOffset: { 2: 178 }, bodyXOffset: { 2: 70 }, labelsTranslateX: { 2: 70 } },
        "colorLegend": {
            titleYOffset: { 2: 210 }
        }
    },
    C1500: {
        "maxCircleRadius": { 2: 30 },
        "sizeLegend": { values: { 2: [4000, 2000, 500] }, bodyYOffset: { 2: 130 }, bodyXOffset: { 2: 55 } },
        "colorLegend": {
            titleYOffset: { 2: 170 }
        }
    },
    C1600: {
        "maxCircleRadius": { 2: 30 },
        "sizeLegend": { values: { 2: [1000, 500, 100] }, bodyYOffset: { 2: 130 }, bodyXOffset: { 2: 55 } },
        "colorLegend": {
            titleYOffset: { 2: 170 }
        }
    },
    C2000: {
        "maxCircleRadius": { 2: 30 },
        "sizeLegend": {
            values: { 2: [1000, 500, 100] }, bodyYOffset: { 2: 130 }, bodyXOffset: { 2: 55 }
        },
        "colorLegend": {
            titleYOffset: { 2: 170 }
        }
    }
}

//dorling initiation
let dorling = NutsDorlingCartogram.dorling()
    .containerId("containerDiv")
    .title("Cereal production")
    .nutsLevel(2)
    .mixNuts({
        2: {
            level: 1,
            ids: ["DE1", "DE2", "DE3", "DE4", "DE5", "DE6", "DE7", "DE8", "DE9", "DEA", "DEB", "DEC", "DED", "DEE", "DEF", "DEG", "UKC", "UKD", "UKE", "UKF", "UKG", "UKH", "UKI", "UKJ", "UKK", "UKL", "UKM", "UKN"]
        }
    }) //add specified NUTS codes to level 2
    .colors(["#2d50a0", "#6487c3", "#aab9e1", "#f0cd91", "#e6a532", "#d76e2d"])
    .sizeDatasetCode("apro_cpshr")
    .sizeDatasetFilters("precision=1&crops=C1110&strucpro=PR_HU_EU&time=2018")
    .colorDatasetCode("apro_cpshr")
    .colorDatasetName("crop production")
    .colorDatasetFilters("precision=1&crops=C1110&strucpro=PR_HU_EU&time=2018")
    .colorCalculation("percentage")
    .colorCalculationDatasetCode("apro_cpshr")
    .colorCalculationDatasetFilters("precision=1&crops=C0000&strucpro=PR_HU_EU&time=2018")
    .maxCircleRadius(cropConfig.C1110.maxCircleRadius)
    .colorLegend({
        //https://d3-legend.susielu.com/#color
        titleWidth: 225,
        title: "Share of total regional cereal production (%)",
        orient: "vertical",
        shapeRadius: 10,
        shapePadding: 5,
        labelAlign: "middle",
        labelFormat: ".1f",
        labelUnit: " ",
        labelOffset: 10,
        shape: "circle",
        translateY: 145,
        titleYOffset: { 2: 170 },
    })
    .sizeLegend({
        title: "Harvested production (1 000 tonnes)",
        textFunction: function (d) { return d.toLocaleString("en").replace(/,/gi, " "); },
        values: { 2: [5000, 2500, 1000] },
        bodyXOffset: { 2: 55 },
        bodyYOffset: { 2: 128 },
    })
    .tooltip({
        colorLabel: "Share of total regional cereal production",
        colorUnit: "%",
        sizeLabel: "Harvested production",
        sizeUnit: "(1 000 tonnes)",
        shareLabel: "Share of national harvested production",
        shareUnit: "%"
    })
    .showFootnotes(true)
    .footnotesText("NUTS 1 data shown for Germany and the United Kingdom.")
    .exclude(["MK", "ME", "TR", "AL", "RS"])
    .showNutsSelector(false)
    .build();


function getURLParamValue(paramName) {
    var url = window.location.search.substring(1); //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++) {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName) {
            pArr[1] = decodeURI(pArr[1])
            return pArr[1]; //return value
        }
    }
}

function optionSelected() {
    let id = document.getElementById("dorling-cereal-select").value;
    dorling.sizeDatasetFilters("precision=1&crops=" + id + "&strucpro=PR_HU_EU&time=2018")
        .colorDatasetFilters("precision=1&crops=" + id + "&strucpro=PR_HU_EU&time=2018")
        .maxCircleRadius(cropConfig[id].maxCircleRadius)
    if (cropConfig[id].sizeLegend) {
        dorling.sizeLegend(cropConfig[id].sizeLegend)
    }
    if (cropConfig[id].colorLegend) {
        dorling.colorLegend(cropConfig[id].colorLegend)
    }
    dorling.rebuild()
}