NutsDorlingCartogram.dorling()
  .svgId("dorlingSvg")
  .width(800)
  .height(700)
  .nutsLvl(2)
  .colorScheme("interpolateRdYlBu")
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
    cells: 5,
    shape: "rect",
    shapeRadius: 10,
    shapePadding: 5,
    labelAlign: "middle",
    labelOffset: 10
  })
  .scale(1000)
  .rotateX(-13)
  .rotateY(-61)
  .translateX(340)
  .translateY(216)
  .build();
