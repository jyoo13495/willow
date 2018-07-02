import * as d3 from 'd3';
import {willowState} from '../WillowState';
import {getX, getY} from './ZoomLayer';
import {getNodeIcon} from '../Willow_helper_functions/getNodeIcon';

let willowZoomLayer;

const contextMenuArray = ['EXPLORATIVE', 'START_ACTION', 'NEXT_ACTION', 'ONE_TIME_OBJECTIVE', 'RECURRING_OBJECTIVE'];

export const createContextMenu = (zoomLayer, props) => {
    d3.select('contextMenu').remove();
    willowZoomLayer = zoomLayer;

    const contextMenu = willowZoomLayer.append('g')
        .attr('class','contextMenu');

    contextMenuArray.forEach(item => {
        createContextMenuButton(contextMenu, item);
    })

    addContextMenuEventListeners(props);
}

const createContextMenuButton = (contextMenu, item) => {
    const button = contextMenu.append('g')
        .attr('class',`${item}_contextMenuButton contextMenuButton`)
        .on('mouseover', () => {
            d3.select(`.${item}_contextMenuButton`).select('circle')
                .attr('fill', 'red')
            })
        .on('mouseout', () => {
            d3.select(`.${item}_contextMenuButton`).select('circle')
                .attr('fill', 'white')
        })
        .on('click', () => {
            closeContextMenu();
        })
    
    button.append('circle')
        .attr('r', 0)
        .attr('fill', 'white')
    
    button.append('path')
        .attr('d', () => getNodeIcon(item))
        .attr('transform', 'scale(0.0) translate(-150.66, -150)');
    
    button.append('polygon')
        .attr('points', '166.7 153.3 210.94 153.3 210.94 166.7 166.7 166.7 166.7 210.94 153.3 210.94 153.3 166.7 109.06 166.7 109.06 153.3 153.3 153.3 153.3 109.06 166.7 109.06 166.7 153.3')
        .attr('fill', 'red')
        .attr('transform', ' scale(0.0) translate(-150.66, -150)');
}

export const openContextMenu = (props) => {
    willowState.contextMenuOpen = true;
    willowState.newNodeX = getX(props);
    willowState.newNodeY = getY(props);

    const contextMenu = d3.select('.contextMenu');

    contextMenu
        .attr('transform', `translate(${willowState.newNodeX},${willowState.newNodeY})`)
    
    contextMenuArray.forEach((item, i) => {
        let radius = 50;

        const button = d3.select(`.${item}_contextMenuButton`);

        button
            .transition()
            .duration(200)
            .attr('transform', `translate(${Math.cos((2 * Math.PI) * ((i+1)/5) + (Math.PI / 10)) * radius}, ${-Math.sin((2 * Math.PI) * ((i+1)/5) + (Math.PI / 10)) * radius})`)
            
        button.select('circle')
            .transition()
            .duration(200)
            .attr('r', 20);
        
        button.selectAll('path')
            .transition()
            .duration(200)
            .attr('transform', 'scale(0.08) translate(-150.66, -150)');
    })
}

export const closeContextMenu = () => {
    willowState.contextMenuOpen = false;
    willowState.newNodeX = 0;
    willowState.newNodeY = 0;

    contextMenuArray.forEach(item => {
        d3.select(`.${item}_contextMenuButton`)
            .transition()
            .duration(200)
            .attr('transform', 'translate(0, 0)');

        d3.select(`.${item}_contextMenuButton`)
            .select('circle')
            .attr('r', 0);

        d3.select(`.${item}_contextMenuButton`)
            .selectAll('path')
            .transition()
            .duration(200)
            .attr('transform', 'scale(0) translate(0, 0)');
    });
}

const addContextMenuEventListeners = (props) => {
    const svg = d3.select('svg');
    const backgroundLayer = d3.select('backgroundLayer')

    svg.on('contextmenu', () => {
        d3.event.preventDefault();
        (willowState.contextMenuOpen) ?
            closeContextMenu() :
            openContextMenu(props);
    })
}