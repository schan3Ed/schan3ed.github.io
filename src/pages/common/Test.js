// @flow
import React, { Component } from 'react'
import { message } from 'antd'
import { withRouter, Link } from 'react-router-dom'
import { observer, inject } from 'mobx-react'

import type {User, Business, Distributor } from '../types/core'
import { auth, database } from '../firebase/firebase'
import AuthManager from '../AuthManager'
import logoTitle from '../assets/FreshSpire-Brandmark_Combination-Green.png';

type Props = {};

@inject('userStore')
@observer
class Test extends Component<Props, Distributor> {



  onUsernameChange = (e) => {
    
  }

  onPasswordChange = (e) => {
    
  }

  onLogin = () => {
    AuthManager.login('testaccount@gmail.com', 'testaccount')
    .then( () => {
      alert('hey')
      var currentUser = {
        name: AuthManager.getUID()
      };
      let tmp: User = {
        email: "lmao",
        name: {
            first: "Please",
            last: "Work",
        },
    }
    database.ref('/users/' + currentUser.name).set(tmp);
    })
   .catch( error => {
   })
   /*
    AuthManager.login("testaccount@gmail.com", "testaccount").then({
        
        let tmp: User = {
            email: "lmao",
            name: {
                first: "Please",
                last: "Work",
            },
        }
        database.ref('/users/' + auth.currentUser.uid).set(tmp);
    })
    */
  }
  
  render() {
    return (
      <div className="login-container">
      	<div className="login-wrapper">
					<img src={logoTitle} alt="FreshSpire" className="img-format"/>
					<div className="login-credentials">
						<label>Username
							<input 
								type="text"
								onChange={this.onUsernameChange}
							/>
						</label>
					</div>
					<div className="login-credentials">
						<label>Password
							<input
								type="password"
								onChange={this.onPasswordChange}
							/>
						</label>
					</div>
					<div className="btn-submit">
						<button
							onClick={this.onLogin}
						>Login</button>
					</div>
					<div className="btn-submit">
						<Link to={'/signup'}><button>Sign Up</button></Link>
					</div>
					<Link to="/forgotpass">
						<span className="link-forgot">Forgot Password?</span>
					</Link>
				</div>
      </div>
    )
  }
}

export default withRouter(Test)
