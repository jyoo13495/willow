import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';

import v4 from 'uuid/v4';
import { modalClose, modalOpen } from '../actions/modal';
import { resetNodeTitle } from '../actions/projects';
import { closeBookmark, saveBookmark, resetBookmarks } from '../actions/bookmarks';
import { closeNoteView, addNote, resetNotes } from '../actions/notes';
import { populateMilestone, resetMilestones } from '../actions/milestone';
import { projectSave, projectGetData } from '../actions/project';

import Modals from '../containers/Modal_NEW/Modals';
import ExplorativeNode from '../containers/ExplorativeNode';
import Milestones from '../containers/Milestones/MilestoneColumn';

import {getNodeColor} from './Willow_helper_functions/getNodeColor';
import {getNodeIcon} from './Willow_helper_functions/getNodeIcon';
import {getIcon} from './Willow_helper_functions/getIcon';
import {getLinkColor} from './Willow_helper_functions/getLinkColor';
import {createNewNode} from './Willow_helper_functions/createNewNode';
import {createNewLink} from './Willow_helper_functions/createNewLink';

let d3State = {
    selectedNode: {},
    selectedLink: {},
    menuOpen: false,
    deleteMode: false,
    newLinkMode: false,
    newLinkMode2: false,
    contextMenuOpen: false,
    addNodeButtonPressed: false,
    newNodeX: 0,
    newNodeY: 0,
};

let zoomState = false;

let projectLoad = false;

class WillowCore extends Component {
    componentDidMount() {

        projectLoad = false;
        this.reset = this.reset.bind(this);
        this.placeNewNode = this.placeNewNode.bind(this);
        this.closeContextMenu = this.closeContextMenu.bind(this);
        this.reset = this.reset.bind(this);
        this.d3Setup();
    }
    componentDidUpdate() {
        // console.log('updated: ',this.props.projectData);
        this.d3Restart();
    }

    onOpen = (obj) => {
        this.props.modalOpen(obj);
    };

    onClose = (obj) => {
        this.props.modalClose(obj);
    };

//--------------------------------------------------------------------------------- SETUP SETTINGS
    addNewNode(newObject) {
        newObject.x = d3State.newNodeX
        newObject.y = d3State.newNodeY

        this.simulation.stop();
        this.props.projectData.nodes.push(newObject);
        this.d3Restart();
    }

    getX() {
        if (zoomState) return (d3.event.offsetX - this.props.projectData.project.zoomx) / this.props.projectData.project.zoomscale;
        return (d3.event.clientX - this.props.projectData.project.zoomx) / this.props.projectData.project.zoomscale;
    }

    getY() {
        if (zoomState) return (d3.event.offsetY - this.props.projectData.project.zoomy) / this.props.projectData.project.zoomscale;
        return (d3.event.clientY - this.props.projectData.project.zoomy) / this.props.projectData.project.zoomscale;
    }

//--------------------------------------------------- D3 SETUP
    d3Setup() {
        const svg = d3.select('#willowCore');
        
        //Background Color
        const backgroundColor = svg.append('rect')
            .attr('class','background')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'white');

        const zoomLayer = this.zoomSetup();

        zoomLayer.append('g')
          .attr('class', 'links')
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.6);

        zoomLayer.append('g')
          .attr('class', 'nodes');

        this.setupContextMenu(zoomLayer);

        svg.on('contextmenu', () => {
            d3.event.preventDefault();
            d3State.contextMenuOpen ? this.closeContextMenu() : this.openContextMenu();
        });

        svg.on('mousemove', () => {
            let x = (d3.event.offsetX - this.props.projectData.project.zoomx) / this.props.projectData.project.zoomscale;
            let y = (d3.event.offsetY - this.props.projectData.project.zoomy) / this.props.projectData.project.zoomscale;

            if (!d3State.contextMenuOpen) d3.select('.newNodeRightClickMenu').attr('transform', ` translate(${x},${y})`);
        });

        backgroundColor.on('click', () => {
            this.reset();
        });
    }

    setupContextMenu(zoomLayer) {
        const contextMenu = zoomLayer.append('g').attr('class', 'newNodeRightClickMenu');
        const contextMenuArray = ['EXPLORATIVE', 'START_ACTION', 'NEXT_ACTION', 'ONE_TIME_OBJECTIVE', 'RECURRING_OBJECTIVE'];
        contextMenuArray.forEach( item => this.setupContextMenuButton(contextMenu, item));
    }

    setupContextMenuButton(contextMenu, type) {
        const newButton = contextMenu.append('g')
            .attr('class', `new${type}NodeButton`)
            .on('mouseover', () => {
                d3.select(`.new${type}NodeButton`)
                    .select('circle')
                    .attr('fill', 'red');
                
                d3.select('.ADDNODEMODE').remove();
                
                d3.select('svg')
                    .append('text')
                    .attr('class', 'ADDNODEMODE')
                    .text(`ADD NODE MODE: Select Node Type - Add ${type.split('_').join(' ')} Node`)
                    .attr('transform', 'translate(10, 85)')
                    .style('font-size', 20)
                    .style('fill', 'black')
                    .style('font-style', 'italic');
            })
            .on('click', () => {
                this.closeContextMenu();
                let newObject = createNewNode(type, this.props.projectData, this.props.userStatus);
                this.addNewNode(newObject);
            });
        
        newButton
            .append('circle')
                .attr('r', 0)
                .attr('fill', 'white');

        newButton
            .append('path')
                .attr('d', () => getNodeIcon(type))
                .attr('transform', ' scale(0.0) translate(-150.66, -150)');

        newButton
            .append('polygon')
            .attr('points', '166.7 153.3 210.94 153.3 210.94 166.7 166.7 166.7 166.7 210.94 153.3 210.94 153.3 166.7 109.06 166.7 109.06 153.3 153.3 153.3 153.3 109.06 166.7 109.06 166.7 153.3')
            .attr('fill', 'red')
            .attr('transform', ' scale(0.0) translate(-150.66, -150)');
    }

    openContextMenu() {
        d3State.newNodeX = this.getX();
        d3State.newNodeY = this.getY();

        d3.select('.ADDNODEMODE').remove();

        d3.select('svg')
            .append('text')
            .attr('class', 'ADDNODEMODE')
            .text(`ADD NODE MODE: Select Node Type -`)
            .attr('transform', 'translate(10, 85)')
            .style('font-size', 20)
            .style('fill', 'black')
            .style('font-style', 'italic');

        d3State.contextMenuOpen = true;

        const contextMenuArray = ['EXPLORATIVE', 'START_ACTION', 'NEXT_ACTION', 'ONE_TIME_OBJECTIVE', 'RECURRING_OBJECTIVE'];

        contextMenuArray.forEach((item, i) => {
            let radius = 50;

            d3.select(`.new${item}NodeButton`)
                .transition()
                .duration(200)
                .attr('transform', `translate(${Math.cos((2 * Math.PI) * ((i+1)/5) + (Math.PI / 10)) * radius}, ${-Math.sin((2 * Math.PI) * ((i+1)/5) + (Math.PI / 10)) * radius})`);
            
            d3.select(`.new${item}NodeButton`).select('circle')
                .transition()
                .duration(200)
                .attr('r', 20);
            
            d3.select(`.new${item}NodeButton`).selectAll('path')
                .transition()
                .duration(200)
                .attr('transform', ' scale(0.08) translate(-150.66, -150)');
        })
    }

    closeContextMenu() {
        d3State.contextMenuOpen = false;
        d3.select('.background').on('click', this.reset)
        d3.select('.ADDNODEMODE').remove();

        const contextMenuArray = ['EXPLORATIVE', 'START_ACTION', 'NEXT_ACTION', 'ONE_TIME_OBJECTIVE', 'RECURRING_OBJECTIVE'];

        contextMenuArray.forEach(item => {
            d3.select(`.new${item}NodeButton`)
                .transition()
                .duration(200)
                .attr('transform', 'translate(0, 0)');

            d3.select(`.new${item}NodeButton`)
                .select('circle')
                .attr('r', 0);

            d3.select(`.new${item}NodeButton`)
                .selectAll('path')
                .transition()
                .duration(200)
                .attr('transform', 'scale(0) translate(0, 0)');
        });
    }
    
//--------------------------------------------------- TICKED
    ticked() {
        d3.select('.nodes').selectAll('.node').attr('transform', d => `translate(${d.x}, ${d.y})`);

        d3.selectAll('.links').selectAll('line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
    }
    
//--------------------------------------------------- ZOOM SETUP
    zoomSetup() {
        const svg = d3.select('svg')
        const zoomLayer = svg.append('g')
          .attr('class', 'zoomLayer');

        return zoomLayer;
    }

    zoom_actions(zoomLayer) {
        zoomState = true;
        zoomLayer.attr('transform', d3.event.transform);
    }

//--------------------------------------------------- D3 RESTART
    d3Restart() {
        if (!projectLoad) {
            d3.select('svg')
                .append('g')
                .attr('class', 'saveScreen')
                .append('rect')
                .attr('fill', 'black')
                .attr('width', '100%')
                .attr('height', '100%');

            d3.select('.saveScreen')
                .append('text')
                .text('PROJECT IS LOADING')
                .attr('transform', `translate(${this.props.width / 2}, 250)`)
                .attr('text-anchor', 'middle')
                .style('fill','white')
                .style('font-size', 50);
            
            setTimeout(() => {
                projectLoad = true;
                this.d3Restart();
            }, 1000);
            return;
        }
        this.clearScreen();

        const svg = d3.select('svg');
        const zoomLayer = d3.select('.zoomLayer');
        const zoom_handler = d3.zoom().scaleExtent([0.25, 2.25]).on('zoom', () => {
            this.props.projectData.project.zoomx = d3.event.transform.x;
            this.props.projectData.project.zoomy = d3.event.transform.y;
            this.props.projectData.project.zoomscale = d3.event.transform.k;

            zoomLayer.attr('transform', d3.event.transform);

            this.zoom_actions(zoomLayer);
        });

        const transform = d3.zoomIdentity.translate(this.props.projectData.project.zoomx, this.props.projectData.project.zoomy).scale(this.props.projectData.project.zoomscale);

        svg
            .call(zoom_handler)
            .call(zoom_handler.transform, transform);

        svg.on("dblclick.zoom", null);

        const nodesData = this.props.projectData.nodes;
        const linksData = this.props.projectData.links;

        this.simulation = d3.forceSimulation().nodes(nodesData)
        const link_force = d3.forceLink(linksData).id((d) => d.hash_id).strength(0);
        
        this.simulation
            .force('links', link_force)
            .on('tick', this.ticked);
        
        this.createNodes(nodesData);
        this.createLinks(linksData);

        this.showProjectTitle();
        this.createMainMenu();

        var drag_handler = d3.drag()
                .on('start', (d) => this.drag_start(d, this.simulation))
                .on('drag', (d) => this.drag_drag(d, this.simulation))
                .on('end', (d) => this.drag_end(d, this.simulation));	
       
        drag_handler( d3.select('.nodes').selectAll('.node'));
    }

//--------------------------------------------------- CREATE MAIN MENU
    createMainMenu() {
        const svg = d3.select('svg')

        const mainMenuArray = ['SAVE','ADD_NODE','ADD_LINK','DELETE', 'REVERT_TO_LAST_SAVE'];

        mainMenuArray.forEach((item, i) => {

            const button = svg.append('g')
                .attr('class', `${item}Button menuBar`)
                .attr('transform', `translate( ${this.props.width - 50} , ${10 + i * 50})`)
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
                    this.reset();
                    if (item === 'SAVE') saveFunction();
                    if (item === 'ADD_NODE') addNodeFunction();
                    if (item === 'ADD_LINK') addLinkFunction();
                    if (item === 'DELETE') deleteFunction();
                    if (item === 'REVERT_TO_LAST_SAVE') revertFunction();
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

        const revertFunction = () => {
            d3.select(`.REVERT_TO_LAST_SAVEButton`)
                .select('rect')
                .attr('fill', '#317669');
            
            d3.select('.background')
                .attr('fill', 'red')

            setTimeout(() => {
                d3.select('.background')
                    .transition()
                    .duration(1000)
                    .attr('fill', '#dadada');
            }, 0);

            projectLoad = false;
            this.props.projectGetData(this.props.projectData.project.id);
        }

        const saveFunction = () => {
            d3.select(`.SAVEButton`)
                .select('rect')
                .attr('fill', '#317669');

            projectLoad = false;
            this.d3Restart();
            this.props.saveProject(this.props.projectData);
        }

        const addNodeFunction = () => {
            d3State.addNodeButtonPressed = true;
            d3.select('.ADD_NODEButton')
                .select('rect')
                .attr('fill', 'yellow');

            d3.select('svg')
                .append('text')
                .attr('class', 'ADDNODEMODE')
                .text(`ADD NODE MODE: Click location of New Node`)
                .attr('transform', 'translate(10, 85)')
                .style('font-size', 20)
                .style('fill', 'black')
                .style('font-style', 'italic');

            setTimeout(() => d3.select('.background').on('click', () => {
                this.openContextMenu();
                setTimeout(() => {
                    d3.select('.background').on('click', this.closeContextMenu);
                    d3.select('.addNodeButton')
                        .select('rect')
                        .attr('fill', 'white');
                }, 0);
            }), 0)
        }

        const addLinkFunction = () => {
            d3.select('.ADD_LINKButton')
                .select('rect')
                .attr('fill', 'red');

            d3.select('svg')
                .append('text')
                .attr('class', 'LINKMODE2')
                .text(`ADD LINK MODE: Select Source Node`)
                .attr('transform', 'translate(10, 85)')
                .style('font-size', 20)
                .style('fill', 'black')
                .style('font-style', 'italic');

            d3State.newLinkMode2 = true;
        }

        const deleteFunction = () => {
            d3.select('.DELETEButton')
                .select('rect')
                .attr('fill', 'red');

            if (JSON.stringify(d3State.selectedNode) === JSON.stringify({})) {
                d3State.deleteMode = true;
                d3.select('svg')
                    .append('text')
                    .attr('class', 'DELETEMODE')
                    .text(`DELETE MODE: Select Node/Link To Delete`)
                    .attr('transform', 'translate(10, 85)')
                    .style('font-size', 20)
                    .style('fill', 'black')
                    .style('font-style', 'italic');

            } else {
                d3State.selectedNode.status = 'delete';
                this.props.projectData.links.forEach(link => {
                    if (link.source_id === d3State.selectedNode.hash_id || link.target_id === d3State.selectedNode.hash_id) {
                        link.status = 'delete';
                    }
                });
                this.reset();
                this.d3Restart();
            }   
        }
    }
    
//--------------------------------------------------- SHOW PROJECT TITLE
    showProjectTitle() {
        const svg = d3.select('svg');

        svg.append('text')
            .text(this.props.projectData.project.project_name)
            .attr('transform', 'translate(10, 50)')
            .style('font-size', 40)
            .style('fill', 'black')
            .style('font-weight', 'bold');
    }
    
//--------------------------------------------------- CLEAR SCREEN
    clearScreen() {
        this.reset();

        d3.selectAll('.saveScreen').remove();
        d3.selectAll('.menuBar').remove();
        d3.selectAll('line').remove();
        d3.selectAll('.node').remove();
    }

//--------------------------------------------------- CREATE LINKS
    createLinks(linksData) {
        const link = d3.select('.links')
                        .selectAll('line')
                        .data(linksData, (d) => d.hash_id)
                        .enter().append('line');


        link
            .attr('stroke-width', 4)
            .style('stroke', d => getLinkColor(d))
            .on('click', (d) => {
                if (d3State.addNodeButtonPressed || d3State.newLinkMode || d3State.newLinkMode2) return this.reset();
                if (JSON.stringify(d3State.selectedLink) !== JSON.stringify({})) return this.reset();
                if (d3State.deleteMode) {
                    d.status = 'delete';
                    this.d3Restart();
                    return;
                };

                link.filter(data => data.hash_id === d.hash_id)
                    .style('stroke', 'yellow');
                
                d3State.selectedLink = d;
            });

        link.filter(data => data.status === 'delete')
            .style('visibility', 'hidden');
    }

//--------------------------------------------------- CREATE NODES
    createNodes(nodesData) {
        const node = d3.select('.nodes').selectAll('g')
                        .data(nodesData, (d) => d.hash_id)
                        .enter().append('g')
                        .attr('class', 'node');

        const titleBox = node.append('g').attr('class','titlebox')

        titleBox.append('rect')
        .attr('class', 'nodetitle')
        .attr('y', -25)
        .attr('height', 50)
        .attr('width', 205)
        .attr('fill', 'black');
                

        titleBox.append('rect')
        .attr('class', 'nodetitle')
        .attr('y', -20)
        .attr('height', 40)
        .attr('width', 200)
        .attr('fill', 'white');


        titleBox.append('text')
            .text((d) => d.node_description)
            .attr('class', 'nodetitle')
            .attr('x', '0')
            .attr('y', '0')
            .style('text-anchor', 'start')
            .attr('transform', 'translate(30, 5)')
            .style('font-size', 13)
            .style('fill', 'black');

        this.createNodeMenu(node);

        const nodeList = ['EXPLORATIVE','START_ACTION','NEXT_ACTION','ONE_TIME_OBJECTIVE','RECURRING_OBJECTIVE'];
        nodeList.forEach((item, i) => {
            const newNode = node.filter((d) => (d.label_id - 1) === i)
                                .append('g')
                                .attr('class', `${item}Node`)
                                .on('click', (d) => {
                                    if (d3State.addNodeButtonPressed) return this.reset();
                                    if (d3State.contextMenuOpen) return this.reset();
                                    this.clickOpenNodeMenu(d)
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


        d3.selectAll('.titlebox').filter(d => d.label_id === 2).style('visibility','hidden')

        d3.selectAll('.node')
            .filter(data => data.status === 'delete')
            .style('visibility' , 'hidden');
    }

//--------------------------------------------------- CREATE NODE MENU
    createNodeMenu(node) {
        const nodeMenuArray = ['DELETE','ADD_LINK','DISPLAY'];

        nodeMenuArray.forEach(item => {
            const nodeButton = node.append('g')
            .attr('class', `${item}NodeButton menu`)
            .attr('transform', 'translate(0, 0)')
            .on('click', d => {
                if (item === 'DELETE') deleteFunction(d);
                if (item === 'ADD_LINK') addLinkFunction(d);
                if (item === 'DISPLAY') displayFunction();
            });
        
            nodeButton
                .append('circle')
                .attr('r', 15)
                .attr('fill', 'white');

            nodeButton
                .append('path')
                .attr('d', getIcon(item))
                .attr('transform', 'scale(0.05) translate(-160, -150)');            
        });

        const deleteFunction = (d) => {
            d3.selectAll(`.DELETENodeButton`)
                .filter(data => data.hash_id === d.hash_id)
                .select('circle')
                .attr('fill', 'red');

            d3State.selectedNode.status = 'delete';

            this.props.projectData.links.forEach(link => {
                if (link.source_id === d3State.selectedNode.hash_id || link.target_id === d3State.selectedNode.hash_id) {
                    link.status = 'delete';
                }
            });

            this.reset();
            this.d3Restart();
        };

        const addLinkFunction = (d) => {
            d3.selectAll('.ADD_LINKNodeButton')
                .filter(data => data.hash_id === d.hash_id)
                .select('circle')
                .attr('fill', 'red');

            d3.select('svg')
                .append('text')
                .attr('class', 'LINKMODE1')
                .text(`ADD LINK MODE: Select Target Node`)
                .attr('transform', 'translate(10, 85)')
                .style('font-size', 20)
                .style('fill', 'black')
                .style('font-style', 'italic');

            
            d3State.newLinkMode = true;
        };

        const displayFunction = d => {
            this.clickDisplayMenuMode(d);
        };
    }

//--------------------------------------------------- PLACE NEW NODE
    placeNewNode(dataObject) {
        let x = this.getX();
        let y = this.getY();

        d3.select('svg').on('click', null);

        let grid = 100;

        if (((x | 0) % grid) < grid / 2) dataObject.x = (x | 0) - ((x | 0) % grid);
        if (((x | 0) % grid) >= grid / 2) dataObject.x = (x | 0) + (grid - ((x | 0) % grid));

        if (((y | 0) % grid) < grid / 2) dataObject.y = (y | 0) - ((y | 0) % grid);
        if (((y | 0) % grid) >= grid / 2) dataObject.y = (y | 0) + (grid - ((y | 0) % grid));

        dataObject.status = 'new';

        this.simulation.stop();
        this.props.projectData.nodes.push(dataObject);
        this.d3Restart();
    }

//--------------------------------------------------- RESET
    reset() {

        this.closeContextMenu();

        d3State = {
            selectedNode: {},
            selectedLink: {},
            menuOpen: false,
            deleteMode: false,
            newLinkMode: false,
            newLinkMode2: false,
            contextMenuOpen: false,
            addNodeButtonPressed: false,
            newNodeX: 0,
            newNodeY: 0,
        };

        d3.select('.background').on('click', this.reset);

        d3.select('.DELETEMODE').remove();

        d3.select('.ADDNODEMODE').remove();

        d3.selectAll('.LINKMODE1').remove();

        d3.selectAll('.LINKMODE2').remove();

        d3.select('.deleteLinkButton')
            .transition()
            .duration(500)
            .attr('transform', 'translate(500, 640)');

        d3.selectAll('.face')
            .attr('fill', (d) => getNodeColor(d));

        d3.selectAll('.mainMenuButton')
            .attr('fill', 'white');

        d3.selectAll('.menu').selectAll('circle')
            .attr('fill', 'white');

        d3.selectAll('.links').selectAll('line')
            .style('stroke', d => getLinkColor(d));

        d3.selectAll('.menu')
            .transition()
            .duration(250)
            .attr('width', 0)
            .attr('height', 0)
            .attr('transform', `translate(0, 0)`);

        d3.selectAll('.menuLabel')
            .transition()
            .duration(250)
            .attr('x', `0`)
            .attr('y', `0`)
            .style('font-size', '0')
            .style('visibility', 'hidden');
    }

    //--------------------------------------------------------------------------------- MENU SETTINGS
    //--------------------------------------------------- CLICK OPEN NODE MENU*
    clickOpenNodeMenu(d) {
        if (d3State.newLinkMode) {
            d3.select('.LINKMODE1').remove();

            const newLinkObject = createNewLink(this.props.projectData, this.props.userStatus, d3State.selectedNode, d);

            if (newLinkObject === 'fail') {
                d3.select('svg')
                    .append('text')
                    .attr('class', 'LINKFAIL')
                    .text(`NODE CANNOT LINK ITSELF`)
                    .attr('transform', 'translate(10, 85)')
                    .style('font-size', 20)
                    .style('fill', 'white');
                
                setTimeout(() => {
                    d3.select('.LINKFAIL')
                        .remove();
                }, 1000);

                this.reset();
                return;
            }

            this.simulation.stop();
            this.props.projectData.links.push(newLinkObject);
            this.d3Restart();
            return;

        } else if (d3State.newLinkMode2) {

            d3State.selectedNode = d;

            d3.selectAll('.face')
                .filter(data => data.hash_id === d.hash_id)
                .attr('fill', 'green');

            d3.select('.LINKMODE2').remove();

            d3.select('svg')
                .append('text')
                .attr('class', 'LINKMODE1')
                .text(`ADD LINK MODE: Select Target Node`)
                .attr('transform', 'translate(10, 85)')
                .style('font-size', 20)
                .style('fill', 'black')
                .style('font-style', 'italic');


            d3State.newLinkMode2 = false;
            d3State.newLinkMode = true;

        } else if (d3State.deleteMode) {
            
            d.status = 'delete';

            this.props.projectData.links.forEach(link => {
                if (link.source_id === d.hash_id || link.target_id === d.hash_id) {
                    link.status = 'delete';
                }
            })
            this.d3Restart();

        } else if (d3State.menuOpen) {
            this.reset();

        } else {
            const clickedNode = d3.selectAll('.node').filter((data) => data.hash_id === d.hash_id);

            d3State.menuOpen = true;
            d3State.selectedNode = d;
        
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
    }

    //--------------------------------------------------- DISPLAY MENU BUTTON
    clickDisplayMenuMode(d) {
        const selectedNode = d3State.selectedNode;
        let content;
        let modalType;

        const closeNode = () => {
            this.reset();
            if (selectedNode.label_id === 1) {
                selectedNode.node_data = {
                    bookmarks: this.props.bookmarkListAdd,
                    notes: this.props.notes
                };
                selectedNode.node_description = this.props.setNodeTitle;

                this.props.closeBookmark();
                this.props.closeNoteView();
                projectLoad = false;
                this.props.saveProject(this.props.projectData);
                this.props.resetBookmarks();
                this.props.resetNotes();
                this.props.resetNodeTitle();

            } else {
                selectedNode.node_data = { milestones: this.props.milestones };
                selectedNode.node_description = this.props.setNodeTitle;

                projectLoad = false;
                this.props.saveProject(this.props.projectData);
                this.props.resetMilestones();
                this.props.resetNodeTitle();
            }
        }

        if (selectedNode.label_id === 1) {
            content = <ExplorativeNode nodeTitle={ selectedNode.node_description } />;
            modalType = '';
            if (!!selectedNode.node_data) {
                selectedNode.node_data.bookmarks.forEach((bm) => this.props.saveBookmark(bm));
                selectedNode.node_data.notes.forEach((nt) => this.props.addNote(nt));
            }
        } else {
            content = <Milestones column="L" nodeTitle={ selectedNode.node_description } />;
            modalType = 'CreateProject';
            if (!!selectedNode.node_data) {
                selectedNode.node_data.milestones.forEach((ms) => this.props.populateMilestone(ms));
            }
        }

        this.onOpen({
            id: v4(),
            onClose: () => closeNode(),
            content,
            modalType
        });
    }

    //--------------------------------------------------- DRAG NODE
    drag_start(d, simulation) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        if (d.status !== 'new') d.status = 'updated';

        d.fx = d.x;
        d.fy = d.y;
    }
    
    //make sure you can't drag the circle outside the box
    drag_drag(d, simulation) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    drag_end(d, simulation) {
        if (!d3.event.active) simulation.alphaTarget(0);

        if (((d3.event.x | 0) % 30) < 15) d.x = (d3.event.x | 0) - ((d3.event.x | 0) % 30);
        if (((d3.event.x | 0) % 30) >= 15) d.x = (d3.event.x | 0) + (30 - ((d3.event.x | 0) % 30));

        if (((d3.event.y | 0) % 30) < 15) d.y = (d3.event.y | 0) - ((d3.event.y | 0) % 30);
        if (((d3.event.y | 0) % 30) >= 15) d.y = (d3.event.y | 0) + (30 - ((d3.event.y | 0) % 30));

        d.fx = null;
        d.fy = null;
    }

    //--------------------------------------------------- RENDER
    render() {
        return (
            <div id='chart'>
                <svg  data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' id='willowCore' width={ this.props.width } height={ (this.props.height - 55) } />
                <Modals />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return { 
        projectData: state.projectData,
        userStatus: state.userStatus,
        modals: state.isModalOpen.modals,
        bookmarkListAdd: state.bookmarkListAdd,
        notes: state.notes,
        milestones: state.milestones,
        setNodeTitle: state.setNodeTitle,
    };
};

const mapDispatchToProps = (dispatch) => {
    return { 
        saveProject: (projectData) => dispatch(projectSave(projectData)),
        projectGetData: (projectID) => dispatch(projectGetData(projectID)),
        modalClose: (obj) => dispatch(modalClose(obj)),
        modalOpen: (obj) => dispatch(modalOpen(obj)),
        closeBookmark: () => dispatch(closeBookmark()),
        closeNoteView: () => dispatch(closeNoteView()),
        saveBookmark: (data) => dispatch(saveBookmark(data)),
        addNote: (data) => dispatch(addNote(data)),
        resetBookmarks: () => dispatch(resetBookmarks()),
        resetNotes: () => dispatch(resetNotes()),
        populateMilestone: (data) => dispatch(populateMilestone(data)),
        resetMilestones: () => dispatch(resetMilestones()),
        resetNodeTitle: () => dispatch(resetNodeTitle()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(WillowCore);