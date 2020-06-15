import * as d3 from "d3";
import * as d3Array from "d3-array";
import * as d3Geo from "d3-geo";
import * as topojson from "topojson";
import { legendColor } from "d3-svg-legend";
import "./styles.css";

export function dorling(options) {
  //the output object
  let out = {};

  //default values
  out.containerId_ = "";
  //styles
  out.seaColor_ = "white";
  out.playButtonFill_ = "#212529";
  out.coastalMargins_ = false;
  out.graticule_ = false;
  out.highlightColor_ = "cyan";
  out.nutsBorderColor_ = "grey";
  //d3 force
  // out.circleExaggerationFactor_ = 1.2; //deprecated
  // out.collisionPadding_ = 0.1; //deprectated
  out.positionStrength_ = 0.1;
  out.collisionStrength_ = 0.7;

  //circle radius
  out.minCircleRadius_ = { '0': 1.5, '1': 1.5, '2': 1.5, '3': 1.5 };
  out.maxCircleRadius_ = { '0': 20, '1': 20, '2': 20, '3': 20 }

  //d3-geo
  out.translateX_ = -390; //-390;
  out.translateY_ = 1126; //1126;
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
  out.animate_ = true;
  out.loop_ = false;
  out.pauseButton_ = false;
  out.showBorders_ = true;

  //legend container
  out.legendsContainerWidth_ = 270;
  out.legendsContainerHeight_ = 600;

  //size legend (circle radiuses)
  out.sizeLegend_ = {
    title: "Circle Size",
    titleYOffset: { '0': 10, '1': 10, '2': 10, '3': 10 },
    titleXOffset: { '0': 20, '1': 20, '2': 20, '3': 20 },
    textFunction: function (d) { return d.toLocaleString() },
    values: {},
    translateY: { '0': 0, '1': 0, '2': 0, '3': 0 },
    bodyXOffset: { '0': 50, '1': 50, '2': 50, '3': 50 },
    bodyYOffset: { '0': 90, '1': 90, '2': 90, '3': 90 },
    labelsTranslateX: { '0': 40, '1': 40, '2': 40, '3': 40 },
    textOffsetY: { '0': -12, '1': -12, '2': -12, '3': -12 },
    labelsOffsetY: { '0': 2, '1': 2, '2': 2, '3': 2 }
  };

  //color legend
  out.colorLegend_ = {
    //https://d3-legend.susielu.com/#color
    titleWidth: 170,
    title: "Circle Colour",
    orient: "vertical",
    cells: null,
    shape: "rect",
    shapeRadius: 10,
    shapePadding: 5,
    labelAlign: "middle",
    labelOffset: 10,
    labelFormat: d3.format(".1f"),
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
    translateX: 20,
    translateY: 135,
    explanationYOffset: { 0: 330, 1: 330, 2: 330, 3: 330 },
    cellsTranslateX: 3,
    cellsTranslateY: 2
  };

  //selectors
  out.nutsSelectorTranslateY_ = { 0: 375, 1: 375, 2: 375, 3: 375 };
  out.showNutsSelector_ = true;

  out.showInsets_ = true;
  out.insets_ = {
    titleWidth: 120,
    overseasHeight: 72,
    overseasWidth: 72,
    translateX: 15,
    translateY: 15,
    // captionY: 65,
    // captionX: -30,
    captionY: 95,
    captionX: 5,
    captionFontSize: 13,
    yOffset: 25,
    xOffset: 25,
    radius: 70,
    circleYOffset: 75,
    circleXOffset: 75,
    spacing: 120,
    padding: 38
  }

  //tooltip html
  out.tooltip_ = {
    colorLabel: "Color value:",
    colorUnit: "",
    sizeLabel: "Size value:",
    sizeUnit: "",
    shareLabel: "Share value:",
    shareUnit: "%",
    sizeValueTextFunction: null
  }

  //additional text and links
  out.showAttribution_ = true;
  out.attributionText_ = 'Boundaries: © <a href="https://eurogeographics.org/" target="_blank" class="externallink">EuroGeographics</a> © <a href="https://www.fao.org/" target="_blank">UN-FAO</a>  © <a href="https://www.turkstat.gov.tr/" target="_blank">Turkstat</a>, Cartography: <a href="https://ec.europa.eu/eurostat/en/web/gisco" target="_blank">Eurostat - GISCO, 2017</a>';
  out.showSources_ = true;
  out.showFootnotes_ = false;
  out.footnotesText_ = "";

  //data params
  out.nutsAvailable_ = [0, 1, 2, 3] //available nuts levels
  out.mixNuts_ = { 0: null, 1: null, 2: null, 3: null } // e.g. {2:{UK:1, DE:1}} adds UK and DE level 1 nuts to level 2
  out.eurostatRESTBaseURL = "https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/";
  out.nutsLevel_ = 2;
  out.sizeDatasetCode_ = "demo_r_pjangrp3";
  out.sizeDatasetFilters_ = "sex=T&age=TOTAL&unit=NR&time=2018";
  out.colorDatasetCode_ = "demo_r_gind3";
  out.colorDatasetFilters_ = "indic_de=GROWRT&time=2018";
  out.exclude_ = null; //list of country codes to exclude from the data
  out.EUIds = ["EU", "EU27_2020", "EU28"] //EU ids to omit from size values
  out.colorIsPercentage_ = false;
  out.colorPercentageCalcDatasetCode_ = "";
  out.colorPercentageCalcDatasetFilters_ = "";

  //animation loop
  out.playing = true;

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

  //override some accesors
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

  //main build function
  out.build = function () {



    out.container_ = d3.select("#" + out.containerId_);
    addLoadingSpinnerToDOM();
    showLoadingSpinner();

    //get data and animate
    out.main();
    return out;
  };


  //e.g. when changing nuts level
  out.rebuild = function () {
    restartTransition();
    out.playing = false;
    out.stage = 1;

    out.container_ = d3.select("#" + out.containerId_);
    clearSvg();
    clearBottomText();
    showLoadingSpinner();
    out.main();
    return out;
  }
  function clearSvg() {
    //empty svg
    out.container_.selectAll("g").remove();
    out.container_.selectAll("svg").remove();
  }
  function clearBottomText() {
    out.container_.selectAll(".dorling-bottom-text-container").remove();
  }


  out.main = function () {
    if (window.screen.width < 700) {
      //mobile stuff
      out.showInsets_ = false;
    }

    //TODO: allow insets for different NUTS
    if (out.nutsLevel_ !== 2) {
      out.showInsets_ = false;
    }

    let nutsParam;
    if (out.nutsLevel_ == 0) {
      nutsParam = "country";
    } else {
      nutsParam = "nuts" + out.nutsLevel_;
    }
    //data promises
    let promises = [];
    //add exeption for GDP at NUTS 3 level (no data for 2018 so overrides to 2017 data)
    if (out.nutsLevel_ == 3 && out.sizeDatasetCode_ == "nama_10r_3gdp" && out.sizeDatasetFilters_ == "unit=MIO_EUR&time=2018") {
      promises.push(
        d3.json(
          `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/3035/nutspt_${out.nutsLevel_}.json`
        ), //centroids
        d3.json(
          `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/3035/20M/${out.nutsLevel_}.json`
        ), //NUTS
        d3.json(
          `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/3035/20M/0.json`
        ), //countries
        d3.json(
          `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?geoLevel=${nutsParam}&unit=MIO_EUR&time=2017&filterNonGeo=1`
        ), //sizeData
        d3.json(
          `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?geoLevel=${nutsParam}&unit=EUR_HAB&time=2017&filterNonGeo=1`
        ), //colorData
      );
    } else {
      promises.push(
        d3.json(
          `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/3035/nutspt_${out.nutsLevel_}.json`
        ), //centroids
        d3.json(
          `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/3035/20M/${out.nutsLevel_}.json`
        ), //NUTS
        d3.json(
          `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/3035/20M/0.json`
        ), //countries
        d3.json(
          `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?geoLevel=${nutsParam}&${out.sizeDatasetFilters_}&filterNonGeo=1`
        ), //sizeData
        d3.json(
          `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?geoLevel=${nutsParam}&${out.colorDatasetFilters_}&filterNonGeo=1`
        ), //colorData
      );
    }

    //bag of mixed NUTS
    // add specified NUTS IDs 9of any NUTS level) to the current nuts level
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
        d3.json(
          `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/3035/nutspt_${nutsLevel}.json`
        ), //mixLevel centroids
        d3.json(
          `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?${out.mixNutsFilterString}&${out.sizeDatasetFilters_}`
        ), //mixLevel sizeData
        d3.json(
          `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?${out.mixNutsFilterString}&${out.colorDatasetFilters_}`
        ), //mixLevel colorData
      )

    }

    Promise.all(promises).then((res) => {
      hideLoadingSpinner();
      //stop previous simulation
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

      //indexing requires the use of promises for when using colorPercentageCalculationData
      let sizePromise = new Promise((resolve, reject) => {
        indexStat(sizeData, "size", out, resolve, reject);
      });
      let colorPromise = new Promise((resolve, reject) => {
        indexStat(colorData, "color", out, resolve, reject)
      });

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
        out.svg = d3.create("svg");
        out.svg
          .attr("viewBox", [0, 0, out.width_, out.height_])
          .attr("id", "dorling-svg")
          .style("background-color", out.seaColor_)
          .style("width", "100%")
        if (!out.showFootnotes_) {
          out.svg.style("height", "95%")
        } else {
          out.svg.style("height", "92%")
        }

        out.container_.node().appendChild(out.svg.node());
        out.container_.attr("class", "dorling-container");
        // initialize tooltip
        if (!out.tooltipElement) {
          out.tooltipElement = addTooltipToDOM();
        }

        // d3-geo
        out.projection = d3Geo
          .geoIdentity()
          .reflectY(true)
          .fitExtent([[0, 0], [out.width_ + out.fitSizePadding_, out.height_ + out.fitSizePadding_]], topojson.feature(out.n2j, out.n2j.objects.nutsbn))

        out.path = d3Geo.geoPath().projection(out.projection);

        if (out.translateX_ && out.translateY_) {
          out.projection.translate([out.translateX_, out.translateY_]);
        }
        if (out.scale_) {
          out.projection.scale(out.scale_);
        }

        //d3 scale
        out.colorExtent = d3.extent(Object.values(out.colorIndicator));
        out.sizeExtent = d3.extent(Object.values(out.sizeIndicator));
        //color scale
        out.colorScale = defineColorScale();
        out.sizeScale = defineSizeScale();

        //container for all map stuff
        out.map = out.svg.append("g").attr("transform", "translate(0,0)").attr("class", "dorling-map-container");

        if (out.graticule_) {
          out.graticule = out.map.append("g").selectAll("path").data(topojson.feature(out.n2j, out.n2j.objects.gra).features)
            .enter().append("path").attr("d", out.path).attr("class", "dorling-graticule");
        }

        //coastal margin
        if (out.coastalMargins_) {

        }

        if (out.showBorders_) {
          //draw regions
          out.countries = out.map.append("g").attr("id", "dorling-countries").selectAll("path").data(topojson.feature(out.n2j, out.n2j.objects.cntrg).features)
            .enter().append("path").filter((f) => {
              //exclude GL
              // if (f.properties.id !== "GL") {
              return f;
              // }
            }).attr("d", out.path).attr("class", "cntrg");

          out.nuts = out.map.append("g").attr("id", "dorling-nuts").selectAll("path").data(topojson.feature(out.n2j, out.n2j.objects.nutsrg).features)
            .enter().append("path").attr("d", out.path).attr("class", function (bn) {
              if (out.exclude_.indexOf(bn.properties.id.substring(0, 2)) == -1) {
                return "nutsrg"
              } else {
                return "cntrg"
              }
            });

          //draw boundaries
          //countries
          out.countryBorders = out.map.append("g").selectAll("path").data(topojson.feature(out.n2j, out.n2j.objects.cntbn).features)
            .enter().append("path").filter((f) => {
              //exclude GL
              // if (f.properties.id !== "GL") {
              return f;
              // }
            }).attr("d", out.path)
            .attr("class", function (bn) { return "cntbn" + (bn.properties.co === "T" ? " coastal" : ""); });
        }
        //nuts
        out.nutsBorders = out.map.append("g").attr("id", "dorling-nuts-borders").selectAll("path").data(topojson.feature(out.n2j, out.n2j.objects.nutsbn).features)
          .enter().append("path").filter((f) => {
            // if (f.properties.eu == "T" || f.properties.efta == "T") {
            return f;
            // }
          }).attr("d", out.path)
          .attr("stroke", out.nutsBorderColor_).attr("fill", "none").attr("class", function (f) {
            let c = "";
            if (f.properties.co === "T") {
              c = c + "coastal"
            }
            //hide non-EU borders
            if (f.properties.eu !== "T" && f.properties.efta !== "T") {
              c = c + "dorling-no-data";
            }
            return c
            // }
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
          .attr("cx", (f) => out.projection(f.geometry.coordinates)[0])
          .attr("cy", (f) => out.projection(f.geometry.coordinates)[1])
          .attr("fill", "#ffffff00")
          .attr("stroke", "#40404000");

        //addOverseasRegions();
        if (out.showInsets_) {
          addInsets();
        } else {
          addMouseEvents();
        }

        addZoom();
        addLegendsToDOM();

        if (out.showNutsSelector_ && !out.nutsSelector) {
          addNutsSelectorToDOM();
        }

        if (out.showAttribution_) {
          addAttributionToDOM();
        }

        //additional texts
        out.bottomTextContainer = document.createElement("div")
        out.bottomTextContainer.classList.add("dorling-bottom-text-container")
        out.container_.node().appendChild(out.bottomTextContainer)
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
        out.playing = true;
        out.stage = 1; //current transition number
        animate();

      });
      return out;
    })//colorPromise
  };

  function defineInsets(geojson) {
    out.insetsGeojson = geojson;
    let insetsJson = [
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
        name: "Acores (PT)",
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
        proj = d3
          .geoIdentity()
          .reflectY(true)
          .fitExtent(
            [[10, 10], [out.insets_.overseasWidth, out.insets_.overseasHeight]],
            fc)
        // .clipExtent([[-55.26, 6.05], [-50.88, 1.93]]);
      } else {
        proj = d3
          .geoIdentity()
          .reflectY(true)
          .fitExtent(
            [[10, 10], [out.insets_.overseasWidth, out.insets_.overseasHeight]],
            inset.featureCollection);
      }
      inset.x = translateX;
      inset.y = translateY;
      inset.projection = proj;
      inset.path = d3.geoPath().projection(proj);
      translateY = translateY + out.insets_.spacing;
      //split into 2 columns
      if (i == 3) {
        translateY = out.insets_.translateY;
        translateX = out.insets_.translateX + out.insets_.spacing;
      }
    });

    return insetsJson;
  }

  function addInsets() {
    out.insetsSvg = d3.create("svg");
    out.insetsSvg
      .attr("viewBox", [0, 0, 272, 605])
      .attr("class", "dorling-insets")
    out.container_.node().appendChild(out.insetsSvg.node());

    d3.json(
      `../../assets/topojson/overseas/NUTS${out.nutsLevel_}.json`
    ).then((overseasTopo) => {

      let objectName = "NUTS" + out.nutsLevel_;
      var geojson = topojson.feature(overseasTopo, overseasTopo.objects[objectName]);
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
        .attr('transform', function (d) {
          return 'translate(' + [(d.x + out.insets_.xOffset), (d.y + out.insets_.yOffset)] + ')';
        })
        .attr('id', function (d) {
          return 'inset-' + d.name;
        })
        .attr('clip-path', function (d) {
          return 'url(#clip-inset-' + d.id + ')'
        });

      //background rect
      g.append('rect')
        .classed('background', true)
        .attr('height', out.insets_.overseasHeight + out.insets_.padding)
        .attr('width', out.insets_.overseasWidth + out.insets_.padding)
      // /.attr('transform', "translate(-" + (out.insets_.overseasWidth / 2) + ",-" + (out.insets_.overseasHeight / 2) + ")")

      //geometries
      // let features = out.insetsGeojson.features;
      let index = 0;
      g.selectAll('path')
        .data(function (d) { return d.featureCollection.features.map(d.path); })
        .enter().append('path')
        .attr("class", function (d, i) { index++; return "inset" + index; })
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr('d', function (d) { return d; });

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

      //border
      //blur
      // g.append('rect')
      //   .classed('blur', true)
      //   .attr('height', out.insets_.overseasHeight + out.insets_.padding)
      //   .attr('width', out.insets_.overseasWidth + out.insets_.padding)
      //.attr('transform', "translate(-" + (out.insets_.overseasWidth / 2) + ",-" + (out.insets_.overseasHeight / 2) + ")")
      //outline
      g
        .append('rect')
        .classed('outline', true)
        .attr('height', out.insets_.overseasHeight + out.insets_.padding - 1)
        .attr('width', out.insets_.overseasWidth + out.insets_.padding - 1)
      //.attr('transform', "translate(-" + (out.insets_.overseasWidth / 2) + ",-" + (out.insets_.overseasHeight / 2) + ")")

      //append each overseas topojson feature
      // insets.forEach(function (inset, i) {
      // let insetGeom = out.insetsSvg
      //   .append("g")
      //   .attr("id", inset.name)
      //   .selectAll("path")
      //   .data(inset.featureCollection.features)
      //   .enter()
      //   .append("path")
      //   .attr('transform', 'translate(' + [inset.x, inset.y] + ')')
      //   .attr('clip-path', 'url(#clip-inset-' + inset.name + ')')
      //   .attr("fill", "white")
      //   .attr("stroke", "black")
      //   .attr("d", inset.path);

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
        .attr("r", (f) => sizeFunction(+out.sizeIndicator[f.featureCollection.features[0].properties.id]))
        .attr("fill", (f) => colorFunction(+out.colorIndicator[f.featureCollection.features[0].properties.id]))
        .attr("stroke", "black");

      addMouseEvents();
    })
  }

  function addZoomButtonsToDOM() {
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("dorling-leaflet-control-zoom")
    let zoomIn = document.createElement("a");
    zoomIn.classList.add("dorling-leaflet-control-zoom-in")
    zoomIn.innerHTML = "+";
    let zoomOut = document.createElement("a");
    zoomOut.classList.add("dorling-leaflet-control-zoom-out")
    zoomOut.innerHTML = "-";
    buttonContainer.appendChild(zoomIn)
    buttonContainer.appendChild(zoomOut)
    out.container_.node().appendChild(buttonContainer);

    zoomIn.addEventListener("click", function (e) {
      out.svg.transition().call(out.zoom.scaleBy, 1.5)
    });
    zoomOut.addEventListener("click", function (e) {
      out.svg.transition().call(out.zoom.scaleBy, 0.5)
    });
  }

  function addAttributionToDOM() {
    let cont = out.svg.append("g").attr("class", "dorling-attribution").attr("transform", "translate(690," + (out.height_ - 4) + ")");
    let t = cont.append("text").html(out.attributionText_)

    //add background fill
    var ctx = cont.node(),
      textElem = t.node(),
      SVGRect = textElem.getBBox();

    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", SVGRect.x);
    rect.setAttribute("y", SVGRect.y);
    rect.setAttribute("width", SVGRect.width + 2);
    rect.setAttribute("height", SVGRect.height + 2);
    rect.setAttribute("fill", "white");
    ctx.insertBefore(rect, textElem);
  }


  function addSourcesToDOM() {
    let colorURL = "https://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=" + out.colorDatasetCode_
    let sizeURL = "https://appsso.eurostat.ec.europa.eu/nui/show.do?dataset=" + out.sizeDatasetCode_
    let sources = document.createElement("div");
    sources.classList.add("dorling-sources-container");
    let colorSource = document.createElement("div")
    colorSource.innerHTML = "Source (colour): Eurostat - <a target='_blank' href='" + colorURL + "'>access to dataset</a>"
    let sizeSource = document.createElement("div")
    sizeSource.innerHTML = "Source (size): Eurostat - <a target='_blank' href='" + sizeURL + "'>access to dataset</a>"
    sources.appendChild(colorSource);
    sources.appendChild(sizeSource);
    out.bottomTextContainer.appendChild(sources)
  }

  function addFootnotesToDOM() {
    let footnotes = document.createElement("div");
    footnotes.classList.add("dorling-footnotes-container");
    footnotes.innerHTML = out.footnotesText_;
    out.bottomTextContainer.appendChild(footnotes)
  }

  function addMouseEvents() {
    out.circles.on("mouseover", function (f) {
      if (out.stage == 2) {
        // d3.select(this).attr("fill", out.highlightColor_);
        d3.select(this).attr("stroke-width", "3px");

        if (out.tooltip_.sizeValueTextFunction) {
          out.tooltipElement.html(`<strong>${f.properties.na}</strong>
          (${f.properties.id}) <i>${out.countryNamesIndex_[f.properties.id[0] + f.properties.id[1]]}</i><br>
          ${out.tooltip_.colorLabel}: <strong>${
            formatNumber(roundToOneDecimal(out.colorIndicator[f.properties.id]))
            } ${out.tooltip_.colorUnit}</strong><br>
          ${out.tooltip_.sizeLabel}: ${out.tooltip_.sizeValueTextFunction((out.sizeIndicator[f.properties.id]))} ${out.tooltip_.sizeUnit}<br>
          ${out.tooltip_.shareLabel}: ${roundToOneDecimal((out.sizeIndicator[f.properties.id] /
              out.totalsIndex[f.properties.id.substring(0, 2)]) *
              100)} ${out.tooltip_.shareUnit} <br>
      `);
        } else {
          out.tooltipElement.html(`<strong>${f.properties.na}</strong>
          (${f.properties.id}) <i>${out.countryNamesIndex_[f.properties.id[0] + f.properties.id[1]]}</i><br>
          ${out.tooltip_.colorLabel}: <strong>${
            formatNumber(roundToOneDecimal(out.colorIndicator[f.properties.id]))
            } ${out.tooltip_.colorUnit}</strong><br>
          ${out.tooltip_.sizeLabel}: ${formatNumber(roundToOneDecimal(out.sizeIndicator[f.properties.id]))} ${out.tooltip_.sizeUnit}<br>
          ${out.tooltip_.shareLabel}: ${roundToOneDecimal((out.sizeIndicator[f.properties.id] /
              out.totalsIndex[f.properties.id.substring(0, 2)]) *
              100)} ${out.tooltip_.shareUnit} <br>
      `);
        }

        out.tooltipElement.style("visibility", "visible");

        //tooltip position + offsets
        let matrix = this.getScreenCTM().translate(
          +this.getAttribute("cx"),
          +this.getAttribute("cy")
        );
        let node = out.tooltipElement.node();
        let tooltipWidth = node.offsetWidth;
        let tooltipHeight = node.offsetHeight;
        let left = window.pageXOffset + matrix.e + 20;
        let top = window.pageYOffset + matrix.f - 100;
        if (left > out.width_ - tooltipWidth) {
          left = left - (tooltipWidth + 40);
        }
        if (left < 0) {
          left = 1;
        }
        if (top < 0) {
          top = top + (tooltipHeight + 40);
        }
        out.tooltipElement.style("left", left + "px").style("top", top + "px");
      }
    });
    out.circles.on("mouseout", function () {
      if (out.stage == 2) {
        out.tooltipElement.style("visibility", "hidden");
        d3.select(this).attr("stroke-width", "1px");
        // d3.select(this).attr("fill", (f) =>
        //   colorFunction(+out.colorIndicator[f.properties.id])
        // );
      }
    });

    //INSETS
    if (out.showInsets_) {
      out.insetCircles.on("mouseover", function (f) {
        let id = f.featureCollection.features[0].properties.id;
        let name = f.name;
        if (out.stage == 2) {
          // d3.select(this).attr("fill", out.highlightColor_);
          d3.select(this).attr("stroke-width", "3px");

          if (out.tooltip_.sizeValueTextFunction) {
            out.tooltipElement.html(`<strong>${name}</strong>
          (${id}) <i>${out.countryNamesIndex_[id[0] + id[1]]}</i><br>
          ${out.tooltip_.colorLabel}: <strong>${
              formatNumber(roundToOneDecimal(out.colorIndicator[id]))
              } ${out.tooltip_.colorUnit}</strong><br>
          ${out.tooltip_.sizeLabel}: ${out.tooltip_.sizeValueTextFunction((out.sizeIndicator[id]))} ${out.tooltip_.sizeUnit}<br>
          ${out.tooltip_.shareLabel}: ${roundToOneDecimal((out.sizeIndicator[id] /
                out.totalsIndex[id.substring(0, 2)]) *
                100)} ${out.tooltip_.shareUnit} <br>
      `);
          } else {
            out.tooltipElement.html(`<strong>${name}</strong>
          (${id}) <i>${out.countryNamesIndex_[id[0] + id[1]]}</i><br>
          ${out.tooltip_.colorLabel}: <strong>${
              formatNumber(roundToOneDecimal(out.colorIndicator[id]))
              } ${out.tooltip_.colorUnit}</strong><br>
          ${out.tooltip_.sizeLabel}: ${formatNumber(roundToOneDecimal(out.sizeIndicator[id]))} ${out.tooltip_.sizeUnit}<br>
          ${out.tooltip_.shareLabel}: ${roundToOneDecimal((out.sizeIndicator[id] /
                out.totalsIndex[id.substring(0, 2)]) *
                100)} ${out.tooltip_.shareUnit} <br>
      `);
          }

          out.tooltipElement.style("visibility", "visible");

          //tooltip position + offsets
          let matrix = this.getScreenCTM().translate(
            +this.getAttribute("cx"),
            +this.getAttribute("cy")
          );
          let node = out.tooltipElement.node();
          let tooltipWidth = node.offsetWidth;
          let tooltipHeight = node.offsetHeight;
          let left = window.pageXOffset + matrix.e + 20;
          let top = window.pageYOffset + matrix.f - 100;
          if (left > out.width_ - tooltipWidth) {
            left = left - (tooltipWidth + 40);
          }
          if (left < 0) {
            left = 1;
          }
          if (top < 0) {
            top = top + (tooltipHeight + 40);
          }
          out.tooltipElement.style("left", left + "px").style("top", top + "px");
        }
      });
      out.insetCircles.on("mouseout", function () {
        if (out.stage == 2) {
          out.tooltipElement.style("visibility", "hidden");
          d3.select(this).attr("stroke-width", "1px");
          // d3.select(this).attr("fill", (f) =>
          //   colorFunction(+out.colorIndicator[f.properties.id])
          // );
        }
      });
    }
  }

  function roundToOneDecimal(n) {
    return Math.round(n * 10) / 10
  }


  function animate() {
    if (out.stage == 1) {
      if (out.playing) {
        setTimeout(function () {
          //out.stage = 1;
          if (out.playing) {
            firstTransition();
            out.stage = 2;
          }
        }, 2000);
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
      .duration(1000)
      .attr("r", (f) => sizeFunction(+out.sizeIndicator[f.properties.id]))
      .attr("fill", (f) => colorFunction(+out.colorIndicator[f.properties.id]))
      .attr("stroke", "black");
    //hide nuts
    if (out.showBorders_) {
      out.nutsBorders.transition().duration(1000).attr("stroke", "grey");
    } else {
      out.nutsBorders.transition().duration(1000).attr("stroke", "#1f1f1f00");
      if (out.coastalMargins_) {
        if (out.margins) {
          out.margins.forEach((margin => {
            margin.attr("stroke", "#1f1f1f00").attr("stroke-width", "0px");
          }))
        }
      }

    }

    // show legends
    out.legendContainer.transition().duration(1000).attr("opacity", 0.9);
    out.sizeLegendContainer.transition().duration(1000).attr("opacity", 0.9);
    if (out.showNutsSelector_) {
      out.radioContainer.transition().duration(1000).attr("opacity", 0.9);
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
    out.simulation = d3
      .forceSimulation(out.centroids.features)
      .force(
        "x",
        d3
          .forceX()
          .x((f) => out.projection(f.geometry.coordinates)[0])
          .strength(out.positionStrength_)
      )
      .force(
        "y",
        d3
          .forceY()
          .y((f) => out.projection(f.geometry.coordinates)[1])
          .strength(out.positionStrength_)
      )
      .force(
        "collide",
        d3
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
      //restart after 8 seconds
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
              .attr("stroke", d3.interpolateBlues(1 - Math.sqrt(m / out.marginNb)))
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
    out.zoom = d3
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
    addColorLegend();
    addColorLegendExplanation();
    addSizeLegend();

    //ff
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      // Do Firefox-related activities
      out.legendContainerBackground.attr("height", "500").attr("width", (out.colorLegend_.titleWidth + 30));
    } else {
      out.legendContainerBackground.style("height", "500").style("width", (out.colorLegend_.titleWidth + 30));

    }
  }

  function addColorLegendExplanation() {
    let explanation = out.legendContainer
      .append("g")
      .attr("fill", "black")
      .attr("class", "dorling-color-legend-explanation")
      .attr("text-anchor", "right")
      .attr("transform", "translate(22," + (out.sizeLegend_.translateY[out.nutsLevel_] + out.colorLegend_.explanationYOffset[out.nutsLevel_]) + ")")

    explanation
      .append("text")
      .attr("y", 5)
      .attr("x", 0)
      .attr("dy", "0em")
      .text("Hover over the different legend classes to highlight them on the map").call(d3_textWrapping, out.colorLegend_.titleWidth);
  }

  function addColorLegend() {
    out.legendSvg = d3.create("svg");
    out.legendSvg
      // .attr("viewBox", [0, 0, 310, 555])
      .attr("height", out.legendsContainerHeight_)
      .attr("width", out.legendsContainerWidth_)
      .attr("viewBox", [0, 0, out.legendsContainerWidth_, out.legendsContainerHeight_])
      .attr("class", "dorling-legend")

    if (window.screen.width < 700) {
      //mobile stuff
      let node = out.legendSvg.node()
      node.style.left = "0px";
      node.style.top = "50px";
    }

    //append legend to main container
    out.container_.node().appendChild(out.legendSvg.node());

    //background container
    out.legendContainer = out.legendSvg
      .append("g")
      .attr("id", "dorling-legend-container")
      .attr("opacity", 0);

    out.legendContainerBackground = out.legendContainer
      .append("rect")
      .attr("class", "dorling-legend-container-background")
      .attr("transform", "translate(0,0)")

    //legend <g>
    out.colorLegendContainer = out.legendContainer
      .append("g")
      .attr("class", "dorling-color-legend")

    //ff positioning fix
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      // Do Firefox-related activities
      out.colorLegendContainer.attr("transform", "translate(" + out.colorLegend_.translateX + "," + (out.sizeLegend_.bodyYOffset[out.nutsLevel_] + 40) + ")")
    } else {
      out.colorLegendContainer.attr("transform", "translate(" + out.colorLegend_.translateX + "," + (out.sizeLegend_.bodyYOffset[out.nutsLevel_] + 40) + ")")
    }

    let legend = legendColor()
      .title(out.colorLegend_.title)
      .titleWidth(out.colorLegend_.titleWidth)
      .orient(out.colorLegend_.orient)
      .shape(out.colorLegend_.shape)
      .shapePadding(out.colorLegend_.shapePadding)
      .labelAlign(out.colorLegend_.labelAlign)
      .labelOffset(out.colorLegend_.labelOffset)
      .labelFormat(out.colorLegend_.labelFormat)
      .scale(out.colorScale)
      .labelDelimiter(out.colorLegend_.labelDelimiter)
      .labelWrap(out.colorLegend_.labelWrap)
      .on("cellover", function (color) {
        if (out.stage == 2) {
          out.circles.attr("fill", (f) => {
            //if circle color isnt that of the hovered cell
            if (colorFunction(+out.colorIndicator[f.properties.id]) !== color) {
              //
              return "white"
            } else {
              return color
            }
          })
        }
      })
      .on("cellout", function (d) {
        if (out.stage == 2) {
          out.circles.attr("fill", (f) => colorFunction(+out.colorIndicator[f.properties.id]))
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
    let legendCells = d3.select(".legendCells")
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

    let sizeLegendBackground = out.sizeLegendContainer
      .append("rect")
      .attr("id", "dorling-size-legend-container-background")
      .attr("transform", "translate(0,0)");
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
      .attr("cy", (d) => -sizeFunction(d))
      .attr("r", sizeFunction);

    //labels
    legC
      .append("text")
      //.attr("y", (d) => 9 - 2 * sizeFunction(d))
      .attr("y", (d, i) => {
        let y
        if (i == 0) {
          y = -1 - 2 * sizeFunction(d) + out.sizeLegend_.textOffsetY[out.nutsLevel_]; //add padding for first item
        } else {
          y = -1 - 2 * sizeFunction(d) + out.sizeLegend_.textOffsetY[out.nutsLevel_];
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
        if (i == 0) {
          y = -1 - 2 * sizeFunction(d); //add padding
        } else {
          y = -1 - 2 * sizeFunction(d);
        }
        return y + out.sizeLegend_.labelsOffsetY[out.nutsLevel_];
      })
      .attr("xml:space", "preserve")
      .attr("x2", out.sizeLegend_.labelsTranslateX[out.nutsLevel_] - 3)
      .attr("y2", (d, i) => {
        let y;
        if (i == 0) {
          y = -1 - 2 * sizeFunction(d); //add padding
        } else {
          y = -1 - 2 * sizeFunction(d);
        }
        return y + out.sizeLegend_.labelsOffsetY[out.nutsLevel_];
      })
  }

  var d3_textWrapping = function d3_textWrapping(text, width) {
    text.each(function () {
      var text = (0, d3.select)(this),
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

  function addNutsSelectorToDOM() {
    let radioWidth = 30;
    let radioHeight = 30;
    let radioRadius = 8;
    let radioDotRadius = 6;
    let padding = 0;//vertical padding between radios
    let marginTop = 40;
    let marginLeft = 30;
    let radioCxy = 5;
    let backgroundHeight = 160;
    let radioDotOpacity = 0.3;
    let outlineSelectedColor = "#022B58";


    //main container
    out.radioContainer = out.legendContainer
      .append("g")
      .attr("id", "dorling-nuts-selector")
      //.attr("class", "dorling-nuts-selector-container dorling-plugin")
      .attr("opacity", 0)
      .attr("transform", "translate(0, " + out.nutsSelectorTranslateY_[out.nutsLevel_] + ")")

    //background
    out.radioContainer
      .append("rect")
      .attr("class", "dorling-legend-container-background dorling-plugin")

    //title
    out.radioContainer.append("text")
      .text("Choose geographic level").attr("class", "dorling-legend-title")
      .attr("transform", "translate(" + (marginLeft - 5) + ",28)");

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
        .attr("stroke-width", "3")

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
        .attr("stroke-width", "3")

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
        .attr("stroke-width", "3")

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
        .attr("stroke-width", "3")

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


  out.play = function () {
    out.playing = true;
    animate();
  }
  out.pause = function () {
    out.playing = false;
  }

  function addTooltipToDOM() {
    return d3
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
        return d3
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
        return d3
          .scaleThreshold()
          .domain(domain)
          .range(["#2d50a0", "#6487c3", "#aab9e1", "#f0cd91", "#e6a532", "#d76e2d"])
          .unknown("#ccc")
      }
    } else {
      if (out.thresholdValues_) {
        return d3
          .scaleDiverging()
          .domain([out.colorExtent[0], 0, out.colorExtent[1]])
          .interpolator(d3[out.colorScheme_]);
        //.range();
      } else {
        //default
        return d3
          .scaleDivergingSymlog((t) => d3[out.colorScheme_](1 - t))
          .domain([out.colorExtent[0], out.colorExtent[1] / 2, out.colorExtent[1]])
          .nice();
      }
    }
  }

  function defineSizeScale() {
    let scale = d3.scaleSqrt()
      .range([out.minCircleRadius_[out.nutsLevel_], out.maxCircleRadius_[out.nutsLevel_]]).domain(out.sizeExtent);

    return scale;
  }

  function colorFunction(v) {
    return out.colorScale(v);
  }

  function sizeFunction(v) {
    // let r = out.circleExaggerationFactor_ * 0.005 * Math.sqrt(val);
    let r = out.sizeScale(v);
    // let rad = r * out.circleExaggerationFactor_
    return r;
  }

  function zoomed() {
    out.map.attr("transform", d3.event.transform);
    // out.countries.attr("transform", d3.event.transform);
    // out.countryBorders.attr("transform", d3.event.transform);
    // out.nuts.attr("transform", d3.event.transform);
    // out.nutsBorders.attr("transform", d3.event.transform);
    //out.kosovo.attr("transform", d3.event.transform);
  }

  function addLoadingSpinnerToDOM() {
    out.spinner = document.createElement("div");
    out.spinner.classList.add("lds-ripple");
    let son1 = document.createElement("div");
    let son2 = document.createElement("div");
    out.spinner.appendChild(son1);
    out.spinner.appendChild(son2);
    out.container_.node().appendChild(out.spinner);
  }
  function showLoadingSpinner() {
    out.spinner.classList.remove("hide");
    out.spinner.classList.add("show");
  }
  function hideLoadingSpinner() {
    out.spinner.classList.remove("show");
    out.spinner.classList.add("hide");
  }

  return out;
}

function indexStat(data, type, out, resolve, reject) {
  const arr = Object.entries(
    data.dimension.geo.category.index
  ).map(([key, val]) => ({ id: key, val: +data.value[val] || null }));
  let ind = {};

  //if the color value is a percentage, divide each colorValue by its relevant total from colorPercentageCalculationData
  if (out.colorIsPercentage_ && type == "color") {
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
      promises.push(d3.json(`${out.eurostatRESTBaseURL}${out.colorPercentageCalcDatasetCode_}?geoLevel=${nutsParam}&${out.colorPercentageCalcDatasetFilters_}`))
      //totals for mixNuts injected data nuts level
      promises.push(d3.json(`${out.eurostatRESTBaseURL}${out.colorPercentageCalcDatasetCode_}?geoLevel=${mixNutsLevel}&${out.mixNutsFilterString}&${out.colorPercentageCalcDatasetFilters_}`))

      Promise.all(promises).then((res) => {
        let totals = res[0];
        let mixTotals = res[1]
        //mixNuts
        const mixTotalsArr = Object.entries(
          mixTotals.dimension.geo.category.index
        ).map(([k, v]) => ({ id: k, tot: +mixTotals.value[v] || null }));
        let mixNutsMerged = mergeById(out.mixNutsColorArr, mixTotalsArr);
        for (let i = 0; i < mixNutsMerged.length; i++) {
          let value = mixNutsMerged[i].val;
          let total = mixNutsMerged[i].tot;
          let percentage = ((value / total) * 100);
          ind[mixNutsMerged[i].id] = percentage || null;
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
          let percentage = ((value / total) * 100);
          ind[merged[i].id] = percentage || null;
        }


        out.colorIndicator = ind;
        resolve();
      })
    } else {
      //without mixed nuts
      d3.json(`${out.eurostatRESTBaseURL}${out.colorPercentageCalcDatasetCode_}?geoLevel=${nutsParam}&${out.colorPercentageCalcDatasetFilters_}`).then((totals) => {
        const totalsArr = Object.entries(
          totals.dimension.geo.category.index
        ).map(([k, v]) => ({ id: k, tot: +totals.value[v] || null }));
        //merge values array with totals array
        let merged = mergeById(arr, totalsArr);
        //divide each value by the desired total
        for (let i = 0; i < merged.length; i++) {
          let value = merged[i].val;
          let total = merged[i].tot;
          let percentage = ((value / total) * 100);
          ind[merged[i].id] = percentage || null;
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

function getTotals(data) {
  //get total for each country
  let arr = Object.entries(data);
  let dataByCountry = Array.from(d3Array.group(arr, (d) => d[0][0] + d[0][1]));

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


