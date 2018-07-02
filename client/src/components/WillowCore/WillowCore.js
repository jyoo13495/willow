import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';

import {createBackgroundLayer} from './BackgroundLayer/BackgroundLayer';

import {createUserMenuLayer} from './UserMenuLayer/UserMenuLayer';

import {createZoomLayer, zoomSetup} from './ZoomLayer/ZoomLayer';
import {createContextMenu} from './ZoomLayer/ContextMenu';
import {createNodesGroup} from './ZoomLayer/WillowCoreSimulation/Nodes';
import {createLinksGroup} from './ZoomLayer/WillowCoreSimulation/Links';
import {createSimulation} from './ZoomLayer/WillowCoreSimulation/Simulation';

import {projectSave, projectGetData} from '../../actions/project';

const willowCoreSettings = {
    backgroundColor: 'grey',
    titleColor: 'black',
    devMode: true,
}

class WillowCore extends Component {
    componentDidMount() {
        this.svg = d3.select('svg');
        
        //BACKGROUND LAYER
        this.backgroundLayer = createBackgroundLayer(this.svg, willowCoreSettings.backgroundColor);
        
        //ZOOM LAYER
        this.zoomLayer = createZoomLayer(this.svg);
        createLinksGroup(this.zoomLayer);
        createNodesGroup(this.zoomLayer);
    }

    componentDidUpdate() {
        //ZOOM LAYER
        zoomSetup(this.props);
        createContextMenu(this.zoomLayer, this.props);
        createSimulation(this.props);

        //USER MENU LAYER
        createUserMenuLayer(this.svg, this.props, willowCoreSettings.devMode);
    }

    render() {
        return (
            <div id='chart'>
                <svg  data-name='Layer 1' 
                    xmlns='http://www.w3.org/2000/svg' 
                    id='willowCore' 
                    width={ this.props.width } 
                    height={ (this.props.height - 55) } 
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return { 
        projectData: state.projectData,
    };
};

const mapDispatchToProps = (dispatch) => {
    return { 
        saveProject: (projectData) => dispatch(projectSave(projectData)),
        projectGetData: (projectID) => dispatch(projectGetData(projectID))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(WillowCore);