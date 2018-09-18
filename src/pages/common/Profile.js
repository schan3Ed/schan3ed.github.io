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

@inject('profileStore','userStore', 'errorStore')
class Profile extends Component {
	state = {
		isLoadingProfile: true,
		businessInfo: null,
		profileUID: null
	  }
	
	async componentDidMount() {
		const { profileStore, location, userStore } = this.props
		try {
			let profileUID = this.getProfileUID(location.pathname);
			if(!profileUID){
				profileUID = userStore.user.uid;
			}
			let businessInfo = await profileStore.getBusiness(profileUID);
			this.setState({
				isLoadingProfile: false,
				businessInfo,
				profileUID
			})
			window.scroll(0, 0);
		}
		catch (e) {
			message.error(e);
			await this.props.errorStore.reportError(e, 'Error during ProfileStore#getBusiness in Profile#componentDidMount');
		}
		
	}

	formatPhoneNumber = (s) => {
		var s2 = (""+s).replace(/\D/g, '');
		var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
		return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
	}

	createFoodOptionLabels = (array) => {
		return array.map(item => (
			<Chip key={item} className="chip" label={item} />
		))
	}

	getProfileUID(url) {
		return url.substring(url.lastIndexOf("profile")+8);
	}

	render() {
		let title = '', sub = '', tabs = null, hasEmail = false, hasPhone = false, phonePrefer = '';
		const { isLoadingProfile, businessInfo, profileUID } = this.state;
		if(profileUID && (profileUID !== this.props.userStore.user.uid)){
			title = 'Profile';
			sub = 'View their profile';
		} else if (profileUID && (profileUID === this.props.userStore.user.uid)) {
			title = "Profile";
			sub = "View your information"
			tabs = [
				{
					name: 'Profile',
					child: false,
					path: '/profile'
				},
			];
		}
		if(businessInfo){
			let options = businessInfo.communicationOptions;
			hasEmail = options.includes("Email");
			hasPhone = (options.includes("Text") || options.includes("Call"));
			phonePrefer;
			if(hasPhone){
				if (options.includes("Text") && !options.includes("Call")){
					phonePrefer = " (Text Only)";
				} else if (!options.includes("Text") && options.includes("Call")){
					phonePrefer = " (Call Only)";
				} else {
					phonePrefer = "";
				}
			}
		}
		return (
			<React.Fragment>
				<Menu />
				<Topbar title={title} sub={sub} tabs={tabs} tabIndex={0} isChildPath={false} />
				<div className="Profile-container">
					<div className="profile-backdrop"></div>
					{
						isLoadingProfile ? 
						<LoadingSpinnerPage />
						:
						(
							<div className="profile-wrapper">
								<div className="top-container">
									<div className="avatar">
										<img
											src={businessInfo.picture? businessInfo.picture:require('../../assets/placeholder.png')}
											alt="profilePhoto"
											style={{ backgroundColor: '#fff' }}
										/>
									</div>
									<div className="text-container">
										<Typography variant="headline" className="business-name">{businessInfo.name}</Typography>
									</div>
								</div>
								<div className="info-wrapper">
									<div container='true' className="side">
										<div className="contact">
											<div className="contact-header">
												<Icon className="icon">person</Icon>
												<Typography variant="headline">Contact</Typography>
											</div>
											<div className="contact-body">
												{
													hasPhone?
													<div className="contact-item">
														<div className="phone-wrapper">
															<Icon className="icon">call</Icon>
															{phonePrefer}
														</div>
														<Typography variant="subheading" className="contact-text">{this.formatPhoneNumber(businessInfo.phone)}</Typography>
													</div>
													:
													''
												}
												{
													hasEmail?
													<div className="contact-item">
														<Icon className="icon">email</Icon>
														<Typography variant="subheading" className="contact-text">{businessInfo.email}</Typography>
													</div>
													:
													''

												}
												<div className="contact-item">
													<Icon className="icon">location_on</Icon>
													<Typography variant="subheading" className="contact-text">{`${businessInfo.streetAddress}, ${businessInfo.city} ${businessInfo.state} ${businessInfo.zipcode}`}</Typography>
												</div>
												<div className="contact-item">
													<Icon className="icon">access_time</Icon>
													<Typography variant="subheading" className="contact-text">{`${moment(businessInfo.opening+'','hh:mm').format('hh:mm A')} - ${moment(businessInfo.closing+'','hh:mm').format('hh:mm A')}`}</Typography>
												</div>
											</div>
										</div>
									</div>
									<div className="main">
										<div className="delivery">
											<div className="delivery-header">
												<Icon className="icon">local_shipping</Icon>
												<Typography variant="headline">Food Options</Typography>
											</div>
											<Grid container={true} className="food-chips">
												{this.createFoodOptionLabels(businessInfo.foodOptions)}
											</Grid>
										</div>
										<div className="description">
											<div className="description-header">
												<Icon className="icon">message</Icon>
												<Typography variant="headline">Description</Typography>
											</div>
											<Typography variant="subheading">
												{businessInfo.description}
											</Typography>
										</div>
									</div>
								</div>
							</div>
						)
					}
				</div>
			</React.Fragment>
		)
	}
}

export default withRouter(Profile)