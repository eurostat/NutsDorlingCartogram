NutsDorlingCartogram.dorling()
  .svgId("dorlingSvg")
  .width(900)
  .height(700)
  .nutsLvl(2)
  //.colorScheme("interpolateRdYlBu")
  .colors(["#2d50a0", "#6487c3", "#aab9e1", "#f0cd91", "#e6a532", "#d76e2d"])
  .thresholdValues([-15, -10, 0, 10, 15, 20])
  .zoom(true)
  .sizeDatasetCode("demo_r_pjangrp3")
  .sizeDatasetFilters("sex=T&age=TOTAL&unit=NR&time=2018")
  .colorDatasetCode("demo_r_gind3")
  .colorDatasetFilters("indic_de=GROWRT&time=2018")
  .legend({
    //https://d3-legend.susielu.com/#color
    titleWidth: 200,
    title: "Population change (‰)",
    orient: "vertical",
    shape: "rect",
    shapeRadius: 10,
    shapePadding: 5,
    labelAlign: "middle",
    labelOffset: 10,
    shape: "circle",
    //So peaceful cells: 10,
  })
  .scale(900)
  .rotateX(-10)
  .rotateY(-61)
  .translateX(400)
  .translateY(216)
  .build();
