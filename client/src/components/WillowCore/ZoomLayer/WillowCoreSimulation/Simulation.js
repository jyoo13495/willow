import * as d3 from 'd3';
import {createNodes} from './Nodes';
import {createLinks} from './Links';

let willowCoreProps;

let willowSimulation;

export const createSimulation = (props) => {
    willowCoreProps = props;
    
    const nodesData = willowCoreProps.projectData.nodes;
    const linksData = willowCoreProps.projectData.links;

    willowSimulation = d3.forceSimulation().nodes(nodesData);
    const link_force = d3.forceLink(linksData).id(d => d.hash_id).strength(0);

    willowSimulation
        .force('links', link_force)
        .on('tick', ticked)

    const drag_handler = d3.drag()
        .on('start', d => drag_start(d, willowSimulation))
        .on('drag', d => drag_drag(d, willowSimulation))
        .on('end', d => drag_end(d, willowSimulation));
        
    createLinks(linksData);
    createNodes(nodesData);

    drag_handler(d3.select('.nodes').selectAll('.node'));

    return willowSimulation;
}

const ticked = () => {
    d3.select('.nodes').selectAll('.node').attr('transform', d => `translate(${d.x}, ${d.y})`);

    d3.selectAll('.links').selectAll('line')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
}

const drag_start = (d, simulation) => {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    if (d.status !== 'new') d.status = 'updated';

    d.fx = d.x;
    d.fy = d.y;
}

const drag_drag = (d, simulation) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

const drag_end = (d, simulation) => {
    if (!d3.event.active) simulation.alphaTarget(0);

    if (((d3.event.x | 0) % 30) < 15) d.x = (d3.event.x | 0) - ((d3.event.x | 0) % 30);
    if (((d3.event.x | 0) % 30) >= 15) d.x = (d3.event.x | 0) + (30 - ((d3.event.x | 0) % 30));

    if (((d3.event.y | 0) % 30) < 15) d.y = (d3.event.y | 0) - ((d3.event.y | 0) % 30);
    if (((d3.event.y | 0) % 30) >= 15) d.y = (d3.event.y | 0) + (30 - ((d3.event.y | 0) % 30));

    d.fx = null;
    d.fy = null;
}