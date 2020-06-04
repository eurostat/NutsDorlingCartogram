import * as d3 from "d3";
import * as d3Array from "d3-array";

import * as d3Geo from "d3-geo";

import * as topojson from "topojson";
import { legendColor } from "d3-svg-legend";
import "./styles.css";
import { interpolateBlues } from "d3";

export function dorling(options) {
  //the output object
  let out = {};

  //default values
  out.containerId_ = "";
  //styles
  out.seaColor_ = "white";
  out.playButtonFill_ = "#212529";
  out.coastalMargins_ = false;
  out.graticule_ = true;
  out.highlightColor_ = "cyan";
  out.nutsBorderColor_ = "grey";
  //d3 force
  out.circleExaggerationFactor_ = 1.2;
  out.collisionPadding_ = 0.1;
  out.positionStrength_ = 0.1;
  out.collisionStrength_ = 0.7;

  //d3-geo
  out.translateX_ = -500; //-390;
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
  out.loop_ = true;
  out.pauseButton_ = false;
  out.showBorders_ = false;

  //size legend (circle radiuses)
  out.sizeLegend_ = {
    title: "Size Legend",
    titleYOffset: 0,
    titleXOffset: 20,
    textFunction: function (d) { return d.toLocaleString() },
    values: null,
    translateY: 240,
    bodyXOffset: 50,
    bodyYOffset: 90
  };

  //color legend
  out.colorLegend_ = {
    //https://d3-legend.susielu.com/#color
    titleWidth: 170,
    title: "Colour Legend",
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
    explanationYOffset: -55,
    cellsTranslateX: 3,
    cellsTranslateY: 2
  };

  out.insets_ = {
    overseasHeight: 50,
    overseasWidth: 50,
    column2OffsetLeft: 107,
    translateX: 25,
    translateY: 200,
    captionY: -30,
    captionX: -30,
    circleYOffset: 25,
    circleXOffset: 25,
    radius: 50,
    spacing: 105
  }

  //tooltip html
  out.tooltip_ = {
    colorLabel: "Color value:",
    colorUnit: "",
    sizeLabel: "Size value:",
    sizeUnit: "",
    shareLabel: "Share value:",
    sizeValueTextFunction: null
  }

  //copyright text
  out.bottomText_ = false;
  out.bottomTextFontSize_ = 12;
  out.bottomTextFill_ = "black";
  out.bottomTextFontFamily_ = "'Open Sans', 'Helvetica Neue', Arial,'Noto Sans',sans-serif";
  out.bottomTextPadding_ = 10;
  out.bottomTextTooltipMessage_ = "The designations employed and the presentation of material on this map do not imply the expression of any opinion whatsoever on the part of the European Union concerning the legal status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries. Kosovo*: This designation is without prejudice to positions on status, and is in line with UNSCR 1244/1999 and the ICJ Opinion on the Kosovo declaration of independence. Palestine*: This designation shall not be construed as recognition of a State of Palestine and is without prejudice to the individual positions of the Member States on this issue.";

  //data params
  out.nutsLevel_ = 2;
  out.showNutsSelector_ = true;
  out.sizeDatasetCode_ = "demo_r_pjangrp3";
  out.sizeDatasetFilters_ = "sex=T&age=TOTAL&unit=NR&time=2018";
  out.colorDatasetCode_ = "demo_r_gind3";
  out.colorDatasetFilters_ = "indic_de=GROWRT&time=2018";
  out.exclude_ = null; //list of country codes to exclude from the data

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
    showLoadingSpinner();
    out.main();
    return out;
  }
  function clearSvg() {
    //empty svg
    out.container_.selectAll("g").remove();
    out.container_.selectAll("svg").remove();
  }


  out.main = function () {
    let nutsParam;
    if (out.nutsLevel_ == 0) {
      nutsParam = "country"
    } else {
      nutsParam = "nuts" + out.nutsLevel_
    }
    //data promises
    let promises = [];
    //add exeption for GDP at NUTS 3 level (no data for 2018 so overrides to 2016 data)
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
          `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/${out.sizeDatasetCode_}?geoLevel=${nutsParam}&unit=MIO_EUR&time=2017`
        ), //sizeData
        d3.json(
          `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/${out.colorDatasetCode_}?geoLevel=${nutsParam}&unit=EUR_HAB&time=2017`
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
          `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/${out.sizeDatasetCode_}?geoLevel=${nutsParam}&${out.sizeDatasetFilters_}`
        ), //sizeData
        d3.json(
          `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/${out.colorDatasetCode_}?geoLevel=${nutsParam}&${out.colorDatasetFilters_}`
        ), //colorData
      );
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

      out.n2j = res[1];
      out.nuts0 = res[2];

      let sizeData = res[3];
      let colorData = res[4];

      out.sizeIndicator = indexStat(sizeData);
      out.colorIndicator = indexStat(colorData);
      out.totalsIndex = getTotals(out.sizeIndicator); //total of sizeIndicator for each country

      // exclude values from eurostat data indices

      let newSizeIndicator = {};
      for (let key in out.sizeIndicator) {
        if (out.exclude_) {
          if (out.exclude_.indexOf(key.substring(0, 2)) == -1 && key !== "EU28" && key !== "EU27_2020") {
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
        .style("height", "100%")
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
      addInsets();


      addZoom();
      addLegendsToDOM();
      addMouseEvents();
      if (out.showNutsSelector_ && !out.nutsSelector) {
        addNutsSelectorToDOM();
      }

      addAttributionToDOM();
      if (out.bottomText_) {
        addDisclaimerToDOM();
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
  };

  function defineInsets(geojson) {
    let insetsJson = [
      {
        name: "Guadeloupe (FR)",
        featureCollection: {
          type: "FeatureCollection",
          features: [geojson.features[0]]
        }
      },
      {
        name: "Martinique (FR)",
        featureCollection: {
          type: "FeatureCollection",
          features: [geojson.features[1]]
        }
      },
      {
        name: "Guyane (FR)",
        featureCollection: {
          type: "FeatureCollection",
          features: [geojson.features[2]]
        }
      },
      {
        name: "Réunion (FR)",
        featureCollection: {
          type: "FeatureCollection",
          features: [geojson.features[3]]
        }
      },
      {
        name: "Mayotte (FR)",
        featureCollection: {
          type: "FeatureCollection",
          features: [geojson.features[4]]
        }
      },
      {
        name: "Canary Islands (ES)",
        featureCollection: {
          type: "FeatureCollection",
          features: [geojson.features[6]]
        }
      },
      {
        name: "Acores (PT)",
        featureCollection: {
          type: "FeatureCollection",
          features: [geojson.features[7]]
        }
      },
      {
        name: "Madeira (PT)",
        featureCollection: {
          type: "FeatureCollection",
          features: [geojson.features[8]]
        }
      }
    ]

    //add properties to insets...
    let translateY = out.insets_.translateY;
    let translateX = out.insets_.translateX;
    insetsJson.forEach(function (inset, i) {
      inset.x = translateX;
      inset.y = translateY;
      inset.path = d3.geoPath().projection(
        d3
          .geoIdentity()
          .reflectY(true)
          .fitExtent(
            [[0, 0], [out.insets_.overseasWidth, out.insets_.overseasHeight]],
            inset.featureCollection
          )
      );
      translateY = translateY + out.insets_.spacing;
      //split into 2 columns
      if (i == 3) {
        translateY = out.insets_.translateY;
        translateX = out.insets_.translateX + out.insets_.column2OffsetLeft;
      }
    });

    return insetsJson;
  }

  function addInsets() {


    d3.json(
      `../../assets/topojson/NUTS${out.nutsLevel_}.json`
    ).then((overseasTopo) => {

      let objectName = "NUTS" + out.nutsLevel_;
      var geojson = topojson.feature(overseasTopo, overseasTopo.objects[objectName]);
      let insets = defineInsets(geojson);


      //define blur
      var defs = out.svg.append('defs');
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
          return 'clip-inset-' + d.name;
        })
        .append('circle')
        .attr('r', out.insets_.radius);

      //append each overseas topojson feature
      insets.forEach(function (inset, i) {
        var g = out.svg
          .selectAll('g.insetmap')
          .data(insets)
          .enter()
          .append('g')
          .classed('insetmap', true)
          .attr('transform', function (d) {
            return 'translate(' + [(d.x + out.insets_.circleXOffset), (d.y + out.insets_.circleYOffset)] + ')';
          })
          .attr('id', function (d) {
            return 'inset-' + d.name;
          })
          .attr('clip-path', function (d) {
            return 'url(#clip-inset-' + d.name + ')';
          });

        g.append('circle')
          .classed('background', true)
          .attr('r', out.insets_.radius);

        let insetGeom = out.svg
          .append("g")
          .attr('transform', 'translate(' + [inset.x, inset.y] + ')')
          .selectAll("path")
          .data(inset.featureCollection.features)
          .enter()
          .append("path")
          .attr("fill", "white")
          .attr("stroke", "grey")
          .attr("d", inset.path);

        g.append('circle')
          .classed('blur', true)
          .attr('r', out.insets_.radius);

        let circleBorder = g
          .append('circle')
          .classed('outline', true)
          .attr('r', out.insets_.radius);

        let caption = g
          .append("text")
          .data(insets)
          .text(d => {
            return d.name;
          })
          .attr("class", "overseas-caption")
          .attr("font-size", "10")
          .attr("stroke-width", 0.2)
          .attr("transform", "translate(" + out.insets_.captionX + "," + out.insets_.captionY + ")");
      });




    })
  }

  function addOverseasRegions() {
    //build container
    out.overseasContainer = out.map.append("g").attr("class", "dorling-overseas-container").attr("transform", "translate(20,100)")
    //for switching between nuts
    let objectName = "NUTS" + out.nutsLevel_;
    //get overseas topojson
    d3.json(
      `../../assets/topojson/NUTS${out.nutsLevel_}.json`
    ).then((overseasTopo) => {
      //to geojson
      let overseasGeojson = topojson.feature(overseasTopo, overseasTopo.objects[objectName]);
      //define overseas projection
      let overseasWidth = 120;
      let overseasHeight = 100;
      let overseasProjection = d3Geo
        .geoIdentity()
        .reflectY(true)
        .fitExtent([[0, 0], [overseasWidth, overseasHeight]], overseasGeojson)
      let overseasPath = d3Geo.geoPath().projection(overseasProjection);


      let minimaps = [
        { name: "Canarias (ES", center: [28.459033, -15.779399], feature: overseasGeojson.features[0] },
        { name: "Guadeloupe (FR)", feature: overseasGeojson.features[1] },
        { name: "Martinique (FR)", feature: overseasGeojson.features[2] },
        { name: "Guyane (FR)", feature: overseasGeojson.features[3] },
        { name: "Réunion (FR)", feature: overseasGeojson.features[4] },
        { name: "Mayotte (FR)", feature: overseasGeojson.features[5] },
        { name: "Açores (PT)", feature: overseasGeojson.features[6] },
        { name: "Madeira (PT)", feature: overseasGeojson.features[7] }];

      //for positioning each region within the main container
      let translateX = 0;
      let translateY = 0;
      for (var m = 0; m < minimaps.length; m++) {
        let minimap = minimaps[m];

        //draw region & append to container
        let minimapContainer = out.overseasContainer.append("g").attr("stroke", "black").attr("width", overseasWidth).attr("height", overseasHeight).attr("transform", "translate(" + translateX + "," + translateY + ")")
        minimapContainer.append("g").attr("class", "dorling-overseas-region").selectAll("path").data(overseasGeojson.features)
          .enter().append("path").attr("d", overseasPath)
        //translateX = translateX + 200



        //add container borders
        var bbox = minimapContainer.node().getBBox();
        let padding = 20;
        minimapContainer.append("rect")
          .attr("width", bbox.width + padding)
          .attr("height", bbox.height + padding)
          .attr("x", bbox.x - (padding / 2))
          .attr("y", bbox.y - (padding / 2))
          .style("fill", "transparent")
          .style("stroke", "grey");

        //region caption
        let caption = minimapContainer.append("text").text(minimap.name).attr("class", "dorling-overseas-caption").attr("font-size", "10").attr("transform", "translate(2," + (bbox.height + padding) + ")")

        translateY = translateY + (bbox.height + padding)
      }


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
    let cont = out.svg.append("g").attr("class", "dorling-attribution").attr("transform", "translate(" + (out.width_ - 460) + "," + (out.height_ - 4) + ")");
    let t = cont.append("text").html('Boundaries: © <a href="https://eurogeographics.org/" target="_blank">EuroGeographics</a> © <a href="https://www.fao.org/" target="_blank">UN-FAO</a>  © <a href="https://www.turkstat.gov.tr/" target="_blank">Turkstat</a>, Cartography: <a href="https://ec.europa.eu/eurostat/en/web/gisco" target="_blank">Eurostat - GISCO, 2017</a>')

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

    function getBB(selection) {
      selection.each(function (d) { d.bbox = this.getBBox(); })
    }

    // let container = document.createElement("div");
    // container.classList.add("dorling-attribution")
    // container.innerHTML = 'Boundaries: © <a href="https://eurogeographics.org/" target="_blank">EuroGeographics</a> © <a href="https://www.fao.org/" target="_blank">UN-FAO</a>  © <a href="https://www.turkstat.gov.tr/" target="_blank">Turkstat</a>'
    // out.container_.node().appendChild(container)
  }


  function addDisclaimerToDOM() {
    out.svg.append("text").attr("font-size", out.bottomTextFontSize_).attr("id", "bottomtext").attr("x", out.bottomTextPadding_).attr("y", out.height_ - out.bottomTextPadding_)
      .text(out.bottomText_)
      .style("font-family", out.bottomTextFontFamily_)
      .style("font-size", out.bottomTextFontSize_)
      .style("fill", out.bottomTextFill_)
      .on("mouseover", function () {
        out.tooltipElement.style("visibility", "visible");
        out.tooltipElement.style("font-size", "12px")
        let svgNode = out.svg.node();
        let svgWidth = svgNode.clientWidth;
        out.tooltipElement.style("max-width", svgWidth + "px")
        out.tooltipElement.html(`${out.bottomTextTooltipMessage_}`)
        //tooltip position + offsets
        let matrix = this.getScreenCTM().translate(
          +this.getAttribute("x"),
          +this.getAttribute("y")
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
          top = top + (tooltipHeight);
        }
        out.tooltipElement.style("left", left + "px").style("top", top + "px");
      })
      .on("mouseout", function () {
        out.tooltipElement.style("visibility", "hidden");
        out.tooltipElement.style("font-size", "14px")
      })
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
              100)} % <br>
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
              100)} % <br>
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
      .attr("r", (f) => toRadius(+out.sizeIndicator[f.properties.id]))
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
    out.radioContainer.transition().duration(1000).attr("opacity", 0.9);


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
          .radius((f) => toRadius(+out.sizeIndicator[f.properties.id]))
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
      .attr("transform", "translate(22," + (out.sizeLegend_.translateY + out.colorLegend_.explanationYOffset) + ")")

    explanation
      .append("text")
      .attr("y", 5)
      .attr("x", 0)
      .attr("dy", "0em")
      .text("Hover over the different legend classes to highlight them on the map").call(d3_textWrapping, out.colorLegend_.titleWidth);
  }

  function addColorLegend() {
    //background container
    out.legendContainer = out.svg
      .append("g")
      .attr("id", "dorling-legend-container")
      .attr("opacity", 0);

    out.legendContainerBackground = out.legendContainer
      .append("rect")
      .attr("class", "dorling-legend-container-background")
      .attr("transform", "translate(0,0)")

    //legend <g>
    out.legendContainer
      .append("g")
      .attr("class", "dorling-color-legend")
      .attr("transform", "translate(20,20)");

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
          var r = /\-?\d+/g; //regExp for getting numbers from a string
          let label;
          //first label
          if (d.i === 0) {
            label = d.generatedLabels[d.i].split(d.labelDelimiter)[1] + out.colorLegend_.labelUnit;
            var m = label.match(r);
            return "< " + formatNumber(parseInt(m[0]));
            //last label
          } else if (d.i === d.genLength - 1) {
            label = d.generatedLabels[d.i].split(d.labelDelimiter)[0] + out.colorLegend_.labelUnit;
            var m = label.match(r);
            return "≥ " + formatNumber(parseInt(m[0]));
            //intermediate labels
          } else {
            label = d.generatedLabels[d.i] + out.colorLegend_.labelUnit;
            var m = label.match(r);
            return formatNumber(parseInt(m[0])) + d.labelDelimiter + formatNumber(parseInt(m[1]));
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
    out.svg.select(".dorling-color-legend").call(legend);

    //apply indentation to legend cells
    let legendCells = d3.select(".legendCells")
    let transform = legendCells.attr("transform");
    let translation = getTranslation(transform);
    legendCells.attr("transform", "translate(" + (translation[0] + out.colorLegend_.cellsTranslateX) + "," + (translation[1] + out.colorLegend_.cellsTranslateY) + ")")


    //ajust position of legend container
    // let svgWidth = out.svg.node().clientWidth;
    // out.legendContainerNode = out.legendContainer.node();
    //TODO use node width instead of viewport width
    out.legendContainer.attr("transform", "translate(" + ((out.width_ - (out.colorLegend_.titleWidth + 20))) + ", 0)");
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
    if (!out.sizeLegend_.values) {
      out.sizeLegend_.values = [Math.floor(out.sizeExtent[1]), Math.floor(out.sizeExtent[1] / 2), Math.floor(out.sizeExtent[1] / 10)]
    }

    out.sizeLegendContainer = out.legendContainer
      .append("g")
      .attr("id", "dorling-size-legend-container")
      .attr("opacity", 0);

    //ff positioning fix
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      // Do Firefox-related activities
      out.sizeLegendContainer.attr("transform", "translate(0," + (out.sizeLegend_.translateY + 2) + ")")
    } else {
      out.sizeLegendContainer.attr("transform", "translate(0," + out.sizeLegend_.translateY + ")")
    }

    let sizeLegendBackground = out.sizeLegendContainer
      .append("rect")
      .attr("id", "dorling-size-legend-container-background")
      .attr("transform", "translate(0,0)");
    const legendTitle = out.sizeLegendContainer
      .append("g")
      .attr("fill", "black")
      .attr("class", "dorling-size-legend-title")
      .attr("transform", "translate(" + out.sizeLegend_.titleXOffset + "," + out.sizeLegend_.titleYOffset + ")")
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
      .attr("transform", "translate(" + out.sizeLegend_.bodyXOffset + "," + out.sizeLegend_.bodyYOffset + ")") //TODO: make dynamic
      .attr("text-anchor", "right")
      .selectAll("g")
      // .data([20e6, 10e6, 1e6])
      .data(out.sizeLegend_.values)
      .join("g");
    legC
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("cy", (d) => -toRadius(d))
      .attr("r", toRadius);

    //labels
    legC
      .append("text")
      //.attr("y", (d) => 9 - 2 * toRadius(d))
      .attr("y", (d, i) => {
        if (i == 0) {
          return -1 - 2 * toRadius(d) - 7 - 4; //add padding
        } else {
          return -1 - 2 * toRadius(d) - 7;
        }
      })
      .attr("x", 40)
      .attr("dy", "1.2em")
      .attr("xml:space", "preserve")
      .text((d) => {
        return out.sizeLegend_.textFunction(d);
        //return d.toLocaleString("en").replace(/,/gi, " ");
      });
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

    out.nutsSelectorTranslateY = 340;
    //main container
    let sl = document.getElementById("dorling-size-legend-container")
    let slbr = sl.getBoundingClientRect();
    out.radioContainer = out.legendContainer
      .append("g")
      .attr("id", "dorling-nuts-selector")
      //.attr("class", "dorling-nuts-selector-container dorling-plugin")
      .attr("opacity", 0)
      .attr("transform", "translate(0, " + out.nutsSelectorTranslateY + ")")

    //background
    out.radioContainer
      .append("rect")
      .attr("class", "dorling-legend-container-background dorling-plugin")
    //.style("height", backgroundHeight)
    //.attr("transform", "translate(0,0)");

    //title
    out.radioContainer.append("text")
      .text("Geographic level").attr("class", "dorling-legend-title")
      .attr("transform", "translate(" + (marginLeft - 5) + ",28)");

    //RADIO 0
    let radio0 = out.radioContainer.append("g")
      .attr("fill", "currentColor")
      .attr("class", "dorling-radio-button")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("height", "" + radioHeight + "px")
      .attr("width", "" + radioWidth + "px")
      .attr("viewBox", "0 0 " + radioWidth + " " + radioHeight + "")
      .attr("transform", "translate(" + marginLeft + "," + marginTop + ")");

    let outline0 = radio0.append("circle")
      .attr("class", "dorling-radio-outline")
      .attr("cx", "" + radioCxy + "")
      .attr("cy", "" + radioCxy + "")
      .attr("r", "" + radioRadius + "")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "3")

    let dot0 = radio0.append("circle")
      .attr("opacity", radioDotOpacity)
      .attr("cx", "" + radioCxy + "")
      .attr("cy", "" + radioCxy + "")
      .attr("r", "" + radioDotRadius + "")
      .attr("class", "dorling-radio-dot")

    let label0 = radio0.append("text")
      .text("Country")
      .attr("transform", "translate(25,10)");

    //RADIO 1
    let radio1 = out.radioContainer.append("g")
      .attr("fill", "currentColor")
      .attr("class", "dorling-radio-button")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("height", "" + radioHeight + "px")
      .attr("width", "" + radioWidth + "px")
      .attr("viewBox", "0 0 " + radioWidth + " " + radioHeight + "")
      .attr("transform", "translate(" + marginLeft + "," + (radioHeight + padding + marginTop) + ")");

    let outline1 = radio1.append("circle")
      .attr("class", "dorling-radio-outline")
      .attr("cx", "" + radioCxy + "")
      .attr("cy", "" + radioCxy + "")
      .attr("r", "" + radioRadius + "")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "3")

    let dot1 = radio1.append("circle")
      .attr("opacity", radioDotOpacity)
      .attr("cx", "" + radioCxy + "")
      .attr("cy", "" + radioCxy + "")
      .attr("r", "" + radioDotRadius + "")
      .attr("class", "dorling-radio-dot")

    let label1 = radio1.append("text")
      .text("NUTS 1")
      .attr("transform", "translate(25,10)");

    //RADIO 2
    let radio2 = out.radioContainer.append("g")
      .attr("fill", "currentColor")
      .attr("class", "dorling-radio-button")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("height", "" + radioHeight + "px")
      .attr("width", "" + radioWidth + "px")
      .attr("viewBox", "0 0 " + radioWidth + " " + radioHeight + "")
      .attr("transform", "translate(" + marginLeft + "," + (radioHeight * 2 + padding * 2 + marginTop) + ")")

    let outline2 = radio2.append("circle")
      .attr("class", "dorling-radio-outline")
      .attr("cx", "" + radioCxy + "")
      .attr("cy", "" + radioCxy + "")
      .attr("r", "" + radioRadius + "")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "3")

    let dot2 = radio2.append("circle")
      .attr("opacity", radioDotOpacity)
      .attr("cx", "" + radioCxy + "")
      .attr("cy", "" + radioCxy + "")
      .attr("r", "" + radioDotRadius + "")
      .attr("class", "dorling-radio-dot")

    let label2 = radio2.append("text")
      .text("NUTS 2")
      .attr("transform", "translate(25,10)");

    //RADIO 3
    let radio3 = out.radioContainer.append("g")
      .attr("fill", "currentColor")
      .attr("class", "dorling-radio-button")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("height", "" + radioHeight + "px")
      .attr("width", "" + radioWidth + "px")
      .attr("viewBox", "0 0 " + radioWidth + " " + radioHeight + "")
      .attr("transform", "translate(" + marginLeft + "," + (radioHeight * 3 + padding * 3 + marginTop) + ")")

    let outline3 = radio3.append("circle")
      .attr("class", "dorling-radio-outline")
      .attr("cx", "" + radioCxy + "")
      .attr("cy", "" + radioCxy + "")
      .attr("r", "" + radioRadius + "")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "3")

    let dot3 = radio3.append("circle")
      .attr("opacity", radioDotOpacity)
      .attr("cx", "" + radioCxy + "")
      .attr("cy", "" + radioCxy + "")
      .attr("r", "" + radioDotRadius + "")
      .attr("class", "dorling-radio-dot")

    let label3 = radio3.append("text")
      .text("NUTS 3")
      .attr("transform", "translate(25,10)");

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

    radio0.on("click", function (e) {
      nutsRadioEventHandler(0)
    });
    radio1.on("click", function (e) {
      nutsRadioEventHandler(1)
    });
    radio2.on("click", function (e) {
      nutsRadioEventHandler(2)
    });
    radio3.on("click", function (e) {
      nutsRadioEventHandler(3)
    });


    //HTML
    // let container = document.createElement("div");
    // container.classList.add("dorling-nuts-selector-container");
    // let title = document.createElement("div");
    // title.innerHTML = "Geographic level <br>"
    // title.style.marginBottom = "6px";
    // container.appendChild(title);
    // out.container_.node().appendChild(container);

    // //radios
    // //0
    // let radio0 = document.createElement("input");
    // radio0.type = "radio";
    // radio0.value = 0;
    // radio0.id = "dorling-nuts-radio0";
    // radio0.name = "dorling-nuts-radios";
    // if (out.nutsLevel_ == 0) radio0.checked = "true";
    // radio0.onclick = nutsRadioEventHandler;
    // let radio0Label = document.createElement("label");
    // radio0Label.for = "dorling-nuts-radio0";
    // radio0Label.innerHTML = "Country"
    // //1
    // let radio1 = document.createElement("input");
    // radio1.type = "radio";
    // radio1.value = 1;
    // radio1.id = "dorling-nuts-radio1";
    // radio1.name = "dorling-nuts-radios";
    // if (out.nutsLevel_ == 1) radio1.checked = "true";
    // radio1.onclick = nutsRadioEventHandler;
    // let radio1Label = document.createElement("label");
    // radio1Label.for = "dorling-nuts-radio1";
    // radio1Label.innerHTML = "NUTS 1"
    // //2
    // let radio2 = document.createElement("input");
    // radio2.type = "radio";
    // radio2.value = 2;
    // radio2.id = "dorling-nuts-radio2";
    // radio2.name = "dorling-nuts-radios";
    // if (out.nutsLevel_ == 2) radio2.checked = "true";
    // radio2.onclick = nutsRadioEventHandler;
    // let radio2Label = document.createElement("label");
    // radio2Label.for = "dorling-nuts-radio2";
    // radio2Label.innerHTML = "NUTS 2"
    // //3
    // let radio3 = document.createElement("input");
    // radio3.type = "radio";
    // radio3.value = 3;
    // radio3.id = "dorling-nuts-radio3";
    // radio3.name = "dorling-nuts-radios";
    // if (out.nutsLevel_ == 3) radio3.checked = "true";
    // radio3.onclick = nutsRadioEventHandler;
    // let radio3Label = document.createElement("label");
    // radio3Label.for = "dorling-nuts-radio3";
    // radio3Label.innerHTML = "NUTS 3"

    // container.appendChild(radio0);
    // container.appendChild(radio0Label);
    // container.appendChild(document.createElement('br'))
    // container.appendChild(radio1);
    // container.appendChild(radio1Label);
    // container.appendChild(document.createElement('br'))
    // container.appendChild(radio2);
    // container.appendChild(radio2Label);
    // container.appendChild(document.createElement('br'))
    // container.appendChild(radio3);
    // container.appendChild(radio3Label);
    // container.appendChild(document.createElement('br'))
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
      return d3
        .scaleThreshold()
        .domain(out.thresholdValues_)
        .range(out.colors_)
        .unknown("#ccc")
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

  function colorFunction(v) {
    let color = out.colorScale(v);
    return color;
  }

  function zoomed() {
    out.map.attr("transform", d3.event.transform);
    // out.countries.attr("transform", d3.event.transform);
    // out.countryBorders.attr("transform", d3.event.transform);
    // out.nuts.attr("transform", d3.event.transform);
    // out.nutsBorders.attr("transform", d3.event.transform);
    //out.kosovo.attr("transform", d3.event.transform);
  }

  function toRadius(val) {
    return out.circleExaggerationFactor_ * 0.005 * Math.sqrt(val);
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

function indexStat(data) {
  const arr = Object.entries(
    data.dimension.geo.category.index
  ).map(([key, val]) => ({ id: key, val: +data.value[val] || null }));
  const ind = {};
  for (let i = 0; i < arr.length; i++) ind[arr[i].id] = arr[i].val;
  return ind;
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


