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
  out.positionStrength_ = 0.6;
  out.collisionStrength_ = 0.3;
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
  out.sizeLegendTitle_ = "Total Population";

  out.legend_ = {
    //https://d3-legend.susielu.com/#color
    titleWidth: 200,
    title: "Population change (‰)",
    orient: "vertical",
    cells: null,
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
  out.legend = function (v) {
    for (let key in v) {
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

  let playing = true;
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
      out.n2j = res[0];
      let n2jrg = res[1];

      let sizeData = res[2];
      let colorData = res[3];

      let bn = topojson.feature(n2jrg, n2jrg.objects.nutsbn).features;
      let coastlines = topojson.feature(n2jrg, n2jrg.objects.nutsbn).features;

      out.sizeIndicator = indexStat(sizeData);
      out.colorIndicator = indexStat(colorData);
      out.totalsIndex = getTotals(out.sizeIndicator); //total of sizeIndicator for each country

      //d3 geo
      out.projection = d3
        .geoAzimuthalEqualArea()
        .rotate([out.rotateX_, out.rotateY_])
        .fitSize([out.width_, out.height_], out.n2j)
        .scale(out.scale_);
      out.path = d3.geoPath().projection(out.projection);

      if (out.translateX_ && out.translateY_) {
        out.projection.translate([out.translateX_, out.translateY_]);
      }

      // let path = geoPath().projection(
      //   geoIdentity()
      //     .reflectY(true)
      //     .fitSize([out.width_, out.height_], n2j)
      // );

      //d3 scale
      out.extent = d3.extent(Object.values(out.colorIndicator));
      //color scale
      out.colorScale = defineColorScale();
      out.countries = out.svg
        .append("g")
        .selectAll("path")
        .data(bn)
        .enter()
        .append("path")
        .attr("d", out.path)
        .attr("fill", "none")
        .attr("stroke", "#404040ff");

      //add coastlines
      out.coastL = out.svg
        .append("g")
        .attr("id", "g_coast_margin_cnt")
        .selectAll("path")
        .data(coastlines)
        .enter()
        .filter(function (bn) {
          return bn.properties.co === "T";
        })
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#40404000")
        .attr("d", out.path);

      // initialize tooltip
      out.tooltip = addTooltipToDOM();

      //add play button
      out.playButton = addPlayButtonToDOM();

      //define region centroids
      out.circles = out.svg
        .append("g")
        .selectAll("circle")
        .data(out.n2j.features)
        .enter()
        .append("circle")
        .attr("cx", (f) => out.projection(f.geometry.coordinates)[0])
        .attr("cy", (f) => out.projection(f.geometry.coordinates)[1])
        .attr("r", (f) => 0.000055 * Math.sqrt(f.properties.ar))
        .attr("fill", "#ffffff00")
        .attr("stroke", "#40404000");

      addZoom();
      addLegendsToDOM();

      out.stage = 1; //current transition number
      animate();
    });
    return out;
  };

  function animate() {
    if (out.stage == 1) {
      if (playing) {
        setTimeout(function () {
          out.stage = 1;
          //Show the regions as circles & configure tooltip

          if (playing) {
            firstTransition();
            setTimeout(function () {
              out.stage = 2;
              //Change circle size and color with population figures

              if (playing) {
                secondTransition();
                setTimeout(function () {
                  out.stage = 3;
                  //Dorling cartogram deformation

                  if (playing) {
                    thirdTransition();
                    // setTimeout(function () {
                    //   out.stage = 4;
                    //   //fade in coastlines
                    //   if (playing) fourthTransition();
                    // }, 3000);
                  }
                }, 3000);
              }
            }, 2000);
          }
        }, 1000);
      }
      return;
    } else if (out.stage == 2) {
      if (playing) {
        setTimeout(function () {
          out.stage = 2;
          //Change circle size and color with population figures
          if (playing) {
            secondTransition();
            setTimeout(function () {
              out.stage = 3;
              //Dorling cartogram deformation
              if (playing) {
                thirdTransition();
                // setTimeout(function () {
                //   out.stage = 4;
                //   //fade in coastlines
                //   if (playing) {
                //     fourthTransition();
                //   }
                // }, 2000);
              }
            }, 2000);
          }
        }, 1000);
      }
      return;
    } else if (out.stage == 3) {
      if (playing) {
        setTimeout(function () {
          out.stage = 3;
          //Dorling cartogram deformation
          if (playing) {
            endTransition();
            // setTimeout(function () {
            //   out.stage = 4;
            //   //fade in coastlines
            //   if (playing) fourthTransition();
            // }, 1000);
          }
        }, 1000);
      }
      return;
    }
    // else if (out.stage == 4) {
    //   if (playing) {
    //     setTimeout(function () {
    //       out.stage = 4;
    //       //fade in coastlines
    //       fourthTransition();
    //     }, 1);
    //   }
    //   return;
    // }
  }

  //hide countries show circles
  function firstTransition() {
    //hide out.countries
    out.countries.transition().duration(1000).attr("stroke", "#40404000");

    //show circles
    out.circles
      .transition()
      .duration(1000)
      .attr("fill", "#ffffff44")
      .attr("stroke", "#404040ff");
    out.circles.on("mouseover", function (f) {
      d3.select(this).attr("fill", "purple");
      out.tooltip.html(`<strong>${f.properties.na}</strong>
                    (${f.properties.id})<br>
                    Population: ${out.sizeIndicator[f.properties.id]
          .toLocaleString("en")
          .replace(/,/gi, " ")}<br>
                      Share of national population: ${(
          (out.sizeIndicator[f.properties.id] /
            out.totalsIndex[f.properties.id.substring(0, 2)]) *
          100
        ).toFixed(0)} % <br>
                    Population Change: <strong>${
        out.colorIndicator[f.properties.id]
        } ‰</strong><br>
                `);
      let matrix = this.getScreenCTM().translate(
        +this.getAttribute("cx"),
        +this.getAttribute("cy")
      );
      out.tooltip.style("visibility", "visible");
      //position + offsets
      let node = out.tooltip.node();
      let tooltipWidth = node.offsetWidth;
      let tooltipHeight = node.offsetHeight;
      let left = window.pageXOffset + matrix.e + 20;
      let top = window.pageYOffset + matrix.f - 100;
      if (left > out.width_ - tooltipWidth) {
        left = left - (tooltipWidth + 40);
      }
      if (top < 0) {
        top = top + (tooltipHeight + 40);
      }
      out.tooltip.style("left", left + "px").style("top", top + "px");
      // tooltip
      //   .style("top", d3.event.pageY - 110 + "px")
      //   .style("left", d3.event.pageX - 120 + "px");
    });
    out.circles.on("mouseout", function () {
      out.tooltip.style("visibility", "hidden");
      d3.select(this).attr("fill", (f) =>
        colorFunction(+out.colorIndicator[f.properties.id])
      );
    });
  }


  //resize circles
  function secondTransition() {
    out.circles
      .transition()
      .duration(1500)
      .attr("r", (f) => toRadius(+out.sizeIndicator[f.properties.id]))
      .attr("fill", (f) => colorFunction(+out.colorIndicator[f.properties.id]))
      .attr("stroke", "black");
  }


  //d3 simulation of dorling deformation
  function thirdTransition() {
    //fade in coastlines
    out.coastL.transition().duration(1000).attr("stroke", "#404040ff");
    const simulation = d3
      .forceSimulation(out.n2j.features)
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
    for (const f of out.n2j.features) {
      f.x = out.projection(f.geometry.coordinates)[0];
      f.y = out.projection(f.geometry.coordinates)[1];
    }

    simulation.on("tick", () => {
      out.circles.attr("cx", (f) => f.x).attr("cy", (f) => f.y);
    });

    simulation.on("end", function () {
      simulation.stop();
      if (playing) {
        endTransition();
      }
    });
    //invalidation.then(() => simulation.stop());
  }
  function endTransition() {
    //reset styles and restart animation
    //fade circles
    out.circles
      .transition()
      .delay(500)
      .duration(1000)
      .attr("fill", "#40404000")
      .attr("stroke", "#40404000");
    // fade-in countries
    out.countries
      .transition()
      .delay(500)
      .duration(1000)
      .attr("stroke", "#404040ff");
    setTimeout(function () {
      //reset circle locations & color
      out.circles
        .attr("cx", (f) => out.projection(f.geometry.coordinates)[0])
        .attr("cy", (f) => out.projection(f.geometry.coordinates)[1])
        .attr("r", (f) => 0.000055 * Math.sqrt(f.properties.ar));
      out.stage = 1;
      animate();
    }, 1500);
  }
  function addZoom() {
    //add d3 zoom
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
            zoomed(out.circles, out.coastL);
          })
      );
    }
  }
  function addLegendsToDOM() {
    //background container
    out.legendContainer = out.svg
      .append("g")
      .attr("class", "dorling-legend-container")
      .attr("transform", "translate(0,0)");
    let containerBackground = out.legendContainer
      .append("rect")
      .attr("class", "dorling-legend-container-background")
      .attr("transform", "translate(0,0)");
    //legend <g>
    out.legendContainer
      .append("g")
      .attr("class", "dorling-color-legend")
      .attr("transform", "translate(20,20)");

    let legend = legendColor()
      //.useClass(true)
      .title(out.legend_.title)
      .titleWidth(out.legend_.titleWidth)
      .orient(out.legend_.orient)
      .shape(out.legend_.shape)
      .shapePadding(out.legend_.shapePadding)
      .labelAlign(out.legend_.labelAlign)
      .labelOffset(out.legend_.labelOffset)
      .labelFormat(out.legend_.labelFormat)
      .scale(out.colorScale)
      .labelDelimiter(out.legend_.labelDelimiter)
      .labelWrap(out.legend_.labelWrap);
    if (out.legend_.cells) {
      legend.cells(out.legend_.cells);
    }
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

    out.svg.select(".dorling-color-legend").call(legend);

    let colorLegendNode = document
      .getElementsByClassName("dorling-color-legend")[0]
      .getBoundingClientRect();

    //circle size legend
    let sizeLegendContainer = out.svg
      .append("g")
      .attr("class", "dorling-size-legend")
      .attr("transform", "translate(0," + (out.height_ - 100) + ")");
    let sizeLegendBackground = sizeLegendContainer
      .append("rect")
      .attr("class", "dorling-legend-container-background")
      .attr("transform", "translate(0,0)");
    const legendTitle = sizeLegendContainer
      .append("g")
      .attr("fill", "black")
      .attr("transform", "translate(20,0)")
      .attr("text-anchor", "right");
    legendTitle
      .append("text")
      .attr("y", 5)
      .attr("x", 0)
      .attr("dy", "1.3em")
      .text(out.sizeLegendTitle_);
    const legC = sizeLegendContainer
      .append("g")
      .attr("fill", "black")
      .attr("transform", "translate(40, 85)")
      .attr("text-anchor", "right")
      .selectAll("g")
      .data([20e6, 10e6, 1e6])
      .join("g");
    legC
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("cy", (d) => -toRadius(d))
      .attr("r", toRadius);
    legC
      .append("text")
      //.attr("y", (d) => 9 - 2 * toRadius(d))
      .attr("y", (d) => {
        if (d == 20e6) {
          return -1 - 2 * toRadius(d) - 10 - 4; //add padding
        } else {
          return -1 - 2 * toRadius(d) - 10;
        }
      })
      .attr("x", 30)
      .attr("dy", "1.3em")
      .text((d) => {
        return d.toLocaleString("en").replace(/,/gi, " ");
      });

    //adjust legend bacgkround box height
    let containerNode = document
      .getElementsByClassName("dorling-legend-container")[0]
      .getBoundingClientRect();
    containerBackground.style("height", containerNode.height + 10 + "px");
    containerBackground.style("width", containerNode.width + 10 + "px");
  }
  function addPlayButtonToDOM() {
    let buttonContainer = out.svg
      .append("g")
      .attr("class", "dorling-play-button")
      .attr(
        "transform",
        "translate(" + out.width_ / 2 + "," + (out.height_ - 60) + ")"
      );
    let playBtn = buttonContainer.append("g").style("visibility", "hidden");
    let pauseBtn = buttonContainer.append("g").style("visibility", "visible");

    playBtn
      .append("rect")
      .attr("width", 50)
      .attr("height", 50)
      .attr("rx", 4)
      .style("fill", "steelblue");
    playBtn
      .append("path")
      .attr("d", "M15 10 L15 40 L35 25 Z")
      .style("fill", "white");

    pauseBtn
      .append("rect")
      .attr("width", 50)
      .attr("height", 50)
      .attr("rx", 4)
      .style("fill", "steelblue");
    pauseBtn
      .append("path")
      .attr("d", "M12,11 L23,11 23,40 12,40 M26,11 L37,11 37,40 26,40")
      .style("fill", "white");

    buttonContainer.on("mousedown", function () {
      playing = !playing;

      //change icon
      playBtn.style("visibility", playing ? "hidden" : "visible");
      pauseBtn.style("visibility", playing ? "visible" : "hidden");

      //continue animation
      if (playing) {
        animate();
      }
    });

    return buttonContainer;
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
        .range(out.colors_);
    } else {
      if (out.thresholdValues_) {
        return d3
          .scaleDiverging()
          .domain([out.extent[0], 0, out.extent[1]])
          .interpolator(d3[out.colorScheme_]);
        //.range();
      } else {
        return d3
          .scaleDivergingSymlog((t) => d3[out.colorScheme_](1 - t))
          .domain([out.extent[0], out.extent[1] / 2, out.extent[1]])
          .nice();
      }
    }
  }

  function colorFunction(v) {
    let color = out.colorScale(v);
    return color;
  }

  function zoomed(circles, coastL) {
    circles.attr("transform", d3.event.transform);
    coastL.attr("transform", d3.event.transform);
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
