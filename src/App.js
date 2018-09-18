import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import {
  HashRouter as Router,
  Redirect,
  Route,
  BrowserRouter
} from 'react-router-dom'
import { auth } from './core/firebase/firebase'
import DatabaseClient from './core/DatabaseClient'
import Login from './pages/common/Login'
import ViewDeals from './pages/sellers/ViewDeals';
import AddDeals from './pages/sellers/AddDeals';
import History from './pages/common/History';
import ForgotPass from './pages/common/ForgotPass';
import SignUp from './pages/common/SignUp';
import EditDeal from './pages/sellers/EditDeal';
import ShoppingCart from './pages/buyers/ShoppingCart';
import ViewShelf from './pages/buyers/ViewShelf';
import FirstTimeSurvey from './pages/common/FirstTimeSurvey';
import Profile from './pages/common/Profile';
import Help from './pages/common/Help';
import ViewOrders from './pages/common/ViewOrders';
import PrivateBuyerRoute from './routes/PrivateBuyerRoute'
import PrivateSellerRoute from './routes/PrivateSellerRoute'
import GenericPrivateRoute from './routes/GenericPrivateRoute'
import { MaterialUITheme as theme} from './core/MaterialUITheme';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { message } from 'antd';
import ErrorBoundary from './components/ErrorBoundary'

@inject('userStore', 'errorStore')
@observer
class App extends Component {
  componentWillMount() {
    this.props.userStore.initUser();
    // TODO: move to AuthManager
    auth.onAuthStateChanged(async (FirebaseUser) => {
      if (FirebaseUser) {
        let user = await DatabaseClient.getUser(FirebaseUser.uid);
        this.props.userStore.setUser(user);
      } else {
        this.props.userStore.removeUser();
      }
    });
    //NotificationClient.initializeNotifications();
  }
  render() {
    return (
      <ErrorBoundary>
        <MuiThemeProvider theme={theme}>
          <BrowserRouter>
            <div className="container">
              <Route exact path={'/'}
                render={() => {
                  //default go to homepage
                  return <Redirect to={'/login'} />
                }}
                />

              {/* Why is this here?
                  When you add to home screen on Android/iOS, it adds "freshspire.io/index.html" as the link.
                  Regularly calling freshspire.io/ is enough to load index.html, which in turns loads bundle.js
                  and the app. However, when directly entering freshspire.io/index.html in a browser, the browser automatically
                  loads the regular index.html and thus the app, and then the routing takes over and treats 'index.html'
                  as a route.  The route below serves as a workaround. */}
              <Route exact path={'/index.html'}
                render={() => {
                  return <Redirect to={'/'} />
                }}
              />

                
              {/***** AUTH ****/}
              <Route exact    path={'/login'}
                render={() => {
                  if (this.props.userStore.isBuyer) {
                    return (<Redirect to={'/shelf'} />)
                  }
                  if (this.props.userStore.isSeller) {
                    return (<Redirect to={'/deals'} />)
                  }
                  return (<Login/>)
                }}/>
              <Route exact    path={'/forgotpass'}        component={ForgotPass}/>
              
              {/***** COMMON ****/}
              <GenericPrivateRoute exact    path={'/profile'}           component={Profile} />
              <GenericPrivateRoute exact    path={'/profile/:uid'}      component={Profile} />
              <GenericPrivateRoute exact    path={'/help'}      component={Help} />
              
              
              {/***** ORDERS ****/}
              <GenericPrivateRoute exact    path={'/(request|active|completed)'}           component={ViewOrders} />
              <GenericPrivateRoute exact    path={'/history'}          component={History}/>

              {/***** DEALS ****/}
              <PrivateSellerRoute exact    path={'/deals'}             component={ViewDeals}/>
              <PrivateSellerRoute exact    path={'/deals/adddeal'}     component={AddDeals}/>
              <PrivateSellerRoute exact    path={'/deals/editdeal'}    component={EditDeal} />


              {/**** OTHERS *****/}
              <GenericPrivateRoute exact   path={'/firsttimesurvey'}   component={FirstTimeSurvey} />

              {/***** SHELF ****/}
              <PrivateBuyerRoute exact    path={'/shoppingcart'}      component={ShoppingCart}/>
              <PrivateBuyerRoute exact    path={'/shelf'}             component={ViewShelf} />


            </div>
          </BrowserRouter>
        </MuiThemeProvider>
      </ErrorBoundary>
    )
  }
}

export default App;