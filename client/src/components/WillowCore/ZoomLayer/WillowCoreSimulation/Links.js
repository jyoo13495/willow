import * as d3 from 'd3';

import {getLinkColor} from '../../Willow_helper_functions/getLinkColor';

let willowZoomLayer;

export const createLinksGroup = (zoomLayer) => {
    willowZoomLayer = zoomLayer;
    
    willowZoomLayer.append('g')
        .attr('class','links')
}


export const createLinks = (linksData) => {
    const link = d3.select('.links')
        .selectAll('line')
        .data(linksData, (d) => d.hash_id)
        .enter().append('line');


    link
        .attr('stroke-width', 4)
        // .style('stroke', 'white')
        .style('stroke', d => getLinkColor(d))
        .on('click', (d) => {
            // if (d3State.addNodeButtonPressed || d3State.newLinkMode || d3State.newLinkMode2) return this.reset();
            // if (JSON.stringify(d3State.selectedLink) !== JSON.stringify({})) return this.reset();
            // if (d3State.deleteMode) {
            // d.status = 'delete';
            // this.d3Restart();
            // return;
        // };

        link.filter(data => data.hash_id === d.hash_id)
        .style('stroke', 'yellow');

        // d3State.selectedLink = d;
    });

    link
        .filter(data => data.status === 'delete')
        .style('visibility', 'hidden');
}