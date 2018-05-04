import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Home from '../components/Home';
import Dashboard from '../components/Dashboard';
import Project from './Project';
import Login from './Login';

import styles from '../assets/sass/Main.module.scss';

const Main = ({ fakeAuth }) => {
	const PrivateRoute = ({ component: Component, ...rest }) => (
		<Route { ...rest } render={(info) =>
			fakeAuth.isAuthenticated
			? (<Component
					{ ...info }
					fakeAuth={ fakeAuth }
				/>)
			: (<Redirect to={{
					pathname: '/login',
					state: { from: info.location }
				}}/>)
			}
		/>
	);

	const MainRoute = ({ component: Component, ...rest }) => (
		<Route { ...rest } render={(info) =>
			<Component
				{ ...info }
				fakeAuth={ fakeAuth }
			/>}
		/>
	);

	return (
		<main className={ styles.grid }>
			<div className={ styles.row }>
				<Switch>
					<PrivateRoute path='/dashboard' component={ Dashboard } />
					<PrivateRoute path='/project' component={ Project } />
					<MainRoute exact path='/' component={ Home } />
					<MainRoute path='/login' component={ Login } />
				</Switch>
			</div>
		</main>
	);
};

export default Main;