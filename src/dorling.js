import * as d3scaleChromatic from 'd3-scale-chromatic'
import * as d3zoom from 'd3-zoom'
import * as d3scale from 'd3-scale'
import * as d3fetch from 'd3-fetch'
import * as d3format from 'd3-format'
import * as d3force from 'd3-force'
import * as d3array from 'd3-array'
import * as d3select from 'd3-selection'
import * as d3geo from 'd3-geo'
import * as topojson from 'topojson'
import * as ColorLegend from './legend/color'
import * as SizeLegend from './legend/size'
import $ from 'jquery'

const createStandaloneHTMLString = require('./templates/standalone')

/**
 * Main accessor function
 *
 * @return {*} output object
 */
export function dorling() {
    //the output object
    let out = {}

    //default values
    out.containerId_ = ''

    out.title_ = '' //viz main title
    //styles
    out.seaColor_ = 'white'
    out.coastalMargins_ = false
    out.graticule_ = false
    out.nutsBorderColor_ = 'grey'
    out.nutsBorderWidth_ = 0.15
    out.toggleLegendWidthThreshold_ = 850
    out.toggleLegendHeightThreshold_ = 700 //height (px) at which the legend is loaded in "collapsable" mode
    out.nutsLevelToggleHeightThreshold_ = 600 // the minimum height for the legend and toggle to be in the same container, otherwise they are separated.

    // no data
    out.noDataText_ = 'No data'
    out.noDataColor_ = 'grey'

    //d3 force
    // out.circleExaggerationFactor_ = 1.2; //deprecated
    // out.collisionPadding_ = 0.1; //deprectated
    out.positionStrength_ = 0.4
    out.collisionStrength_ = 0.7
    //circle radius
    out.minCircleRadius_ = { 0: 1.5, 1: 1.5, 2: 1.5, 3: 1.5 }
    out.maxCircleRadius_ = { 0: 20, 1: 20, 2: 20, 3: 20 }
    out.circleSizeFunction_ = null // lets user define custom d3 scale function
    //d3-geo
    out.translateX_ = -350 //-390;
    out.translateY_ = 1120 //1126;
    out.scale_ = 0.0002065379208173783
    out.fitSizePadding_ = 0
    //viewbox
    out.width_ = 1000
    out.height_ = 1000
    //d3 scale
    out.colorScheme_ = 'interpolateRdYlBu'
    out.colors_ = null //["#000",etc]
    out.thresholdValues_ = null //[1,100,1000]
    //interactivity
    out.loop_ = false
    out.pauseButton_ = false
    out.showBorders_ = true
    out.legendHeight_ = 550
    out.legendWidth_ = window.innerWidth > 1000 ? 400 : 220
    out.legendOpacity_ = 0.8
    //size legend (circle radiuses)
    out.sizeLegend_ = {
        title: 'Circle Size',
        textFunction: function (d) {
            return d.toLocaleString()
        },
        values: {},
    }
    //color legend
    out.colorLegend_ = {
        //https://d3-legend.susielu.com/#color
        titleWidth: 250,
        title: 'Circle Colour',
        subtitle: 'Hover over the different legend classes to highlight them on the map',
        orient: 'vertical',
        cells: null,
        shape: 'circle',
        shapeRadius: 10,
        shapePadding: 3,
        labelAlign: 'middle',
        labelOffset: 10,
        labelFormat: d3format.format('.1f'),
        locale: {
            decimal: '\u066b',
            thousands: ' ',
            grouping: [3],
            currency: ['', ' \u062f\u002e\u0625\u002e'],
            numerals: [
                '\u0660',
                '\u0661',
                '\u0662',
                '\u0663',
                '\u0664',
                '\u0665',
                '\u0666',
                '\u0667',
                '\u0668',
                '\u0669',
            ],
        },
        labelFontSize: 15,
        labelDelimiter: ' to ',
        labelUnit: ' ',
        labelWrap: 140,
        eu27: null,
    }
    //selectors
    out.showNutsSelector_ = true
    out.nutsSelectorSvgHeight_ = 140
    out.nutsSelectorSvgWidth_ = 100
    //overseas inset maps
    out.showInsets_ = true
    out.insets_ = {
        height: { 1: 340, 2: 340, 3: 550 }, // NUTS 1, 2, 3
        titleWidth: 120,
        overseasHeight: { 1: 60, 2: 60, 3: 55 },
        overseasWidth: { 1: 70, 2: 70, 3: 70 },
        translateX: 0,
        translateY: 0,
        // captionY: 65,
        // captionX: -30,
        captionY: 12,
        captionX: 3,
        captionFontSize: 9,
        offsetX: window.innerWidth > 1000 ? 10 : 0, // d3 projection fitExtent
        offsetY: window.innerWidth > 1000 ? 30 : 30,
        circleXOffset: window.innerWidth > 1000 ? 37 : 37,
        circleYOffset: window.innerWidth > 1000 ? 45 : 45,
        spacingX: { 1: 87, 2: 87, 3: 87 }, // between the start of each rect
        spacingY: { 1: 77, 2: 77, 3: 72 }, // between the start of each rect
        padding: window.innerWidth > 1000 ? 15 : 15, // inside the rect. so that the geometries arent touching the rect borders
    }
    //tooltip html
    out.tooltip_ = {
        colorLabel: 'Color value',
        colorUnit: '',
        sizeLabel: 'Size value',
        sizeUnit: '',
        shareLabel: 'Share value',
        shareUnit: '%',
        sizeValueTextFunction: null,
        colorValueTextFunction: null,
    }
    //additional text and links
    out.showAttribution_ = true
    out.attributionText_ =
        'Boundaries: © <a href="https://eurogeographics.org/" target="_blank" class="externallink">EuroGeographics</a> © <a href="https://www.fao.org/" target="_blank">UN-FAO</a>  © <a href="http://www.turkstat.gov.tr/" target="_blank">Turkstat</a>, Cartography: <a href="https://ec.europa.eu/eurostat/en/web/gisco" target="_blank">Eurostat - GISCO, 2023</a>'
    out.showSources_ = true
    out.showFootnotes_ = false
    out.footnotesText_ = ''

    //data params
    out.nutsAvailable_ = [0, 1, 2, 3] //available nuts levels
    out.onNutsLevelChange_ = null // custom callback

    out.mixNuts_ = { 0: null, 1: null, 2: null, 3: null } // e.g. {2:{UK:1, DE:1}} adds UK and DE level 1 nuts to level 2
    out.mixColorData_ = null
    out.mixSizeData_ = null

    out.eurostatRESTBaseURL = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/'
    out.nuts2JsonBaseURL_ = 'https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/'
    //'https://ec.europa.eu/assets/estat/E/E4/gisco/pub/nuts2json/v2/'
    // 'https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v1/'
    out.overseasGeometriesBaseURL_ =
        'https://raw.githubusercontent.com/eurostat/NutsDorlingCartogram/master/assets/topojson/overseas/'
    // 'https://ec.europa.eu/eurostat/cache/interactive-publications/regions/2023/vis/cartograms/assets/topojson/overseas/'
    // 'https://raw.githubusercontent.com/eurostat/NutsDorlingCartogram/master/assets/topojson/overseas/'
    out.dataBrowserBaseURL_ = 'https://ec.europa.eu/eurostat/databrowser/product/view/'
    out.customSourceURL_ = null
    out.sourcesPopupContent_ = null

    out.nutsLevel_ = 2
    out.nutsYear_ = 2016
    out.sizeDatasetCode_ = 'demo_r_pjangrp3'
    out.sizeDatasetName_ = null
    out.colorDatasetName_ = ''
    out.sizeDatasetFilters_ = 'sex=T&age=TOTAL&unit=NR&time=2022'
    out.colorDatasetCode_ = 'demo_r_gind3'
    out.colorDatasetFilters_ = 'indic_de=GROWRT&time=2022'
    out.exclude_ = [] //list of country codes to exclude from the data
    out.EUIds = ['EU', 'EU27_2020', 'EU28'] //EU ids to omit from size values
    out.colorIsPercentage_ = false
    out.colorCalculation_ = ''
    out.colorCalculationFunction_ = null
    out.colorCalculationDatasetCode_ = ''
    out.colorCalculationDatasetFilters_ = ''
    out.colorCalculationDimension_ = null

    //mobile
    out.mobileWidth_ = 479
    out.tabletWidth_ = 1000

    //standalone
    const standaloneDefault = {
        infoText: null,
        twitterText: null,
        twitterTags: ['Eurostat', 'DigitalRegionalYearbook'],
        twitterURL: window.location,
        embedURL: window.location,
        facebookTitle: null,
    }
    out.standalone_ = false
    out.standaloneUrl_ = ''

    out.circleStrokeWidth_ = 0.1
    out.circleStroke_ = '#ffffff'
    out.circleHighlightStroke_ = '#000'

    //definition of generic accessors based on the name of each parameter name
    for (let p in out)
        (function () {
            let p_ = p
            out[p_.substring(0, p_.length - 1)] = function (v) {
                if (!arguments.length) return out[p_]
                out[p_] = v
                return out
            }
        })()

    //override some accesors whereby only the object properties specified by the user are overwritten and where defaults are maintained for the remaining properties
    out.colorLegend = function (v) {
        for (let key in v) {
            out.colorLegend_[key] = v[key]
        }
        return out
    }
    out.sizeLegend = function (v) {
        for (let key in v) {
            out.sizeLegend_[key] = v[key]
        }
        return out
    }
    out.tooltip = function (v) {
        for (let key in v) {
            out.tooltip_[key] = v[key]
        }
        return out
    }
    out.insets = function (v) {
        for (let key in v) {
            out.insets_[key] = v[key]
        }
        return out
    }
    out.mixNuts = function (v) {
        for (let key in v) {
            out.mixNuts_[key] = v[key]
        }
        return out
    }
    out.standalone = function (v) {
        if (v == false || v == 'false') {
            out.standalone_ = false
        } else if (v == true || v == 'true') {
            out.standalone_ = standaloneDefault
        } else {
            // set properties individually
            for (let key in v) {
                out.standalone_[key] = v[key]
            }
        }

        return out
    }

    /**
     * @description initiates the construction of the visualization
     *
     */
    out.build = () => {
        if (getURLParamValue('simple')) {
            out.standalone_ = false
        }
        out.containerNode_ = d3select.select('#' + out.containerId_)

        // clear out existing container
        if (out.containerNode_) {
            out.containerNode_.selectAll('*').remove()
        }

        if (out.standalone_) {
            addStandaloneToDOM()
            generateEmbed()
            generateTwitterLink()
            generateFacebook()
        } else {
            out.containerNode_.attr('class', 'dorling-main-container')
        }

        // if (out.standalone_) {
        //add title between standaloneNav and dorling container
        addDorlingTitleToDOM()
        // }

        addDorlingContainerToDOM()
        addLoadingSpinnerToDOM()
        showLoadingSpinner()

        if (out.sourcesPopupContent_) {
            addSourcesModalToDOM()
        }

        //get data and animate
        out.main()
        return out
    }

    /**
     * @description Append the main parent container to the DOM
     *
     */
    function addDorlingContainerToDOM() {
        if (out.standalone_) {
            out.containerNode_.append('div').attr('id', 'dorling-container')
            out.dorlingContainer = d3select.select('#dorling-container')
            out.dorlingContainer.node().classList.add('standalone-dorling')
            out.containerNode_.node().classList.add('standalone-container')
        } else {
            out.dorlingContainer = out.containerNode_
        }
    }

    /**
     * @description Inject the relevant DOM nodes for the standalone version (includes header, share buttons, logo and modal)
     *
     */
    function addStandaloneToDOM() {
        let container = document.createElement('div')
        container.classList.add('standalone-nav')
        out.containerNode_.node().appendChild(container)
        let text
        if (out.standalone_.infoText) {
            text = out.standalone_.infoText
        } else {
            text =
                'Each bubble represents a NUTS region. Its size represents ' +
                out.tooltip_.sizeLabel.toLowerCase() +
                ' and its colour represents ' +
                out.tooltip_.colorLabel.toLowerCase() +
                '. Hover over a region using your mouse in order to read its values. To highlight all regions of the same colour-class, simply hover over the colours in the legend. '

            if (out.showNutsSelector_) {
                text +=
                    "In order to change NUTS level, use the radio buttons under 'choose geographic level' when available."
            }
        }
        let templateString = createStandaloneHTMLString(text)
        container.insertAdjacentHTML('beforeend', templateString)
    }

    /**
     * @description Adds a modal to the DOM which appears when the user clicks the data source text
     */
    function addSourcesModalToDOM() {
        let container = document.createElement('div')
        container.classList.add('sources-popup')

        let template = ` 
    <!-- Modal -->
    <div id="sources_overlay" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" translate="sources.title">Access to source datasets:</h4>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" style="text-align:center;">
                    ${out.sourcesPopupContent_}
                </div>
            </div>
        </div>
    </div>`
        container.innerHTML = template

        out.containerNode_.node().appendChild(container)
    }

    /**
     * @description Adds the visualization title to DOM
     */
    function addDorlingTitleToDOM() {
        let titleDiv = document.createElement('div')
        titleDiv.classList.add('dorling-title')
        titleDiv.innerHTML = out.title_

        if (out.standalone_) {
            out.containerNode_.node().appendChild(titleDiv)
        } else {
            let containerParent = out.containerNode_.node().parentNode
            containerParent.insertBefore(titleDiv, containerParent.firstChild)
        }
    }

    /**
     * @description Rebuilds the visualization. e.g. when changing nuts level. Similar to build, without certain DOM elements
     */
    out.rebuild = function () {
        restartTransition()
        out.stage = 1

        clearSvg()
        clearContainers()
        clearBottomText()
        showLoadingSpinner()
        out.main()
        return out
    }

    /**
     * @description Redraw the cartogram, map and legends
     */
    out.redraw = function () {
        showLoadingSpinner()

        // get new stats for the new NUTS level
        getStatisticalData().then(([colorIndex, sizeIndex]) => {
            // requests finished
            hideLoadingSpinner()

            // color and size data used to transform the circles
            out.colorIndicator = colorIndex
            out.sizeIndicator = sizeIndex

            // define scaling functions
            out.colorExtent = d3array.extent(Object.values(out.colorIndicator))
            out.sizeExtent = d3array.extent(Object.values(out.sizeIndicator))
            out.colorScale = defineColorScale()
            out.sizeScale = defineSizeScale()

            //stop previous d3 simulation
            if (out.simulation) {
                out.simulation.stop()
                out.forceInProgress = false
            }

            // redraw nuts borders
            redrawBorders()
            // redraw circles
            redrawCircles()

            //clear legend
            out.legendContainer.html('')
            //add legends
            addSizeLegend()
            addColorLegend()
            // NUTS selector is drawn inside legend container, so we need to reappend it after clearing the legend container
            addNutsSelectorToDOM()

            // show legends & nuts selector
            out.legendContainer.transition().duration(750).attr('opacity', 0.9)
            out.sizeLegendContainer.transition().duration(750).attr('opacity', 0.9)
            if (out.showNutsSelector_) {
                out.radioContainer.transition().duration(750).attr('opacity', 0.9)
            }
        })
    }

    /**
     * @description Redraws the cartogram NUTS borders
     */
    function redrawBorders() {
        //clear existing
        d3select.selectAll('#dorling-nuts-borders').remove()
        // darw new
        drawNUTSboundaries()

        if (out.showBorders_) {
            out.nutsBorders.transition().duration(750).attr('stroke', 'grey')
        } else {
            out.nutsBorders.transition().duration(750).attr('stroke', '#1f1f1f00')
            if (out.coastalMargins_) {
                if (out.margins) {
                    out.margins.forEach((margin) => {
                        margin.attr('stroke', '#1f1f1f00').attr('stroke-width', '0px')
                    })
                }
            }
        }
    }

    /**
     * @description Redraws the cartogram circles (e.g. called after nuts level change)
     */
    function redrawCircles() {
        //stop previous d3 simulation
        if (out.simulation) {
            out.simulation.stop()
            out.forceInProgress = false
        }

        // clear previous circles
        d3select.selectAll('#dorling-circles').remove()
        d3select.selectAll('#dorling-inset-circles').remove()

        // define new circles
        drawNUTScircles()

        //define size and color of the circles
        out.circles
            .transition()
            .duration(750)
            .attr('r', (f) => sizeFunction(+out.sizeIndicator[f.properties.id]))
            .attr('fill', (f) => colorFunction(out.colorIndicator[f.properties.id]))

        // clear insets
        d3select.selectAll('.dorling-insets').remove()

        // add new insets
        if (out.showInsets_ && out.nutsLevel_ !== 0) {
            getInsets().then((overseasTopo) => {
                addInsets(overseasTopo)
                //hide insets on small screens by default
                if (
                    (window.innerWidth < out.toggleLegendWidthThreshold_ ||
                        window.innerHeight < out.toggleLegendHeightThreshold_) &&
                    out.showOverseas === false
                ) {
                    out.insetsSvg.node().style.display = 'none'
                }

                // apply d3 force to the circles
                applyForce()
                // add mouse events to map
                addMouseEvents()

                // scale and color inset circles
                out.insetCircles
                    .transition()
                    .duration(750)
                    .attr('r', (f) => {
                        let id =
                            out.nutsLevel_ == 3 && f.id == 'FRY30'
                                ? f.featureCollection.features[1].properties.id
                                : f.featureCollection.features[0].properties.id
                        if (window.devicePixelRatio > 1) {
                            return sizeFunction(+out.sizeIndicator[id]) / window.devicePixelRatio
                        } else {
                            return sizeFunction(+out.sizeIndicator[id])
                        }
                    })
                    .attr('fill', (f) => {
                        let id =
                            out.nutsLevel_ == 3 && f.id == 'FRY30'
                                ? f.featureCollection.features[1].properties.id
                                : f.featureCollection.features[0].properties.id

                        return colorFunction(out.colorIndicator[id])
                    })
                    .attr('stroke', out.circleStroke_)
            })
        } else {
            // apply d3 force to the circles
            applyForce()
            // add mouse events to map
            addMouseEvents()
        }
    }

    /**
     * @description Removes all DOM nodes from all of the visualizations containers
     *
     */
    function clearContainers() {
        if (out.legendDiv) out.legendDiv.remove()
        if (out.legendBtn) out.legendBtn.remove()
        if (out.nutsSelectorDiv) out.nutsSelectorDiv.remove()
        if (out.nutsSelectorBtn) out.nutsSelectorBtn.remove()
        if (out.overseasBtn) out.overseasBtn.remove()
        if (out.zoomBtnContainer) out.zoomBtnContainer.remove()
        if (out.footnotesDiv) out.footnotesDiv.remove()
        if (out.attributionDiv) out.attributionDiv.remove()
        if (out.sourcesDiv) out.sourcesDiv.remove()
    }

    /**
     * @description Removes all DOM nodes from all of the visualizations SVGs
     *
     */
    function clearSvg() {
        //empty container of svgs
        out.dorlingContainer.selectAll('g').remove()
        out.dorlingContainer.selectAll('svg').remove()
    }

    /**
     * @description Removes all DOM nodes from the bottom text container
     *
     */
    function clearBottomText() {
        out.dorlingContainer.selectAll('.dorling-bottom-text-container').remove()
    }

    /**
     * @description Our main initiator function for building the dorling
     *
     */
    out.main = () => {
        // country ID to country name index for tooltip
        out.countryNamesIndex_ = getCountryNamesIndex()

        if (out.nutsLevel_ == 0) {
            out.showInsets_ = false
        } else {
            out.showInsets_ = true
        }

        getGeometryData().then(([nuts, centroids]) => {
            out.n2j = nuts
            out.CENTROIDS = centroids

            getStatisticalData().then(([colorIndex, sizeIndex]) => {
                // requests finished
                hideLoadingSpinner()

                // color and size data used to transform the circles
                out.colorIndicator = colorIndex
                out.sizeIndicator = sizeIndex

                // define scaling functions
                out.colorExtent = d3array.extent(Object.values(out.colorIndicator))
                out.sizeExtent = d3array.extent(Object.values(out.sizeIndicator))
                out.colorScale = defineColorScale()
                out.sizeScale = defineSizeScale()

                //stop previous d3 simulation
                if (out.simulation) {
                    out.simulation.stop()
                    out.forceInProgress = false
                }

                out.height_ = (out.width_ * (out.n2j.bbox[3] - out.n2j.bbox[1])) / (out.n2j.bbox[2] - out.n2j.bbox[0])

                //set up main svg element
                let viewbox = [0, 0, out.width_, out.height_]
                if (window.innerWidth < out.mobileWidth_) viewbox = [0, 0, 1076, 1267]
                if (window.innerWidth < out.tabletWidth_) viewbox = [0, 0, 992, 1181]

                out.svg = d3select.create('svg')
                out.svg.attr('viewBox', viewbox).attr('class', 'dorling-svg').style('background-color', out.seaColor_)

                // append map svg
                out.dorlingContainer.node().appendChild(out.svg.node())

                if (out.showAttribution_) {
                    addAttributionToDOM()
                }

                // initialize tooltip
                if (!out.tooltipElement) {
                    out.tooltipElement = addTooltipToDOM()
                }

                // d3-geo
                out.projection = d3geo
                    .geoIdentity()
                    .reflectY(true)
                    .fitExtent(
                        [
                            [0, 0],
                            [out.width_ + out.fitSizePadding_, out.height_ + out.fitSizePadding_],
                        ],
                        topojson.feature(out.n2j, out.n2j.objects['nutsbn' + out.nutsLevel_])
                    )

                out.path = d3geo.geoPath().projection(out.projection)

                if (window.innerWidth < out.mobileWidth_) {
                    // mobile
                    out.translateX_ += 50
                    out.translateY_ += 100
                }

                if (out.translateX_ && out.translateY_) {
                    out.projection.translate([out.translateX_, out.translateY_])
                }
                if (out.scale_) {
                    out.projection.scale(out.scale_)
                }

                //container for all map stuff
                out.map = out.svg.append('g').attr('transform', 'translate(0,0)').attr('class', 'dorling-map-container')

                if (out.graticule_) {
                    // draw graticule
                    drawGraticule()
                }

                if (out.showBorders_) {
                    // draw countries
                    drawCountries()
                    // draw nuts regions
                    drawNUTSregions()
                }

                drawNUTSboundaries()

                // define region centroids
                drawNUTScircles()

                // add size and color legends to DOM
                addLegendsToDOM()

                if (out.showInsets_) {
                    getInsets().then((overseasTopo) => {
                        addInsets(overseasTopo)
                        //hide insets on small screens by default
                        if (
                            window.innerWidth < out.toggleLegendWidthThreshold_ ||
                            window.innerHeight < out.toggleLegendHeightThreshold_
                        ) {
                            out.insetsSvg.node().style.display = 'none'
                        }
                        addMouseEvents()
                        addZoom()
                        out.stage = 1
                        animate()
                    })
                } else {
                    addMouseEvents()
                    addZoom()
                    out.stage = 1
                    animate() // initiate d3 animation
                }

                //additional texts
                out.bottomTextContainer = document.createElement('div')
                out.bottomTextContainer.classList.add('dorling-bottom-text-container')
                out.dorlingContainer.node().appendChild(out.bottomTextContainer)
                if (out.showFootnotes_) {
                    addFootnotesToDOM()
                }
                if (out.showSources_) {
                    addSourcesToDOM()
                }
                addZoomButtonsToDOM()
                return out
            })
        })
    }
    /**
     * @description Retrieves statistical data for both size and color indicators of the circles. Also performs any preprocessing calculations on the data and 'fills in the gaps' using different nuts years or nuts levels.
     * @return {Promise} Promise that resolves an array containing two objects: [colorIndex, sizeIndex]
     */
    function getStatisticalData() {
        return new Promise((resolve, reject) => {
            //data promises
            let statPromises = []

            // define api geo level parameter
            let geoLevel = out.nutsLevel_ == 0 ? 'country' : 'nuts' + out.nutsLevel_

            //add exeption for GDP at NUTS 3 level (no data for latest year so overrides to previous year)
            if (
                out.nutsLevel_ == 3 &&
                out.sizeDatasetCode_ == 'nama_10r_3gdp' &&
                out.colorDatasetFilters_ == 'unit=PPS_EU27_2020_HAB&time=2021'
            ) {
                statPromises.push(
                    //sizeData
                    d3fetch.json(
                        `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?geoLevel=${geoLevel}&unit=MIO_EUR&time=2020`
                    ),
                    //colorData
                    d3fetch.json(
                        `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?geoLevel=${geoLevel}&unit=PPS_EU27_2020_HAB&time=2020`
                    )
                )
            } else {
                statPromises.push(
                    //sizeData
                    d3fetch.json(
                        `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?geoLevel=${geoLevel}&${out.sizeDatasetFilters_}`
                    ),
                    //colorData
                    d3fetch.json(
                        `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?geoLevel=${geoLevel}&${out.colorDatasetFilters_}`
                    )
                )
            }

            // mix nuts: add specified NUTS IDs (of any NUTS level) to the current nuts level
            if (out.mixNuts_ && out.mixNuts_[out.nutsLevel_]) {
                out.mixNutsFilterString = '' // eurobase query string
                //prepare levels that need retrieving
                out.mixNuts_[out.nutsLevel_].ids.forEach((nutsID, index) => {
                    if (index == 0) {
                        out.mixNutsFilterString += 'geo=' + nutsID
                    } else {
                        out.mixNutsFilterString += '&geo=' + nutsID
                    }
                })

                //add promises for retrieving sizeData and ColorData of the nuts level to be merged with the current nutsLevel_
                // res[2] & res[3]
                statPromises.push(
                    d3fetch.json(
                        `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?${out.mixNutsFilterString}&${out.sizeDatasetFilters_}`
                    ), //mixLevel sizeData
                    d3fetch.json(
                        `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?${out.mixNutsFilterString}&${out.colorDatasetFilters_}`
                    ) //mixLevel colorData
                )
            }

            if (
                out.mixColorData_ &&
                out.mixColorData_[out.nutsLevel_] &&
                out.mixSizeData_ &&
                out.mixSizeData_[out.nutsLevel_]
            ) {
                // add different year for specified regions
                // res[4] & res[5]
                statPromises.push(
                    d3fetch.json(
                        `${out.eurostatRESTBaseURL}${out.sizeDatasetCode_}?geoLevel=${geoLevel}&${out.mixSizeData_.filters}`
                    )
                )
                statPromises.push(
                    d3fetch.json(
                        `${out.eurostatRESTBaseURL}${out.colorDatasetCode_}?geoLevel=${geoLevel}&${out.mixColorData_.filters}`
                    )
                )
            }

            // send eurobase requests
            Promise.all(statPromises).then((res) => {
                //if mixing NUTS levels, add specified NUTS regions to the current level's datasets
                if (out.mixNuts_[out.nutsLevel_]) {
                    let newCentroids = out.CENTROIDS[out.mixNuts_[out.nutsLevel_].level]
                    let sizeData = res[2]
                    let colorData = res[3]

                    //get centroids for specified nuts ids
                    newCentroids.features.forEach((c) => {
                        if (out.mixNuts_[out.nutsLevel_].ids.indexOf(c.properties.id) !== -1) {
                            //add centroids of mixedNuts to current level centroids

                            if (
                                !out.CENTROIDS[out.nutsLevel_].features.some((e) => e.properties.id === c.properties.id)
                            ) {
                                /* centroid hasnt already been added yet so we can push */
                                out.CENTROIDS[out.nutsLevel_].features.push(c)
                            }
                        }
                    })

                    //index color values
                    out.mixNutsColorArr = Object.entries(colorData.dimension.geo.category.index).map(([key, val]) => ({
                        id: key,
                        val: +colorData.value[val] || null,
                    }))
                    let colorInd = {}
                    for (let i = 0; i < out.mixNutsColorArr.length; i++)
                        colorInd[out.mixNutsColorArr[i].id] = out.mixNutsColorArr[i].val
                    out.mixNutsColorInd = colorInd

                    //index size values
                    let sizeArr = Object.entries(sizeData.dimension.geo.category.index).map(([key, val]) => ({
                        id: key,
                        val: +sizeData.value[val] || null,
                    }))
                    let sizeInd = {}
                    for (let i = 0; i < sizeArr.length; i++) sizeInd[sizeArr[i].id] = sizeArr[i].val
                    out.mixNutsSizeInd = sizeInd
                }

                // eurostat api stats responses
                let sizeData = res[0]
                let colorData = res[1]

                let colorPromise
                let sizePromise

                if (out.mixColorData_ && out.mixColorData_[out.nutsLevel_]) {
                    // data of a different year to fill in data gaps (e.g. greece tourism 2018)
                    let sizeDataToMix = res[4]
                    let colorDataToMix = res[5]
                    sizePromise = indexStat(sizeData, 'size', sizeDataToMix, null)
                    colorPromise = indexStat(colorData, 'color', null, colorDataToMix)
                } else {
                    //indexing requires the use of promises for when using colorPercentageCalculationData
                    sizePromise = indexStat(sizeData, 'size')
                    colorPromise = indexStat(colorData, 'color')
                }

                let indexPromises = [colorPromise, sizePromise]

                Promise.all(indexPromises).then((indexes) => {
                    let colorResult = indexes[0]
                    let sizeResult = indexes[1]

                    // get color and size data then carry out any preprocessing
                    out.totalsIndex = getTotals(sizeResult) //total of sizeIndicator for each country

                    // exclude values from eurostat data indices
                    let newSizeIndicator = {}
                    for (let key in sizeResult) {
                        if (out.exclude_) {
                            if (out.exclude_.indexOf(key.substring(0, 2)) == -1 && key.indexOf('EU') == -1) {
                                newSizeIndicator[key] = sizeResult[key]
                            }
                        } else {
                            //exlude eu values to not skew size legend values
                            if (key.indexOf('EU') == -1) {
                                newSizeIndicator[key] = sizeResult[key]
                            }
                        }
                    }
                    sizeResult = newSizeIndicator

                    resolve([colorResult, sizeResult])
                })
            })
        }) // end of returned promise
    }

    /**
     * @description returns a promise that resolves when all geometry data (nuts regions, boundaries, centroids etc) has been retrieved
     * @returns {Promise} promise that resolves nuts and centroids
     */
    function getGeometryData() {
        return new Promise((resolve, reject) => {
            let promises = []

            promises.push(
                //centroids for all NUTS levels
                d3fetch.json(`${out.nuts2JsonBaseURL_}/${out.nutsYear_}/3035/nutspt_0.json`),
                d3fetch.json(`${out.nuts2JsonBaseURL_}/${out.nutsYear_}/3035/nutspt_1.json`),
                d3fetch.json(`${out.nuts2JsonBaseURL_}/${out.nutsYear_}/3035/nutspt_2.json`),
                d3fetch.json(`${out.nuts2JsonBaseURL_}/${out.nutsYear_}/3035/nutspt_3.json`),
                //NUTS
                d3fetch.json(`${out.nuts2JsonBaseURL_}/${out.nutsYear_}/3035/20M/all.json`)
            )

            Promise.all(promises)
                .catch(function (err) {
                    console.log('A promise failed to resolve', err)
                    reject()
                    return promises
                })
                .then((res) => {
                    // all.json
                    let nuts = res[4]

                    // centroids by nuts level
                    let centroids = {
                        0: res[0],
                        1: res[1],
                        2: res[2],
                        3: res[3],
                    }

                    //remove excluded country codes from centroids feature array
                    if (out.exclude_) {
                        let levels = [0, 1, 2, 3]
                        levels.forEach((nutsLevel) => {
                            let newFeatures = []
                            centroids[nutsLevel].features.forEach((f) => {
                                if (out.exclude_.indexOf(f.properties.id.substring(0, 2)) == -1) {
                                    newFeatures.push(f)
                                }
                            })
                            centroids[nutsLevel].features = newFeatures
                        })
                    }

                    //remove madeira and azores when showing insets
                    if (out.showInsets_) {
                        let levels = [0, 1, 2, 3]
                        levels.forEach((nutsLevel) => {
                            let newFeatures = []
                            centroids[nutsLevel].features.forEach((f) => {
                                if (
                                    f.properties.id !== 'PT20' &&
                                    f.properties.id !== 'PT30' &&
                                    f.properties.id !== 'PT3' &&
                                    f.properties.id !== 'PT2' &&
                                    f.properties.id !== 'PT200' &&
                                    f.properties.id !== 'PT300'
                                ) {
                                    newFeatures.push(f)
                                }
                            })
                            centroids[nutsLevel].features = newFeatures
                        })
                    }
                    resolve([nuts, centroids])
                })
        })
    }

    /**
     * @description retrieve inset map geometries
     */
    function getInsets() {
        return d3fetch.json(`${out.overseasGeometriesBaseURL_}/NUTS${out.nutsLevel_}.json`)
    }

    /**
     * @description draws the NUTS circles on the map. Does not scale their size or colour, which occurs in firstTransition()
     */
    function drawNUTScircles() {
        out.circles = out.map
            .append('g')
            .attr('id', 'dorling-circles')
            .selectAll('circle')
            .data(out.CENTROIDS[out.nutsLevel_].features)
            .enter()
            .filter((f) => {
                if (out.sizeIndicator[f.properties.id]) {
                    return f
                }
            })
            .append('circle')
            .attr('id', (f) => f.properties.id)
            .attr('cx', (f) => out.projection(f.geometry.coordinates)[0])
            .attr('cy', (f) => out.projection(f.geometry.coordinates)[1])
            .attr('fill', '#ffffff00')
            .attr('stroke', out.circleStroke_)
            .attr('stroke-width', out.circleStrokeWidth_ + 'px')
            .attr('vector-effect', 'non-scaling-stroke')
    }

    /**
     * @description draws the NUTS boundaries on the map
     */
    function drawNUTSboundaries() {
        // nutsbn
        out.nutsBorders = out.map
            .append('g')
            .attr('id', 'dorling-nuts-borders')
            .selectAll('path')
            .data(topojson.feature(out.n2j, out.n2j.objects['nutsbn' + out.nutsLevel_]).features)
            .enter()
            .append('path')
            .attr('d', out.path)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('stroke', out.nutsBorderColor_)
            .attr('stroke-width', (f) => {
                if (f.properties.co === 'T') return out.nutsBorderWidth_ + 0.1 + 'px'
                if (f.properties.lvl === 0) return '1px'
                return out.nutsBorderWidth_ + 'px'
            })
            .attr('fill', 'none')
            .attr('class', function (f) {
                let c
                if (f.properties.co === 'T') {
                    c = 'coastal'
                } else {
                    //hide non-EU / EFTA borders
                    // https://github.com/eurostat/Nuts2json/issues/38
                    if (f.properties.eu == 'F' && f.properties.cc == 'T') {
                        c = 'dorling-no-data'
                    }
                    // exclude uk when excluded
                    if (out.exclude_.indexOf('UK') !== -1) {
                        if (
                            f.properties.eu == 'F' &&
                            f.properties.efta == 'F' &&
                            f.properties.cc == 'F' &&
                            f.properties.co == 'F' &&
                            f.properties.oth == 'T'
                        ) {
                            c = 'dorling-no-data'
                        }
                    }
                }
                return c
            })
    }

    /**
     * @description draws the NUTS regions on the map
     */
    function drawNUTSregions() {
        out.nuts = out.map
            .append('g')
            .attr('id', 'dorling-nuts')
            .selectAll('path')
            .data(topojson.feature(out.n2j, out.n2j.objects['nutsrg' + out.nutsLevel_]).features)
            .enter()
            .append('path')
            .attr('d', out.path)
            .attr('class', function (rg) {
                //colour excluded regions differently
                if (out.exclude_.indexOf(rg.properties.id.substring(0, 2)) == -1) {
                    return 'dorling-nutsrg'
                } else {
                    return 'dorling-cntrg'
                }
            })
    }

    /**
     * @description draws the countries (cntrg) on the map
     */
    function drawCountries() {
        out.cntrg = out.map
            .append('g')
            .attr('id', 'dorling-cntrg')
            .selectAll('path')
            .data(topojson.feature(out.n2j, out.n2j.objects.cntrg).features)
            .enter()
            .append('path')
            .attr('d', out.path)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('class', 'dorling-cntrg')

        out.cntbn = out.map
            .append('g')
            .attr('id', 'dorling-cntbn')
            .selectAll('path')
            .data(topojson.feature(out.n2j, out.n2j.objects.cntbn).features)
            .enter()
            .append('path')
            .attr('d', out.path)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('class', 'dorling-cntbn')
            .attr('fill', 'none')
            .attr('stroke-width', (rg) => {
                if (rg.properties.co === 'T') {
                    return out.nutsBorderWidth_ + 0.1 + 'px'
                }
            })
            .attr('stroke', (rg) => {
                if (rg.properties.co === 'T') {
                    return '#444444'
                }
            })
    }

    /**
     * @description draws the graticule on the map
     */
    function drawGraticule() {
        out.graticule = out.map
            .append('g')
            .selectAll('path')
            .data(topojson.feature(out.n2j, out.n2j.objects.gra).features)
            .enter()
            .append('path')
            .attr('d', out.path)
            .attr('class', 'dorling-graticule')
    }

    /**
     * @description Defines a custom geojson for the inset maps
     *
     * @param {*} geojson The parsed topojson object
     * @returns
     */
    function defineInsets(geojson) {
        out.insetsGeojson = geojson
        let insetsJson
        //restructure json for each NUTS level to suit d3geo fitExtent function
        if (out.nutsLevel_ == 1) {
            insetsJson = [
                {
                    id: 'ES7',
                    name: 'Canarias (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[2]],
                    },
                },
                {
                    id: 'FRY',
                    name: 'Régions Ultrapériphériques Françaises (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[3]],
                    },
                },
                {
                    id: 'PT2',
                    name: 'Açores (PT)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[0]],
                    },
                },
                {
                    id: 'PT3',
                    name: 'Madeira (PT)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[1]],
                    },
                },
            ]
        } else if (out.nutsLevel_ == 2) {
            insetsJson = [
                {
                    id: 'ES70',
                    name: 'Canarias (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[0]],
                    },
                },
                {
                    id: 'FRY2',
                    name: 'Martinique (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[2]],
                    },
                },
                {
                    id: 'FRY4',
                    name: 'La Réunion (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[4]],
                    },
                },
                {
                    id: 'PT20',
                    name: 'Açores (PT)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[6]],
                    },
                },
                {
                    id: 'FRY1',
                    name: 'Guadeloupe (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[1]],
                    },
                },
                {
                    id: 'FRY3',
                    name: 'Guyane (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[3], geojson.features[8]],
                    },
                },
                {
                    id: 'FRY5',
                    name: 'Mayotte (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[5]],
                    },
                },
                {
                    id: 'PT30',
                    name: 'Madeira (PT)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[7]],
                    },
                },
            ]
        } else if (out.nutsLevel_ === 3) {
            insetsJson = [
                {
                    id: 'ES703',
                    name: 'El Hierro (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[0]],
                    },
                },
                {
                    id: 'ES704',
                    name: 'Fuerteventura (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[1]],
                    },
                },
                {
                    id: 'ES705',
                    name: 'Gran Canaria (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[2]],
                    },
                },
                {
                    id: 'ES706',
                    name: 'La Gomera (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[3]],
                    },
                },
                {
                    id: 'ES707',
                    name: 'La Palma (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[4]],
                    },
                },
                {
                    id: 'ES708',
                    name: 'Lanzarote (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[5]],
                    },
                },
                {
                    id: 'ES709',
                    name: 'Tenerife (ES)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[6]],
                    },
                },
                {
                    id: 'FRY10',
                    name: 'Guadeloupe (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[7]],
                    },
                },
                {
                    id: 'FRY20',
                    name: 'Martinique (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[8]],
                    },
                },
                {
                    id: 'FRY30',
                    name: 'Guyane (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[14], geojson.features[9]],
                    },
                },
                {
                    id: 'FRY40',
                    name: 'La Réunion (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[10]],
                    },
                },
                {
                    id: 'FRY50',
                    name: 'Mayotte (FR)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[11]],
                    },
                },
                {
                    id: 'PT200',
                    name: 'Açores (PT)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[12]],
                    },
                },
                {
                    id: 'PT300',
                    name: 'Madeira (PT)',
                    featureCollection: {
                        type: 'FeatureCollection',
                        features: [geojson.features[13]],
                    },
                },
            ]
        }

        //add properties to insets...
        let translateY = out.insets_.translateY
        let translateX = out.insets_.translateX
        insetsJson.forEach(function (inset, i) {
            //define a projection for each inset - needs improving
            let proj
            if (inset.id == 'FRY3') {
                //zoom in on guyane, not the border feature
                let fc = {
                    type: 'FeatureCollection',
                    features: [geojson.features[3]],
                }
                proj = d3geo
                    .geoIdentity()
                    .reflectY(true)
                    .fitExtent(
                        [
                            [out.insets_.offsetX, out.insets_.offsetY],
                            [out.insets_.overseasWidth[out.nutsLevel_], out.insets_.overseasHeight[out.nutsLevel_]],
                        ],
                        fc
                    )
                // .clipExtent([[-55.26, 6.05], [-50.88, 1.93]]);
            } else if (inset.id == 'FRY30') {
                //guyane nuts 3
                //zoom in on guyane, not the border feature
                let fc = {
                    type: 'FeatureCollection',
                    features: [geojson.features[9]],
                }
                proj = d3geo
                    .geoIdentity()
                    .reflectY(true)
                    .fitExtent(
                        [
                            [out.insets_.offsetX, out.insets_.offsetY],
                            [out.insets_.overseasWidth[out.nutsLevel_], out.insets_.overseasHeight[out.nutsLevel_]],
                        ],
                        fc
                    )
            } else {
                proj = d3geo
                    .geoIdentity()
                    .reflectY(true)
                    .fitExtent(
                        [
                            [out.insets_.offsetX, out.insets_.offsetY],
                            [out.insets_.overseasWidth[out.nutsLevel_], out.insets_.overseasHeight[out.nutsLevel_]],
                        ],
                        inset.featureCollection
                    )
            }
            //positioning
            inset.x = translateX
            inset.y = translateY
            inset.projection = proj
            inset.path = d3geo.geoPath().projection(proj)
            //add Y spacing
            translateY = translateY + out.insets_.spacingY[out.nutsLevel_]
            //split into 2 columns according to inset index...
            if (out.nutsLevel_ == 3) {
                if (i == 6) {
                    translateY = out.insets_.translateY
                    translateX = out.insets_.translateX + out.insets_.spacingX[out.nutsLevel_]
                }
            } else {
                if (i == 3) {
                    translateY = out.insets_.translateY
                    translateX = out.insets_.translateX + out.insets_.spacingX[out.nutsLevel_]
                }
            }
        })

        return insetsJson
    }

    /**
     * @description Adds inset maps to the DOM
     *
     * @param {TopoJSON} overseasTopo The topojson object containing the geometries of the overseas regions to show
     */
    function addInsets(overseasTopo) {
        // create new SVG
        let nutsClass = 'dorling-insets-nuts' + out.nutsLevel_
        let width
        if (out.nutsLevel_ == 1) {
            // single column
            width = out.insets_.overseasWidth[out.nutsLevel_] + out.insets_.padding
        } else {
            // 2 columns
            width = out.insets_.overseasWidth[out.nutsLevel_] * 2 + out.insets_.padding * 2 + 2
        }
        out.insetsSvg = d3select
            .create('svg')
            // .attr("viewBox", [0, 0, 272, 605])
            .attr('width', width)
            .attr('height', out.insets_.height[out.nutsLevel_])
            .attr('class', 'dorling-insets ' + nutsClass)

        out.dorlingContainer.node().appendChild(out.insetsSvg.node())

        let objectName = 'NUTS' + out.nutsLevel_
        var geojson = topojson.feature(overseasTopo, overseasTopo.objects[objectName])

        if (out.nutsLevel_ === 3) {
            //guyane is in a different object within the topojson for NUTS 3
            let guyane = topojson.feature(overseasTopo, overseasTopo.objects.guyane)
            geojson.features.push(guyane.features[0])
        }

        let insets = defineInsets(geojson)

        //define blur
        var defs = out.insetsSvg.append('defs')
        defs.append('filter').attr('id', 'blur').append('feGaussianBlur').attr('stdDeviation', 4)
        defs.selectAll('clipPath')
            .data(insets)
            .enter()
            .append('clipPath')
            .attr('id', function (d) {
                return 'clip-inset-' + d.id
            })
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', out.insets_.overseasHeight[out.nutsLevel_] + out.insets_.padding)
            .attr('width', out.insets_.overseasWidth[out.nutsLevel_] + out.insets_.padding)

        //inset parent G element
        var g = out.insetsSvg
            .selectAll('g.insetmap')
            .data(insets)
            .enter()
            .append('g')
            .classed('insetmap', true)
            .style('transform', function (d, i) {
                let x, y
                x = d.x
                y = d.y
                return 'translate(' + x + 'px ,' + y + 'px)'
            })
            .attr('id', function (d) {
                return 'inset-' + d.id
            })
            .attr('clip-path', function (d) {
                return 'url(#clip-inset-' + d.id + ')'
            })

        //background rect
        g.append('rect')
            .classed('background', true)
            .attr('rx', '0')
            .attr('ry', '0')
            .attr('height', out.insets_.overseasHeight[out.nutsLevel_] + out.insets_.padding)
            .attr('width', out.insets_.overseasWidth[out.nutsLevel_] + out.insets_.padding)
        // /.style('transform', "translate(-" + (out.insets_.overseasWidth / 2) + ",-" + (out.insets_.overseasHeight / 2) + ")")

        //geometries
        // let features = out.insetsGeojson.features;
        let index = 0
        let insetPath = g
            .selectAll('path')
            .data(function (d) {
                return d.featureCollection.features.map(d.path)
            })
            .enter()
            .append('path')
            .attr('class', function (d, i) {
                index++
                return 'inset' + index
            })
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('d', function (d) {
                return d
            })

        index = 0
        //apply unique styling to specific regions
        if (out.nutsLevel_ === 2) {
            insetPath.attr('fill', function (d, i) {
                index++
                if (index == 7) {
                    //guyane bordering geometry
                    return '#E5E5E5'
                } else {
                    return 'white'
                }
            })
        } else if (out.nutsLevel_ === 3) {
            insetPath.attr('fill', function (d, i) {
                index++
                //guyane bordering geometry
                if (index == 10) {
                    return '#E5E5E5'
                } else {
                    return 'white'
                }
            })
        }

        //caption
        let caption = g
            .append('text')
            .data(insets)
            .text((d) => {
                if (d.name.length > 30) {
                    // wrap long names
                    let y = out.insets_.captionY
                    let w = d.name.split(' ')
                    // merge (FR) with second last item
                    let words = []
                    w.forEach((wo, i) => {
                        if (i !== w.length - 1) {
                            if (i == w.length - 2) {
                                words.push(wo + ' ' + w[i + 1])
                            } else {
                                words.push(wo)
                            }
                        }
                    })

                    let inset = d3select.select('#inset-' + d.id) //inset-ES7

                    words.forEach((word) => {
                        inset
                            .append('text')
                            .text(word)
                            .attr('class', 'overseas-caption')
                            .attr('font-size', out.insets_.captionFontSize)
                            .attr('stroke-width', 0.2)
                            .style('transform', 'translate(' + out.insets_.captionX + 'px,' + y + 'px)')
                        y += out.insets_.captionFontSize + 2
                    })
                } else {
                    return d.name
                }
            })
            .attr('class', 'overseas-caption')
            .attr('font-size', out.insets_.captionFontSize)
            .attr('stroke-width', 0.2)
            .style('transform', 'translate(' + out.insets_.captionX + 'px,' + out.insets_.captionY + 'px)')

        g.append('rect')
            .classed('outline', true)
            .attr('rx', '0')
            .attr('ry', '0')
            .attr('height', out.insets_.overseasHeight[out.nutsLevel_] + out.insets_.padding - 1)
            .attr('width', out.insets_.overseasWidth[out.nutsLevel_] + out.insets_.padding - 1)
        //.style('transform', "translate(-" + (out.insets_.overseasWidth / 2) + ",-" + (out.insets_.overseasHeight / 2) + ")")

        //add circles
        out.insetCircles = out.insetsSvg
            .append('g')
            .attr('id', 'dorling-inset-circles')
            .selectAll('circle')
            .data(insets)
            .enter()
            .filter((f) => {
                // special case for FRY30
                let id =
                    out.nutsLevel_ == 3 && f.id == 'FRY30'
                        ? f.featureCollection.features[1].properties.id
                        : f.featureCollection.features[0].properties.id
                // only show circles with both size and color data
                if (out.sizeIndicator[id]) {
                    return f
                }
            })
            .append('circle')
            .attr('cx', (d) => {
                return d.x + out.insets_.circleXOffset
            })
            .attr('cy', (d) => {
                return d.y + out.insets_.circleYOffset
            })
            .attr('id', (f) => {
                // special case for FRY30
                let id =
                    out.nutsLevel_ == 3 && f.id == 'FRY30'
                        ? f.featureCollection.features[1].properties.id
                        : f.featureCollection.features[0].properties.id

                return 'inset-circle-' + id
            })
            .attr('fill', '#ffffff00')
            .attr('stroke', out.circleStroke_)
            .attr('stroke-width', out.circleStrokeWidth_ + 'px')
    }

    /**
     * @description Appends zoom buttons to the DOM used to control d3 zoom
     *
     */
    function addZoomButtonsToDOM() {
        out.zoomBtnContainer = document.createElement('div')
        out.zoomBtnContainer.classList.add('dorling-leaflet-control-zoom')
        let zoomIn = document.createElement('div')
        zoomIn.title = 'Zoom in'
        zoomIn.classList.add('dorling-leaflet-control-zoom-in')
        zoomIn.innerHTML = '+'

        let zoomOut = document.createElement('div')
        zoomOut.classList.add('dorling-leaflet-control-zoom-out')
        zoomOut.innerHTML = '-'
        zoomOut.title = 'Zoom out'
        out.zoomBtnContainer.appendChild(zoomIn)
        out.zoomBtnContainer.appendChild(zoomOut)
        out.dorlingContainer.node().appendChild(out.zoomBtnContainer)

        zoomIn.addEventListener('click', function (e) {
            out.svg.transition().call(out.zoom.scaleBy, 1.5)
        })
        zoomOut.addEventListener('click', function (e) {
            out.svg.transition().call(out.zoom.scaleBy, 0.5)
        })
    }

    /**
     * @description Appends attribution text to the bottom of the cartogram
     *
     */
    function addAttributionToDOM() {
        out.attributionDiv = document.createElement('div')
        out.attributionDiv.innerHTML = out.attributionText_
        out.attributionDiv.classList.add('dorling-attribution')
        out.dorlingContainer.node().appendChild(out.attributionDiv)
    }

    /**
     * @description Appends data source text to the bottom of the cartogram
     *
     */
    function addSourcesToDOM() {
        out.sourcesDiv = document.createElement('div')
        out.sourcesDiv.classList.add('dorling-sources-container')
        out.bottomTextContainer.appendChild(out.sourcesDiv)

        let colorURL = out.dataBrowserBaseURL_ + out.colorDatasetCode_
        //let sizeURL = out.dataExplorerBaseURL_+ out.sizeDatasetCode_
        let colorSource = document.createElement('div')

        //<i class='fas fa-external-link-alt'>
        if (out.sourcesPopupContent_) {
            // add popup trigger
            colorSource.innerHTML =
                "Source: Eurostat - <a target='_blank' href='' data-toggle='modal' data-target='#sources_overlay' > access to dataset  </a>"
        } else {
            if (out.customSourceURL_) {
                colorSource.innerHTML =
                    "Source: Eurostat - <a target='_blank' href='" + out.customSourceURL_ + "'> access to dataset </a>"
            } else {
                colorSource.innerHTML =
                    "Source: Eurostat - <a target='_blank' href='" + colorURL + "'> access to dataset </a>"
            }
        }

        out.sourcesDiv.appendChild(colorSource)
    }

    /**
     * @description Appends footnotes text to the bottom of the cartogram
     *
     */
    function addFootnotesToDOM() {
        out.footnotesDiv = document.createElement('div')
        out.footnotesDiv.classList.add('dorling-footnotes-container')
        out.bottomTextContainer.appendChild(out.footnotesDiv)
        out.footnotesDiv.innerHTML = out.footnotesText_
    }

    /**
     * @description Defines the mouse events for the cartogram circles
     *
     */
    function addMouseEvents() {
        out.circles.on('mouseover', function (e, f) {
            if (out.stage == 2) {
                if (out.highlightedRegion) {
                    out.unhightlightRegion() //in case highlightRegion() has been used
                }

                //highlight
                d3select.select(this).attr('stroke-width', '3px').attr('stroke', out.circleHighlightStroke_)

                //calculate tooltip position + offsets
                let name = f.properties.na
                let id = f.properties.id
                let pos = getTooltipPositionFromNode(this)
                setTooltip(name, id, pos)
                let pos2 = getTooltipPositionFromNode(this)
                setTooltip(name, id, pos2)
            }
        })
        out.circles.on('mouseout', function () {
            if (out.stage == 2) {
                out.tooltipElement.style('visibility', 'hidden')

                //unhighlight
                d3select.select(this).attr('stroke-width', out.circleStrokeWidth_ + 'px').attr('stroke', out.circleStroke_)
            }
        })

        //INSETS
        if (out.showInsets_) {
            out.insetCircles.on('mouseover', function (e, f) {
                if (out.highlightedRegion) {
                    out.unhightlightRegion() //in case highlightRegion() has been used
                }
                let id =
                    out.nutsLevel_ == 3 && f.id == 'FRY30'
                        ? f.featureCollection.features[1].properties.id
                        : f.featureCollection.features[0].properties.id
                let name = f.name
                if (out.stage == 2) {
                    //highlight
                    d3select.select(this).attr('stroke-width', '3px').attr('stroke', out.circleHighlightStroke_)
                    out.tooltipElement.style('visibility', 'visible')
                    let pos = getTooltipPositionFromNode(this)
                    setTooltip(name, id, pos)
                    let pos2 = getTooltipPositionFromNode(this)
                    setTooltip(name, id, pos2)
                }
            })
            out.insetCircles.on('mouseout', function () {
                if (out.stage == 2) {
                    out.tooltipElement.style('visibility', 'hidden')
                    //unhighlight
                    d3select.select(this).attr('stroke-width', out.circleStrokeWidth_ + 'px').attr('stroke', out.circleStroke_)
                    out.unhightlightRegion() //in case highlightRegion() has been used
                }
            })
        }
    }

    /**
     * @description Calculates new tooltip position + offsets
     * @param {Element} el the HTML target element of the hover event
     * @returns {{ left: number, top: number }} object containing mouse position in screen coordinates
     */
    function getTooltipPositionFromNode(el) {
        let matrix = el.getScreenCTM().translate(
            +el.getAttribute('cx'), //svg circle
            +el.getAttribute('cy')
        )
        let tooltipNode = out.tooltipElement.node()
        let tooltipWidth = tooltipNode.offsetWidth
        let tooltipHeight = tooltipNode.offsetHeight
        let tooltipLeft = window.pageXOffset + matrix.e
        let tooltipTop = window.pageYOffset + matrix.f - 115
        let containerNode = out.dorlingContainer.node()
        let containerBoundingRect = containerNode.getBoundingClientRect()
        let circleRect = el.getBoundingClientRect()
        let mapContainer = document.getElementsByClassName('dorling-svg')[0]
        let mapContainerRect = mapContainer.getBoundingClientRect()
        let padding = 10

        // prevent going off screen right
        if (tooltipLeft > containerNode.clientWidth - tooltipWidth) {
            // move to left side of circle
            tooltipLeft = tooltipLeft - (tooltipWidth + 10 + circleRect.width)
            //make sure tooltip doesnt cover circle
            if (circleRect.left <= tooltipLeft + tooltipWidth + circleRect.width + padding) {
                tooltipLeft = tooltipLeft - padding
            }
            // make sure y value is also lower then the circle
            if (circleRect.top + circleRect.height >= tooltipTop + tooltipHeight) {
                tooltipTop = circleRect.top + padding
            }
        }

        //prevent going out of top of container
        if (tooltipTop < containerBoundingRect.top) {
            // y value is lower than top of container y value
            tooltipTop = tooltipTop + (tooltipHeight + padding)
        }
        //prevent going out of bottom of map container
        if (tooltipTop + tooltipHeight + padding > mapContainerRect.bottom) {
            // y value is lower than top of container y value
            tooltipTop = tooltipTop - (tooltipHeight + padding)
        }

        if (tooltipLeft < 0) {
            tooltipLeft = 1
        }
        if (tooltipTop < 0) {
            tooltipTop = tooltipTop + (tooltipHeight + 2) //offset
        }

        return { left: tooltipLeft, top: tooltipTop }
    }

    /**
     * Sets the tooltip HTML and position
     *
     * @param {String} name
     * @param {String} id
     * @param {MousePosition} pos
     */
    function setTooltip(name, id, pos) {
        // set default text functions if left undefined by user
        if (!out.tooltip_.sizeValueTextFunction) {
            out.tooltip_.sizeValueTextFunction = (sizeValue) => {
                return sizeValue == null || sizeValue == ':' ? out.noDataText_ : `${formatNumber(roundToOneDecimal(sizeValue))}\xA0${out.tooltip_.sizeUnit}` 
        }
        }
        if (!out.tooltip_.colorValueTextFunction) {
            out.tooltip_.colorValueTextFunction = (colorValue) => {
                return colorValue == null || colorValue == ':' ? out.noDataText_ :`<strong>${formatNumber(
                    roundToOneDecimal(colorValue)
                )}</strong>${
                    out.tooltip_.colorUnit == '%' ? out.tooltip_.colorUnit : '\xA0' + out.tooltip_.colorUnit
                }`
            }
        }

        //set tooltip content
        out.tooltipElement.html(`
                
                ${/* HEADER */ ''}
                <div class="estat-vis-tooltip-bar">
                    <strong>${name}</strong>
                    (${id}) ${out.countryNamesIndex_[id[0] + id[1]]}
                </div>
                
                ${/*  BODY */ ''}
                <div class="estat-vis-tooltip-text">

                ${/*  SIZE UNIT / VALUE */ ''}
                    ${out.tooltip_.sizeLabel}:\xA0${out.tooltip_.sizeValueTextFunction(out.sizeIndicator[id])}<br>

                ${/*  COLOR UNIT / VALUE */ ''}
                ${out.tooltip_.colorLabel}: ${out.tooltip_.colorValueTextFunction(out.colorIndicator[id])}<br>

                ${/*  SHARE UNIT / VALUE */ ''}
                    ${out.tooltip_.shareLabel}:\xA0${roundToOneDecimal(
                    (out.sizeIndicator[id] / out.totalsIndex[id.substring(0, 2)]) * 100
                )}${out.tooltip_.shareUnit} <br>

                </div>
`)

        out.tooltipElement.style('visibility', 'visible')
        out.tooltipElement.style('left', pos.left + 'px').style('top', pos.top + 'px')
    }

    function roundToOneDecimal(n) {
        return Math.round(n * 10) / 10
    }

    function animate() {
        if (out.stage == 1) {
            firstTransition()
            out.stage = 2
        } else if (out.stage == 2) {
            out.stage = 1
            restartTransition()
        }
    }

    /**
     * @description show and inflate the circles on the map and transition them into a dorling cartogram using d3-froce
     */
    function firstTransition() {
        //scale the circle sizes
        out.circles
            .transition()
            .duration(750)
            .attr('r', (f) => sizeFunction(+out.sizeIndicator[f.properties.id]))
            .attr('fill', (f) => colorFunction(out.colorIndicator[f.properties.id]))
            .attr('stroke', out.circleStroke_)

        // insets
        if (out.showInsets_) {
            out.insetCircles
                .transition()
                .duration(750)
                .attr('r', (f) => {
                    let id =
                        out.nutsLevel_ == 3 && f.id == 'FRY30'
                            ? f.featureCollection.features[1].properties.id
                            : f.featureCollection.features[0].properties.id
                    if (window.devicePixelRatio > 1) {
                        return sizeFunction(+out.sizeIndicator[id]) / window.devicePixelRatio
                    } else {
                        return sizeFunction(+out.sizeIndicator[id])
                    }
                })
                .attr('fill', (f) => {
                    let id =
                        out.nutsLevel_ == 3 && f.id == 'FRY30'
                            ? f.featureCollection.features[1].properties.id
                            : f.featureCollection.features[0].properties.id

                    return colorFunction(out.colorIndicator[id])
                })
                .attr('stroke', out.circleStroke_)
        }
        //hide nuts
        if (out.showBorders_) {
            out.nutsBorders.transition().duration(750).attr('stroke', 'grey')
        } else {
            out.nutsBorders.transition().duration(750).attr('stroke', '#1f1f1f00')
            if (out.coastalMargins_) {
                if (out.margins) {
                    out.margins.forEach((margin) => {
                        margin.attr('stroke', '#1f1f1f00').attr('stroke-width', '0px')
                    })
                }
            }
        }

        // show legends & nuts selector
        out.legendContainer.transition().duration(750).attr('opacity', 0.9)
        out.sizeLegendContainer.transition().duration(750).attr('opacity', 0.9)
        if (out.showNutsSelector_) {
            out.radioContainer.transition().duration(750).attr('opacity', 0.9)
        }

        if (!out.forceInProgress) {
            applyForce()
        }
    }

    /**
     * Replaces thousand separator with a space
     *
     * @param {*} n
     * @returns
     */
    function formatNumber(n) {
        return n.toLocaleString('en').replace(/,/gi, '\xA0')
    }

    /**
     * Applies D3 force to the dorling circles, pushing them apart
     *
     */
    function applyForce() {
        if (out.simulation) {
            out.simulation.stop()
            out.forceInProgress = false
        }
        out.simulation = d3force
            .forceSimulation(out.CENTROIDS[out.nutsLevel_].features)
            .force(
                'x',
                d3force
                    .forceX()
                    .x((f) => out.projection(f.geometry.coordinates)[0])
                    .strength(out.positionStrength_)
            )
            .force(
                'y',
                d3force
                    .forceY()
                    .y((f) => out.projection(f.geometry.coordinates)[1])
                    .strength(out.positionStrength_)
            )
            .force(
                'collide',
                d3force
                    .forceCollide()
                    .radius((f) => sizeFunction(+out.sizeIndicator[f.properties.id]))
                    .strength(out.collisionStrength_)
            )

        //set initial position of the circles
        for (const f of out.CENTROIDS[out.nutsLevel_].features) {
            f.x = out.projection(f.geometry.coordinates)[0]
            f.y = out.projection(f.geometry.coordinates)[1]
        }

        out.simulation.on('tick', () => {
            out.circles.attr('cx', (f) => f.x).attr('cy', (f) => f.y)
        })

        out.forceInProgress = true

        out.simulation.on('end', function () {
            out.forceInProgress = false
            out.simulation.stop()
            if (out.loop_) {
                restartTransition()
            }
        })
    }

    /**
     * Resets the map styles to their initial state, before transitioning into the cartogram
     *
     */
    function restartTransition() {
        out.stage = 1
        out.tooltipElement.style('visibility', 'hidden')
        //reset styles and restart animation
        //fade circles
        out.circles.transition().duration(500).attr('fill', '#40404000').attr('stroke', out.circleStroke_)
        // fade-in countries
        if (out.nuts) {
            out.nuts
                .transition()
                .duration(500)
                //.attr("stroke", "#404040ff")
                .attr('fill', 'white')
        }

        //out.countries.transition().duration(1000).attr("stroke", "#404040ff").attr("fill", "white");
        if (!out.showBorders_) {
            //hide coastal margins
            if (out.coastalMargins_) {
                if (out.margins) {
                    out.margins.forEach((margin, m) => {
                        margin
                            .attr('stroke', '#404040ff')
                            .attr('stroke-width', m * 10 + 'px')
                            .attr('stroke', d3scaleChromatic.interpolateBlues(1 - Math.sqrt(m / out.marginNb)))
                            .attr('fill', 'none')
                            .attr('opacity', '0.6')
                            .attr('stroke-linecap', 'round')
                            .attr('stroke-linejoin', 'round')
                    })
                }
            }
        } else {
            out.nutsBorders.transition().duration(1000).attr('stroke', out.nutsBorderColor_)
        }

        animate()
    }

    /**
     * Defines a D3 zoom for the map to handle zooming and panning
     *
     */
    function addZoom() {
        out.zoom = d3zoom
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
            .on('zoom', (event) => {
                zoomed(event)
            })
        out.svg.call(out.zoom).on('wheel.zoom', null)
    }

    /**
     * Adds a legend explaining the meaning of both the size of the circles and their colour
     *
     */
    function addLegendsToDOM() {
        out.legendSvg = d3select.create('svg')
        out.legendSvg
            // .attr("width", out.legendWidth_) //this is defined in the background size calculations
            .attr('class', 'dorling-legend-svg')
            .attr('viewBox', () => (window.innerWidth < out.mobileWidth_ ? '0,0,235,380' : undefined)) // 194,329 @ 588
            .attr('height', () => (window.innerWidth < out.mobileWidth_ ? 290 : out.legendHeight_))

        //append legend div to main container
        // if (!out.legendDiv) {
        out.legendDiv = document.createElement('div')
        out.legendDiv.classList.add('dorling-legend-div')
        out.legendDiv.appendChild(out.legendSvg.node())
        out.dorlingContainer.node().appendChild(out.legendDiv)
        // }

        //hide legend on small screens
        if (
            window.innerWidth < out.toggleLegendWidthThreshold_ ||
            window.innerHeight < out.toggleLegendHeightThreshold_
        ) {
            if (!out.showLegend) {
                out.legendDiv.style.visibility = 'hidden'
            }
        }

        //background container
        out.legendContainer = out.legendSvg.append('g').attr('id', 'dorling-legend-container').attr('opacity', 0)

        //add legends
        addSizeLegend()
        addColorLegend()

        if (out.showNutsSelector_) {
            addNutsSelectorToDOM()
        }

        //add background rect to legend svg for legibility when zooming
        var ctx = out.legendSvg.node(),
            textElem = out.legendContainer.node(),
            SVGRect = textElem.getBBox()
        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('x', SVGRect.x - 10)
        rect.setAttribute('y', SVGRect.y - 10)
        rect.setAttribute('width', SVGRect.width + 20)
        rect.classList.add('dorling-legend-background-rect')
        //set container width to calculated element node width
        out.legendSvg.attr('width', SVGRect.width)
        rect.setAttribute('height', SVGRect.height + 20)
        rect.setAttribute('fill', 'none') // legend fill
        rect.setAttribute('opacity', out.legendOpacity_)
        ctx.insertBefore(rect, textElem)

        //if mobile, append leaflet-like button to hide and show the legend , overseas maps & nuts selector
        if (
            window.innerWidth < out.toggleLegendWidthThreshold_ ||
            window.innerHeight < out.toggleLegendHeightThreshold_
        ) {
            addLegendMenuButtonToDOM()
            if (out.showInsets_) {
                addOverseasButtonToDOM()
            }
        }

        if (window.innerHeight < out.nutsLevelToggleHeightThreshold_) {
            // show nuts level radios in separate container
            if (out.showNutsSelector_) {
                addNutsSelectorButtonToDOM()
            }
        }
    }

    //hidden on mobile screens but shown by default otherwise
    if (window.innerWidth < out.mobileWidth_) {
        out.showLegend = false
    } else {
        out.showLegend = true
    }
    function addLegendMenuButtonToDOM() {
        let buttonContainer = document.createElement('div')
        buttonContainer.classList.add('dorling-leaflet-control-legend')
        out.legendBtn = document.createElement('div')
        out.legendBtn.classList.add('dorling-leaflet-control-legendBtn')
        out.legendBtn.innerHTML = '≡'
        out.legendBtn.title = 'Toggle legend'
        buttonContainer.appendChild(out.legendBtn)
        out.dorlingContainer.node().appendChild(buttonContainer)

        out.legendBtn.addEventListener('click', function (e) {
            out.showLegend = !out.showLegend
            // for smaller screens
            if (
                window.innerWidth < out.toggleLegendWidthThreshold_ ||
                window.innerHeight < out.toggleLegendHeightThreshold_
            ) {
                if (out.showLegend) {
                    out.legendDiv.style.visibility = 'visible'
                } else if (!out.showLegend) {
                    out.legendDiv.style.visibility = 'hidden'
                }
            } else {
                if (out.showLegend) {
                    out.legendDiv.style.opacity = 1
                } else if (!out.showLegend) {
                    out.legendDiv.style.opacity = 0
                }
            }
        })
    }

    /**
     * Adds a toggle button to show and hide the overrseas regions inset maps
     *
     */
    function addOverseasButtonToDOM() {
        out.showOverseas = false
        let buttonContainer = document.createElement('div')
        buttonContainer.classList.add('dorling-leaflet-control-overseas')
        out.overseasBtn = document.createElement('div')
        out.overseasBtn.classList.add('dorling-leaflet-control-overseasBtn')
        out.overseasBtn.innerHTML = "<i class='fa fa-globe-europe'></i>"
        out.overseasBtn.title = 'Toggle overseas regions'
        buttonContainer.appendChild(out.overseasBtn)
        out.dorlingContainer.node().appendChild(buttonContainer)
        out.overseasBtn.addEventListener('click', function (e) {
            out.showOverseas = !out.showOverseas
            if (out.showOverseas) {
                out.insetsSvg.node().style.display = 'block'
            } else if (!out.showOverseas) {
                out.insetsSvg.node().style.display = 'none'
            }
        })
    }

    /**
     * Add a radio button for a NUTS level to the DOM
     *
     */
    function addNutsSelectorButtonToDOM() {
        out.showNutsLevels = false
        let buttonContainer = document.createElement('div')
        buttonContainer.classList.add('dorling-leaflet-control-nuts-selector')
        out.nutsSelectorBtn = document.createElement('div')
        out.nutsSelectorBtn.classList.add('dorling-leaflet-control-nuts-selector-btn')
        out.nutsSelectorBtn.innerHTML = "<i class='fa fa-ellipsis-v'></i>"
        out.nutsSelectorBtn.title = 'Select geographic level'
        buttonContainer.appendChild(out.nutsSelectorBtn)
        out.dorlingContainer.node().appendChild(buttonContainer)
        out.nutsSelectorBtn.addEventListener('click', function (e) {
            out.showNutsLevels = !out.showNutsLevels
            if (out.showNutsLevels) {
                out.nutsSelectorDiv.style.display = 'block'
            } else if (!out.showNutsLevels) {
                out.nutsSelectorDiv.style.display = 'none'
            }
        })
    }

    /**
     * @description Adds a colour legend to the DOM using d3-svg-legend
     */
    function addColorLegend() {
        // define Y position

        let sizeLegendNode = out.sizeLegendContainer.node()
        let sizeLegendBbox = sizeLegendNode.getBoundingClientRect()
        let sizeLegendHeight = sizeLegendBbox.height
        let padding = 30 // buffer in px between size and color legends
        out.colorLegendY = sizeLegendHeight + padding

        // define container
        out.colorLegendContainer = out.legendContainer.append('g').attr('class', 'dorling-color-legend')
        // set position
        out.colorLegendContainer.style('transform', 'translate(0px ,' + out.colorLegendY + 'px)')

        // build using d3-svg-legend
        let colorLegend = ColorLegend.default()
            .ascending(true)
            .title(window.innerWidth > out.mobileWidth_ ? out.colorLegend_.title : null)
            .subtitle(window.innerWidth > out.mobileWidth_ ? out.colorLegend_.subtitle : null)
            .titleWidth(out.legendWidth_)
            .orient(out.colorLegend_.orient)
            .shape(out.colorLegend_.shape)
            .shapePadding(out.colorLegend_.shapePadding)
            .labelAlign(out.colorLegend_.labelAlign)
            .labelOffset(out.colorLegend_.labelOffset)
            .labelFormat(d3format.format(out.colorLegend_.labelFormat))
            .scale(out.colorScale)
            .labelDelimiter(out.colorLegend_.labelDelimiter)
            .labelWrap(out.colorLegend_.labelWrap)
            .on('cellover', function (event) {
                // legend hover mouseover
                let color = event.currentTarget.__data__
                if (out.stage == 2) {
                    out.circles
                        .transition()
                        .duration(750)
                        .attr('fill', (f) => {
                            //if circle color isnt that of the hovered cell
                            if (colorFunction(out.colorIndicator[f.properties.id]) !== color) {
                                return 'white'
                            } else {
                                return color
                            }
                        })
                    if (out.insetCircles) {
                        out.insetCircles
                            .transition()
                            .duration(750)
                            .attr('fill', (f) => {
                                //if circle color isnt that of the hovered cell
                                let id =
                                    out.nutsLevel_ == 3 && f.id == 'FRY30'
                                        ? f.featureCollection.features[1].properties.id
                                        : f.featureCollection.features[0].properties.id
                                if (colorFunction(out.colorIndicator[id]) !== color) {
                                    return 'white'
                                } else {
                                    return color
                                }
                            })
                    }
                }
            })
            .on('cellout', function (d) {
                if (out.stage == 2) {
                    out.circles
                        .transition()
                        .duration(750)
                        .attr('fill', (f) => colorFunction(out.colorIndicator[f.properties.id]))
                    if (out.insetCircles) {
                        out.insetCircles
                            .transition()
                            .duration(750)
                            .attr('fill', (f) => {
                                let id =
                                    out.nutsLevel_ == 3 && f.id == 'FRY30'
                                        ? f.featureCollection.features[1].properties.id
                                        : f.featureCollection.features[0].properties.id
                                return colorFunction(out.colorIndicator[id])
                            })
                    }
                }
            })

        if (out.colorLegend_.cells) {
            colorLegend.cells(out.colorLegend_.cells)
        }
        if (out.colors_) {
            if (out.colorLegend_.labels) {
                colorLegend.labels(out.colorLegend_.labels)
            } else {
                colorLegend.labels(function (d) {
                    if (d.i === 0) {
                        // first label
                        let thresholdValue = d.domain[d.i]
                        return '< ' + formatNumber(parseFloat(thresholdValue))
                    } else if (d.i === d.genLength - 1) {
                        //last label
                        let thresholdValue = d.domain[d.i - 1]
                        return '≥ ' + formatNumber(parseFloat(thresholdValue))
                    } else {
                        // other labels
                        let thresholdValue = d.domain[d.i]
                        let previous = d.domain[d.i - 1]
                        return formatNumber(previous) + d.labelDelimiter + '< ' + formatNumber(thresholdValue)
                    }
                })
            }
        } else {
            if (out.colorLegend_.labels) {
                colorLegend.labels(out.colorLegend_.labels)
            }
        }

        if (out.colorLegend_.shape == 'circle') colorLegend.shapeRadius(out.colorLegend_.shapeRadius)

        // append to container
        out.legendSvg.select('.dorling-color-legend').call(colorLegend)
    }

    /**
     * @description Adds a circle size legend to the DOM manually (without a third party library)
     */
    function addSizeLegend() {
        // define container
        out.sizeLegendContainer = out.legendContainer
            .append('g')
            .attr('class', 'dorling-size-legend')
            .attr('opacity', 0)

        // set position
        out.sizeLegendContainer.style('transform', 'translate(0px ,0px)')

        //assign default circle radiuses if none specified by user
        if (!out.sizeLegend_.values[out.nutsLevel_]) {
            out.sizeLegend_.values[out.nutsLevel_] = [
                Math.floor(out.sizeExtent[1]),
                Math.floor(out.sizeExtent[1] / 2),
                Math.floor(out.sizeExtent[1] / 10),
            ]
        }

        // build legend
        let sizeLegend = SizeLegend.default()
            .title(out.sizeLegend_.title)
            .maxWidth(out.legendWidth_)
            .values(out.sizeLegend_.values[out.nutsLevel_])
            .sizeFunction(out.sizeScale)
            .textFunction(out.sizeLegend_.textFunction)

        // append to container
        out.legendSvg.select('.dorling-size-legend').call(sizeLegend)
    }

    /**
     * Add svg radio buttons for changing NUTS levels.
     * If screen height is smaller than out.nutsLevelToggleHeightThreshold then the radios are shown in a separate container
     *
     */
    function addNutsSelectorToDOM() {
        let radioWidth = 30
        let radioHeight = 30
        let radioRadius = 8
        let radioDotRadius = 6
        let padding = -10 //vertical padding between radios
        let marginTop = 40
        let marginLeft = 5
        let radioCxy = 5
        let backgroundHeight = 160
        let radioDotOpacity = 0

        //add to its own svg container on smaller screens and legendsSvg for larger screens
        if (window.innerHeight < out.nutsLevelToggleHeightThreshold_) {
            marginTop = 15
            out.nutsSelectorSvg = d3select.create('svg')
            out.nutsSelectorSvg
                .attr('class', 'dorling-nuts-selector-svg')
                .attr('height', out.nutsSelectorSvgHeight_)
                .attr('width', out.nutsSelectorSvgWidth_)

            out.nutsSelectorDiv = document.createElement('div')
            out.nutsSelectorDiv.classList.add('dorling-nuts-selector-div')
            //hide nutsSelector and insets on small screens by default
            out.nutsSelectorDiv.style.display = 'none'
            out.nutsSelectorDiv.appendChild(out.nutsSelectorSvg.node())
            out.dorlingContainer.node().appendChild(out.nutsSelectorDiv)

            out.radioContainer = out.nutsSelectorSvg
                .append('g')
                .attr('id', 'dorling-nuts-selector')
                .attr('opacity', 1)
                .style('transform', 'translate(10px,0px)')
        } else {
            // add radios to legend container

            let colorLegendHeight = out.colorLegendContainer.node().getBBox().height || 0
            let padding = 0
            let translateY = out.colorLegendY + colorLegendHeight + padding

            out.radioContainer = out.legendContainer
                .append('g')
                .attr('id', 'dorling-nuts-selector')
                .attr('opacity', 0)
                .style('transform', 'translate(0px, ' + translateY + 'px)')

            //title only on larger screens
            out.radioContainer
                .append('text')
                .text('Select geographic level')
                .attr('class', 'dorling-legend-title')
                .style('transform', 'translate(0px,28px)')
        }

        //RADIO 0
        if (out.nutsAvailable_.indexOf(0) != -1) {
            out.radio0 = out.radioContainer
                .append('g')
                .attr('fill', 'currentColor')
                .attr('class', 'dorling-radio-button')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('height', '' + radioHeight + 'px')
                .attr('width', '' + radioWidth + 'px')
                .attr('viewBox', '0 0 ' + radioWidth + ' ' + radioHeight + '')
                .style('transform', 'translate(' + marginLeft + 'px ,' + marginTop + 'px)')

            out.outline0 = out.radio0
                .append('circle')
                .attr('class', 'dorling-radio-outline')
                .attr('cx', '' + radioCxy + '')
                .attr('cy', '' + radioCxy + '')
                .attr('r', '' + radioRadius + '')
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', '1')

            out.dot0 = out.radio0
                .append('circle')
                .attr('opacity', radioDotOpacity)
                .attr('cx', '' + radioCxy + '')
                .attr('cy', '' + radioCxy + '')
                .attr('r', '' + radioDotRadius + '')
                .attr('class', 'dorling-radio-dot')

            out.label0 = out.radio0.append('text').text('Country').style('transform', 'translate(25px,10px)')
        }

        //RADIO 1
        if (out.nutsAvailable_.indexOf(1) !== -1) {
            out.radio1 = out.radioContainer
                .append('g')
                .attr('fill', 'currentColor')
                .attr('class', 'dorling-radio-button')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('height', '' + radioHeight + 'px')
                .attr('width', '' + radioWidth + 'px')
                .attr('viewBox', '0 0 ' + radioWidth + ' ' + radioHeight + '')
                .style('transform', 'translate(' + marginLeft + 'px ,' + (radioHeight + padding + marginTop) + 'px)')

            out.outline1 = out.radio1
                .append('circle')
                .attr('class', 'dorling-radio-outline')
                .attr('cx', '' + radioCxy + '')
                .attr('cy', '' + radioCxy + '')
                .attr('r', '' + radioRadius + '')
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', '1')

            out.dot1 = out.radio1
                .append('circle')
                .attr('opacity', radioDotOpacity)
                .attr('cx', '' + radioCxy + '')
                .attr('cy', '' + radioCxy + '')
                .attr('r', '' + radioDotRadius + '')
                .attr('class', 'dorling-radio-dot')

            out.radio1.append('text').text('NUTS 1').style('transform', 'translate(25px,10px)')
        }

        //RADIO 2
        if (out.nutsAvailable_.indexOf(2) !== -1) {
            out.radio2 = out.radioContainer
                .append('g')
                .attr('fill', 'currentColor')
                .attr('class', 'dorling-radio-button')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('height', '' + radioHeight + 'px')
                .attr('width', '' + radioWidth + 'px')
                .attr('viewBox', '0 0 ' + radioWidth + ' ' + radioHeight + '')
                .style(
                    'transform',
                    'translate(' + marginLeft + 'px,' + (radioHeight * 2 + padding * 2 + marginTop) + 'px)'
                )

            out.outline2 = out.radio2
                .append('circle')
                .attr('class', 'dorling-radio-outline')
                .attr('cx', '' + radioCxy + '')
                .attr('cy', '' + radioCxy + '')
                .attr('r', '' + radioRadius + '')
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', '1')

            out.dot2 = out.radio2
                .append('circle')
                .attr('opacity', radioDotOpacity)
                .attr('cx', '' + radioCxy + '')
                .attr('cy', '' + radioCxy + '')
                .attr('r', '' + radioDotRadius + '')
                .attr('class', 'dorling-radio-dot')

            out.radio2.append('text').text('NUTS 2').style('transform', 'translate(25px,10px)')
        }

        //RADIO 3
        if (out.nutsAvailable_.indexOf(3) !== -1) {
            out.radio3 = out.radioContainer
                .append('g')
                .attr('fill', 'currentColor')
                .attr('class', 'dorling-radio-button')
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('height', '' + radioHeight + 'px')
                .attr('width', '' + radioWidth + 'px')
                .attr('viewBox', '0 0 ' + radioWidth + ' ' + radioHeight + '')
                .style(
                    'transform',
                    'translate(' + marginLeft + 'px ,' + (radioHeight * 3 + padding * 3 + marginTop) + 'px)'
                )

            out.outline3 = out.radio3
                .append('circle')
                .attr('class', 'dorling-radio-outline')
                .attr('cx', '' + radioCxy + '')
                .attr('cy', '' + radioCxy + '')
                .attr('r', '' + radioRadius + '')
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', '1')

            out.dot3 = out.radio3
                .append('circle')
                .attr('opacity', radioDotOpacity)
                .attr('cx', '' + radioCxy + '')
                .attr('cy', '' + radioCxy + '')
                .attr('r', '' + radioDotRadius + '')
                .attr('class', 'dorling-radio-dot')

            out.label3 = out.radio3.append('text').text('NUTS 3').style('transform', 'translate(25px ,10px)')
        }

        // set current nutsLevel
        updateRadios()

        // add nuts level change event listeners
        if (out.radio0) {
            out.radio0.on('click', function (e) {
                nutsRadioEventHandler(0)
            })
        }
        if (out.radio1) {
            out.radio1.on('click', function (e) {
                nutsRadioEventHandler(1)
            })
        }
        if (out.radio2) {
            out.radio2.on('click', function (e) {
                nutsRadioEventHandler(2)
            })
        }
        if (out.radio3) {
            out.radio3.on('click', function (e) {
                nutsRadioEventHandler(3)
            })
        }
    }

    function updateRadios() {
        let outlineSelectedColor = '#022B58'
        let radioDotOpacity = 0
        //current nutsLevel
        if (out.nutsLevel_ == 0) {
            out.dot0.attr('opacity', '1')
            out.outline0.attr('stroke', outlineSelectedColor)
            if (out.nutsAvailable_.indexOf(1) !== -1) out.dot1.attr('opacity', radioDotOpacity)
            if (out.nutsAvailable_.indexOf(2) !== -1) out.dot2.attr('opacity', radioDotOpacity)
            if (out.nutsAvailable_.indexOf(3) !== -1) out.dot3.attr('opacity', radioDotOpacity)
        } else if (out.nutsLevel_ == 1) {
            out.dot1.attr('opacity', '1')
            out.outline1.attr('stroke', outlineSelectedColor)
            if (out.nutsAvailable_.indexOf(0) !== -1) out.dot0.attr('opacity', radioDotOpacity)
            if (out.nutsAvailable_.indexOf(2) !== -1) out.dot2.attr('opacity', radioDotOpacity)
            if (out.nutsAvailable_.indexOf(3) !== -1) out.dot3.attr('opacity', radioDotOpacity)
        } else if (out.nutsLevel_ == 2) {
            out.dot2.attr('opacity', '1')
            out.outline2.attr('stroke', outlineSelectedColor)
            if (out.nutsAvailable_.indexOf(0) !== -1) out.dot0.attr('opacity', radioDotOpacity)
            if (out.nutsAvailable_.indexOf(1) !== -1) out.dot1.attr('opacity', radioDotOpacity)
            if (out.nutsAvailable_.indexOf(3) !== -1) out.dot3.attr('opacity', radioDotOpacity)
        } else if (out.nutsLevel_ == 3) {
            out.dot3.attr('opacity', '1')
            out.outline3.attr('stroke', outlineSelectedColor)
            if (out.nutsAvailable_.indexOf(0) !== -1) out.dot0.attr('opacity', radioDotOpacity)
            if (out.nutsAvailable_.indexOf(1) !== -1) out.dot1.attr('opacity', radioDotOpacity)
            if (out.nutsAvailable_.indexOf(2) !== -1) out.dot2.attr('opacity', radioDotOpacity)
        }
    }

    /**
     * @description Handles a change of NUTS level
     * @param {Number} nutsLevel the new nuts level
     */
    function nutsRadioEventHandler(nutsLevel) {
        // let nuts = evt.currentTarget.value;
        if (out.nutsLevel_ !== nutsLevel) {
            out.nutsLevel_ = nutsLevel

            // fire custom nuts level event callback
            if (out.onNutsLevelChange_) out.onNutsLevelChange_(nutsLevel)

            updateRadios()

            if (out.overseasBtn) {
                if (out.nutsLevel_ == 0) {
                    // hide insets button
                    out.overseasBtn.style.display = 'none'
                } else {
                    // show insets button
                    out.overseasBtn.style.display = 'block'
                }
            }

            out.redraw()
        }
    }

    /**
     * @description Highlights a region on the map e.g. when hovered
     * @return {*}
     */
    out.highlightRegion = function (nutsCode) {
        if (out.circles) {
            out.circles.attr('fill', (f) => {
                if (f.properties.id == nutsCode) {
                    let name = f.properties.na
                    let id = f.properties.id
                    let circle = d3select.select('#' + id)
                    let node = circle.node()
                    let pos = getTooltipPositionFromNode(node)
                    setTooltip(name, id, pos)
                    let pos2 = getTooltipPositionFromNode(node)
                    setTooltip(name, id, pos2)
                    out.highlightedRegion = nutsCode
                    return 'yellow'
                } else {
                    return colorFunction(out.colorIndicator[f.properties.id])
                }
            })

            out.circles.attr('stroke-width', (f) => {
                if (f.properties.id == nutsCode) {
                    return '3px'
                } else {
                    return out.circleStrokeWidth_ + 'px'
                }
            })
        }

        if (out.insetCircles) {
            // if highlighted region is overseas region then open insets
            let isInset = out.insetsGeojson.features.find((f) => f.properties.id == nutsCode)
            if (!out.showOverseas && isInset) {
                out.insetsSvg.node().style.display = 'block'
                out.showOverseas = true
            }
            out.insetCircles.attr('fill', (f) => {
                if (f.id == nutsCode) {
                    let name = f.name
                    let id = f.id
                    let circle = d3select.select('#inset-circle-' + id)
                    let node = circle.node()
                    let pos = getTooltipPositionFromNode(node)
                    setTooltip(name, id, pos)
                    let pos2 = getTooltipPositionFromNode(node)
                    setTooltip(name, id, pos2)
                    let pos3 = getTooltipPositionFromNode(node)
                    setTooltip(name, id, pos3)
                    out.highlightedRegion = nutsCode
                    return 'yellow'
                } else {
                    return colorFunction(out.colorIndicator[f.id])
                }
            })

            out.insetCircles.attr('stroke-width', (f) => {
                if (f.id == nutsCode) {
                    return '3px'
                } else {
                    return out.circleStrokeWidth_ + 'px'
                }
            })
        }
    }

    out.unhightlightRegion = function () {
        out.circles.attr('stroke-width', (f) => {
            return out.circleStrokeWidth_ + 'px'
        })
        out.circles.attr('fill', (f) => {
            return colorFunction(out.colorIndicator[f.properties.id])
        })
        if (out.insetCircles) {
            out.insetCircles.attr('stroke-width', (f) => {
                return out.circleStrokeWidth_ + 'px'
            })
            out.insetCircles.attr('fill', (f) => {
                return colorFunction(out.colorIndicator[f.id])
            })
        }
        out.highlightedRegion = null
    }

    function addTooltipToDOM() {
        return d3select.select('body').append('div').attr('class', 'dorling-tooltip').text('')
    }

    /**
     * @description Defines the d3 scale used to define the colours of the classes
     * @return {*}
     */
    function defineColorScale() {
        //return [0,1,2,3,...,nb-1]
        let getA = function (nb) {
            let a = []
            for (let i = 0; i < nb; i++) a.push(i)
            return a
        }
        if (out.colors_) {
            if (out.thresholdValues_) {
                return d3scale.scaleThreshold().domain(out.thresholdValues_).range(out.colors_).unknown('#ccc')
            } else {
                //split range into equal parts, rounding up or down to nearest n
                const split = function (left, right, parts) {
                    var result = [],
                        delta = (right - left) / (parts - 1)
                    while (left < right) {
                        result.push(round(left, 5))
                        left += delta
                    }
                    result.push(round(right, 5))
                    return result
                }
                let domain
                if (out.colorExtent[0] < 1) {
                    domain = split(5, out.colorExtent[1], 6)
                } else {
                    domain = split(out.colorExtent[0], out.colorExtent[1], 6)
                }
                return d3scale
                    .scaleThreshold()
                    .domain(domain)
                    .range(['#2d50a0', '#6487c3', '#aab9e1', '#f0cd91', '#e6a532', '#d76e2d'])
                    .unknown('#ccc')
            }
        } else {
            if (out.thresholdValues_) {
                return d3scale
                    .scaleDiverging()
                    .domain([out.colorExtent[0], 0, out.colorExtent[1]])
                    .interpolator(d3scaleChromatic[out.colorScheme_])
                //.range();
            } else {
                //default
                return d3scale
                    .scaleDivergingSymlog((t) => d3scaleChromatic[out.colorScheme_](1 - t))
                    .domain([out.colorExtent[0], out.colorExtent[1] / 2, out.colorExtent[1]])
                    .nice()
            }
        }
    }

    /**
     * @description Defines the d3 scale used to size the circles
     *
     * @return d3.scale
     */
    function defineSizeScale() {
        let scale =
            out.circleSizeFunction_ ||
            d3scale
                .scaleSqrt()
                .range([out.minCircleRadius_[out.nutsLevel_], out.maxCircleRadius_[out.nutsLevel_]])
                .domain(out.sizeExtent)
        return scale
    }

    /**
     * @description returns a colour from a value using the defined d3 colour scale
     *
     * @param {float} v indicator value
     * @return {string} returns colour string
     */
    function colorFunction(v) {
        return v == ':' || v == null ? out.noDataColor_ : out.colorScale(v)
    }

    /**
     * @description returns a radius from an indicator value using the defined d3 sizing scale
     *
     * @param {float} v indicator value
     * @return {float}
     */
    function sizeFunction(v) {
        // let r = out.circleExaggerationFactor_ * 0.005 * Math.sqrt(val);
        let r = out.sizeScale(v)
        // let rad = r * out.circleExaggerationFactor_
        return r
    }

    /**
     * @description map zoom event handler
     *
     */
    function zoomed(event) {
        out.map.attr('transform', event.transform)

        // give legend backlground a fill for legibility when zxooming in
        let backg = d3select.select('.dorling-legend-background-rect')

        if (event.transform.k > 1) {
            backg.node().classList.add('dorling-opaque')
        } else {
            backg.node().classList.remove('dorling-opaque')
        }
    }

    /**
     * @description Adds css spinner to DOM
     *
     */
    function addLoadingSpinnerToDOM() {
        out.spinner = document.createElement('div')
        out.spinner.classList.add('dorling-loader')
        let lds = document.createElement('div')
        lds.classList.add('lds-roller')
        let son1 = document.createElement('div')
        let son2 = document.createElement('div')
        let son3 = document.createElement('div')
        let son4 = document.createElement('div')
        let son5 = document.createElement('div')
        let son6 = document.createElement('div')
        let son7 = document.createElement('div')
        let son8 = document.createElement('div')
        lds.appendChild(son1)
        lds.appendChild(son2)
        lds.appendChild(son3)
        lds.appendChild(son4)
        lds.appendChild(son5)
        lds.appendChild(son6)
        lds.appendChild(son7)
        lds.appendChild(son8)
        out.spinner.appendChild(lds)
        out.dorlingContainer.node().appendChild(out.spinner)
    }
    function showLoadingSpinner() {
        out.spinner.classList.remove('hide')
        out.spinner.classList.add('show')
    }
    function hideLoadingSpinner() {
        out.spinner.classList.remove('show')
        out.spinner.classList.add('hide')
    }

    //standalone stuff
    const generateTwitterURL = require('./components/twitter.js').generateURL
    function generateEmbed() {
        $('#embed-content').html(
            '<pre class="pre-scrollable"><code>&lt;iframe frameborder="0" height="600px" scrolling="no" width="100%" src="' +
                out.standalone_.embedURL +
                '"&gt;&lt;/iframe&gt;</code></pre>'
        )
    }
    function generateTwitterLink() {
        let text
        if (out.standalone_.twitterText) {
            text = out.standalone_.twitterText
        } else {
            text = 'Digital Regional Yearbook: ' + out.title_
        }
        $('#tweet').attr('href', generateTwitterURL(text, out.standalone_.twitterURL, out.standalone_.twitterTags))
    }
    function generateFacebook() {
        $('#facebook-button').click(function () {
            let u = window.location.href
            let t
            if (out.standalone_.facebookTitle) {
                t = out.standalone_.facebookTitle
            } else {
                t = out.title_
            }

            let url =
                'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(u) + '&t=' + encodeURIComponent(t)
            window.open(url + '?redirect=facebook', 'sharer', 'toolbar=0,status=0,width=626,height=436')
        })
    }

    /**
     * @description Creates an index for the retrieved eurostat data. resolves a promise when done
     *
     * @param {Object} data // The eurostat api REST query reponse data
     * @param {String} type // The type of visual variable that the data represents (colour or size)
     * @param {JSON} mixSizeData // the eurobase rest response data to mix into the rest of the size index
     * @param {JSON} mixColorData // the eurobase rest response data to mix into the rest of the color index
     * @returns {[colorIndex, sizeIndex]} indexes of {region:value} for color and size indicators
     *
     */
    function indexStat(data, type, mixSizeData, mixColorData) {
        let colorIndex
        let sizeIndex
        let ind = {} //initial index
        let arr

        return new Promise((resolve, reject) => {
            //add mixed data to array here
            if (mixColorData || mixSizeData) {
                let dataToMix = mixColorData ? mixColorData : mixSizeData
                arr = Object.entries(data.dimension.geo.category.index).map(([key, val]) => ({
                    id: key,
                    val: +data.value[val] || null,
                }))

                let dataToMixArr = Object.entries(dataToMix.dimension.geo.category.index).map(([key, val]) => ({
                    id: key,
                    val: +dataToMix.value[val] || null,
                }))

                let a = mixColorData ? out.mixColorData_[out.nutsLevel_] : out.mixSizeData_[out.nutsLevel_]
                dataToMixArr.forEach((rg) => {
                    // if the user has specified that this region should be used to fill in the data gaps
                    if (a) {
                        if (a.includes(rg.id)) {
                            // then add it to the main color data array
                            arr.push(rg)
                        }
                    }
                })
            } else {
                arr = Object.entries(data.dimension.geo.category.index).map(([key, val]) => ({
                    id: key,
                    val: +data.value[val] || null,
                }))
            }

            //if the color value is a percentage, divide each colorValue by its relevant total from colorPercentageCalculationData
            if (out.colorCalculation_ && type == 'color') {
                // define api geo level parameter
                let geoLevel = out.nutsLevel_ == 0 ? 'country' : 'nuts' + out.nutsLevel_

                //util function
                const mergeById = (a1, a2) =>
                    a1.map((itm) => ({
                        ...a2.find((item) => item.id === itm.id && item),
                        ...itm,
                    }))

                //if mixNuts and colorPercentageCalculationData,
                //then the data used to calculate percentages has to be of the same nuts level as the mixNuts data
                if (out.mixNuts_[out.nutsLevel_]) {
                    let mixNutsLevel
                    if (out.mixNuts_[out.nutsLevel_].level == 0) {
                        mixNutsLevel = 'country'
                    } else {
                        mixNutsLevel = 'nuts' + out.mixNuts_[out.nutsLevel_].level
                    }
                    let totalsPromises = []
                    //totals for current nuts level
                    totalsPromises.push(
                        d3fetch.json(
                            `${out.eurostatRESTBaseURL}${out.colorCalculationDatasetCode_}?geoLevel=${geoLevel}&${out.colorCalculationDatasetFilters_}`
                        )
                    )
                    //totals for mixNuts injected data (of a different nuts level)
                    totalsPromises.push(
                        d3fetch.json(
                            `${out.eurostatRESTBaseURL}${out.colorCalculationDatasetCode_}?${out.mixNutsFilterString}&${out.colorCalculationDatasetFilters_}`
                        )
                    )

                    Promise.all(totalsPromises)
                        .catch((err) => {
                            // log that I have an error, return the entire array;
                            console.log('A promise failed to resolve', err)
                            return promises
                        })
                        .then((res) => {
                            let totals = res[0] //(current nuts level)
                            let mixTotals = res[1] //(differnt nuts level)
                            let mixedTotalsArr // array holding the totals of the regions being mixed in (those of a different NUTS level to the rest)

                            // for multiple values of a dimension we need to add them all to the total
                            // animals=A3100&animals=A2000&animals=A4100&animals=A4200 should be 4 iterations
                            if (out.colorCalculationDimension_) {
                                // NORMAL REGIONS

                                let regions = Object.keys(totals.dimension.geo.category.index) // 342
                                let values = totals.value
                                let dimensions = Object.keys(
                                    totals.dimension[out.colorCalculationDimension_].category.index
                                )
                                // totals for first dimension type of normal totals
                                let normaltotalsArr = Object.entries(totals.dimension.geo.category.index).map(
                                    ([k, v]) => {
                                        return {
                                            id: k,
                                            tot: values[v] || null,
                                        }
                                    }
                                )

                                // INJECTED REGIONS
                                let injRegions = Object.keys(mixTotals.dimension.geo.category.index) // 342
                                let injValues = mixTotals.value
                                let injDimensions = Object.keys(
                                    mixTotals.dimension[out.colorCalculationDimension_].category.index
                                )
                                // totals for first dimension type of injected totals
                                let injectedTotalsArr = Object.entries(mixTotals.dimension.geo.category.index).map(
                                    ([k, v]) => {
                                        return {
                                            id: k,
                                            tot: injValues[v] || null,
                                        }
                                    }
                                )

                                // loop the same number of times as there are groups of results in the eurostat REST response
                                for (let i = 1; i < dimensions.length; i++) {
                                    let pos = regions.length * i // position in the values index : 341 | 683 etc;
                                    Object.entries(totals.dimension.geo.category.index).map(([k, v]) => {
                                        let regionIndex = totals.dimension.geo.category.index[k]
                                        let dimValue = values[regionIndex + pos]
                                        if (dimValue) {
                                            if (normaltotalsArr[v].tot) {
                                                normaltotalsArr[v].tot = normaltotalsArr[v].tot + dimValue
                                            } else {
                                                normaltotalsArr[v].tot = dimValue
                                            }
                                        }
                                    })
                                }

                                // loop the same number of times as there are groups of results in the eurostat REST response
                                for (let b = 1; b < injDimensions.length; b++) {
                                    let pos = injRegions.length * b // posbtion in the values index (each dimension is piled on top of the next so *2 = position in 2nd dimension)
                                    Object.entries(mixTotals.dimension.geo.category.index).map(([k, v]) => {
                                        let regionIndex = mixTotals.dimension.geo.category.index[k]
                                        let dimValue = injValues[regionIndex + pos]
                                        if (dimValue) {
                                            if (injectedTotalsArr[v].tot) {
                                                injectedTotalsArr[v].tot = injectedTotalsArr[v].tot + dimValue
                                            } else {
                                                injectedTotalsArr[v].tot = dimValue
                                            }
                                        }
                                    })
                                }

                                // merge the totals of normal regions with the totals of injected regions of a different NUTS level
                                mixedTotalsArr = normaltotalsArr.concat(injectedTotalsArr)

                                // merge the values with the totals for all nuts levels
                                let mixedValuesArr = out.mixNutsColorArr.concat(arr)
                                let mixNutsMerged = mergeById(mixedValuesArr, mixedTotalsArr)
                                // add the mixed nuts to the final index (ind)
                                for (let i = 0; i < mixNutsMerged.length; i++) {
                                    let value = mixNutsMerged[i].val
                                    let total = mixNutsMerged[i].tot
                                    let indicator
                                    if (out.colorCalculation_ == 'percentage') {
                                        indicator = (value / total) * 100
                                    } else if (out.colorCalculation_ == 'per') {
                                        if (out.colorCalculationFunction_) {
                                            indicator = out.colorCalculationFunction_(value, total)
                                        } else {
                                            indicator = total / value
                                        }
                                    }
                                    ind[mixNutsMerged[i].id] = indicator || null
                                }
                            } else {
                                // without colorCalculationDimension
                                let mixTotalsArr = Object.entries(mixTotals.dimension.geo.category.index).map(
                                    ([k, v]) => ({ id: k, tot: +mixTotals.value[v] || null })
                                )
                                let mixNutsMerged = mergeById(out.mixNutsColorArr, mixTotalsArr)

                                for (let i = 0; i < mixNutsMerged.length; i++) {
                                    let value = mixNutsMerged[i].val
                                    let total = mixNutsMerged[i].tot
                                    let indicator
                                    if (out.colorCalculation_ == 'percentage') {
                                        indicator = (value / total) * 100
                                    } else if (out.colorCalculation_ == 'per') {
                                        if (out.colorCalculationFunction_) {
                                            indicator = out.colorCalculationFunction_(value, total)
                                        } else {
                                            indicator = total / value
                                        }
                                    }
                                    ind[mixNutsMerged[i].id] = indicator || null
                                }

                                //normal
                                const totalsArr = Object.entries(totals.dimension.geo.category.index).map(([k, v]) => ({
                                    id: k,
                                    tot: +totals.value[v] || null,
                                }))
                                //merge values array with totals array
                                let merged = mergeById(arr, totalsArr)
                                //divide each value by the desired total
                                for (let i = 0; i < merged.length; i++) {
                                    let value = merged[i].val
                                    let total = merged[i].tot
                                    let indicator
                                    if (out.colorCalculation_ == 'percentage') {
                                        indicator = (value / total) * 100
                                    } else if (out.colorCalculation_ == 'per') {
                                        if (out.colorCalculationFunction_) {
                                            indicator = out.colorCalculationFunction_(value, total)
                                        } else {
                                            indicator = total / value
                                        }
                                    }
                                    ind[merged[i].id] = indicator || null
                                }
                            }

                            colorIndex = ind
                            resolve(colorIndex)
                        })
                } else {
                    //without mixed nuts
                    d3fetch
                        .json(
                            `${out.eurostatRESTBaseURL}${out.colorCalculationDatasetCode_}?geoLevel=${geoLevel}&${out.colorCalculationDatasetFilters_}`
                        )
                        .then((totals) => {
                            let totalsArr
                            // for multiple values of a dimension we need to add them all to the total
                            // animals=A3100&animals=A2000&animals=A4100&animals=A4200 should be 4 iterations
                            if (out.colorCalculationDimension_) {
                                let regions = Object.keys(totals.dimension.geo.category.index) // 342
                                let values = totals.value
                                let dimensions = Object.keys(
                                    totals.dimension[out.colorCalculationDimension_].category.index
                                )

                                // totals for first dimension type
                                totalsArr = Object.entries(totals.dimension.geo.category.index).map(([k, v]) => {
                                    return {
                                        id: k,
                                        tot: values[v] || null,
                                    }
                                })

                                // loop the same number of times as there are groups of results in the eurostat REST response
                                for (let i = 1; i < dimensions.length; i++) {
                                    let pos = regions.length * i // position in the values index : 341 | 683 etc;
                                    Object.entries(totals.dimension.geo.category.index).map(([k, v]) => {
                                        let regionIndex = totals.dimension.geo.category.index[k]
                                        let dimValue = values[regionIndex + pos]
                                        if (dimValue) {
                                            if (totalsArr[v].tot) {
                                                totalsArr[v].tot = totalsArr[v].tot + dimValue
                                            } else {
                                                totalsArr[v].tot = dimValue
                                            }
                                        }
                                    })
                                }
                            } else {
                                totalsArr = Object.entries(totals.dimension.geo.category.index).map(([k, v]) => ({
                                    id: k,
                                    tot: +totals.value[v] || null,
                                }))
                            }

                            //merge values array with totals array
                            let merged = mergeById(arr, totalsArr)
                            //divide each value by the desired total
                            for (let i = 0; i < merged.length; i++) {
                                let value = merged[i].val
                                let total = merged[i].tot
                                let indicator
                                if (out.colorCalculation_ == 'percentage') {
                                    indicator = (value / total) * 100
                                } else if (out.colorCalculation_ == 'per') {
                                    if (out.colorCalculationFunction_) {
                                        indicator = out.colorCalculationFunction_(value, total)
                                    } else {
                                        indicator = total / value
                                    }
                                }
                                ind[merged[i].id] = indicator || null
                            }
                            colorIndex = ind
                            resolve(colorIndex)
                        })
                }
            } else {
                //otherwise, just index the data normally
                for (let i = 0; i < arr.length; i++) ind[arr[i].id] = arr[i].val
                if (type == 'size') {
                    sizeIndex = ind

                    if (out.mixNuts_[out.nutsLevel_]) {
                        //add values to be mixed to current indices
                        for (var attr in out.mixNutsSizeInd) {
                            sizeIndex[attr] = out.mixNutsSizeInd[attr]
                        }
                    }

                    resolve(sizeIndex)
                } else if (type == 'color') {
                    colorIndex = ind

                    if (out.mixNuts_[out.nutsLevel_]) {
                        //add values to be mixed to current indices
                        for (var attr in out.mixNutsColorInd) {
                            colorIndex[attr] = out.mixNutsColorInd[attr]
                        }
                    }
                    resolve(colorIndex)
                }
            }
        })
    }

    return out
}

/**
 * Groups data by country and calculates the sum for the given indicator
 *
 * @param {*} data //eurostat REST query response data
 * @return {*}
 */
function getTotals(data) {
    //get total for each country
    let arr = Object.entries(data)
    let dataByCountry = Array.from(d3array.group(arr, (d) => d[0][0] + d[0][1]))
    let result = {}
    dataByCountry.forEach((country) => {
        let countryTotal = 0
        for (let i = 0; i < country[1].length; i++) {
            countryTotal = countryTotal + country[1][i][1]
        }
        result[country[0]] = countryTotal
    })
    return result
}

//rounds both positive and negative float to nearest n
function round(v, nearest) {
    return (v >= 0 || -1) * Math.round(Math.abs(v) / nearest) * nearest
}

function getCountryNamesIndex() {
    return {
        BE: 'Belgium',
        BG: 'Bulgaria',
        CZ: 'Czechia',
        DK: 'Denmark',
        DE: 'Germany',
        EE: 'Estonia',
        IE: 'Ireland',
        EL: 'Greece',
        ES: 'Spain',
        FR: 'France',
        HR: 'Croatia',
        IT: 'Italy',
        CY: 'Cyprus',
        LV: 'Latvia',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        HU: 'Hungary',
        MT: 'Malta',
        NL: 'Netherlands',
        AT: 'Austria',
        PL: 'Poland',
        PT: 'Portugal',
        RO: 'Romania',
        SI: 'Slovenia',
        SK: 'Slovakia',
        FI: 'Finland',
        SE: 'Sweden',
        IS: 'Iceland',
        LI: 'Liechtenstein',
        NO: 'Norway',
        CH: 'Switzerland',
        ME: 'Montenegro',
        MK: 'North Macedonia',
        AL: 'Albania',
        RS: 'Serbia',
        TR: 'Turkey',
        BA: 'Bosnia and Herzegovina',
        XK: 'Kosovo',
        UK: 'United Kingdom',
    }
}
/**
 * @description Retrieve a URL parameter
 * @param {*} paramName
 * @return {*}
 */
function getURLParamValue(paramName) {
    var url = window.location.search.substring(1) //get rid of "?" in querystring
    var qArray = url.split('&') //get key-value pairs
    for (var i = 0; i < qArray.length; i++) {
        var pArr = qArray[i].split('=') //split key and value
        if (pArr[0] == paramName) {
            pArr[1] = decodeURI(pArr[1])
            return pArr[1] //return value
        }
    }
}
