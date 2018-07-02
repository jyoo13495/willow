import {closeContextMenu} from './ZoomLayer/ContextMenu';
import {closeNodeMenu} from './ZoomLayer/WillowCoreSimulation/Nodes';

export const willowState = {
    zoomState: false,
    contextMenuOpen: false,
    nodeMenuOpen: false,
    selectedNode: {},
    newNodeX: 0,
    newNodeY: 0,
}

export const resetState = () => {
    closeContextMenu();
    closeNodeMenu();

    willowState.contextMenuOpen = false;
    willowState.nodeMenuOpen = false;
    willowState.selectedNode = {};
    willowState.newNodeX = 0;
    willowState.newNodeY = 0;
}