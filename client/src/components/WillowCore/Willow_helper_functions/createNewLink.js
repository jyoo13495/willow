import {getLinkLabelID} from './getLinkLabelID';

export const createNewLink = (projectData, userStatus, sourceNode, targetNode) => {
    let hash_id = `${userStatus.google_id}-${projectData.project.id}-LINK-${Date.now()}`;
    let label_id;

    label_id = getLinkLabelID(sourceNode, targetNode);

    if (JSON.stringify(sourceNode) === JSON.stringify(targetNode)) {
        console.log('you cannot link a node to itself');
        return 'fail';
    }

    const newLinkObject = {
        hash_id: hash_id,
        project_id: projectData.project.id,
        id: hash_id,
        link_status: null,
        link_data: null,
        status: 'new',
        source_id: sourceNode.hash_id,
        source: sourceNode.hash_id,
        target_id: targetNode.hash_id,
        target: targetNode.hash_id,
        label_id: label_id,
    }



    return newLinkObject;
}