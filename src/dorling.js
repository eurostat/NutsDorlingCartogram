import * as d3 from "d3";
import * as d3Array from "d3-array";
import * as topojson from "topojson";
import { legendColor } from "d3-svg-legend";
import "./styles.css";

export function dorling(options) {
  //the output object
  let out = {};

  //default values
  out.svgId_ = "map";
  //d3 force
  out.circleExaggerationFactor_ = 0.8;
  out.collisionPadding_ = 0.2;
  out.positionStrength_ = 3;
  out.collisionStrength_ = 0.1;
  //d3-geo
  out.scale_ = 1000;
  out.rotateX_ = -13;
  out.rotateY_ = -61;
  out.translateX_ = null; //340;
  out.translateY_ = null; //216;
  //container
  out.width_ = 600;
  out.height_ = 600;

  out.colorScheme_ = "interpolateRdYlBu";
  out.colors_ = null; //["#000",etc]
  out.thresholdValues_ = null; //[1,100,1000]
  out.thresholds_ = 7;
  out.zoom_ = true;

  out.legend_ = {
    //https://d3-legend.susielu.com/#color
    titleWidth: 200,
    title: "Population change (‰)",
    orient: "vertical",
    cells: 5,
    shape: "rect",
    shapeRadius: 10,
    shapePadding: 5,
    labelAlign: "middle",
    labelOffset: 10,
    labelFormat: d3.format(".1f"),
    labelFontSize: 15,
    labelDelimiter: " to ",
    labelUnit: " % ",
    labelWrap: 140,
    labelDecNb: 2,
  };

  //data params
  out.nutsLvl_ = 2;
  out.sizeDatasetCode_ = "demo_r_pjangrp3";
  out.sizeDatasetFilters_ = "sex=T&age=TOTAL&unit=NR&time=2018";
  out.colorDatasetCode_ = "demo_r_gind3";
  out.colorDatasetFilters_ = "indic_de=GROWRT&time=2018";

  //definition of generic accessors based on the name of each parameter name
  for (var p in out)
    (function () {
      var p_ = p;
      out[p_.substring(0, p_.length - 1)] = function (v) {
        if (!arguments.length) return out[p_];
        out[p_] = v;
        return out;
      };
    })();

  //override some accesors
  out.legend = function (v) {
    for (var key in v) {
      out.legend_[key] = v[key];
    }
    return out;
  };

  //build function
  out.build = function () {
    out.svg = d3.select("#" + out.svgId_);
    //empty svg
    out.svg.selectAll("*").remove();

    //set up svg element
    out.svg
      .attr("viewBox", [0, 0, out.width_, out.height_])
      .attr("width", out.width_)
      .attr("height", out.height_);
    //get data and animate
    out.main();
    return out;
  };

  out.main = function () {
    //data promises
    let promises = [];
    promises.push(
      d3.json(
        `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/4258/nutspt_${out.nutsLvl_}.json`
      ), //centroids
      d3.json(
        `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/4258/60M/0.json`
      ), //regions
      d3.json(
        `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/${out.sizeDatasetCode_}?geoLevel=nuts${out.nutsLvl_}&${out.sizeDatasetFilters_}`
      ), //sizeData
      d3.json(
        `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/${out.colorDatasetCode_}?geoLevel=nuts${out.nutsLvl_}&${out.colorDatasetFilters_}`
      ) //colorData
    );

    Promise.all(promises).then((res) => {
      //data loaded
      let n2j = res[0];
      let n2jrg = res[1];

      let sizeData = res[2];
      let colorData = res[3];

      let bn = topojson.feature(n2jrg, n2jrg.objects.nutsbn).features;
      let rg = topojson.feature(n2jrg, n2jrg.objects.nutsrg).features;

      let sizeIndicator = indexStat(sizeData);
      let colorIndicator = indexStat(colorData);
      let totalsIndex = getTotals(sizeIndicator); //total of sizeIndicator for each country

      //d3 geo
      let projection = d3
        .geoAzimuthalEqualArea()
        .rotate([out.rotateX_, out.rotateY_])
        .fitSize([out.width_, out.height_], n2j)
        .scale(out.scale_);

      if (out.translateX_ && out.translateY_) {
        projection.translate([out.translateX_, out.translateY_]);
      }

      // let path = geoPath().projection(
      //   geoIdentity()
      //     .reflectY(true)
      //     .fitSize([out.width_, out.height_], n2j)
      // );

      //d3 scale
      out.extent = d3.extent(Object.values(colorIndicator));
      //color scale
      out.colorScale = defineColorScale();
      let countries = out.svg
        .append("g")
        .selectAll("path")
        .data(bn)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", "none")
        .attr("stroke", "#404040ff");

      // initialize tooltip
      var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "dorling-tooltip")
        .text("");

      //Show the regions as circles
      let circles = out.svg
        .append("g")
        .selectAll("circle")
        .data(n2j.features)
        .enter()
        .append("circle")
        .attr("cx", (f) => projection(f.geometry.coordinates)[0])
        .attr("cy", (f) => projection(f.geometry.coordinates)[1])
        .attr("r", (f) => 0.000055 * Math.sqrt(f.properties.ar))
        .attr("fill", "#ffffff00")
        .attr("stroke", "#40404000");

      //tooltip
      //       circles.append("title").text(
      //         (f) => `${f.properties.na}
      //       ${f.properties.id}
      // Total Population: ${sizeIndicator[f.properties.id]
      //           .toLocaleString("en")
      //           .replace(/,/gi, " ")}
      // Population Change: ${colorIndicator[f.properties.id]}‰
      // Share of National Population ${(
      //           (sizeIndicator[f.properties.id] /
      //             totalsIndex[f.properties.id.substring(0, 2)]) *
      //           100
      //         ).toFixed(0)}%`
      //       );

      //Show the regions as circles

      setTimeout(function () {
        //hide countries
        countries.transition().duration(1000).attr("stroke", "#40404000");

        //show circles
        circles
          .transition()
          .duration(1000)
          .attr("fill", "#ffffff44")
          .attr("stroke", "#404040ff");
        circles.on("mouseover", function (f) {
          d3.select(this).attr("fill", "purple");
          tooltip.html(`<strong>${f.properties.na}</strong>
          ${f.properties.id} <br>
    Population: ${sizeIndicator[f.properties.id]
      .toLocaleString("en")
      .replace(/,/gi, " ")}<br>
      Share of National Population ${(
        (sizeIndicator[f.properties.id] /
          totalsIndex[f.properties.id.substring(0, 2)]) *
        100
      ).toFixed(0)}% <br>
    Population Change: <strong>${colorIndicator[f.properties.id]}‰</strong><br>
`);
          tooltip.style("visibility", "visible");
          tooltip
            .style("top", d3.event.pageY - 110 + "px")
            .style("left", d3.event.pageX - 120 + "px");
        });
        // .on("mousemove", function () {
        //   tooltip
        //     .style("top", d3.event.pageY - 10 + "px")
        //     .style("left", d3.event.pageX + 10 + "px");
        // })
        circles.on("mouseout", function () {
          tooltip.style("visibility", "hidden");
          d3.select(this).attr("stroke", "none");
          d3.select(this).attr("fill", (f) =>
            colorFunction(+colorIndicator[f.properties.id])
          );
        });
      }, 1000);

      //Change circle size and color with population figures
      setTimeout(function () {
        circles
          .transition()
          .duration(1500)
          .attr("r", (f) => toRadius(+sizeIndicator[f.properties.id]))
          .attr("fill", (f) => colorFunction(+colorIndicator[f.properties.id]))
          .attr("stroke", "#40404030");
      }, 2500);

      //Dorling cartogram deformation
      setTimeout(function () {
        const simulation = d3
          .forceSimulation(n2j.features)
          .force(
            "x",
            d3
              .forceX()
              .x((f) => projection(f.geometry.coordinates)[0])
              .strength(out.positionStrength_)
          )
          .force(
            "y",
            d3
              .forceY()
              .y((f) => projection(f.geometry.coordinates)[1])
              .strength(out.positionStrength_)
          )
          .force(
            "collide",
            d3
              .forceCollide()
              .radius((f) => toRadius(+sizeIndicator[f.properties.id]))
              .strength(out.collisionStrength_)
          );

        //set initial position of the circles
        for (const f of n2j.features) {
          f.x = projection(f.geometry.coordinates)[0];
          f.y = projection(f.geometry.coordinates)[1];
        }

        simulation.on("tick", () => {
          circles.attr("cx", (f) => f.x).attr("cy", (f) => f.y);
        });

        simulation.on("end", function () {
          simulation.stop();
        });
        //invalidation.then(() => simulation.stop());
      }, 3000);

      //show legend
      setTimeout(function () {
        //background container
        out.svg
          .append("rect")
          .attr("class", "dorling-legend-container")
          .attr("transform", "translate(0,0)");
        //legend <g>
        out.svg
          .append("g")
          .attr("class", "legendQuant")
          .attr("transform", "translate(20,20)");

        var legend = legendColor()
          //.useClass(true)
          .title(out.legend_.title)
          .titleWidth(out.legend_.titleWidth)
          //.cells(out.legend_.cells)
          .orient(out.legend_.orient)
          .shape(out.legend_.shape)
          .shapePadding(out.legend_.shapePadding)
          .labelAlign(out.legend_.labelAlign)
          .labelOffset(out.legend_.labelOffset)
          .labelFormat(out.legend_.labelFormat)
          .scale(out.colorScale)
          .labelDelimiter(out.legend_.labelDelimiter)
          .labelWrap(out.legend_.labelWrap);
        if (out.colors_) {
          legend.labels(function (d) {
            if (d.i === 0)
              return (
                "< " +
                d.generatedLabels[d.i].split(d.labelDelimiter)[1] +
                out.legend_.labelUnit
              );
            else if (d.i === d.genLength - 1)
              return (
                "≥ " +
                d.generatedLabels[d.i].split(d.labelDelimiter)[0] +
                out.legend_.labelUnit
              );
            else return "≥ " + d.generatedLabels[d.i] + out.legend_.labelUnit;
          });
        }

        if (out.legend_.shape == "circle")
          legend.shapeRadius(out.legend_.shapeRadius);

        out.svg.select(".legendQuant").call(legend);

        //circle size legend
        const legC = out.svg
          .append("g")
          .attr("fill", "#444")
          .attr("transform", "translate(40," + out.height_ + ")")
          .attr("text-anchor", "right")
          .style("font", "10px sans-serif")
          .selectAll("g")
          .data([20e6, 10e6, 1e6])
          .join("g");
        legC
          .append("circle")
          .attr("fill", "none")
          .attr("stroke", "#444")
          .attr("cy", (d) => -toRadius(d))
          .attr("r", toRadius);
        legC
          .append("text")
          .attr("y", (d) => -10 - 2 * toRadius(d))
          .attr("x", 30)
          .attr("dy", "1.3em")
          .text((d) => {
            return d.toLocaleString("en").replace(/,/gi, " ");
          });

        //d3 zoom
        if (out.zoom_) {
          out.svg.call(
            d3
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
                zoomed(circles);
              })
          );
        }
      }, 4500);
    });
    return out;
  };

  function defineColorScale() {
    //return [0,1,2,3,...,nb-1]
    let getA = function (nb) {
      var a = [];
      for (var i = 0; i < nb; i++) a.push(i);
      return a;
    };

    if (out.colors_) {
      return d3
        .scaleThreshold()
        .domain(out.thresholdValues_)
        .range(out.colors_);
    } else {
      if (out.thresholdValues_) {
        return d3
          .scaleDivergingSymlog((t) => d3[out.colorScheme_](1 - t))
          .domain(out.thresholdValues_)
          .nice();
      } else {
        return d3
          .scaleDivergingSymlog((t) => d3[out.colorScheme_](1 - t))
          .domain([out.extent[0], 0, out.extent[1]])
          .nice();
      }
    }
  }

  function colorFunction(v) {
    let color = out.colorScale(v);
    return color;
  }

  function zoomed(circles) {
    circles.attr("transform", d3.event.transform);
    //circles.attr("transform", d3.event.transform);
  }

  function toRadius(val) {
    return out.circleExaggerationFactor_ * 0.005 * Math.sqrt(val);
  }

  return out;
}

function indexStat(data) {
  const arr = Object.entries(
    data.dimension.geo.category.index
  ).map(([key, val]) => ({ id: key, val: +data.value[val] || null }));
  const ind = {};
  for (var i = 0; i < arr.length; i++) ind[arr[i].id] = arr[i].val;
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
