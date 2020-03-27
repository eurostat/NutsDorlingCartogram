import * as d3 from "d3";
import { geoIdentity, geoPath } from "d3-geo";
import * as topojson from "topojson";
import { legendColor } from "d3-svg-legend";

export function dorling(options) {
  //the output object
  let out = {};

  //default values
  out.svgId_ = "map";
  out.circleExaggerationFactor_ = 1;
  out.width_ = 700;
  out.height_ = 400;
  out.colorScheme_ = "interpolateRdYlBu";
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
    labelFormat: d3.format(".1f")
  };

  //data params
  out.nutsLvl_ = 2;
  out.sizeDatasetCode_ = "demo_r_pjangrp3";
  out.sizeDatasetFilters_ = "sex=T&age=TOTAL&unit=NR&time=2018";
  out.colorDatasetCode_ = "demo_r_gind3";
  out.colorDatasetFilters_ = "indic_de=GROWRT&time=2018";

  //definition of generic accessors based on the name of each parameter name
  for (var p in out)
    (function() {
      var p_ = p;
      out[p_.substring(0, p_.length - 1)] = function(v) {
        if (!arguments.length) return out[p_];
        out[p_] = v;
        return out;
      };
    })();

  //override some accesors
  out.legend = function(v) {
    for (var key in v) {
      out.legend_[key] = v[key];
    }

    return out;
  };

  //build function
  out.build = function() {
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

  out.main = function() {
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

    Promise.all(promises).then(res => {
      //data loaded
      let n2j = res[0];
      let n2jrg = res[1];

      let sizeData = res[2];
      let colorData = res[3];

      let bn = topojson.feature(n2jrg, n2jrg.objects.nutsbn).features;
      let rg = topojson.feature(n2jrg, n2jrg.objects.nutsrg).features;

      let sizeInd = indexStat(sizeData);
      let colorIndicator = indexStat(colorData);

      //d3 geo
      let projection = d3
        .geoAzimuthalEqualArea()
        .rotate([-10, -52])
        .translate([out.width_ / 2.5, out.height_ / 2])
        .scale(600);

      // let path = geoPath().projection(
      //   geoIdentity()
      //     .reflectY(true)
      //     .fitSize([out.width_, out.height_], n2j)
      // );

      //d3 scale
      let extent = d3.extent(Object.values(colorIndicator));
      //color scale
      let colorScale = d3
        .scaleDivergingSymlog(t => d3[out.colorScheme_](1 - t))
        .domain([extent[0], 0, extent[1]])
        .nice();
      let legendScale = d3
        .scaleDiverging(t => d3[out.colorScheme_](1 - t))
        .domain([extent[0], 0, extent[1]]);

      let countries = out.svg
        .append("g")
        .selectAll("path")
        .data(bn)
        .enter()
        .append("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", "none")
        .attr("stroke", "#404040ff");

      //Show the regions as circles
      let circles = out.svg
        .append("g")
        .selectAll("circle")
        .data(n2j.features)
        .enter()
        .append("circle")
        .attr("cx", f => projection(f.geometry.coordinates)[0])
        .attr("cy", f => projection(f.geometry.coordinates)[1])
        .attr("r", f => 0.000055 * Math.sqrt(f.properties.ar))
        .attr("fill", "#ffffff00")
        .attr("stroke", "#40404000");

      //tooltip
      circles.append("title").text(
        f => `${f.properties.na}
${sizeInd[f.properties.id]} inhabitants in 2018
Variation: ${colorIndicator[f.properties.id]}‰`
      );

      //Show the regions as circles

      setTimeout(function() {
        //hide countries
        countries
          .transition()
          .duration(1000)
          .attr("stroke", "#40404000");

        //show circles
        circles
          .transition()
          .duration(1000)
          .attr("fill", "#ffffff44")
          .attr("stroke", "#404040ff");
        circles
          .on("mouseover", function(rg) {
            d3.select(this).attr("fill", "purple");
          })
          .on("mouseout", function() {
            d3.select(this).attr("fill", "#fdbf6faa");
          });
      }, 1000);

      //Change circle size and color with population figures
      setTimeout(function() {
        circles
          .transition()
          .duration(1500)
          .attr("r", f => toRadius(+sizeInd[f.properties.id]))
          .attr("fill", f => colorScale(+colorIndicator[f.properties.id]))
          .attr("stroke", "#40404030");
        circles.on("mouseout", function() {
          d3.select(this).attr("fill", f =>
            colorScale(+colorIndicator[f.properties.id])
          );
        });
      }, 2500);

      //Dorling cartogram deformation
      setTimeout(function() {
        const simulation = d3
          .forceSimulation(n2j.features)
          .force(
            "x",
            d3.forceX().x(f => projection(f.geometry.coordinates)[0])
          )
          .force(
            "y",
            d3.forceY().y(f => projection(f.geometry.coordinates)[1])
          )
          .force(
            "collide",
            d3.forceCollide().radius(f => toRadius(+sizeInd[f.properties.id]))
          );

        //set initial position of the circles
        for (const f of n2j.features) {
          f.x = projection(f.geometry.coordinates)[0];
          f.y = projection(f.geometry.coordinates)[1];
        }

        simulation.on("tick", () => {
          circles.attr("cx", f => f.x).attr("cy", f => f.y);
        });

        simulation.on("end", function() {
          simulation.stop();
        });
        //invalidation.then(() => simulation.stop());
      }, 3000);

      //show legend
      setTimeout(function() {
        out.svg
          .append("g")
          .attr("class", "legendQuant")
          .attr("transform", "translate(20,20)");

        var legend = legendColor()
          //.useClass(true)
          .title(out.legend_.title)
          .titleWidth(out.legend_.titleWidth)
          .cells(out.legend_.cells)
          .orient(out.legend_.orient)
          .shape(out.legend_.shape)
          .shapePadding(out.legend_.shapePadding)
          .labelAlign(out.legend_.labelAlign)
          .labelOffset(out.legend_.labelOffset)
          .labelFormat(out.legend_.labelFormat)
          .scale(colorScale);

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
          .attr("cy", d => -toRadius(d))
          .attr("r", toRadius);
        legC
          .append("text")
          .attr("y", d => -10 - 2 * toRadius(d))
          .attr("x", 30)
          .attr("dy", "1.3em")
          .text(d3.format(".1s"));

        //d3 zoom
        if (out.zoom_) {
          out.svg.call(
            d3
              .zoom()
              .extent([
                [0, 0],
                [out.width_, out.height_]
              ])
              .translateExtent([
                [0, 0],
                [out.width_, out.height_]
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
