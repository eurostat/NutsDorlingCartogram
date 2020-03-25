import * as d3 from "d3";
import * as topojson from "topojson";
import { legendColor } from "d3-svg-legend";

export function dorling(options) {
  if (!options.svgId) {
    return console.error("Please define an svgId");
  }
  var svg = d3.select("#" + options.svgId);

  let circleExaggerationFactor = options.circleExaggerationFactor || 1;
  let width = options.width || 900;
  let height = options.height || 500;
  let colorScheme = options.colorScheme || "interpolateRdYlBu";
  let enableZoom = options.zoom || true;
  
  let defaultLegendOptions = {
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
  let legendOptions = {
    titleWidth: options.legend.titleWidth || defaultLegendOptions.titleWidth,
    title: options.legend.title || defaultLegendOptions.title,
    orient: options.legend.orient || defaultLegendOptions.orient,
    cells: options.legend.cells || defaultLegendOptions.cells,
    shape: options.legend.shape || defaultLegendOptions.shape,
    shapeRadius: options.legend.shapeRadius || defaultLegendOptions.shapeRadius,
    shapePadding:
      options.legend.shapePadding || defaultLegendOptions.shapePadding,
    labelAlign: options.legend.labelAlign || defaultLegendOptions.labelAlign,
    labelOffset: options.legend.labelOffset || defaultLegendOptions.labelOffset,
    labelFormat: options.legend.labelFormat || defaultLegendOptions.labelFormat
  };

  //data params
  let nutsLvl = options.nutsLvl || 2;
  let sizeDatasetId = options.sizeDatasetId || "demo_r_pjangrp3";
  let sizeDatasetFilters =
    options.sizeDatasetFilters || "sex=T&age=TOTAL&unit=NR&time=2018";
  let colorDatasetId = options.colorDatasetId || "demo_r_gind3";
  let colorDatasetFilters =
    options.colorDatasetFilters || "indic_de=GROWRT&time=2018";

  svg.attr("viewBox", [0, 0, width, height]);
  svg.attr("width", width);
  svg.attr("height", height);
  let promises = [];

  promises.push(
    d3.json(
      `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/4258/nutspt_${nutsLvl}.json`
    ), //centroids
    d3.json(
      `https://raw.githubusercontent.com/eurostat/Nuts2json/master/2016/4258/60M/0.json`
    ), //regions
    d3.json(
      `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/${sizeDatasetId}?geoLevel=nuts${nutsLvl}&${sizeDatasetFilters}`
    ), //sizeData
    d3.json(
      `https://ec.europa.eu/eurostat/wdds/rest/data/v2.1/json/en/${colorDatasetId}?geoLevel=nuts${nutsLvl}&${colorDatasetFilters}`
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
      .scale(700);
    //d3 scale
    let extent = d3.extent(Object.values(colorIndicator));
    //color scale
    let colorScale = d3
      .scaleDivergingSymlog(t => d3[colorScheme](1 - t))
      .domain([extent[0], 0, extent[1]])
      .nice();
    let legendScale = d3
      .scaleDiverging(t => d3[colorScheme](1 - t))
      .domain([extent[0], 0, extent[1]]);

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

      simulation.on("end", function() {
        simulation.stop();
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
        //.useClass(true)
        .title(legendOptions.title)
        .titleWidth(legendOptions.titleWidth)
        .cells(legendOptions.cells)
        .orient(legendOptions.orient)
        .shape(legendOptions.shape)
        .shapePadding(legendOptions.shapePadding)
        .labelAlign(legendOptions.labelAlign)
        .labelOffset(legendOptions.labelOffset)
        .labelFormat(legendOptions.labelFormat)
        .scale(colorScale);

      if (legendOptions.shape == "circle")
        legend.shapeRadius(legendOptions.shapeRadius);

      svg.select(".legendQuant").call(legend);

      //circle size legend
      const legC = svg
        .append("g")
        .attr("fill", "#444")
        .attr("transform", "translate(40," + height + ")")
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
      if (enableZoom) {
        svg.call(
          d3
            .zoom()
            .extent([
              [0, 0],
              [width, height]
            ])
            .translateExtent([
              [0, 0],
              [width, height]
            ])
            .scaleExtent([1, 8])
            .on("zoom", () => {
              zoomed(circles);
            })
        );
      }
    }, 4500);
  });

  function zoomed(circles) {
    circles.attr("transform", d3.event.transform);
    //circles.attr("transform", d3.event.transform);
  }

  function toRadius(val) {
    return circleExaggerationFactor * 0.005 * Math.sqrt(val);
  }
}

function indexStat(data) {
  const arr = Object.entries(
    data.dimension.geo.category.index
  ).map(([key, val]) => ({ id: key, val: +data.value[val] || null }));
  const ind = {};
  for (var i = 0; i < arr.length; i++) ind[arr[i].id] = arr[i].val;
  return ind;
}
