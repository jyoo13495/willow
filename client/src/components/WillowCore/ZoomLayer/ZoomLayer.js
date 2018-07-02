import * as d3 from 'd3';
import {willowState} from '../WillowState';

let willowSVG;
let zoomLayer;

//TODOS:

export const createZoomLayer = (svg) => {
    willowSVG = svg;

    zoomLayer = willowSVG.append('g').attr('class','zoomLayer');

    return zoomLayer;
};

const zoom_actions = () => {
    willowState.zoomState = true;
    zoomLayer.attr('transform', d3.event.transform);
}

const createZoomHandler = (props) => {
    return d3.zoom().scaleExtent([0.25, 2.25]).on('zoom', () => {
        props.projectData.project.zoomx = d3.event.transform.x;
        props.projectData.project.zoomy = d3.event.transform.y;
        props.projectData.project.zoomscale = d3.event.transform.k;

        zoom_actions(zoomLayer);
    })
}

export const zoomSetup = (props) => {
    const zoomHandler = createZoomHandler(props);
    const transform = d3.zoomIdentity.translate(props.projectData.project.zoomx, props.projectData.project.zoomy).scale(props.projectData.project.zoomscale);

    willowSVG
        .call(zoomHandler)
        .call(zoomHandler.transform, transform)

    willowSVG.on("dblclick.zoom", null);
}

export const getX = (props) => {
    if (willowState.zoomState) return (d3.event.offsetX - props.projectData.project.zoomx) / props.projectData.project.zoomscale;
    return (d3.event.clientX - props.projectData.project.zoomx) / props.projectData.project.zoomscale;
}

export const getY = (props) => {
    if (willowState.zoomState) return (d3.event.offsetY - props.projectData.project.zoomy) / props.projectData.project.zoomscale;
    return (d3.event.clientY - props.projectData.project.zoomy) / props.projectData.project.zoomscale;
}