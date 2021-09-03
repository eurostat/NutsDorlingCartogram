import * as d3scaleChromatic from "d3-scale-chromatic";
import * as d3zoom from "d3-zoom";
import * as d3scale from "d3-scale";
import * as d3fetch from "d3-fetch";
import * as d3format from "d3-format";
import * as d3force from "d3-force";
import * as d3array from "d3-array";
import * as d3select from "d3-selection";
import { event as currentEvent } from 'd3-selection';
import * as d3geo from "d3-geo";
import * as topojson from "topojson";
import { legendColor } from "d3-svg-legend";
import $ from 'jquery'

const createStandaloneHTMLString = require('./templates/standalone');

/**
 * Main accessor function
 *
 * @return {*} output object
 */
export function dorling() {
  //the output object
  let out = {};

  //default values
  out.containerId_ = "";
  out.standalone_ = true;

  out.title_ = ""; //viz main title
  //styles
  out.seaColor_ = "white";
  out.playButtonFill_ = "#212529";
  out.coastalMargins_ = false;
  out.graticule_ = false;
  out.nutsBorderColor_ = "grey";
  out.toggleLegendWidthThreshold_ = 850;
  out.toggleLegendHeightThreshold_ = 700; //height (px) at which the legend is loaded in "collapsable" mode

  //d3 force
  // out.circleExaggerationFactor_ = 1.2; //deprecated
  // out.collisionPadding_ = 0.1; //deprectated
  out.positionStrength_ = 0.4;
  out.collisionStrength_ = 0.7;
  //circle radius
  out.minCircleRadius_ = { '0': 1.5, '1': 1.5, '2': 1.5, '3': 1.5 };
  out.maxCircleRadius_ = { '0': 20, '1': 20, '2': 20, '3': 20 };
  out.circleSizeFunction_ = null; // lets user define custom d3 scale function
  //d3-geo
  out.translateX_ = -350; //-390;
  out.translateY_ = 1120; //1126;
  out.scale_ = 0.0002065379208173783;
  out.fitSizePadding_ = 0;
  //viewbox
  out.width_ = 1000;
  out.height_ = 1000;
  //d3 scale
  out.colorScheme_ = "interpolateRdYlBu";
  out.colors_ = null; //["#000",etc]
  out.thresholdValues_ = null; //[1,100,1000]
  //interactivity
  out.loop_ = false;
  out.pauseButton_ = false;
  out.showBorders_ = true;
  out.legendHeight_ = 550;
  out.legendWidth_ = 250;
  //size legend (circle radiuses)
  out.sizeLegend_ = {
    title: "Circle Size",
    titleYOffset: { '0': 20, '1': 20, '2': 20, '3': 20 },
    titleXOffset: { '0': 0, '1': 0, '2': 0, '3': 0 },
    textFunction: function (d) { return d.toLocaleString() },
    values: {},
    translateY: { '0': 0, '1': 0, '2': 0, '3': 0 },
    bodyXOffset: { '0': 50, '1': 50, '2': 50, '3': 50 },
    bodyYOffset: { '0': 140, '1': 100, '2': 100, '3': 90 },
    labelsTranslateX: { '0': 40, '1': 40, '2': 40, '3': 40 },
    textOffsetY: { '0': -12, '1': -12, '2': -12, '3': -12 },
    labelsOffsetY: { '0': 2, '1': 2, '2': 2, '3': 2 }
  };
  //color legend
  out.colorLegend_ = {
    //https://d3-legend.susielu.com/#color
    titleWidth: 250,
    title: "Circle Colour",
    titleYOffset: { 0: 170, 1: 160, 2: 160, 3: 160 },
    bodyYOffset: { 0: 50, 1: 50, 2: 50, 3: 50 },
    orient: "vertical",
    cells: null,
    shape: "circle",
    shapeRadius: 10,
    shapePadding: 5,
    labelAlign: "middle",
    labelOffset: 10,
    labelFormat: d3format.format(".1f"),
    locale: {
      "decimal": "\u066b",
      "thousands": " ",
      "grouping": [3],
      "currency": ["", " \u062f\u002e\u0625\u002e"],
      "numerals": ["\u0660", "\u0661", "\u0662", "\u0663", "\u0664", "\u0665", "\u0666", "\u0667", "\u0668", "\u0669"]
    },
    labelFontSize: 15,
    labelDelimiter: " to ",
    labelUnit: " ",
    labelWrap: 140,
    eu27: null,
    translateX: 0,
    translateY: 135,
    cellsTranslateX: 3,
    cellsTranslateY: 2
  };
  //selectors
  out.nutsSelectorTranslateY_ = { 0: 375, 1: 375, 2: 375, 3: 375 };
  out.showNutsSelector_ = true;
  out.nutsSelectorSvgHeight_ = 140;
  out.nutsSelectorSvgWidth_ = 100;
  //overseas inset maps
  out.showInsets_ = true;
  out.insets_ = {
    height: { 1: 340, 2: 340, 3: 550 },
    titleWidth: 120,
    overseasHeight: 60,
    overseasWidth: 60,
    translateX: 0,
    translateY: 0,
    // captionY: 65,
    // captionX: -30,
    captionY: 12,
    captionX: 3,
    captionFontSize: 9,
    yOffset: 15,
    xOffset: 15,
    circleYOffset: 45,
    circleXOffset: 37,
    spacing: 78, //between the start of each rect
    padding: 15 //so that the geometries arent touching the rect borders
  }
  //tooltip html
  out.tooltip_ = {
    colorLabel: "Color value",
    colorUnit: "",
    sizeLabel: "Size value",
    sizeUnit: "",
    shareLabel: "Share value",
    shareUnit: "%",
    sizeValueTextFunction: null
  }
  //additional text and links
  out.showAttribution_ = true;
  out.attributionText_ = 'Boundaries: © <a href="https://eurogeographics.org/" target="_blank" class="externallink">EuroGeographics</a> © <a href="https://www.fao.org/" target="_blank">UN-FAO</a>  © <a href="http://www.turkstat.gov.tr/" target="_blank">Turkstat</a>, Cartography: <a href="https://ec.europa.eu/eurostat/en/web/gisco" target="_blank">Eurostat - GISCO, 2018</a>';
  out.showSources_ = true;
  out.showFootnotes_ = false;
  out.footnotesText_ = "";

  //data params
  out.nutsAvailable_ = [0, 1, 2, 3] //available nuts levels

  out.mixNuts_ = { 0: null, 1: null, 2: null, 3: null } // e.g. {2:{UK:1, DE:1}} adds UK and DE level 1 nuts to level 2
  out.mixColorData_ = null;
  out.mixSizeData_ = null;

  out.eurostatRESTBaseURL = "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/";
  out.Nuts2jsonBaseURL = '';
  out.dataExplorerBaseURL_ = "https://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=";
  out.dataBrowserBaseURL_ = "https://ec.europa.eu/eurostat/databrowser/bookmark/";
  out.customSourceURL_ = null;
  out.sourcesPopupContent_ = null;

  out.nutsLevel_ = 2;
  out.nutsYear_ = 2016;
  out.sizeDatasetCode_ = "demo_r_pjangrp3";
  out.sizeDatasetName_ = null;
  out.colorDatasetName_ = "";
  out.sizeDatasetFilters_ = "sex=T&age=TOTAL&unit=NR&time=2018";
  out.colorDatasetCode_ = "demo_r_gind3";
  out.colorDatasetFilters_ = "indic_de=GROWRT&time=2018";
  out.exclude_ = []; //list of country codes to exclude from the data
  out.EUIds = ["EU", "EU27_2020", "EU28"] //EU ids to omit from size values
  out.colorIsPercentage_ = false;
  out.colorCalculation_ = "";
  out.colorCalculationFunction_ = null;
  out.colorCalculationDatasetCode_ = "";
  out.colorCalculationDatasetFilters_ = "";
  out.colorCalculationDimension_ = null;

  //animation loop
  out.playing = true;
  //mobile
  out.mobileWidth_ = 450;
  //standalone
  out.standalone_ = {
    infoText: null,
    twitterText: null,
    twitterTags: ["Eurostat", "DigitalRegionalYearbook"],
    twitterURL: window.location,
    embedURL: window.location,
    facebookTitle: null
  }
  out.standaloneUrl_ = ""

  //definition of generic accessors based on the name of each parameter name
  for (let p in out)
    (function () {
      let p_ = p;
      out[p_.substring(0, p_.length - 1)] = function (v) {
        if (!arguments.length) return out[p_];
        out[p_] = v;
        return out;
      };
    })();

  //override some accesors whereby only the object properties specified by the user are overwritten and where defaults are maintained for the remaining properties
  out.colorLegend = function (v) {
    for (let key in v) {
      out.colorLegend_[key] = v[key];
    }
    return out;
  };
  out.sizeLegend = function (v) {
    for (let key in v) {
      out.sizeLegend_[key] = v[key];
    }
    return out;
  };
  out.tooltip = function (v) {
    for (let key in v) {
      out.tooltip_[key] = v[key];
    }
    return out;
  };
  out.insets = function (v) {
    for (let key in v) {
      out.insets_[key] = v[key];
    }
    return out;
  };
  out.mixNuts = function (v) {
    for (let key in v) {
      out.mixNuts_[key] = v[key];
    }
    return out;
  };
  out.standalone = function (v) {
    for (let key in v) {
      out.standalone_[key] = v[key];
    }
    return out;
  };

  //initiates the construction of the visualization
  out.build = function () {
    if (getURLParamValue("simple")) {
      out.standalone_ = false;
    }
    out.containerNode_ = d3select.select("#" + out.containerId_);
    if (out.standalone_) {
      addStandaloneToDOM();
      generateEmbed();
      generateTwitterLink();
      generateFacebook();

    } else {
      out.containerNode_.attr("class", "dorling-main-container");
    }


    if (out.standalone_) {
      //add title between standaloneNav and dorling container
      addDorlingTitleToDOM();
    }
    addDorlingContainerToDOM();
    addLoadingSpinnerToDOM();
    showLoadingSpinner();

    if (out.sourcesPopupContent_) {
      addSourcesModalToDOM();
    }


    //get data and animate
    out.main();
    return out;
  };

  function addDorlingContainerToDOM() {
    if (out.standalone_) {
      out.containerNode_.append("div").attr("id", "dorling-container");
      out.dorlingContainer = d3select.select("#dorling-container");
      out.dorlingContainer.node().classList.add("standalone-dorling")
      out.containerNode_.node().classList.add("standalone-container")
    } else {
      out.dorlingContainer = out.containerNode_;
    }
  }

  function addStandaloneToDOM() {
    let container = document.createElement("div");
    container.classList.add("standalone-nav");
    out.containerNode_.node().appendChild(container);
    let text;
    if (out.standalone_.infoText) {
      text = out.standalone_.infoText;
    } else {
      text = "Each bubble represents a NUTS region. Its size represents " + out.tooltip_.sizeLabel.toLowerCase() + " and its colour represents " + out.tooltip_.colorLabel.toLowerCase() + ". Hover over a region using your mouse in order to read its values. To highlight all regions of the same colour-class, simply hover over the colours in the legend. In order to change NUTS level, use the radio buttons under 'choose geographic level' when available.";
    }
    let templateString = createStandaloneHTMLString(text);
    container.insertAdjacentHTML("beforeend", templateString);
  }

  function addSourcesModalToDOM() {
    // <div id="embed-modal" data-role="dialog" class="modal fade">
    //     <div class="modal-dialog">
    //         <!-- Modal content-->
    //         <div class="modal-content">
    //             <div class="modal-header">
    //                 <h4 class="modal-title" translate="embed.title">
    //                     Copy this code and paste it in your Website:
    //                 </h4>
    //                 <button type="button" class="close" data-dismiss="modal">
    //                     &times;
    //                 </button>
    //             </div>
    //             <div class="modal-body" id="embed-content">
    //                 <pre class="pre-scrollable"><code></code></pre>
    //             </div>
    //             <div class="modal-footer">
    //                 <!-- <button type="button" class="btn btn-warning" data-dismiss="modal">Close</button> -->
    //             </div>
    //         </div>
    //     </div>
    // </div>
    let container = document.createElement("div");
    container.classList.add("sources-popup");

    let template = ` 
    <!-- Modal -->
    <div id="sources_overlay" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" translate="sources.title">Access to source datasets:</h4>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="text-align:center;">
                    ${out.sourcesPopupContent_}
                </div>
            </div>
        </div>
    </div>`
    container.innerHTML = template;

    out.containerNode_.node().appendChild(container);
  }

  function addDorlingTitleToDOM() {
    let titleDiv = document.createElement("div");
    titleDiv.classList.add("dorling-title");
    titleDiv.innerHTML = out.title_;

    out.containerNode_.node().appendChild(titleDiv);
  }

  //e.g. when changing nuts level
  // similar to build, without certain DOM elements
  out.rebuild = function () {
    restartTransition();
    out.playing = false;
    out.stage = 1;
    out.containerNode_ = d3select.select("#" + out.containerId_);

    clearSvg();
    clearContainers();
    clearBottomText();
    showLoadingSpinner();
    out.main();
    return out;
  }

  function clearContainers() {
    if (out.legendDiv) out.legendDiv.remove();
    if (out.legendBtn) out.legendBtn.remove();
    if (out.nutsSelectorDiv) out.nutsSelectorDiv.remove();
    if (out.nutsSelectorBtn) out.nutsSelectorBtn.remove();
    if (out.overseasBtn) out.overseasBtn.remove();
    if (out.zoomBtnContainer) out.zoomBtnContainer.remove();
    if (out.footnotesDiv) out.footnotesDiv.remove();
    if (out.attributionDiv) out.attributionDiv.remove();
    if (out.sourcesDiv) out.sourcesDiv.remove();
  }
  function clearSvg() {
    //empty container of svgs
    out.dorlingContainer.selectAll("g").remove();
    out.dorlingContainer.selectAll("svg").remove();
  }
  function clearBottomText() {
    out.dorlingContainer.selectAll(".dorling-bottom-text-container").remove();
  }

  //main d3 logic
  out.main = function () {
    //add nuts selector on smaller screens
    if (window.innerWidth < out.toggleLegendWidthThreshold_ || window.innerHeight < out.toggleLegendHeightThreshold_) {
      addNutsSelectorToDOM();
    }

    //set base URL for retrieving NUTS geometries
    out.Nuts2jsonBaseURL = `https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/${out.nutsYear_}/3035/20M/`;

    if (out.nutsLevel_ == 0) {
      out.showInsets_ = false;
    } else {
      out.showInsets_ = true;
    }

    let nutsParam;
    if (out.nutsLevel_ == 0) {
      nutsParam = "country";
    } else {
      nutsParam = "nuts" + out.nutsLevel_;
    }
    //data promises
    let promises = [];
    //add exeption for GDP at NUTS 3 level (no data for latest year so overrides to previous year)
    if (out.nutsLevel_ == 3 && out.sizeDatasetCode_ == "nama_10r_3gdp" && out.colorDatasetFilters_ == "unit=PPS_EU27_2020_HAB&time=2019") {
      promises.push(
        d3fetch.json(
          //centroids
          `https://raw.githubusercontent.com/eurostat/NutsDorlingCartogram/master/assets/topojson/nuts2json/nutspt_${out.nutsLevel_}.json`
        ),
        d3fetch.json(
          //NUTS
          `${out.Nuts2jsonBaseURL}${out.nutsLevel_}.json`
        ),
        d3fetch.json(
          //countries
          `https://raw.githubusercontent.com/eurostat/NutsDorlingCartogram/master/assets/topojson/countries.json`),
        d3fetch.json(
          //sizeData
          `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?geoLevel=${nutsParam}&unit=MIO_EUR&time=2018&filterNonGeo=1`
        ),
        d3fetch.json(
          //colorData
          `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?geoLevel=${nutsParam}&unit=PPS_EU27_2020_HAB&time=2018&filterNonGeo=1`
        ),
      );
    } else {
      promises.push(
        d3fetch.json(
          //centroids
          `https://raw.githubusercontent.com/eurostat/NutsDorlingCartogram/master/assets/topojson/nuts2json/nutspt_${out.nutsLevel_}.json`
        ),
        d3fetch.json(
          //NUTS
          `${out.Nuts2jsonBaseURL}${out.nutsLevel_}.json`
        ),
        d3fetch.json(
          //countries
          `https://raw.githubusercontent.com/eurostat/NutsDorlingCartogram/master/assets/topojson/countries.json`
        ),
        d3fetch.json(
          //sizeData
          `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?geoLevel=${nutsParam}&${out.sizeDatasetFilters_}&filterNonGeo=1`
        ),
        d3fetch.json(
          //colorData
          `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?geoLevel=${nutsParam}&${out.colorDatasetFilters_}&filterNonGeo=1`
        ),
      );
    }

    //bag of mixed NUTS
    // add specified NUTS IDs (of any NUTS level) to the current nuts level
    if (out.mixNuts_ && out.mixNuts_[out.nutsLevel_]) {
      out.mixNutsFilterString = "";
      //prepare levels that need retrieving
      out.mixNuts_[out.nutsLevel_].ids.forEach((nutsID) => {
        out.mixNutsFilterString = out.mixNutsFilterString + "&geo=" + nutsID;
      })
      let nutsLevel = out.mixNuts_[out.nutsLevel_].level;
      //add promises for retrieving centroids, sizeData and ColorData of the nuts level to be merged with the current nutsLevel_
      //not currently possible to only request data for certain countries therefore I have to request the whole dataset
      promises.push(
        d3fetch.json(
          `https://raw.githubusercontent.com/eurostat/NutsDorlingCartogram/master/assets/topojson/nuts2json/nutspt_${nutsLevel}.json`
        ), //mixLevel centroids
        d3fetch.json(
          `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?${out.mixNutsFilterString}&${out.sizeDatasetFilters_}`
        ), //mixLevel sizeData
        d3fetch.json(
          `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?${out.mixNutsFilterString}&${out.colorDatasetFilters_}`
        ), //mixLevel colorData
      )
    }

    if (out.mixColorData_ && out.mixColorData_[out.nutsLevel_] && out.mixSizeData_ && out.mixSizeData_[out.nutsLevel_]) {
      // add different year for specified regions

      // res[4] & res[5] when promises are executed but if mixNuts is used as well then its res[5] & res[6]
      promises.push(
        d3fetch.json(
          `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?geoLevel=${nutsParam}&${out.mixSizeData_.filters}&filterNonGeo=1`
        )
      )
      promises.push(
        d3fetch.json(
          `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?geoLevel=${nutsParam}&${out.mixColorData_.filters}&filterNonGeo=1`
        )
      )

    }

    Promise.all(promises).then((res) => {
      hideLoadingSpinner();
      //stop previous d3 simulation
      if (out.simulation) {
        out.simulation.stop()
        out.forceInProgress = false;
      }

      out.centroids = res[0];
      //remove excluded country codes from centroids feature array
      if (out.exclude_) {
        let newFeatures = [];
        out.centroids.features.forEach((f) => {
          if (out.exclude_.indexOf(f.properties.id.substring(0, 2)) == -1) {
            newFeatures.push(f);
          }
        });
        out.centroids.features = newFeatures;
      }

      //remove madeira and azores when showing insets
      if (out.showInsets_) {
        let newFeatures = [];
        out.centroids.features.forEach((f) => {
          if (f.properties.id !== "PT20" && f.properties.id !== "PT30" && f.properties.id !== "PT3" && f.properties.id !== "PT2" && f.properties.id !== "PT200" && f.properties.id !== "PT300") {
            newFeatures.push(f);
          }
        });
        out.centroids.features = newFeatures;
      }

      //if mixing NUTS levels, add specified NUTS regions to the current level's datasets
      if (out.mixNuts_[out.nutsLevel_]) {
        let cent = res[5];
        let sizeData = res[6];
        let colorData = res[7];

        //get centroids for specified nuts ids
        cent.features.forEach((c) => {
          if (out.mixNuts_[out.nutsLevel_].ids.indexOf(c.properties.id) !== -1) {
            //add centroids of mixedNuts to current level centroids
            out.centroids.features.push(c);
          }
        })

        //index color values
        out.mixNutsColorArr = Object.entries(
          colorData.dimension.geo.category.index
        ).map(([key, val]) => ({ id: key, val: +colorData.value[val] || null }));
        let colorInd = {};
        for (let i = 0; i < out.mixNutsColorArr.length; i++) colorInd[out.mixNutsColorArr[i].id] = out.mixNutsColorArr[i].val;
        out.mixNutsColorInd = colorInd;

        //index size values
        let sizeArr = Object.entries(
          sizeData.dimension.geo.category.index
        ).map(([key, val]) => ({ id: key, val: +sizeData.value[val] || null }));
        let sizeInd = {};
        for (let i = 0; i < sizeArr.length; i++) sizeInd[sizeArr[i].id] = sizeArr[i].val;
        out.mixNutsSizeInd = sizeInd;

      }

      out.n2j = res[1];
      out.nuts0 = res[2];

      let sizeData = res[3];
      let colorData = res[4];

      let colorPromise;
      let sizePromise;

      if (out.mixColorData_ && out.mixColorData_[out.nutsLevel_]) {
        // data to fill in data gaps (e.g. greece tourism 2018)
        let sizeDataToMix = res[5];
        let colorDataToMix = res[6];
        sizePromise = new Promise((resolve, reject) => {
          indexStat(sizeData, "size", out, resolve, reject, sizeDataToMix, null);
        });
        colorPromise = new Promise((resolve, reject) => {
          indexStat(colorData, "color", out, resolve, reject, null, colorDataToMix)
        });

      } else {
        //indexing requires the use of promises for when using colorPercentageCalculationData
        sizePromise = new Promise((resolve, reject) => {
          indexStat(sizeData, "size", out, resolve, reject);
        });
        colorPromise = new Promise((resolve, reject) => {
          indexStat(colorData, "color", out, resolve, reject)
        });
      }



      let promises = [colorPromise, sizePromise];

      Promise.all(promises).then(() => {

        out.totalsIndex = getTotals(out.sizeIndicator); //total of sizeIndicator for each country

        // exclude values from eurostat data indices

        let newSizeIndicator = {};
        for (let key in out.sizeIndicator) {
          if (out.exclude_) {
            if (out.exclude_.indexOf(key.substring(0, 2)) == -1 && key.indexOf("EU") == -1) {
              newSizeIndicator[key] = out.sizeIndicator[key];
            }
          } else {
            //exlude eu values to not skew size legend values
            if (key.indexOf("EU") == -1) {
              newSizeIndicator[key] = out.sizeIndicator[key];
            }
          }
        }
        out.sizeIndicator = newSizeIndicator;

        out.countryNamesIndex_ = getCountryNamesIndex();

        out.height_ = out.width_ * (out.n2j.bbox[3] - out.n2j.bbox[1]) / (out.n2j.bbox[2] - out.n2j.bbox[0])

        //set up svg element
        out.svg = d3select.create("svg");
        out.svg
          .attr("viewBox", [0, 0, out.width_, out.height_])
          .attr("class", "dorling-svg")
          .style("background-color", out.seaColor_)
        // .style("width", "100%")

        out.dorlingContainer.node().appendChild(out.svg.node());
        // out.dorlingContainer.attr("class", "dorling-container");
        // initialize tooltip
        if (!out.tooltipElement) {
          out.tooltipElement = addTooltipToDOM();
        }

        // d3-geo
        out.projection = d3geo
          .geoIdentity()
          .reflectY(true)
          .fitExtent([[0, 0], [out.width_ + out.fitSizePadding_, out.height_ + out.fitSizePadding_]], topojson.feature(out.n2j, out.n2j.objects.nutsbn))

        out.path = d3geo.geoPath().projection(out.projection);

        if (out.translateX_ && out.translateY_) {
          out.projection.translate([out.translateX_, out.translateY_]);
        }
        if (out.scale_) {
          out.projection.scale(out.scale_);
        }

        //d3 scale
        out.colorExtent = d3array.extent(Object.values(out.colorIndicator));
        out.sizeExtent = d3array.extent(Object.values(out.sizeIndicator));
        //color scale
        out.colorScale = defineColorScale();
        out.sizeScale = defineSizeScale();

        //container for all map stuff
        out.map = out.svg.append("g").attr("transform", "translate(0,0)").attr("class", "dorling-map-container");

        if (out.graticule_) {
          out.graticule = out.map.append("g").selectAll("path").data(topojson.feature(out.n2j, out.n2j.objects.gra).features)
            .enter().append("path").attr("d", out.path).attr("class", "dorling-graticule");
        }

        // cartograms with borders
        if (out.showBorders_) {
          out.countries = out.map.append("path")
            .datum(topojson.mesh(out.nuts0, out.nuts0.objects.countries, function (a, b) { return a === b }))
            .attr("d", out.path)
            .attr("vector-effect", "non-scaling-stroke")
            .attr("class", "dorling-cntrg");

          // nutsrg
          out.nuts = out.map.append("g").attr("id", "dorling-nuts").selectAll("path").data(topojson.feature(out.n2j, out.n2j.objects.nutsrg).features)
            .enter().append("path").attr("d", out.path).attr("class", function (rg) {
              //colour excluded regions differently
              if (out.exclude_.indexOf(rg.properties.id.substring(0, 2)) == -1) {
                return "nutsrg"
              } else {
                return "cntrg"
              }
            });
        }

        // nutsbn
        out.nutsBorders = out.map.append("g").attr("id", "dorling-nuts-borders").selectAll("path").data(topojson.feature(out.n2j, out.n2j.objects.nutsbn).features)
          .enter().append("path").attr("d", out.path)
          .attr("vector-effect", "non-scaling-stroke")
          .attr("stroke", out.nutsBorderColor_).attr("fill", "none").attr("class", function (f) {
            let c;
            if (f.properties.co === "T") {
              c = "coastal"
            } else {
              //hide non-EU / EFTA borders
              // https://github.com/eurostat/Nuts2json/issues/38
              if (f.properties.eu == "F" && f.properties.cc == "T") {
                c = "dorling-no-data";
              }
              // exclude uk when excluded
              if (out.exclude_.indexOf('UK') !== -1) {
                if (f.properties.eu == "F" && f.properties.efta == "F" && f.properties.cc == "F" && f.properties.co == "F" && f.properties.oth == "T") {
                  c = "dorling-no-data";
                }
              }
            }
            return c
          });

        //define region centroids
        out.circles = out.map
          .append("g")
          .selectAll("circle")
          .data(out.centroids.features)
          .enter()
          .filter((f) => {
            if (out.sizeIndicator[f.properties.id] && out.colorIndicator[f.properties.id]) {
              return f;
            }
          })
          .append("circle")
          .attr("id", (f) => f.properties.id)
          .attr("cx", (f) => out.projection(f.geometry.coordinates)[0])
          .attr("cy", (f) => out.projection(f.geometry.coordinates)[1])
          .attr("fill", "#ffffff00")
          .attr("stroke", "#40404000")
          .attr("vector-effect", "non-scaling-stroke");

        addLegendsToDOM();

        if (out.showInsets_) {
          d3fetch.json(
            `https://raw.githubusercontent.com/eurostat/NutsDorlingCartogram/master/assets/topojson/overseas/NUTS${out.nutsLevel_}.json` //prod
          ).then((overseasTopo) => {
            addInsets(overseasTopo);
            //hide insets on small screens by default
            if (window.innerWidth < out.toggleLegendWidthThreshold_ || window.innerHeight < out.toggleLegendHeightThreshold_) {
              out.insetsSvg.node().style.display = "none";
            }
            addMouseEvents();
            addZoom();
            out.playing = true; //for pause/play
            out.stage = 1; //current transition number
            animate();
          });
        } else {
          addMouseEvents();
          addZoom();
          out.playing = true; //for pause/play
          out.stage = 1; //current transition number
          animate(); // initiate d3 animation
        }


        if (out.showAttribution_) {
          addAttributionToDOM();
        }
        //additional texts
        out.bottomTextContainer = document.createElement("div")
        out.bottomTextContainer.classList.add("dorling-bottom-text-container")
        out.dorlingContainer.node().appendChild(out.bottomTextContainer)
        if (out.showFootnotes_) {
          addFootnotesToDOM();
        }
        if (out.showSources_) {
          addSourcesToDOM();
        }
        addZoomButtonsToDOM();
        if (out.pauseButton_) {
          out.playButton = addPlayButtonToDOM();
        }
      });
      return out;
    })//Promise.all
  };

  function defineInsets(geojson) {
    out.insetsGeojson = geojson;
    let insetsJson;
    //restructure json for each NUTS level to suit d3geo fitExtent function
    if (out.nutsLevel_ == 1) {
      insetsJson = [
        {
          id: "ES7",
          name: "Canarias (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[2]]
          }
        },
        {
          id: "FRY",
          name: "Régions Ultrapériphériques Françaises (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[3]]
          }
        },
        {
          id: "PT2",
          name: "Açores (PT)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[0]]
          }
        }, {
          id: "PT3",
          name: "Madeira (PT)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[1]]
          }
        },
      ]
    } else if (out.nutsLevel_ == 2) {
      insetsJson = [
        {
          id: "ES70",
          name: "Canarias (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[0]]
          }
        },
        {
          id: "FRY2",
          name: "Martinique (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[2]]
          }
        },
        {
          id: "FRY4",
          name: "Réunion (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[4]]
          }
        },
        {
          id: "PT20",
          name: "Açores (PT)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[6]]
          }
        },
        {
          id: "FRY1",
          name: "Guadeloupe (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[1]]
          }
        },
        {
          id: "FRY3",
          name: "Guyane (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[3], geojson.features[8]]
          }
        },
        {
          id: "FRY5",
          name: "Mayotte (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[5]]
          }
        },
        {
          id: "PT30",
          name: "Madeira (PT)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[7]]
          }
        }
      ]
    } else if (out.nutsLevel_ === 3) {
      insetsJson = [
        {
          id: "ES703",
          name: "El Hierro (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[0]]
          }
        },
        {
          id: "ES704",
          name: "Fuertaventura (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[1]]
          }
        }, {
          id: "ES705",
          name: "Gran Canaria (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[2]]
          }
        }, {
          id: "ES706",
          name: "La Gomera (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[3]]
          }
        }, {
          id: "ES707",
          name: "La Palma (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[4]]
          }
        }, {
          id: "ES708",
          name: "Lanzarote (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[5]]
          }
        },
        {
          id: "ES709",
          name: "Tenerife (ES)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[6]]
          }
        }, {
          id: "FRY10",
          name: "Guadeloupe (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[7]]
          }
        }, {
          id: "FRY20",
          name: "Martinique (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[8]]
          }
        }, {
          id: "FRY30",
          name: "Guayane (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[14], geojson.features[9]]
          }
        }, {
          id: "FRY40",
          name: "Réunion (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[10]]
          }
        }, {
          id: "FRY50",
          name: "Mayotte (FR)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[11]]
          }
        }, {
          id: "PT200",
          name: "Açores (PT)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[12]]
          }
        }, {
          id: "PT300",
          name: "Madeira (PT)",
          featureCollection: {
            type: "FeatureCollection",
            features: [geojson.features[13]]
          }
        },
      ]
    }


    //add properties to insets...
    let translateY = out.insets_.translateY;
    let translateX = out.insets_.translateX;
    insetsJson.forEach(function (inset, i) {
      //define a projection for each inset - needs improving
      let proj
      if (inset.id == "FRY3") {
        //zoom in on guyane, not the border feature
        let fc = {
          type: "FeatureCollection",
          features: [geojson.features[3]]
        }
        proj = d3geo
          .geoIdentity()
          .reflectY(true)
          .fitExtent(
            [[10, 30], [out.insets_.overseasWidth, out.insets_.overseasHeight]],
            fc)
        // .clipExtent([[-55.26, 6.05], [-50.88, 1.93]]);
      } else if (inset.id == "FRY30") { //guyane nuts 3
        //zoom in on guyane, not the border feature
        let fc = {
          type: "FeatureCollection",
          features: [geojson.features[9]]
        }
        proj = d3geo
          .geoIdentity()
          .reflectY(true)
          .fitExtent(
            [[10, 30], [out.insets_.overseasWidth, out.insets_.overseasHeight]],
            fc)

      } else {
        proj = d3geo
          .geoIdentity()
          .reflectY(true)
          .fitExtent(
            [[10, 30], [out.insets_.overseasWidth, out.insets_.overseasHeight]],
            inset.featureCollection);
      }
      //positioning
      inset.x = translateX;
      inset.y = translateY;
      inset.projection = proj;
      inset.path = d3geo.geoPath().projection(proj);
      //add Y spacing
      translateY = translateY + out.insets_.spacing;
      //split into 2 columns according to inset index...
      if (out.nutsLevel_ == 3) {
        if (i == 6) {
          translateY = out.insets_.translateY;
          translateX = out.insets_.translateX + out.insets_.spacing;
        }
      } else {
        if (i == 3) {
          translateY = out.insets_.translateY;
          translateX = out.insets_.translateX + out.insets_.spacing;
        }
      }

    });

    return insetsJson;
  }

  function addInsets(overseasTopo) {
    out.insetsSvg = d3select.create("svg");
    let nutsClass = "dorling-insets-nuts" + out.nutsLevel_;
    let width;
    if (out.nutsLevel_ == 1) {
      width = "80"
    } else {
      width = "160"
    }
    out.insetsSvg
      // .attr("viewBox", [0, 0, 272, 605])
      .attr("width", width)
      .attr("height", out.insets_.height[out.nutsLevel_])
      .attr("class", "dorling-insets " + nutsClass)
    out.dorlingContainer.node().appendChild(out.insetsSvg.node());

    let objectName = "NUTS" + out.nutsLevel_;
    var geojson = topojson.feature(overseasTopo, overseasTopo.objects[objectName]);

    if (out.nutsLevel_ === 3) { //guyane is in a different object within the topojson for NUTS 3
      let guyane = topojson.feature(overseasTopo, overseasTopo.objects.guyane);
      geojson.features.push(guyane.features[0]);
    }

    let insets = defineInsets(geojson);

    //define blur
    var defs = out.insetsSvg.append('defs');
    defs
      .append('filter')
      .attr('id', 'blur')
      .append('feGaussianBlur')
      .attr('stdDeviation', 4);
    defs
      .selectAll('clipPath')
      .data(insets)
      .enter()
      .append('clipPath')
      .attr('id', function (d) {
        return 'clip-inset-' + d.id;
      })
      .append("rect")
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', out.insets_.overseasHeight + out.insets_.padding)
      .attr('width', out.insets_.overseasWidth + out.insets_.padding);

    //inset parent G element
    var g = out.insetsSvg
      .selectAll('g.insetmap')
      .data(insets)
      .enter()
      .append('g')
      .classed('insetmap', true)
      .attr('transform', function (d, i) {
        let x, y
        x = d.x;
        y = d.y
        return 'translate(' + [x, y] + ')';
      })
      .attr('id', function (d) {
        return 'inset-' + d.id;
      })
      .attr('clip-path', function (d) {
        return 'url(#clip-inset-' + d.id + ')'
      });

    //background rect
    g.append('rect')
      .classed('background', true)
      .attr('rx', "5")
      .attr('ry', "5")
      .attr('height', out.insets_.overseasHeight + out.insets_.padding)
      .attr('width', out.insets_.overseasWidth + out.insets_.padding)
    // /.attr('transform', "translate(-" + (out.insets_.overseasWidth / 2) + ",-" + (out.insets_.overseasHeight / 2) + ")")

    //geometries
    // let features = out.insetsGeojson.features;
    let index = 0;
    let insetPath = g.selectAll('path')
      .data(function (d) { return d.featureCollection.features.map(d.path); })
      .enter().append('path')
      .attr("class", function (d, i) { index++; return "inset" + index; })
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr('d', function (d) { return d; });

    index = 0;
    //apply unique styling to specific regions
    if (out.nutsLevel_ === 2) {
      insetPath.attr("fill", function (d, i) {
        index++;
        if (index == 7) { //guyane bordering geometry
          return "#E5E5E5";
        } else {
          return "white";
        }
      })
    } else if (out.nutsLevel_ === 3) {
      insetPath.attr("fill", function (d, i) {
        index++;
        if (index == 10) {
          return "#E5E5E5";
        } else {
          return "white";
        }
      })
    }

    //caption
    let caption = g
      .append("text")
      .data(insets)
      .text(d => {
        return d.name;
      })
      .attr("class", "overseas-caption")
      .attr("font-size", out.insets_.captionFontSize)
      .attr("stroke-width", 0.2)
      .attr("transform", "translate(" + out.insets_.captionX + "," + out.insets_.captionY + ")")
      .call(d3_textWrapping, out.insets_.titleWidth);

    g
      .append('rect')
      .classed('outline', true)
      .attr('rx', "5")
      .attr('ry', "5")
      .attr('height', out.insets_.overseasHeight + out.insets_.padding - 1)
      .attr('width', out.insets_.overseasWidth + out.insets_.padding - 1)
    //.attr('transform', "translate(-" + (out.insets_.overseasWidth / 2) + ",-" + (out.insets_.overseasHeight / 2) + ")")

    //add circles
    out.insetCircles = out.insetsSvg
      .append("g")
      .selectAll("circle")
      .data(insets)
      .enter()
      .filter((f) => {
        let id = f.featureCollection.features[0].properties.id;
        if (out.sizeIndicator[id] && out.colorIndicator[id]) {
          return f;
        }
      })
      .append("circle")
      .attr("cx", (d) => { return (d.x + out.insets_.circleXOffset) })
      .attr("cy", (d) => { return (d.y + out.insets_.circleYOffset) })
      .attr("fill", "#ffffff00")
      .attr("stroke", "#40404000");

  }

  function addZoomButtonsToDOM() {
    out.zoomBtnContainer = document.createElement("div");
    out.zoomBtnContainer.classList.add("dorling-leaflet-control-zoom")
    let zoomIn = document.createElement("div");
    zoomIn.title = "Zoom in";
    zoomIn.classList.add("dorling-leaflet-control-zoom-in")
    zoomIn.innerHTML = "+";

    let zoomOut = document.createElement("div");
    zoomOut.classList.add("dorling-leaflet-control-zoom-out")
    zoomOut.innerHTML = "-";
    zoomOut.title = "Zoom out";
    out.zoomBtnContainer.appendChild(zoomIn)
    out.zoomBtnContainer.appendChild(zoomOut)
    out.dorlingContainer.node().appendChild(out.zoomBtnContainer);

    zoomIn.addEventListener("click", function (e) {
      out.svg.transition().call(out.zoom.scaleBy, 1.5)
    });
    zoomOut.addEventListener("click", function (e) {
      out.svg.transition().call(out.zoom.scaleBy, 0.5)
    });
  }

  function addAttributionToDOM() {
    out.attributionDiv = document.createElement("div");
    out.attributionDiv.innerHTML = out.attributionText_;
    out.attributionDiv.classList.add("dorling-attribution");
    out.dorlingContainer.node().appendChild(out.attributionDiv);
  }


  function addSourcesToDOM() {
    out.sourcesDiv = document.createElement("div");
    out.sourcesDiv.classList.add("dorling-sources-container");
    out.bottomTextContainer.appendChild(out.sourcesDiv);

    let colorURL = out.dataExplorerBaseURL_ + out.colorDatasetCode_
    //let sizeURL = out.dataExplorerBaseURL_+ out.sizeDatasetCode_
    let colorSource = document.createElement("div");

    if (out.sourcesPopupContent_) {
      // add popup trigger
      colorSource.innerHTML = "Source: Eurostat - <a target='_blank' href='' data-toggle='modal' data-target='#sources_overlay' > access to dataset <i class='fas fa-external-link-alt'>  </i></a>";
    } else {
      if (out.customSourceURL_) {
        colorSource.innerHTML = "Source: Eurostat - <a target='_blank' href='" + out.customSourceURL_ + "'> access to dataset <i class='fas fa-external-link-alt'>  </i></a>";
      } else {
        colorSource.innerHTML = "Source: Eurostat - <a target='_blank' href='" + colorURL + "'> access to dataset <i class='fas fa-external-link-alt'>  </i></a>";
      }

    }



    out.sourcesDiv.appendChild(colorSource);

  }

  function addFootnotesToDOM() {
    out.footnotesDiv = document.createElement("div");
    out.footnotesDiv.classList.add("dorling-footnotes-container");
    out.bottomTextContainer.appendChild(out.footnotesDiv)
    out.footnotesDiv.innerHTML = out.footnotesText_;
  }

  function addMouseEvents() {
    out.circles.on("mouseover", function (f) {
      if (out.stage == 2) {
        if (out.highlightedRegion) {
          out.unhightlightRegion() //in case highlightRegion() has been used
        }
        d3select.select(this).attr("stroke-width", "3px");
        //calculate tooltip position + offsets
        let pos = getTooltipPositionFromNode(this)
        let name = f.properties.na;
        let id = f.properties.id;
        setTooltip(name, id, pos);
      }
    });
    out.circles.on("mouseout", function () {
      if (out.stage == 2) {
        out.tooltipElement.style("visibility", "hidden");
        d3select.select(this).attr("stroke-width", "1px");
      }
    });

    //INSETS
    if (out.showInsets_) {
      out.insetCircles.on("mouseover", function (f) {
        if (out.highlightedRegion) {
          out.unhightlightRegion() //in case highlightRegion() has been used
        }
        let id = f.featureCollection.features[0].properties.id;
        let name = f.name;
        if (out.stage == 2) {
          d3select.select(this).attr("stroke-width", "3px");
          out.tooltipElement.style("visibility", "visible");
          let pos = getTooltipPositionFromNode(this);
          setTooltip(name, id, pos)
        }
      });
      out.insetCircles.on("mouseout", function () {
        if (out.stage == 2) {
          out.tooltipElement.style("visibility", "hidden");
          d3select.select(this).attr("stroke-width", "1px");
          out.unhightlightRegion() //in case highlightRegion() has been used
        }
      });
    }
  }

  //calculate new tooltip position + offsets
  function getTooltipPositionFromNode(el) {
    let matrix = el.getScreenCTM().translate(
      +el.getAttribute("cx"), //svg circle
      +el.getAttribute("cy")
    );
    let tooltipNode = out.tooltipElement.node();
    let tooltipWidth = tooltipNode.offsetWidth;
    let tooltipHeight = tooltipNode.offsetHeight;
    let left = window.pageXOffset + matrix.e + 20;
    let top = window.pageYOffset + matrix.f - 105;
    let containerNode = out.dorlingContainer.node();
    if (left > containerNode.clientWidth - tooltipWidth) {
      left = left - (tooltipWidth + 40); //offset
    }
    if (left < 0) {
      left = 1;
    }
    if (top < 0) {
      top = top + (tooltipHeight + 40); //offset
    }
    return { left: left, top: top }
  }

  function setTooltip(name, id, pos) {
    if (out.tooltip_.sizeValueTextFunction) {
      if (out.tooltip_.colorUnit == "€ per inhabitant") {
        out.tooltipElement.html(`<strong>${name}</strong>
  (${id}) <i>${out.countryNamesIndex_[id[0] + id[1]]}</i><br>
  ${out.tooltip_.colorLabel}: ${out.tooltip_.colorUnit} <strong>${formatNumber(roundToOneDecimal(out.colorIndicator[id]))
          }</strong> per inhabitant <br>
  ${out.tooltip_.sizeLabel}: ${out.tooltip_.sizeUnit} ${out.tooltip_.sizeValueTextFunction((out.sizeIndicator[id]))} million <br>
  ${out.tooltip_.shareLabel}: ${roundToOneDecimal((out.sizeIndicator[id] /
            out.totalsIndex[id.substring(0, 2)]) *
            100)} ${out.tooltip_.shareUnit} <br>`);
      } else {
        out.tooltipElement.html(`<strong>${name}</strong>
  (${id}) <i>${out.countryNamesIndex_[id[0] + id[1]]}</i><br>
  ${out.tooltip_.colorLabel}: <strong>${formatNumber(roundToOneDecimal(out.colorIndicator[id]))
          }</strong> ${out.tooltip_.colorUnit}<br>
  ${out.tooltip_.sizeLabel}: ${out.tooltip_.sizeValueTextFunction((out.sizeIndicator[id]))} ${out.tooltip_.sizeUnit}<br>
  ${out.tooltip_.shareLabel}: ${roundToOneDecimal((out.sizeIndicator[id] /
            out.totalsIndex[id.substring(0, 2)]) *
            100)} ${out.tooltip_.shareUnit} <br>`);
      }

    } else {
      if (out.tooltip_.colorUnit == "€ per inhabitant") {
        out.tooltipElement.html(`<strong>${name}</strong>
        (${id}) <i>${out.countryNamesIndex_[id[0] + id[1]]}</i><br>
        ${out.tooltip_.colorLabel}: €<strong>${formatNumber(roundToOneDecimal(out.colorIndicator[id]))
          }</strong> per inhabitant<br>
        ${out.tooltip_.sizeLabel}: €${formatNumber(roundToOneDecimal(out.sizeIndicator[id]))} million<br>
        ${out.tooltip_.shareLabel}: ${roundToOneDecimal((out.sizeIndicator[id] /
            out.totalsIndex[id.substring(0, 2)]) *
            100)} ${out.tooltip_.shareUnit} <br>`);
      } else {
        out.tooltipElement.html(`<strong>${name}</strong>
        (${id}) <i>${out.countryNamesIndex_[id[0] + id[1]]}</i><br>
        ${out.tooltip_.colorLabel}: <strong>${formatNumber(roundToOneDecimal(out.colorIndicator[id]))
          }</strong> ${out.tooltip_.colorUnit}<br>
        ${out.tooltip_.sizeLabel}: ${formatNumber(roundToOneDecimal(out.sizeIndicator[id]))} ${out.tooltip_.sizeUnit}<br>
        ${out.tooltip_.shareLabel}: ${roundToOneDecimal((out.sizeIndicator[id] /
            out.totalsIndex[id.substring(0, 2)]) *
            100)} ${out.tooltip_.shareUnit} <br>`);
      }
    }
    out.tooltipElement.style("visibility", "visible");
    out.tooltipElement.style("left", pos.left + "px").style("top", pos.top + "px");
  }

  function roundToOneDecimal(n) {
    return Math.round(n * 10) / 10
  }

  function animate() {
    if (out.stage == 1) {
      if (out.playing) {
          //out.stage = 1;
          if (out.playing) {
            firstTransition();
            out.stage = 2;
          }
      }
    } else if (out.stage == 2) {
      if (out.playing) {
        out.stage = 1;
        restartTransition();
      }
    }
  }

  //hide nuts show circles
  function firstTransition() {
    //show circles
    out.circles
      .transition()
      .duration(750)
      .attr("r", (f) => sizeFunction(+out.sizeIndicator[f.properties.id]))
      .attr("fill", (f) => colorFunction(+out.colorIndicator[f.properties.id]))
      .attr("stroke", "black");
    if (out.showInsets_) {
      out.insetCircles
        .transition()
        .duration(750)
        .attr("r", (f) => {
          if (window.devicePixelRatio > 1) {
            return sizeFunction(+out.sizeIndicator[f.featureCollection.features[0].properties.id]) / window.devicePixelRatio
          } else {
            return sizeFunction(+out.sizeIndicator[f.featureCollection.features[0].properties.id]);
          }
        })
        .attr("fill", (f) => colorFunction(+out.colorIndicator[f.featureCollection.features[0].properties.id]))
        .attr("stroke", "black");
    }
    //hide nuts
    if (out.showBorders_) {
      out.nutsBorders.transition().duration(750).attr("stroke", "grey");
    } else {
      out.nutsBorders.transition().duration(750).attr("stroke", "#1f1f1f00");
      if (out.coastalMargins_) {
        if (out.margins) {
          out.margins.forEach((margin => {
            margin.attr("stroke", "#1f1f1f00").attr("stroke-width", "0px");
          }))
        }
      }

    }

    // show legends & nuts selector
    out.legendContainer.transition().duration(750).attr("opacity", 0.9);
    out.sizeLegendContainer.transition().duration(750).attr("opacity", 0.9);
    if (out.showNutsSelector_) {
      out.radioContainer.transition().duration(750).attr("opacity", 0.9);
    }

    if (!out.forceInProgress) {
      applyForce();
    }
  }

  function formatNumber(n) {
    return n
      .toLocaleString("en")
      .replace(/,/gi, " ")
  }

  function applyForce() {
    if (out.simulation) {
      out.simulation.stop()
      out.forceInProgress = false;
    }
    out.simulation = d3force
      .forceSimulation(out.centroids.features)
      .force(
        "x",
        d3force
          .forceX()
          .x((f) => out.projection(f.geometry.coordinates)[0])
          .strength(out.positionStrength_)
      )
      .force(
        "y",
        d3force
          .forceY()
          .y((f) => out.projection(f.geometry.coordinates)[1])
          .strength(out.positionStrength_)
      )
      .force(
        "collide",
        d3force
          .forceCollide()
          .radius((f) => sizeFunction(+out.sizeIndicator[f.properties.id]))
          .strength(out.collisionStrength_)
      );

    //set initial position of the circles
    for (const f of out.centroids.features) {
      f.x = out.projection(f.geometry.coordinates)[0];
      f.y = out.projection(f.geometry.coordinates)[1];
    }

    out.simulation.on("tick", () => {
      out.circles.attr("cx", (f) => f.x).attr("cy", (f) => f.y);
    });

    out.forceInProgress = true;

    out.simulation.on("end", function () {
      out.forceInProgress = false;
      out.simulation.stop();
      if (out.loop_) {
        if (out.playing) {
          restartTransition();
        }
      }
    });
  }


  function restartTransition() {
    out.stage = 1;
    out.tooltipElement.style("visibility", "hidden");
    //reset styles and restart animation
    //fade circles
    out.circles
      .transition()
      .duration(500)
      .attr("fill", "#40404000")
      .attr("stroke", "#40404000");
    // fade-in countries
    if (out.nuts) {
      out.nuts
        .transition()
        .duration(500)
        //.attr("stroke", "#404040ff")
        .attr("fill", "white");
    }

    //out.countries.transition().duration(1000).attr("stroke", "#404040ff").attr("fill", "white");
    if (!out.showBorders_) {
      //hide coastal margins
      if (out.coastalMargins_) {
        if (out.margins) {
          out.margins.forEach((margin, m) => {
            margin
              .attr("stroke", "#404040ff")
              .attr("stroke-width", m * 10 + "px")
              .attr("stroke", d3scaleChromatic.interpolateBlues(1 - Math.sqrt(m / out.marginNb)))
              .attr("fill", "none")
              .attr("opacity", "0.6")
              .attr("stroke-linecap", "round")
              .attr("stroke-linejoin", "round");
          })
        }
      }
    } else {
      out.nutsBorders.transition().duration(1000).attr("stroke", out.nutsBorderColor_);
    }

    animate();
  }

  function addZoom() {
    //add d3 zoom
    out.zoom = d3zoom
      .zoom()
      .extent([
        [0, 0],
        [out.width_, out.height_],
      ])
      .translateExtent([
        [0, 0],
        [out.width_, out.height_],
      ])
      .scaleExtent([1, 8])
      .on("zoom", () => {
        zoomed();
      })
    out.svg.call(
      out.zoom
    ).on("wheel.zoom", null);
  }
  function addLegendsToDOM() {
    out.legendSvg = d3select.create("svg");
    out.legendSvg
      // .attr("width", out.legendWidth_) //this is defined in the background size calculations
      .attr("class", "dorling-legend-svg")
      .attr("height", out.legendHeight_)


    //append legend div to main container
    // if (!out.legendDiv) {
    out.legendDiv = document.createElement("div")
    out.legendDiv.classList.add("dorling-legend-div");
    out.legendDiv.appendChild(out.legendSvg.node());
    out.dorlingContainer.node().appendChild(out.legendDiv);
    // }

    //hide legend on small screens by default
    if (window.innerWidth < out.toggleLegendWidthThreshold_ || window.innerHeight < out.toggleLegendHeightThreshold_) {
      if (!out.showLegend) {
        out.legendDiv.style.visibility = "hidden";
      }
      out.legendDiv.style.left = "50px";
    }

    //background container
    out.legendContainer = out.legendSvg
      .append("g")
      .attr("id", "dorling-legend-container")
      .attr("opacity", 0);

    addSizeLegend();

    //mobile
    // if (window.innerWidth < out.mobileWidth_) {
    //   // move body up to account for the reduction in font sizes on mobile
    //   out.colorLegend_.bodyYOffset[out.nutsLevel_] = out.colorLegend_.bodyYOffset[out.nutsLevel_] - 30;
    // }

    addColorLegend();
    addColorLegendExplanation();

    if (out.showNutsSelector_) {
      addNutsSelectorToDOM();
    }


    //add background fill rect to legend svg
    var ctx = out.legendSvg.node(),
      textElem = out.legendContainer.node(),
      SVGRect = textElem.getBBox();
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", SVGRect.x - 10);
    rect.setAttribute("y", SVGRect.y - 10);
    rect.setAttribute("width", SVGRect.width + 20);
    //set container width to calculated element node width
    out.legendSvg.attr("width", SVGRect.width);
    rect.setAttribute("height", SVGRect.height + 20);
    rect.setAttribute("fill", "white");
    rect.setAttribute("opacity", 0.8);
    ctx.insertBefore(rect, textElem);

    //if mobile, append leaflet-like button to hide and show the legend , overseas maps & nuts selector
    if (window.innerWidth < out.toggleLegendWidthThreshold_ || window.innerHeight < out.toggleLegendHeightThreshold_) {
      addLegendMenuButtonToDOM();
      if (out.showInsets_) {
        addOverseasButtonToDOM();
      }
      if (out.showNutsSelector_) {
        addNutsSelectorButtonToDOM();
      }

    }
  }

  //hidden on mobile screens but shown by default otherwise
  if (window.innerWidth < out.mobileWidth_) {
    out.showLegend = false;
  } else {
    out.showLegend = true;
  }
  function addLegendMenuButtonToDOM() {

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("dorling-leaflet-control-legend")
    out.legendBtn = document.createElement("div");
    out.legendBtn.classList.add("dorling-leaflet-control-legendBtn")
    out.legendBtn.innerHTML = "≡";
    out.legendBtn.title = "Toggle legend";
    buttonContainer.appendChild(out.legendBtn)
    out.dorlingContainer.node().appendChild(buttonContainer);


    out.legendBtn.addEventListener("click", function (e) {
      out.showLegend = !out.showLegend;
      // for smaller screens
      if (window.innerWidth < out.toggleLegendWidthThreshold_ || window.innerHeight < out.toggleLegendHeightThreshold_) {
        if (out.showLegend) {
          out.legendDiv.style.visibility = "visible";
        } else if (!out.showLegend) {
          out.legendDiv.style.visibility = "hidden";
        }
      } else {
        if (out.showLegend) {
          out.legendDiv.style.opacity = 1;
        } else if (!out.showLegend) {
          out.legendDiv.style.opacity = 0;
        }
      }
    });
  }


  function addOverseasButtonToDOM() {
    out.showOverseas = false;
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("dorling-leaflet-control-overseas")
    out.overseasBtn = document.createElement("div");
    out.overseasBtn.classList.add("dorling-leaflet-control-overseasBtn")
    out.overseasBtn.innerHTML = "<i class='fa fa-globe-europe'></i>";
    out.overseasBtn.title = "Toggle overseas regions";
    buttonContainer.appendChild(out.overseasBtn)
    out.dorlingContainer.node().appendChild(buttonContainer);
    out.overseasBtn.addEventListener("click", function (e) {
      out.showOverseas = !out.showOverseas;
      if (out.showOverseas) {
        out.insetsSvg.node().style.display = "block";
      } else if (!out.showOverseas) {
        out.insetsSvg.node().style.display = "none";
      }
    });
  }


  function addNutsSelectorButtonToDOM() {
    out.showNutsLevels = false;
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("dorling-leaflet-control-nuts-selector")
    out.nutsSelectorBtn = document.createElement("div");
    out.nutsSelectorBtn.classList.add("dorling-leaflet-control-nuts-selector-btn")
    out.nutsSelectorBtn.innerHTML = "<i class='fa fa-ellipsis-v'></i>";
    out.nutsSelectorBtn.title = "Select geographic level";
    buttonContainer.appendChild(out.nutsSelectorBtn)
    out.dorlingContainer.node().appendChild(buttonContainer);
    out.nutsSelectorBtn.addEventListener("click", function (e) {
      out.showNutsLevels = !out.showNutsLevels;
      if (out.showNutsLevels) {
        out.nutsSelectorDiv.style.display = "block";
      } else if (!out.showNutsLevels) {
        out.nutsSelectorDiv.style.display = "none";
      }
    });

  }

  function addColorLegendExplanation() {
    let explanation = out.legendContainer
      .append("g")
      .attr("fill", "black")
      .attr("class", "dorling-color-legend-explanation")
      .attr("text-anchor", "right")
      .attr("transform", "translate(" + out.colorLegend_.translateX + "," + (out.sizeLegend_.translateY[out.nutsLevel_] + out.colorLegend_.titleYOffset[out.nutsLevel_]) + ")")

    explanation
      .append("text")
      .attr("y", 5)
      .attr("x", 0)
      .attr("dy", "0em")
      .text(out.colorLegend_.title).call(d3_textWrapping, (out.colorLegend_.titleWidth - 20));
  }

  function addColorLegend() {
    out.colorLegendContainer = out.legendContainer
      .append("g")
      .attr("class", "dorling-color-legend")

    out.colorLegendContainer.attr("transform", "translate(" + out.colorLegend_.translateX + "," + (out.colorLegend_.titleYOffset[out.nutsLevel_] + out.colorLegend_.bodyYOffset[out.nutsLevel_]) + ")")


    let legend = legendColor()
      .title("Hover over the different legend classes to highlight them on the map")
      .titleWidth(out.colorLegend_.titleWidth)
      .orient(out.colorLegend_.orient)
      .shape(out.colorLegend_.shape)
      .shapePadding(out.colorLegend_.shapePadding)
      .labelAlign(out.colorLegend_.labelAlign)
      .labelOffset(out.colorLegend_.labelOffset)
      .labelFormat(d3format.format(out.colorLegend_.labelFormat))
      .scale(out.colorScale)
      .labelDelimiter(out.colorLegend_.labelDelimiter)
      .labelWrap(out.colorLegend_.labelWrap)
      .on("cellover", function (color) {
        if (out.stage == 2) {
          out.circles.transition()
            .duration(750)
            .attr("fill", (f) => {
              //if circle color isnt that of the hovered cell
              if (colorFunction(+out.colorIndicator[f.properties.id]) !== color) {
                //
                return "white"
              } else {
                return color
              }
            })
          if (out.insetCircles) {
            out.insetCircles.transition()
              .duration(750)
              .attr("fill", (f) => {
                //if circle color isnt that of the hovered cell
                if (colorFunction(+out.colorIndicator[f.featureCollection.features[0].properties.id]) !== color) {
                  //
                  return "white"
                } else {
                  return color
                }
              })
          }
        }
      })
      .on("cellout", function (d) {
        if (out.stage == 2) {
          out.circles.transition()
            .duration(750).attr("fill", (f) => colorFunction(+out.colorIndicator[f.properties.id]))
          if (out.insetCircles) {
            out.insetCircles.transition()
              .duration(750).attr("fill", (f) => colorFunction(+out.colorIndicator[f.featureCollection.features[0].properties.id]))
          }
        }
      });

    if (out.colorLegend_.cells) {
      legend.cells(out.colorLegend_.cells);
    }
    if (out.colors_) {
      if (out.colorLegend_.labels) {
        legend.labels(out.colorLegend_.labels)
      } else {
        legend.labels(function (d) {
          //colorLegend.locale() doesnt work with d3v5 so this is a work around for implementing spaces as a thousand separator
          //var r = /\-?\d+/g; //regExp for getting integers from a string
          let r = /[+-]?\d+(\.\d+)?/g; //float
          let label;

          if (d.generatedLabels[d.i].toString().indexOf(d.labelDelimiter) !== -1) {
            //first label
            if (d.i === 0) {
              label = d.generatedLabels[d.i].split(d.labelDelimiter)[1] + out.colorLegend_.labelUnit;
              var m = label.match(r);
              if (m) {
                return "< " + formatNumber(parseFloat(m[0]));
              } else {
                return label;
              }
              //last label
            } else if (d.i === d.genLength - 1) {
              label = d.generatedLabels[d.i].split(d.labelDelimiter)[0] + out.colorLegend_.labelUnit;
              var m = label.match(r);
              if (m) {
                return "≥ " + formatNumber(parseFloat(m[0]));
              } else {
                return label;
              }
              //intermediate labels
            } else {
              label = d.generatedLabels[d.i] + out.colorLegend_.labelUnit;
              var m = label.match(r);
              if (m) {
                return formatNumber(parseFloat(m[0])) + d.labelDelimiter + formatNumber(parseFloat(m[1]));
              } else {
                return label;
              }
            }
          }
        });
      }
    } else {
      if (out.colorLegend_.labels) {
        legend.labels(out.colorLegend_.labels)
      }
    }

    if (out.colorLegend_.shape == "circle")
      legend.shapeRadius(out.colorLegend_.shapeRadius);

    //init svg-color-legend
    out.legendSvg.select(".dorling-color-legend").call(legend);

    //apply indentation to legend cells
    let legendCells = d3select.select(".legendCells")
    let transform = legendCells.attr("transform");
    let translation = getTranslation(transform);
    legendCells.attr("transform", "translate(" + (translation[0] + out.colorLegend_.cellsTranslateX) + "," + (translation[1] + out.colorLegend_.cellsTranslateY) + ")")
  }

  function getTranslation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function 
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix. 
    var matrix = g.transform.baseVal.consolidate().matrix;

    // As per definition values e and f are the ones for the translation.
    return [matrix.e, matrix.f];
  }

  function addSizeLegend() {
    //assign default circle radiuses if none specified by user
    if (!out.sizeLegend_.values[out.nutsLevel_]) {
      out.sizeLegend_.values[out.nutsLevel_] = [Math.floor(out.sizeExtent[1]), Math.floor(out.sizeExtent[1] / 2), Math.floor(out.sizeExtent[1] / 10)]
    }

    out.sizeLegendContainer = out.legendContainer
      .append("g")
      .attr("id", "dorling-size-legend-container")
      .attr("opacity", 0);

    //ff positioning fix
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      // Do Firefox-related activities
      out.sizeLegendContainer.attr("transform", "translate(0," + (out.sizeLegend_.translateY[out.nutsLevel_] + 2) + ")")
    } else {
      out.sizeLegendContainer.attr("transform", "translate(0," + out.sizeLegend_.translateY[out.nutsLevel_] + ")")
    }

    // let sizeLegendBackground = out.sizeLegendContainer
    //   .append("rect")
    //   .attr("id", "dorling-size-legend-container-background")
    //   .attr("transform", "translate(0,0)");
    const legendTitle = out.sizeLegendContainer
      .append("g")
      .attr("fill", "black")
      .attr("class", "dorling-size-legend-title")
      .attr("transform", "translate(" + out.sizeLegend_.titleXOffset[out.nutsLevel_] + "," + out.sizeLegend_.titleYOffset[out.nutsLevel_] + ")")
      .attr("text-anchor", "right");
    legendTitle
      .append("text")
      .attr("y", 5)
      .attr("x", 0)
      .attr("dy", "0em")
      .text(out.sizeLegend_.title).attr("class", "dorling-legend-title").call(d3_textWrapping, out.colorLegend_.titleWidth);

    //circles
    const legC = out.sizeLegendContainer
      .append("g")
      .attr("fill", "black")
      .attr("transform", "translate(" + out.sizeLegend_.bodyXOffset[out.nutsLevel_] + "," + out.sizeLegend_.bodyYOffset[out.nutsLevel_] + ")") //TODO: make dynamic
      .attr("text-anchor", "right")
      .selectAll("g")
      // .data([20e6, 10e6, 1e6])
      .data(out.sizeLegend_.values[out.nutsLevel_])
      .join("g");
    legC
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("cy", (d) => {
        if (window.devicePixelRatio > 1) {
          return -sizeFunction(d) / window.devicePixelRatio
        } else {
          return -sizeFunction(d);
        }
      })
      .attr("r", (d) => {
        if (window.devicePixelRatio > 1) {
          return sizeFunction(d) / window.devicePixelRatio
        } else {
          return sizeFunction(d);
        }
      });

    //labels
    legC
      .append("text")
      .attr("class", "dorling-size-legend-label")
      //.attr("y", (d) => 9 - 2 * sizeFunction(d))
      .attr("y", (d, i) => {
        let r;
        if (window.devicePixelRatio > 1) {
          r = sizeFunction(d) / window.devicePixelRatio
        } else {
          r = sizeFunction(d);
        }
        let y;
        if (i == 0) {
          y = -1 - 2 * r + out.sizeLegend_.textOffsetY[out.nutsLevel_]; //add padding for first item
        } else {
          y = -1 - 2 * r + out.sizeLegend_.textOffsetY[out.nutsLevel_];
        }
        return y + out.sizeLegend_.labelsOffsetY[out.nutsLevel_]
      })
      .attr("x", out.sizeLegend_.labelsTranslateX[out.nutsLevel_])
      .attr("dy", "1.2em")
      .attr("xml:space", "preserve")
      .text((d) => {
        return out.sizeLegend_.textFunction(d);
        //return d.toLocaleString("en").replace(/,/gi, " ");
      })
    //line pointing to top of corresponding circle:
    legC.append("line")
      .style("stroke-dasharray", 2)
      .style("stroke", "grey")
      .attr("x1", 2)
      .attr("y1", (d, i) => {
        let y;
        let r;
        if (window.devicePixelRatio > 1) {
          r = sizeFunction(d) / window.devicePixelRatio
        } else {
          r = sizeFunction(d);
        }
        if (i == 0) {
          y = -1 - 2 * r; //add padding
        } else {
          y = -1 - 2 * r;
        }
        return y + out.sizeLegend_.labelsOffsetY[out.nutsLevel_];
      })
      .attr("xml:space", "preserve")
      .attr("x2", out.sizeLegend_.labelsTranslateX[out.nutsLevel_] - 3)
      .attr("y2", (d, i) => {
        let y;
        let r;
        if (window.devicePixelRatio > 1) {
          r = sizeFunction(d) / window.devicePixelRatio
        } else {
          r = sizeFunction(d);
        }
        if (i == 0) {
          y = -1 - 2 * r; //add padding
        } else {
          y = -1 - 2 * r;
        }
        return y + out.sizeLegend_.labelsOffsetY[out.nutsLevel_];
      })
  }

  var d3_textWrapping = function d3_textWrapping(text, width) {
    text.each(function () {
      var text = (0, d3select.select)(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.2,
        //ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")) || 0,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width && line.length > 1) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("dy", lineHeight + dy + "em").text(word);
        }
      }
    });
  };

  /**
   * Add svg radio buttons for changing NUTS levels
   *
   */
  function addNutsSelectorToDOM() {

    let radioWidth = 30;
    let radioHeight = 30;
    let radioRadius = 8;
    let radioDotRadius = 6;
    let padding = 0;//vertical padding between radios
    let marginTop = 40;
    let marginLeft = 5;
    let radioCxy = 5;
    let backgroundHeight = 160;
    let radioDotOpacity = 0.3;
    let outlineSelectedColor = "#022B58";

    //add to its own svg container on smaller screens and legendsSvg for larger screens
    if (window.innerWidth < out.toggleLegendWidthThreshold_ || window.innerHeight < out.toggleLegendHeightThreshold_) {
      marginTop = 15;
      out.nutsSelectorSvg = d3select.create("svg");
      out.nutsSelectorSvg
        .attr("class", "dorling-nuts-selector-svg")
        .attr("height", out.nutsSelectorSvgHeight_)
        .attr("width", out.nutsSelectorSvgWidth_)

      out.nutsSelectorDiv = document.createElement("div")
      out.nutsSelectorDiv.classList.add("dorling-nuts-selector-div");
      //hide nutsSelector and insets on small screens by default
      out.nutsSelectorDiv.style.display = "none";
      out.nutsSelectorDiv.appendChild(out.nutsSelectorSvg.node());
      out.dorlingContainer.node().appendChild(out.nutsSelectorDiv);


      out.radioContainer = out.nutsSelectorSvg
        .append("g")
        .attr("id", "dorling-nuts-selector")
        .attr("opacity", 1)
        .attr("transform", "translate(10,0)")
    } else {
      out.radioContainer = out.legendContainer
        .append("g")
        .attr("id", "dorling-nuts-selector")
        .attr("opacity", 0)
        .attr("transform", "translate(0, " + out.nutsSelectorTranslateY_[out.nutsLevel_] + ")")

      //title only on larger screens
      out.radioContainer.append("text")
        .text("Select geographic level").attr("class", "dorling-legend-title")
        .attr("transform", "translate(0,28)");
    }

    //RADIO 0
    if (out.nutsAvailable_.indexOf(0) != -1) {
      var radio0 = out.radioContainer.append("g")
        .attr("fill", "currentColor")
        .attr("class", "dorling-radio-button")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("height", "" + radioHeight + "px")
        .attr("width", "" + radioWidth + "px")
        .attr("viewBox", "0 0 " + radioWidth + " " + radioHeight + "")
        .attr("transform", "translate(" + marginLeft + "," + marginTop + ")");

      var outline0 = radio0.append("circle")
        .attr("class", "dorling-radio-outline")
        .attr("cx", "" + radioCxy + "")
        .attr("cy", "" + radioCxy + "")
        .attr("r", "" + radioRadius + "")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1")

      var dot0 = radio0.append("circle")
        .attr("opacity", radioDotOpacity)
        .attr("cx", "" + radioCxy + "")
        .attr("cy", "" + radioCxy + "")
        .attr("r", "" + radioDotRadius + "")
        .attr("class", "dorling-radio-dot")

      var label0 = radio0.append("text")
        .text("Country")
        .attr("transform", "translate(25,10)");
    }

    //RADIO 1
    if (out.nutsAvailable_.indexOf(1) !== -1) {
      var radio1 = out.radioContainer.append("g")
        .attr("fill", "currentColor")
        .attr("class", "dorling-radio-button")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("height", "" + radioHeight + "px")
        .attr("width", "" + radioWidth + "px")
        .attr("viewBox", "0 0 " + radioWidth + " " + radioHeight + "")
        .attr("transform", "translate(" + marginLeft + "," + (radioHeight + padding + marginTop) + ")");

      var outline1 = radio1.append("circle")
        .attr("class", "dorling-radio-outline")
        .attr("cx", "" + radioCxy + "")
        .attr("cy", "" + radioCxy + "")
        .attr("r", "" + radioRadius + "")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1")

      var dot1 = radio1.append("circle")
        .attr("opacity", radioDotOpacity)
        .attr("cx", "" + radioCxy + "")
        .attr("cy", "" + radioCxy + "")
        .attr("r", "" + radioDotRadius + "")
        .attr("class", "dorling-radio-dot")

      var label1 = radio1.append("text")
        .text("NUTS 1")
        .attr("transform", "translate(25,10)");
    }

    //RADIO 2
    if (out.nutsAvailable_.indexOf(2) !== -1) {
      var radio2 = out.radioContainer.append("g")
        .attr("fill", "currentColor")
        .attr("class", "dorling-radio-button")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("height", "" + radioHeight + "px")
        .attr("width", "" + radioWidth + "px")
        .attr("viewBox", "0 0 " + radioWidth + " " + radioHeight + "")
        .attr("transform", "translate(" + marginLeft + "," + (radioHeight * 2 + padding * 2 + marginTop) + ")")

      var outline2 = radio2.append("circle")
        .attr("class", "dorling-radio-outline")
        .attr("cx", "" + radioCxy + "")
        .attr("cy", "" + radioCxy + "")
        .attr("r", "" + radioRadius + "")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1")

      var dot2 = radio2.append("circle")
        .attr("opacity", radioDotOpacity)
        .attr("cx", "" + radioCxy + "")
        .attr("cy", "" + radioCxy + "")
        .attr("r", "" + radioDotRadius + "")
        .attr("class", "dorling-radio-dot")

      var label2 = radio2.append("text")
        .text("NUTS 2")
        .attr("transform", "translate(25,10)");
    }

    //RADIO 3
    if (out.nutsAvailable_.indexOf(3) !== -1) {
      var radio3 = out.radioContainer.append("g")
        .attr("fill", "currentColor")
        .attr("class", "dorling-radio-button")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("height", "" + radioHeight + "px")
        .attr("width", "" + radioWidth + "px")
        .attr("viewBox", "0 0 " + radioWidth + " " + radioHeight + "")
        .attr("transform", "translate(" + marginLeft + "," + (radioHeight * 3 + padding * 3 + marginTop) + ")")

      var outline3 = radio3.append("circle")
        .attr("class", "dorling-radio-outline")
        .attr("cx", "" + radioCxy + "")
        .attr("cy", "" + radioCxy + "")
        .attr("r", "" + radioRadius + "")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1")

      var dot3 = radio3.append("circle")
        .attr("opacity", radioDotOpacity)
        .attr("cx", "" + radioCxy + "")
        .attr("cy", "" + radioCxy + "")
        .attr("r", "" + radioDotRadius + "")
        .attr("class", "dorling-radio-dot")

      var label3 = radio3.append("text")
        .text("NUTS 3")
        .attr("transform", "translate(25,10)");
    }

    //current nutsLevel
    if (out.nutsLevel_ == 0) {
      dot0.attr("opacity", "1");
      outline0.attr("stroke", outlineSelectedColor);
    } else if (out.nutsLevel_ == 1) {
      dot1.attr("opacity", "1");
      outline1.attr("stroke", outlineSelectedColor);
    } else if (out.nutsLevel_ == 2) {
      dot2.attr("opacity", "1");
      outline2.attr("stroke", outlineSelectedColor);
    } else if (out.nutsLevel_ == 3) {
      dot3.attr("opacity", "1");
      outline3.attr("stroke", outlineSelectedColor);
    }

    if (radio0) {
      radio0.on("click", function (e) {
        nutsRadioEventHandler(0)
      });
    }
    if (radio1) {
      radio1.on("click", function (e) {
        nutsRadioEventHandler(1)
      });
    }
    if (radio2) {
      radio2.on("click", function (e) {
        nutsRadioEventHandler(2)
      });
    }
    if (radio3) {
      radio3.on("click", function (e) {
        nutsRadioEventHandler(3)
      });
    }

  }

  function nutsRadioEventHandler(nuts) {
    // let nuts = evt.currentTarget.value;
    if (out.nutsLevel_ !== nuts) {
      out.nutsLevel_ = nuts;
      out.rebuild();
    }
  }

  function addPlayButtonToDOM() {
    let buttonContainer = out.svg
      .append("g")
      .attr("class", "dorling-play-button")
      .attr(
        "transform",
        "translate(" + ((out.width_) - 30) + "," + (out.height_ - 30) + ")"
      );
    let playBtn = buttonContainer.append("g").style("visibility", "hidden");
    let pauseBtn = buttonContainer.append("g").style("visibility", "visible");

    playBtn
      .append("rect")
      .attr("width", 25)
      .attr("height", 25)
      .attr("rx", 40)
      .attr("ry", 40)
      .style("fill", out.playButtonFill_);
    playBtn
      .append("path")
      .attr("d", "M15 10 L15 40 L35 25 Z")
      .style("fill", "white")
      .attr(
        "transform",
        "scale(0.5)translate(1,0)"
      )

    pauseBtn
      .append("rect")
      .attr("width", 25)
      .attr("height", 25)
      .attr("rx", 40)
      .attr("ry", 40)
      .style("fill", out.playButtonFill_);
    pauseBtn
      .append("path")
      .attr("d", "M12,11 L23,11 23,40 12,40 M26,11 L37,11 37,40 26,40")
      .style("fill", "white")
      .attr("transform", "scale(0.5)translate(1,0)")

    buttonContainer.on("mousedown", function () {
      out.playing = !out.playing;

      //change icon
      playBtn.style("visibility", out.playing ? "hidden" : "visible");
      pauseBtn.style("visibility", out.playing ? "visible" : "hidden");

      //continue animation or end simulation
      if (out.playing) {
        animate();
      }
    });

    return buttonContainer;
  }

  //accessible functions
  out.play = function () {
    out.playing = true;
    animate();
  }
  out.pause = function () {
    out.playing = false;
  }
  out.highlightRegion = function (nutsCode) {
    if (out.circles) {
      out.circles.attr("stroke-width", (f) => {
        if (f.properties.id == nutsCode) {
          let name = f.properties.na;
          let id = f.properties.id;
          let circle = d3select.select("#" + id);
          let node = circle.node();
          let pos = getTooltipPositionFromNode(node)
          setTooltip(name, id, pos)
          out.highlightedRegion = nutsCode;
          return "3px"
        } else {
          return "1px"
        }
      });
    }

    if (out.insetCircles) {
      out.insetCircles.attr("stroke-width", (f) => {
        if (f.id == nutsCode) {
          let name = f.name;
          let id = f.id;
          let circle = d3select.select("#" + 'inset-' + id);
          let node = circle.node();
          let pos = getTooltipPositionFromNode(node)
          setTooltip(name, id, pos)
          out.highlightedRegion = nutsCode;
          return "3px"
        } else {
          return "1px"
        }
      });
    }
  }

  out.unhightlightRegion = function () {
    out.circles.attr("stroke-width", (f) => {
      if (f.properties.id == out.highlightedRegion) {
        return "1px"
      }
    })
    out.highlightedRegion = null;
  }

  function addTooltipToDOM() {
    return d3select
      .select("body")
      .append("div")
      .attr("class", "dorling-tooltip")
      .text("");
  }

  function defineColorScale() {
    //return [0,1,2,3,...,nb-1]
    let getA = function (nb) {
      let a = [];
      for (let i = 0; i < nb; i++) a.push(i);
      return a;
    };
    if (out.colors_) {
      if (out.thresholdValues_) {
        return d3scale
          .scaleThreshold()
          .domain(out.thresholdValues_)
          .range(out.colors_)
          .unknown("#ccc")
      } else {

        //split range into equal parts, rounding up or down to nearest n
        const split = function (left, right, parts) {
          var result = [],
            delta = (right - left) / (parts - 1);
          while (left < right) {
            result.push(round(left, 5));
            left += delta;
          }
          result.push(round(right, 5));
          return result;
        }
        let domain;
        if (out.colorExtent[0] < 1) {
          domain = split(5, out.colorExtent[1], 6);
        } else {
          domain = split(out.colorExtent[0], out.colorExtent[1], 6);
        }
        return d3scale
          .scaleThreshold()
          .domain(domain)
          .range(["#2d50a0", "#6487c3", "#aab9e1", "#f0cd91", "#e6a532", "#d76e2d"])
          .unknown("#ccc")
      }
    } else {
      if (out.thresholdValues_) {
        return d3scale
          .scaleDiverging()
          .domain([out.colorExtent[0], 0, out.colorExtent[1]])
          .interpolator(d3scaleChromatic[out.colorScheme_]);
        //.range();
      } else {
        //default
        return d3scale
          .scaleDivergingSymlog((t) => d3scaleChromatic[out.colorScheme_](1 - t))
          .domain([out.colorExtent[0], out.colorExtent[1] / 2, out.colorExtent[1]])
          .nice();
      }
    }
  }

  /**
   * Defines the d3 scale used to size the circles
   *
   * @return d3.scale
   */
  function defineSizeScale() {
    let scale = out.circleSizeFunction_ || d3scale.scaleSqrt()
      .range([out.minCircleRadius_[out.nutsLevel_], out.maxCircleRadius_[out.nutsLevel_]]).domain(out.sizeExtent);
    return scale;
  }


  /**
   * returns a colour from a value using the defined d3 colour scale
   *
   * @param {float} v indicator value
   * @return {string} returns colour string
   */
  function colorFunction(v) {
    return out.colorScale(v);
  }


  /**
   * returns a radius from an indicator value using the defined d3 sizing scale
   *
   * @param {float} v indicator value
   * @return {float} 
   */
  function sizeFunction(v) {
    // let r = out.circleExaggerationFactor_ * 0.005 * Math.sqrt(val);
    let r = out.sizeScale(v);
    // let rad = r * out.circleExaggerationFactor_
    return r;
  }


  /**
   * map zoom event handler
   *
   */
  function zoomed() {
    out.map.attr("transform", currentEvent.transform);
  }

  /**
   * Adds css spinner to DOM
   *
   */
  function addLoadingSpinnerToDOM() {
    out.spinner = document.createElement("div");
    out.spinner.classList.add("dorling-loader");
    let lds = document.createElement("div")
    lds.classList.add("lds-roller")
    let son1 = document.createElement("div");
    let son2 = document.createElement("div");
    let son3 = document.createElement("div");
    let son4 = document.createElement("div");
    let son5 = document.createElement("div");
    let son6 = document.createElement("div");
    let son7 = document.createElement("div");
    let son8 = document.createElement("div");
    lds.appendChild(son1);
    lds.appendChild(son2);
    lds.appendChild(son3);
    lds.appendChild(son4);
    lds.appendChild(son5);
    lds.appendChild(son6);
    lds.appendChild(son7);
    lds.appendChild(son8);
    out.spinner.appendChild(lds);
    out.dorlingContainer.node().appendChild(out.spinner);
  }
  function showLoadingSpinner() {
    out.spinner.classList.remove("hide");
    out.spinner.classList.add("show");
  }
  function hideLoadingSpinner() {
    out.spinner.classList.remove("show");
    out.spinner.classList.add("hide");
  }

  //standalone stuff
  const generateTwitterURL = require('./components/twitter.js').generateURL
  function generateEmbed() {
    $('#embed-content').html(
      '<pre class="pre-scrollable"><code>&lt;iframe frameborder="0" height="600px" scrolling="no" width="100%" src="' +
      out.standalone_.embedURL +
      '"&gt;&lt;/iframe&gt;</code></pre>'
    )
  }
  function generateTwitterLink() {
    let text;
    if (out.standalone_.twitterText) {
      text = out.standalone_.twitterText;
    } else {
      text = "Digital Regional Yearbook: " + out.title_
    }
    $('#tweet').attr(
      'href',
      generateTwitterURL(text, out.standalone_.twitterURL, out.standalone_.twitterTags)
    )
  }
  function generateFacebook() {
    $('#facebook-button').click(function () {
      let u = window.location.href
      let t;
      if (out.standalone_.facebookTitle) {
        t = out.standalone_.facebookTitle;
      } else {
        t = out.title_
      }

      let url =
        'https://www.facebook.com/sharer/sharer.php?u=' +
        encodeURIComponent(u) +
        '&t=' +
        encodeURIComponent(t)
      window.open(
        url + '?redirect=facebook',
        'sharer',
        'toolbar=0,status=0,width=626,height=436'
      )
    })
  }



  return out;
}

/**
 * creates an index for the retrieved eurostat data
 *
 * @param {*} data //REST query reponse data
 * @param {*} type //type of data (colour or size)
 * @param {*} out 
 * @param {*} resolve
 * @param {*} reject
 */
function indexStat(data, type, out, resolve, reject, mixSizeData, mixColorData) {
  let ind = {}; //initial index

  let arr;

  //add mixed data to array here
  if (mixColorData || mixSizeData) {
    let dataToMix = mixColorData ? mixColorData : mixSizeData;
    arr = Object.entries(
      data.dimension.geo.category.index
    ).map(([key, val]) => ({ id: key, val: +data.value[val] || null }));

    let dataToMixArr = Object.entries(
      dataToMix.dimension.geo.category.index
    ).map(([key, val]) => ({ id: key, val: +dataToMix.value[val] || null }));

    let a = mixColorData ? out.mixColorData_[out.nutsLevel_] : out.mixSizeData_[out.nutsLevel_];
    dataToMixArr.forEach((rg) => {
      // if the user has specified that this region should be used to fill in the data gaps
      if (a) {
        if (a.includes(rg.id)) {
          // then add it to the main color data array
          arr.push(rg);
        }
      }
    })

  } else {
    arr = Object.entries(
      data.dimension.geo.category.index
    ).map(([key, val]) => ({ id: key, val: +data.value[val] || null }));
  }



  //if the color value is a percentage, divide each colorValue by its relevant total from colorPercentageCalculationData
  if (out.colorCalculation_ && type == "color") {
    let nutsParam;
    if (out.nutsLevel_ == 0) {
      nutsParam = "country";
    } else {
      nutsParam = "nuts" + out.nutsLevel_;
    }

    //util function
    const mergeById = (a1, a2) =>
      a1.map(itm => ({
        ...a2.find((item) => (item.id === itm.id) && item),
        ...itm
      }));

    //if mixNuts and colorPercentageCalculationData, 
    //then the data used to calculate percentages has to be of the same nuts level as the mixNuts data
    if (out.mixNuts_[out.nutsLevel_]) {
      let mixNutsLevel;
      if (out.mixNuts_[out.nutsLevel_].level == 0) {
        mixNutsLevel = "country";
      } else {
        mixNutsLevel = "nuts" + out.mixNuts_[out.nutsLevel_].level;
      }
      let promises = [];
      //totals for current nuts level
      promises.push(d3fetch.json(`${out.eurostatRESTBaseURL}${out.colorCalculationDatasetCode_}?geoLevel=${nutsParam}&${out.colorCalculationDatasetFilters_}`))
      //totals for mixNuts injected data (of a different nuts level)
      promises.push(d3fetch.json(`${out.eurostatRESTBaseURL}${out.colorCalculationDatasetCode_}?geoLevel=${mixNutsLevel}&${out.mixNutsFilterString}&${out.colorCalculationDatasetFilters_}`))

      Promise.all(promises).catch(function (err) {
        // log that I have an error, return the entire array;
        console.log('A promise failed to resolve', err);
        return promises;
      }).then((res) => {
        //full array of resolved promises
        let totals = res[0]; //(current nuts level)
        let mixTotals = res[1] //(differnt nuts level)


        let mixedTotalsArr; // array holding the totals of the regions being mixed in (those of a different NUTS level to the rest)

        // for multiple values of a dimension we need to add them all to the total
        // animals=A3100&animals=A2000&animals=A4100&animals=A4200 should be 4 iterations
        if (out.colorCalculationDimension_) {

          // NORMAL REGIONS

          let regions = Object.keys(totals.dimension.geo.category.index); // 342
          let values = totals.value;
          let dimensions = Object.keys(totals.dimension[out.colorCalculationDimension_].category.index);
          // totals for first dimension type of normal totals
          let normaltotalsArr = Object.entries(
            totals.dimension.geo.category.index
          ).map(([k, v]) => {
            return {
              id: k,
              tot: values[v] || null
            }
          });

          // INJECTED REGIONS

          let injRegions = Object.keys(mixTotals.dimension.geo.category.index); // 342
          let injValues = mixTotals.value;
          let injDimensions = Object.keys(mixTotals.dimension[out.colorCalculationDimension_].category.index);
          // totals for first dimension type of injected totals
          let injectedTotalsArr = Object.entries(
            mixTotals.dimension.geo.category.index
          ).map(([k, v]) => {
            return {
              id: k,
              tot: injValues[v] || null
            }
          });



          // loop the same number of times as there are groups of results in the eurostat REST response
          for (let i = 1; i < dimensions.length; i++) {
            let pos = (regions.length * i); // position in the values index : 341 | 683 etc;
            Object.entries(
              totals.dimension.geo.category.index
            ).map(([k, v]) => {
              let regionIndex = totals.dimension.geo.category.index[k];
              let dimValue = values[regionIndex + pos];
              if (dimValue) {
                if (normaltotalsArr[v].tot) {
                  normaltotalsArr[v].tot = normaltotalsArr[v].tot + dimValue;
                } else {
                  normaltotalsArr[v].tot = dimValue;
                }
              }
            });
          }

          // loop the same number of times as there are groups of results in the eurostat REST response
          for (let b = 1; b < injDimensions.length; b++) {
            let pos = (injRegions.length * b); // posbtion in the values index (each dimension is piled on top of the next so *2 = position in 2nd dimension)
            Object.entries(
              mixTotals.dimension.geo.category.index
            ).map(([k, v]) => {
              let regionIndex = mixTotals.dimension.geo.category.index[k];
              let dimValue = injValues[regionIndex + pos];
              if (dimValue) {
                if (injectedTotalsArr[v].tot) {
                  injectedTotalsArr[v].tot = injectedTotalsArr[v].tot + dimValue;
                } else {
                  injectedTotalsArr[v].tot = dimValue;
                }
              }
            });
          }

          // merge the totals of normal regions with the totals of injeted regions of a different NUTS level
          mixedTotalsArr = normaltotalsArr.concat(injectedTotalsArr);

          // merge the values with the totals for all nuts levels
          let mixedValuesArr = out.mixNutsColorArr.concat(arr);
          let mixNutsMerged = mergeById(mixedValuesArr, mixedTotalsArr);
          // add the mixed nuts to the final index (ind)
          for (let i = 0; i < mixNutsMerged.length; i++) {
            let value = mixNutsMerged[i].val;
            let total = mixNutsMerged[i].tot;
            let indicator;
            if (out.colorCalculation_ == "percentage") {
              indicator = ((value / total) * 100);
            } else if (out.colorCalculation_ == "per") {
              if (out.colorCalculationFunction_) {
                indicator = out.colorCalculationFunction_(value, total)
              } else {
                indicator = total / value;
              }
            }
            ind[mixNutsMerged[i].id] = indicator || null;
          }

        } else {
          // without colorCalculationDimension
          let mixTotalsArr = Object.entries(
            mixTotals.dimension.geo.category.index
          ).map(([k, v]) => ({ id: k, tot: +mixTotals.value[v] || null }));
          let mixNutsMerged = mergeById(out.mixNutsColorArr, mixTotalsArr);

          for (let i = 0; i < mixNutsMerged.length; i++) {
            let value = mixNutsMerged[i].val;
            let total = mixNutsMerged[i].tot;
            let indicator;
            if (out.colorCalculation_ == "percentage") {
              indicator = ((value / total) * 100);
            } else if (out.colorCalculation_ == "per") {
              if (out.colorCalculationFunction_) {
                indicator = out.colorCalculationFunction_(value, total)
              } else {
                indicator = total / value;
              }
            }
            ind[mixNutsMerged[i].id] = indicator || null;
          }

          //normal
          const totalsArr = Object.entries(
            totals.dimension.geo.category.index
          ).map(([k, v]) => ({ id: k, tot: +totals.value[v] || null }));
          //merge values array with totals array
          let merged = mergeById(arr, totalsArr);
          //divide each value by the desired total
          for (let i = 0; i < merged.length; i++) {
            let value = merged[i].val;
            let total = merged[i].tot;
            let indicator;
            if (out.colorCalculation_ == "percentage") {
              indicator = ((value / total) * 100);
            } else if (out.colorCalculation_ == "per") {
              if (out.colorCalculationFunction_) {
                indicator = out.colorCalculationFunction_(value, total)
              } else {
                indicator = total / value;
              }
            }
            ind[merged[i].id] = indicator || null;
          }
        }


        out.colorIndicator = ind;
        resolve();
      })
    } else {
      //without mixed nuts
      d3fetch.json(`${out.eurostatRESTBaseURL}${out.colorCalculationDatasetCode_}?geoLevel=${nutsParam}&${out.colorCalculationDatasetFilters_}`).then((totals) => {

        let totalsArr;
        // for multiple values of a dimension we need to add them all to the total
        // animals=A3100&animals=A2000&animals=A4100&animals=A4200 should be 4 iterations
        if (out.colorCalculationDimension_) {

          let regions = Object.keys(totals.dimension.geo.category.index); // 342
          let values = totals.value;
          let dimensions = Object.keys(totals.dimension[out.colorCalculationDimension_].category.index);

          // totals for first dimension type
          totalsArr = Object.entries(
            totals.dimension.geo.category.index
          ).map(([k, v]) => {
            return {
              id: k,
              tot: values[v] || null
            }
          });

          // loop the same number of times as there are groups of results in the eurostat REST response
          for (let i = 1; i < dimensions.length; i++) {
            let pos = (regions.length * i); // position in the values index : 341 | 683 etc;
            Object.entries(
              totals.dimension.geo.category.index
            ).map(([k, v]) => {
              let regionIndex = totals.dimension.geo.category.index[k];
              let dimValue = values[regionIndex + pos];
              if (dimValue) {
                if (totalsArr[v].tot) {
                  totalsArr[v].tot = totalsArr[v].tot + dimValue;
                } else {
                  totalsArr[v].tot = dimValue;
                }
              }
            });
          }

        } else {
          totalsArr = Object.entries(
            totals.dimension.geo.category.index
          ).map(([k, v]) => ({ id: k, tot: +totals.value[v] || null }));
        }


        //merge values array with totals array
        let merged = mergeById(arr, totalsArr);
        //divide each value by the desired total
        for (let i = 0; i < merged.length; i++) {
          let value = merged[i].val;
          let total = merged[i].tot;
          let indicator;
          if (out.colorCalculation_ == "percentage") {
            indicator = ((value / total) * 100);
          } else if (out.colorCalculation_ == "per") {
            if (out.colorCalculationFunction_) {
              indicator = out.colorCalculationFunction_(value, total)
            } else {
              indicator = total / value;
            }
          }
          ind[merged[i].id] = indicator || null;
        }
        out.colorIndicator = ind;
        resolve();
      })
    }
  } else {
    //otherwise, just index the data normally
    for (let i = 0; i < arr.length; i++) ind[arr[i].id] = arr[i].val;
    if (type == "size") {
      out.sizeIndicator = ind;

      if (out.mixNuts_[out.nutsLevel_]) {
        //add values to be mixed to current indices
        for (var attr in out.mixNutsSizeInd) { out.sizeIndicator[attr] = out.mixNutsSizeInd[attr]; }
      }

    } else if (type == "color") {
      out.colorIndicator = ind;

      if (out.mixNuts_[out.nutsLevel_]) {
        //add values to be mixed to current indices
        for (var attr in out.mixNutsColorInd) { out.colorIndicator[attr] = out.mixNutsColorInd[attr]; }
      }
    }

    resolve()
  }
}

/**
 * Groups data by country and calculates the sum for the given indicator
 *
 * @param {*} data //eurostat REST query response data
 * @return {*} 
 */
function getTotals(data) {
  //get total for each country
  let arr = Object.entries(data);
  let dataByCountry = Array.from(d3array.group(arr, (d) => d[0][0] + d[0][1]));
  let result = {};
  dataByCountry.forEach((country) => {
    let countryTotal = 0;
    for (let i = 0; i < country[1].length; i++) {
      countryTotal = countryTotal + country[1][i][1];
    }
    result[country[0]] = countryTotal;
  });
  return result;
}

//rounds both positive and negative float to nearest n
function round(v, nearest) {
  return (v >= 0 || -1) * Math.round((Math.abs(v) / nearest)) * nearest;
}

function getCountryNamesIndex() {
  return {
    BE: "Belgium",
    BG: "Bulgaria",
    CZ: "Czechia",
    DK: "Denmark",
    DE: "Germany",
    EE: "Estonia",
    IE: "Ireland",
    EL: "Greece",
    ES: "Spain",
    FR: "France",
    HR: "Croatia",
    IT: "Italy",
    CY: "Cyprus",
    LV: "Latvia",
    LT: "Lithuania",
    LU: "Luxembourg",
    HU: "Hungary",
    MT: "Malta",
    NL: "Netherlands",
    AT: "Austria",
    PL: "Poland",
    PT: "Portugal",
    RO: "Romania",
    SI: "Slovenia",
    SK: "Slovakia",
    FI: "Finland",
    SE: "Sweden",
    IS: "Iceland",
    LI: "Liechtenstein",
    NO: "Norway",
    CH: "Switzerland",
    ME: "Montenegro",
    MK: "North Macedonia",
    AL: "Albania",
    RS: "Serbia",
    TR: "Turkey",
    BA: "Bosnia and Herzegovina",
    XK: "Kosovo",
    UK: "United Kingdom"
  }
}

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




