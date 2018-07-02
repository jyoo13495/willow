import axios from 'axios';

import {
    PROJECT_HAS_ERRORED,
    PROJECT_IS_LOADING,
    PROJECT_SUCCESS,
    CLEAR_PROJECT_DATA,
    RESET_REDIRECTS,
    DELETE_PROJECT_FROM_STATE
} from './types';

export const projectHasErrored = (bool) => ({ type: PROJECT_HAS_ERRORED, projectHasErrored: bool });
export const projectIsLoading = (bool) => ({ type: PROJECT_IS_LOADING, projectIsLoading: bool });
export const projectSuccess = (projectData) => ({ type: PROJECT_SUCCESS, projectData: projectData });
export const clearProjectData = (projectData) => ({ type: CLEAR_PROJECT_DATA, projectData: projectData });

export const testingClearProjectData = (projectData) => {
    return (dispatch) => {
        dispatch(clearProjectData( { nodes:[], links:[] } ));
    };
};

export const projectGetData = (projectID) => { 
    return (dispatch) => {
        dispatch(projectIsLoading(true));
        axios.get('/api/projectData', { params: { projectID }})
            .then(response => {
                dispatch(projectIsLoading(false));
                let projectData = response.data;
                return projectData;
            })
            .then(projectData => dispatch(projectSuccess(projectData)))
            .catch(() => dispatch(projectHasErrored(true)));
    };
};

export const projectSave = (projectData) => {
    let projectID = projectData.project.id;
    let copyObject = Object.assign({}, projectData);
    return (dispatch) => {
        axios.post('/api/updateProject', { project: { nodes: copyObject.nodes, links: copyObject.links ,project: copyObject.project}})
            // .then(response => {
            //     dispatch(projectGetData(projectID));
            // });
    };
};

export const resetRedirects = () => ({
    type: RESET_REDIRECTS,
    payload: null,
});

export const deleteProject = (projectID, idx) => {
    return (dispatch) => {
        axios
            .post('/api/deleteProject', { projectID })
            .then(response => {
                dispatch(deleteProjectFromState(idx));
            })
            .catch(() => dispatch(projectHasErrored(true)));
    };
};

export const deleteProjectFromState = (projectID) => ({
    type: DELETE_PROJECT_FROM_STATE,
    payload: projectID,
});