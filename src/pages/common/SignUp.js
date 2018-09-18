// @flow
import React, { Component } from 'react';
import {
  Link,
  withRouter,
} from 'react-router-dom';
import { inject } from 'mobx-react'
import typeof {User, Name} from '../../core/core.js';
import { auth } from '../../core/firebase/firebase';
import DatabaseClient from '../../core/DatabaseClient'
import { message } from 'antd'
import { RegionDropDown } from 'react-c'

import logoTitle from '../../assets/FreshSpire-Brandmark_Combination-Green.png';
import AuthManager from '../../core/AuthManager';
import { UserStore } from '../../stores';

const INITIAL_STATE = {
	firstName: '',
	lastName:'',
	email: '',
	password: '',
	passwordRepeat: '',
	error: null,
	accessCode: '',
};
// TODO: Implement this form like we have done all others using validate.js

const byPropKey = (propertyName, value) => () => ({
	[propertyName]: value,
  });


@inject('userStore')
class SignUpForm extends Component {
	constructor(props) {
		super(props);
		this.state = {...INITIAL_STATE};
	}

	onSubmit = async (event) => {
		/*
		const {
			firstName,
			lastName,
			email,
			password,
		} = this.state;
		const { history } = this.props;
		
		try {
			await this.props.userStore.signUp(firstName, lastName, email, password);
			history.push('/deals');
			message.success('Welcome, you have logged in successfully.');
		}
		catch(e) {
			// TODO: implement validate.js and provide a meaning message here
			message.error(e.message);
		}
		*/
	}

	validate = () => {
		// TODO: Implement this
	}

	render() {
		const {
			firstName,
			lastName,
			email,
			password,
			passwordRepeat,
			error,
		} = this.state;

		const isInvalid = 
			password !== passwordRepeat ||
			password === ''
			email === ''
			firstName === ''
			lastName === '';
		
		return (
			<form onSubmit={this.onSubmit}>
			<div className="SignUp-container">
				<div className="sign-up-wrapper">
					<img src={logoTitle} alt="FreshSpire" className="img-format-sign"/>
					<div className="SignUp-context">
						<label> First Name
						<input
							value={firstName}
							onChange={event => this.setState(byPropKey('firstName', event.target.value))}
							type="text"
							placeholder="First Name"
						/>
						</label>
					</div>
					<div className="SignUp-context">
						<label> Last Name
						<input
							value={lastName}
							onChange={event => this.setState(byPropKey('lastName', event.target.value))}
							type="text"
							placeholder="Last Name"
						/>
						</label>
					</div>

					<div className="SignUp-context">
						<label> Email Address
						<input
							value={email}
							onChange={event => this.setState(byPropKey('email', event.target.value))}
							type="text"
							placeholder="Email Address"
						/>
						</label>
					</div>

					<div className="SignUp-context">
						<label> Password
						<input
							value={password}
							onChange={event => this.setState(byPropKey('password', event.target.value))}
							type="password"
							placeholder="Password"
						/>
						</label>
					</div>

					<div className="SignUp-context">
						<label> Confirm Password
						<input
							value={passwordRepeat}
							onChange={event => this.setState(byPropKey('passwordRepeat', event.target.value))}
							type="password"
							placeholder="Confirm password"
						/>
						</label>
					</div>


					<div className="btn-submit-sign ">
						<button>Sign Up</button>
						<Link to="/login">
							<a className="link-back-to-login">Back to Login</a>
						</Link>
					</div>
				</div>
			</div>
			</form>
		)
	}	
}
export default withRouter(SignUpForm);