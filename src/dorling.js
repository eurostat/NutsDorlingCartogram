import * as d3 from "d3";
import * as topojson from "topojson";
import { legendColor } from "d3-svg-legend";

let circleExaggerationFactor = 1;

export function dorling(options) {
  var svg = d3.select(options.svgId);
  let width = 800;
  svg.attr("viewBox", [0, 0, width, 500]);
  let promises = [];

  let nutsLvl = 2;
  promises.push(
    d3.json(
      `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/4258/nutspt_${nutsLvl}.json`
    ),
    d3.json(
      `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/4258/60M/0.json`
    ),
    d3.json(
      `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_r_pjangrp3?geoLevel=nuts${nutsLvl}&sex=T&age=TOTAL&unit=NR&time=2018`
    ), //sizeData
    d3.json(
      `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/demo_r_gind3?geoLevel=nuts${nutsLvl}&indic_de=GROWRT&time=2018`
    )
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
      .scale(700);
    //d3 scale
    let extent = d3.extent(Object.values(colorIndicator));
    //color scale
    let colorScale = d3
      .scaleDivergingSymlog(t => d3.interpolateRdYlBu(1 - t))
      .domain([extent[0], 0, extent[1]])
      .nice();

    let countries = svg
      .append("g")
      .selectAll("path")
      .data(bn)
      .enter()
      .append("path")
      .attr("d", d3.geoPath().projection(projection))
      .attr("fill", "none")
      .attr("stroke", "#404040ff");

    //Show the regions as circles
    let circles = svg
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

      //invalidation.then(() => simulation.stop());
    }, 3000);

    //show legend
    setTimeout(function() {
      svg
        .append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(20,20)");

      var legend = legendColor()
        .labelFormat(d3.format(".2f"))
        .useClass(true)
        .title("A really really really really really long title")
        .titleWidth(100)
        .scale(colorScale);

      svg.select(".legendQuant").call(legend);

      //circle size
      const legC = svg
        .append("g")
        .attr("fill", "#444")
        .attr("transform", "translate(50,130)")
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
    }, 4500);
  });
}

function toRadius(val) {
  return circleExaggerationFactor * 0.005 * Math.sqrt(val);
}

function indexStat(data) {
  const arr = Object.entries(
    data.dimension.geo.category.index
  ).map(([key, val]) => ({ id: key, val: +data.value[val] || null }));
  const ind = {};
  for (var i = 0; i < arr.length; i++) ind[arr[i].id] = arr[i].val;
  return ind;
}
