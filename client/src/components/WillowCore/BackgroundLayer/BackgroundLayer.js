import * as d3 from 'd3';

let willowSVG;

let backgroundLayer;

export const createBackgroundLayer = (svg, color) => {
    willowSVG = svg

    backgroundLayer = willowSVG.append('g')
        .attr('class', 'backgroundLayer')

    backgroundLayer.append('rect')
        .attr('class', 'backgroundColor')
        .attr('width', '100%')
        .attr('height','100%')
        .attr('fill', color);

    return backgroundLayer;
}