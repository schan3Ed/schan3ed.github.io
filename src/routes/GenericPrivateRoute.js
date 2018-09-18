import React, { Component } from 'react'
import {
    Redirect,
    Route
  } from 'react-router-dom'
import {userStore} from '../stores'
import PrivateSellerRoute from './PrivateSellerRoute'
import PrivateBuyerRoute from './PrivateBuyerRoute'

export default function GenericPrivateRoute({component: Component, ...rest}) {
    if(!userStore.isAuthenticated) {
        return (
            <Route {...rest}
                render={(props) => (<Redirect to={{pathname: '/login', state: {from: props.location}}}/>)}
            />
        )
    } else if (userStore.isSeller) {
        return (<PrivateSellerRoute component={Component} {...rest} />)
        /*
            <Route {...rest}
                render={(props) => (<Component {...props} />)}
            />
            
        )
        */
    } else {
        return (<PrivateBuyerRoute component={Component} {...rest} />)
    }
}
