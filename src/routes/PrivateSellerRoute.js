import React, { Component } from 'react'
import {
    Redirect,
    Route
  } from 'react-router-dom'
import { shoppingCartStore } from "../stores";
import {userStore} from '../stores'
import FirstTimeSurvey from '../pages/common/FirstTimeSurvey';

export default function PrivateSellerRoute({component: Component, ...rest}) {
    if(!userStore.isAuthenticated) { // Not authenticated -> Go to login
        return (
            <Route {...rest}
                render={(props) => (<Redirect to={{pathname: '/login', state: {from: props.location}}}/>)}
            />
        )
    } else if (userStore.isSeller) { // For an authenticated seller, check if they are initialized
        if (userStore.user.initialized) {
            if (Component === FirstTimeSurvey) { // Don't allow them to go back to first time survey if they are initialized
                return (
                    <Route {...rest}
                        render={(props) => (<Redirect to={{pathname: '/login', state: {from: props.location}}}/>)}
                    />
                )
            }
            else {
                return (
                    <Route {...rest}
                        render={(props) => (<Component {...props} />)}
                    />
                )
            }
        }
        else { // Not initialized, need to complete the first time survey
            if (Component !== FirstTimeSurvey) {
                return (
                    <Route {...rest}
                        render={(props) => (<Redirect to={{pathname: '/firsttimesurvey', state: {from: props.location}}}/>)}
                    />
                )
            }
            else {
                return (
                    <Route {...rest}
                        render={(props) => (<Component {...props} />)}
                    />
                )
            }
        }
    } else { // All other scenarios, redirect to login
        return (
            <Route {...rest}
                render={(props) => (<Redirect to={{pathname: '/login', state: {from: props.location}}}/>)}
            />
        )
    }
}
