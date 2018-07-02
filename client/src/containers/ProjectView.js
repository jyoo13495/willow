import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import styles from '../assets/sass/Dashboard.module.scss';

import { projectGetData, resetRedirects } from '../actions/project';

import WillowCore from '../components/WillowCore/WillowCore';
import Modals from './Modal_NEW/Modals';

class ProjectView extends Component {

	render() {
		// redirect if a new project was created
		if (this.props.shouldRedirect) {
			
			// make sure data is available as we redirect to the project
			let projectID = this.props.shouldRedirectTo;
			this.props.projectGetData(projectID);

			// reset redirects in store to ensure user can navigate back to dashboard
			this.props.resetRedirects();

			return (
				<Redirect to={{ pathname:`/project/${this.props.shouldRedirectTo}`}}/>
			);
		} else {
			return (
				<Fragment>
					<div className={ styles.filler }>
						<WillowCore height={ this.props.screenSize.screenHeight } width={ this.props.screenSize.screenWidth } />
						<Modals />
					</div>
				</Fragment>
			);
		}
	}
}

const mapStateToProps = (state) => ({
	projectData: state.projectData,
	userStatus: state.userStatus,
	screenSize: state.uiReducer,
	shouldRedirect: state.shouldRedirect,
	shouldRedirectTo: state.shouldRedirectTo,
});

const mapDispatchToProps = (dispatch) => ({
	projectGetData: (projectID) => dispatch(projectGetData(projectID)),
	resetRedirects: () => dispatch(resetRedirects()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);
