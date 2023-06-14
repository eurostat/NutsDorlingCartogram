import helper from './legend'
import * as d3select from 'd3-selection'

const sizeLegend = function () {
    let values = [],
        title = '',
        maxWidth = 250,
        sizeFunction,
        textFunction

    function legend(svg) {
        let maxCircleRadius = sizeFunction(Math.max(...values))
        let lineOffsetY = 2
        let labelsTranslateX = maxCircleRadius + 10

        const legendTitle = svg
            .append('g')
            .attr('fill', 'black')
            .attr('class', 'dorling-size-legend-title')
            .style('transform', 'translate(0px,0px)')
            .attr('text-anchor', 'right')
        legendTitle
            .append('text')
            .attr('y', 5)
            .attr('x', 0)
            .attr('dy', '0em')
            .text(title)
            .attr('class', 'dorling-legend-title')
            .call(helper.d3_textWrapping, maxWidth)

        //circles container
        const legC = svg
            .append('g')
            .attr('class', 'dorling-size-legend-circles')
            .attr('fill', 'black')
            .attr('text-anchor', 'right')
            .selectAll('g')
            .data(values)
            .join('g')
            .attr('class', 'dorling-size-legend-entry')

        //circles
        legC.append('circle')
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('class', (c, i) => 'circle' + i)
            .attr('cy', (d) => {
                return -getScreenCircleSize(sizeFunction(d)) / 2
            })
            .attr('r', (d) => {
                return getScreenCircleSize(sizeFunction(d)) / 2
            })

        //labels

        legC.append('text')
            .attr('class', 'dorling-size-legend-label')
            //.attr("y", (d) => 9 - 2 * sizeFunction(d))
            .attr('y', (d, i) => {
                let r = getScreenCircleSize(sizeFunction(d)) / 2
                let y = 1 - 2 * r
                return y + lineOffsetY
            })
            .attr('x', labelsTranslateX)
            //.attr('dy', '1.2em')
            .attr('alignment-baseline', 'middle')
            .attr('xml:space', 'preserve')
            .text((d) => {
                return textFunction(d)
            })
        //line pointing to top of corresponding circle:

        legC.append('line')
            .style('stroke-dasharray', 2)
            .style('stroke', 'grey')
            .attr('x1', 2)
            .attr('y1', (d, i) => {
                let r = getScreenCircleSize(sizeFunction(d)) / 2
                let y = -1 - 2 * r
                return y + lineOffsetY
            })
            .attr('xml:space', 'preserve')
            .attr('x2', labelsTranslateX)
            .attr('y2', (d, i) => {
                let r = getScreenCircleSize(sizeFunction(d)) / 2
                let y = -1 - 2 * r
                return y + lineOffsetY
            })

        // move the body down according to title size
        let titleHeight = svg
            .select('.dorling-size-legend-title')
            .nodes()
            .map((d) => d.getBBox().height)[0]
        let bodyHeight = svg
            .select('.dorling-size-legend-circles')
            .nodes()
            .map((d) => d.getBBox().height)[0]
        let bodyPadding = 15 //space between title and body
        let bodyOffsetX = maxCircleRadius
        let bodyOffsetY = bodyPadding + titleHeight + bodyHeight

        svg.select('.dorling-size-legend-circles').style(
            'transform',
            'translate(' + bodyOffsetX + 'px,' + bodyOffsetY + 'px)'
        )
    }

    const getScreenCircleSize = function (radius) {
        // in order to get the true screen size of circles on the map we must add them to the map, and get their size in pixels with getBoundingClientRect
        d3select.selectAll('#test-circle').remove()

        // add circle to DOM
        let testCircle = d3select
            .select('.dorling-svg')
            .append('circle')
            .attr('id', 'test-circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', 'none')

        // get its width
        let circleWidthPixels = testCircle.nodes().map((d) => d.getBoundingClientRect().width)[0]
        return circleWidthPixels
    }

    legend.values = function (_) {
        if (!arguments.length) return values
        values = _
        return legend
    }

    legend.title = function (_) {
        if (!arguments.length) return title
        title = _
        return legend
    }
    legend.maxWidth = function (_) {
        if (!arguments.length) return maxWidth
        maxWidth = _
        return legend
    }
    legend.sizeFunction = function (_) {
        if (!arguments.length) return sizeFunction
        sizeFunction = _
        return legend
    }
    legend.textFunction = function (_) {
        if (!arguments.length) return textFunction
        textFunction = _
        return legend
    }

    return legend
}
export default sizeLegend

// //ff positioning fix
// if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
//     // Do Firefox-related activities
//     out.sizeLegendContainer.style(
//         'transform',
//         'translate(0px,' + (out.sizeLegend_.translateY[out.nutsLevel_] + 2) + 'px)'
//     )
// } else {
//     out.sizeLegendContainer.style(
//         'transform',
//         'translate(0px,' + out.sizeLegend_.translateY[out.nutsLevel_] + 'px)'
//     )
// }
