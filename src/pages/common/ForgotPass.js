
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { message } from 'antd'
import logoTitle from '../../assets/FreshSpire-Brandmark_Combination-White.png';
import AuthManager from '../../core/AuthManager';
import { LoadingSpinnerButton } from '../../components/LoadingSpinner';
import Button from '../../components/atomic/Button';
import { InputLabel } from '@material-ui/core';

export default class ForgotPass extends Component {
  state = {
		email: null
	}
	
	onSubmit = async () => {
		if (this.state.email === null || this.state.email === '') {
			message.error('Please enter a valid email.');
			return;
		}
		try {
			await AuthManager.sendPasswordResetEmail(this.state.email);
			message.success('An email containing a link to reset your password has been sent to you!')
		}
		catch (e) {
			message.error(`${e}  Please try again.`)
		}
	}

	onEmailChange = (e) => {
		this.setState({ email: e.target.value })
	}

	pressEnter = event => {
		if (event.key === 'Enter')
			this.onSubmit();
	}

	render() {
		const { classes } = this.props; 
		return (
			<div className="forgot-container">
				<div className="forgot-wrapper">
					<div className="img-wrapper">
						<img src={logoTitle} alt="FreshSpire" className="img-format" />
					</div>
					<div className="forgot-instructions">
							Type in your email address and a password reset link will be sent to you.
					</div>
					<div className="credentials-wrapper">
						<div className="forgot-credentials">
								<InputLabel className="label">Email</InputLabel>
								<input
									className="input"
									placeholder="Email"
									onKeyPress={this.pressEnter}
									onChange={this.onEmailChange}
								/>
						</div>
						<div className="button-container">
							<div className="btn-submit">
								<Button variant="outlined" onClick={this.onSubmit}>
									Submit
								</Button>
							</div>
						</div>
						<div className="text-wrapper center">
							<Link to="/login">
								Back to Login
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	}
}