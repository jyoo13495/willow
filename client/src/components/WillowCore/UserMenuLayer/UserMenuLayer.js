import * as d3 from 'd3';
import {getIcon} from '../Willow_helper_functions/getIcon';

let willowCoreProps;
let willowSVG;

let userMenuLayer;

const devTools = ['SAVE', 'ADD_NODE','ADD_LINK','DELETE', 'REVERT_TO_LAST_SAVE', 'getProjectData'];
const userTools = ['SAVE','ADD_NODE','ADD_LINK','DELETE', 'REVERT_TO_LAST_SAVE'];


export const createUserMenuLayer = (svg, props, devMode) => {
    d3.select('.userMenuLayer').remove();
    
    willowCoreProps = props;
    willowSVG = svg;

    userMenuLayer = willowSVG.append('g')
        .attr('class','userMenuLayer');
    
    (devMode) ? createButtons(devTools) : createButtons(userTools);

    renderProjectTitle();

    return userMenuLayer;
}

const renderProjectTitle = () => {
    userMenuLayer.append('text')
        .text(willowCoreProps.projectData.project.project_name)
        .attr('class','projectTitle')
        .attr('transform', 'translate(10, 50)')
        .style('font-size', 40)
        .style('fill', 'white')
        .style('font-weight', 'bold');
}

const createButtons = (buttons) => {
    d3.selectAll('.menuBar').remove();

    buttons.forEach( (item, i) => {
        const button = userMenuLayer.append('g')
            .attr('class', `${item}Button menuBar`)
            .attr('transform', `translate( ${willowCoreProps.width - 50} , ${10 + i * 50})`)
            .on('mouseover', () => {
                d3.select(`.${item}Button`)
                    .select('rect')
                    .attr('fill', '#f8d861');

                d3.select(`.${item}Button`)
                    .select('text')
                    .style('visibility', 'visible')
                    .attr('text-anchor', 'end')
                    .attr('transform', 'translate(-5, 25)');
            })
            .on('mouseout', () => {
                d3.select(`.${item}Button`)
                    .select('rect')
                    .attr('fill', 'white');

                d3.select(`.${item}Button`)
                    .select('text')
                    .attr('transform', 'translate(0, 15)')
                    .style('fill','black')
                    .style('visibility', 'hidden');
            })
            .on('click', () => {
                // this.reset();
                if (item === 'SAVE') willowCoreProps.saveProject(willowCoreProps.projectData);
                if (item === 'getProjectData') console.log('willowCoreProps: ', willowCoreProps)
                // if (item === 'ADD_NODE') addNodeFunction();
                // if (item === 'ADD_LINK') addLinkFunction();
                // if (item === 'DELETE') deleteFunction();
                // if (item === 'REVERT_TO_LAST_SAVE') revertFunction();
            });

        button
            .append('text')
            .text(item.split('_').join(' '))
            .attr('transform', 'translate(0, 15)')
            .style('fill','black')
            .style('font-size', 15)
            .style('visibility', 'hidden')

        button
            .append('rect')
            .attr('class', 'mainMenuButton')
            .attr('fill', 'white')
            .attr('height', 40)
            .attr('width', 40);

        button
            .append('path')
            .attr('d' , getIcon(item))
            .attr('transform', 'scale(0.10) translate(30, 30)');
    })
}

// const revertFunction = () => {
//     d3.select(`.REVERT_TO_LAST_SAVEButton`)
//         .select('rect')
//         .attr('fill', '#317669');
    
//     d3.select('.background')
//         .attr('fill', 'red')

//     setTimeout(() => {
//         d3.select('.background')
//             .transition()
//             .duration(1000)
//             .attr('fill', '#dadada');
//     }, 0);

//     projectLoad = false;
//     this.props.projectGetData(this.props.projectData.project.id);
// }

// const saveFunction = () => {
//     d3.select(`.SAVEButton`)
//         .select('rect')
//         .attr('fill', '#317669');

//     projectLoad = false;
//     this.d3Restart();
//     this.props.saveProject(this.props.projectData);
// }

// const addNodeFunction = () => {
//     d3State.addNodeButtonPressed = true;
//     d3.select('.ADD_NODEButton')
//         .select('rect')
//         .attr('fill', 'yellow');

//     d3.select('svg')
//         .append('text')
//         .attr('class', 'ADDNODEMODE')
//         .text(`ADD NODE MODE: Click location of New Node`)
//         .attr('transform', 'translate(10, 85)')
//         .style('font-size', 20)
//         .style('fill', 'black')
//         .style('font-style', 'italic');

//     setTimeout(() => d3.select('.background').on('click', () => {
//         this.openContextMenu();
//         setTimeout(() => {
//             d3.select('.background').on('click', this.closeContextMenu);
//             d3.select('.addNodeButton')
//                 .select('rect')
//                 .attr('fill', 'white');
//         }, 0);
//     }), 0)
// }

// const addLinkFunction = () => {
//     d3.select('.ADD_LINKButton')
//         .select('rect')
//         .attr('fill', 'red');

//     d3.select('svg')
//         .append('text')
//         .attr('class', 'LINKMODE2')
//         .text(`ADD LINK MODE: Select Source Node`)
//         .attr('transform', 'translate(10, 85)')
//         .style('font-size', 20)
//         .style('fill', 'black')
//         .style('font-style', 'italic');

//     d3State.newLinkMode2 = true;
// }

// const deleteFunction = () => {
//     d3.select('.DELETEButton')
//         .select('rect')
//         .attr('fill', 'red');

//     if (JSON.stringify(d3State.selectedNode) === JSON.stringify({})) {
//         d3State.deleteMode = true;
//         d3.select('svg')
//             .append('text')
//             .attr('class', 'DELETEMODE')
//             .text(`DELETE MODE: Select Node/Link To Delete`)
//             .attr('transform', 'translate(10, 85)')
//             .style('font-size', 20)
//             .style('fill', 'black')
//             .style('font-style', 'italic');

//     } else {
//         d3State.selectedNode.status = 'delete';
//         this.props.projectData.links.forEach(link => {
//             if (link.source_id === d3State.selectedNode.hash_id || link.target_id === d3State.selectedNode.hash_id) {
//                 link.status = 'delete';
//             }
//         });
//         this.reset();
//         this.d3Restart();
//     }   
// }