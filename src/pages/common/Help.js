import React, { Component } from 'react'
import EditableLabel from 'react-inline-editing'
import { observer, inject } from 'mobx-react'
import Menu from '../../components/Menu'
import logo from '../../assets/logo.png'
import pencil from '../../assets/Edit-Profile-Pencil-Green.png'
import {LoadingSpinnerPage} from '../../components/LoadingSpinner'
import Topbar from '../../components/CommonTopBar'
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';
import { Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import moment from 'moment';
import { FoodOptions } from '../../core/core';
import { withRouter } from 'react-router-dom';
import { message } from 'antd';

class Help extends Component {

	createInfoCard = (sub,text) => (
		<Grid item className="grid-item">
			<Paper className="info-container">
				<div className="subheading">
					<Typography component="h2" variant="subheading">
						{sub}
					</Typography>
				</div>
				<div className="info">
					<Typography component="p" variant="subheading">
						{text}
					</Typography>
				</div>
			</Paper>
		</Grid>
	)

	render() {
		const tabs = [
			{
				name: 'Help',
				child: false,
				path: '/help'
			},
		];
		return (
			<React.Fragment>
				<Menu />
				<Topbar title="Help" sub="Reach out for support" tabs={tabs} tabIndex={0} isChildPath={false} />
				<div className="help-container">
					<div className="help-wrapper">
					<Grid direction="column">
						<Typography component="h1" variant="title" className="heading" >
							Support
						</Typography>
						<Typography component="h3" variant="subtitle" className="body" >
							We're here at all times to help you! <br/>
							Contact us through any of the methods below.
						</Typography>
						{this.createInfoCard("Phone",['(910) 502-3961'])}
						{this.createInfoCard("Email",["help@getfreshspired.com"])}
					</Grid>
					</div>
				</div>
			</React.Fragment>
		)
	}
}

export default withRouter(Help)