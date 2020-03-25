NutsDorlingCartogram.dorling({
  svgId: "dorlingSvg",
  width: 800,
  height: 500,
  nutsLvl: 2,
  colorScheme: "interpolateRdYlBu",
  zoom: true,
  sizeDatasetId: "demo_r_pjangrp3",
  sizeDatasetFilters: "sex=T&age=TOTAL&unit=NR&time=2018",
  colorDatasetId: "demo_r_gind3",
  colorDatasetFilters: "indic_de=GROWRT&time=2018",
  legend: {
    //https://d3-legend.susielu.com/#color
    titleWidth: 200,
    title: "Population change (‰)",
    orient: "horizontal",
    cells: 5,
    shape: "rect",
    shapeRadius: 20,
    shapePadding: 20,
    labelAlign: "middle",
    labelOffset: 10
  }
});
