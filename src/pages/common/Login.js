import React, { Component } from 'react'
import { message } from 'antd'
import { withRouter, Link } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '../../components/atomic/Button';
import logoTitle from '../../assets/FreshSpire-Brandmark_Combination-White.png';

@inject('userStore')
@observer
class Login extends Component {
	state = {
		username: null,
		password: null,
		signIn: false,
	}

	onUsernameChange = (e) => {
		e.target.value?
		this.setState({ username: e.target.value })
		:
		this.setState({ username: e.target.value })
	}

	onPasswordChange = (e) => {
		this.setState({ password: e.target.value })
	}

	onLogin = async () => {
		const { history } = this.props
		const { username, password } = this.state
		if (!username || username === '') {
			message.error('Email field is blank.');
			return;
		}
		if (!password || password === '') {
			message.error('Password field is blank.');
			return;
		}
		try {
			await this.props.userStore.login(username, password);
			history.push('/login')
			message.success('Welcome, you have logged in successfully.')
		}
		catch (e) {
			message.error(`${e}  Please try again.`);
		}
	}

	pressEnter = event => {
		if (event.key === 'Enter')
			this.onLogin();
	}


	render() {
		const { classes } = this.props; 
		return (
			<div className="login-container">
				<div className="login-wrapper">
					<div className="img-wrapper">
						<img src={logoTitle} alt="FreshSpire" className="img-format" />
					</div>
					<div className="credentials-wrapper">
						<div className="login-credentials">
								<InputLabel className="label">Email</InputLabel>
								<input
									className="input"
									placeholder="Email"
									onKeyPress={this.pressEnter}
									onChange={this.onUsernameChange}
								/>
						</div>
						<div className="login-credentials">
								<InputLabel className="label">Password</InputLabel>
								<input
									className="input"
									placeholder="Password"
									type="password"
									onKeyPress={this.pressEnter}
									onChange={this.onPasswordChange}
								/>
						</div>
						<div className="text-wrapper right"><Link to="/forgotpass">Forgot Password?</Link></div>
						<div className="button-container">
							<div className="btn-submit">
								<Button variant="outlined" onClick={this.onLogin}>Login</Button>
							</div>
						</div>
						<div className="text-wrapper center">Don't have an account? <a href={'http://www.getfreshspired.com/our-network'}>Sign up</a> for an access code!</div>
					</div>
				</div>
			</div>
		)
	}
}

export default withRouter(Login)
