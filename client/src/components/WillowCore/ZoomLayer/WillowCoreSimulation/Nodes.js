import * as d3 from 'd3';

import {willowState} from '../../WillowState';

import {getNodeColor} from '../../Willow_helper_functions/getNodeColor';
import {getNodeIcon} from '../../Willow_helper_functions/getNodeIcon';
import {getIcon} from '../../Willow_helper_functions/getIcon';

let willowZoomLayer;

export const createNodesGroup = (zoomLayer) => {
    willowZoomLayer = zoomLayer;
    
    willowZoomLayer.append('g')
        .attr('class','nodes');
}

export const createNodes = (nodesData) => {
    const node = d3.select('.nodes').selectAll('g')
        .data(nodesData, (d) => d.hash_id)
        .enter().append('g')
        .attr('class', 'node');

    createNameTag(node);

    const nodeList = ['EXPLORATIVE','START_ACTION','NEXT_ACTION','ONE_TIME_OBJECTIVE','RECURRING_OBJECTIVE'];
    nodeList.forEach((item, i) => {
        const newNode = node.filter((d) => (d.label_id - 1) === i)
            .append('g')
            .attr('class', `${item}Node nodeFace`)
            .on('click', (d) => {
                (!willowState.nodeMenuOpen) ? 
                    openNodeMenu(d) :
                    closeNodeMenu(d);
            });

        newNode
            .append('circle')
            .attr('r', 29)
            .attr('class', 'face')
            .attr('fill', (d) => getNodeColor(d));

        newNode
            .append('path')
            .attr('d', getNodeIcon(item))
            .attr('transform', 'scale(0.10) translate(-160, -160)')
            .attr('fill', 'black');
    });

    d3.selectAll('.node')
        .filter(data => data.status === 'delete')
        .style('visibility' , 'hidden');
}

const createNameTag = (node) => {
    const nameTag = node.append('g').attr('class','nameTag')

    nameTag.append('rect')
        .attr('class', 'nameTag')
        .attr('y', -25)
        .attr('height', 50)
        .attr('width', 205)
        .attr('fill', 'black');


    nameTag.append('rect')
        .attr('class', 'nameTag')
        .attr('y', -20)
        .attr('height', 40)
        .attr('width', 200)
        .attr('fill', 'white');


    nameTag.append('text')
        .text((d) => d.node_description)
        .attr('class', 'nameTag')
        .attr('x', '0')
        .attr('y', '0')
        .style('text-anchor', 'start')
        .attr('transform', 'translate(30, 5)')
        .style('font-size', 13)
        .style('fill', 'black');

    // node.append('text')
    //     .text((d) => {
    //         if (d.node_description.length > 15) return d.node_description.slice(0, 15) + '...';
    //         return d.node_description;
    //     })
    //     .attr('x', '0')
    //     .attr('y', '0')
    //     .attr('transform', 'translate(0, -40)')
    //     .style('font-size', 13)
    //     .style('text-anchor', 'middle')
    //     .style('fill', 'black');

    
    nameTag
        .filter(d => d.label_id === 2)
        .style('visibility','hidden')

}

const createNodeMenu = (d) => {
    const clickedNode = d3.selectAll('.node').filter(data => data.hash_id === d.hash_id);
    const nodeMenuArray = ['DELETE','ADD_LINK','DISPLAY'];
        
    nodeMenuArray.forEach(item => {
        const nodeButton = clickedNode.append('g')
        .attr('class', `${item}NodeButton nodeMenu`)
        .attr('transform', 'translate(0, 0)')
        // .on('click', d => {
        //     if (item === 'DELETE') deleteFunction(d);
        //     if (item === 'ADD_LINK') addLinkFunction(d);
        //     if (item === 'DISPLAY') displayFunction();
        // });
    
        nodeButton
            .append('circle')
            .attr('class', 'nodeButton')
            .attr('r', 15)
            .attr('fill', 'white');

        nodeButton
            .append('path')
            .attr('class', 'nodeButton')
            .attr('d', getIcon(item))
            .attr('transform', 'scale(0.05) translate(-160, -150)');
    });

    clickedNode.append('g')
        .attr('class', 'test')
        .append('circle')
        .attr('r', 29)
        .attr('fill', (d) => getNodeColor(d))
        .on('click', (d) => {
            (!willowState.nodeMenuOpen) ? 
            openNodeMenu(d) :
            closeNodeMenu(d);
        })

    // clickedNode.select('test')
    //     .append('path')
    //     .attr('d', getNodeIcon(item))
    //     .attr('transform', 'scale(0.10) translate(-160, -160)')
    //     .attr('fill', 'black');

    // const deleteFunction = (d) => {
    //     d3.selectAll(`.DELETENodeButton`)
    //         .filter(data => data.hash_id === d.hash_id)
    //         .select('circle')
    //         .attr('fill', 'red');

    //     d3State.selectedNode.status = 'delete';

    //     this.props.projectData.links.forEach(link => {
    //         if (link.source_id === d3State.selectedNode.hash_id || link.target_id === d3State.selectedNode.hash_id) {
    //             link.status = 'delete';
    //         }
    //     });

    //     this.reset();
    //     this.d3Restart();
    // };

    // const addLinkFunction = (d) => {
    //     d3.selectAll('.ADD_LINKNodeButton')
    //         .filter(data => data.hash_id === d.hash_id)
    //         .select('circle')
    //         .attr('fill', 'red');

    //     d3.select('svg')
    //         .append('text')
    //         .attr('class', 'LINKMODE1')
    //         .text(`ADD LINK MODE: Select Target Node`)
    //         .attr('transform', 'translate(10, 85)')
    //         .style('font-size', 20)
    //         .style('fill', 'black')
    //         .style('font-style', 'italic');

        
    //     d3State.newLinkMode = true;
    // };

    // const displayFunction = d => {
    //     this.clickDisplayMenuMode(d);
    // };
}

const deleteNodeMenu = () => {
    d3.selectAll('.nodeMenu').remove();
    d3.select('.test').remove();
}

//--------------------------------------------------INTERACTIONS
const openNodeMenu = (d) => {
    const clickedNode = d3.selectAll('.node').filter((data) => data.hash_id === d.hash_id);

    createNodeMenu(d);

    willowState.nodeMenuOpen = true;
    willowState.selectedNode = d;

    let radius = 45;

    clickedNode
        .select('.DELETENodeButton')
        .transition()
        .duration(200)
        .attr('transform', `translate(${Math.cos(Math.PI / 2) * radius}, ${Math.sin(Math.PI / 2) * radius})`);

    clickedNode
        .select('.ADD_LINKNodeButton')
        .transition()
        .duration(200)
        .attr('transform', `translate(${Math.cos(- Math.PI / 6) * radius}, ${Math.sin(- Math.PI / 6) * radius})`);

    clickedNode.select('.DISPLAYNodeButton')
    .transition()
    .duration(200)
    .attr('transform', `translate(${Math.cos(- Math.PI * (5 / 6)) * radius}, ${Math.sin(- Math.PI * (5 / 6)) * radius})`)
    
    //Node Circle
    clickedNode
        .select('.face')
        .attr('fill', '#f8d861');
}

export const closeNodeMenu = (d) => {
    const clickedNode = d3.selectAll('.node').filter((data) => data.hash_id === d.hash_id);

    clickedNode.select('.face')
        .attr('fill', getNodeColor(d))

    d3.selectAll('.nodeMenu')
        .transition()
        .duration(100)
        .attr('transform' ,'translate(0,0)')
    
    setTimeout(() => deleteNodeMenu() , 100);

    willowState.nodeMenuOpen = false;
    willowState.selectedNode = {};
}