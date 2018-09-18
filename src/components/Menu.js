import React, { Component, Fragment } from 'react'
import logoFab from '../assets/logo.png';
import logo from '../assets/FreshSpire-Brandmark_Combination-White.png';
import charlies_chicken from '../assets/leafy.jpg';
import bens_bagels from '../assets/glass.jpg';
import { userStore } from '../stores';
import Divider from '@material-ui/core/Divider';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
import { observer, inject } from 'mobx-react';
import { withRouter, Link, Redirect } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';

const sellerMenu = {
  Items: [
    {
      path: '/profile',
      icon: 'person',
      text: 'Profile'
    },
    {
      path: '/deals',
      icon: 'dns',
      text: 'Inventory'
    },
    {
      path: '/request',
      icon: 'send',
      text: 'Orders'
    },
    {
      path: '/history',
      icon: 'access_time',
      text: 'Invoice'
    },
  ]
};

const buyerMenu = {
  Items: [
    {
      path: '/profile',
      icon: 'person',
      text: 'Profile'
    },
    {
      path: '/shelf',
      icon: 'dns',
      text: 'View Produce'
    },
    {
      path: '/shoppingcart',
      icon: 'shopping_basket',
      text: 'My Basket'
    },
    {
      path: '/request',
      icon: 'send',
      text: 'Orders'
    },
    {
      path: '/history',
      icon: 'access_time',
      text: 'Invoice'
    },

  ]
};

@inject('userStore','profileStore')
@observer
class Menu extends Component {
  state = {
    isMenuOpen: false,
    location: '/',
  }


  componentDidMount() {
    const { user } = this.props.userStore;
    const { profileStore } = this.props;
    if (!user) {
      return;
    }
    this.setState({ location: this.props.location.pathname })
  }

  componentWillUnmount() {
    this.lockScroll(false);
  }

  onToggleMenu = (bool = !this.state.isMenuOpen) => {
    this.lockScroll(bool)
    this.setState({ isMenuOpen: !this.state.isMenuOpen});
  }

  lockScroll = (bool) => {
    if (document.body.clientWidth <= 549) {
      document.body.style.overflow = bool? 'hidden':'auto';
    }
  }

  handleCheckActive = (path) => this.props.location.pathname.includes(path) ? 'active' : '';

  async logout() {
    userStore.removeUser();
    await userStore.logout();
  }

  createSideBarMainMenuItems = () => {
    const userMenu = this.props.userStore.isSeller? sellerMenu : buyerMenu;

    return userMenu.Items.map((item) => (
      <Link key={item['text']} to={item.path}>
        <ListItem button className={`list-item ${this.handleCheckActive(item.path)}`}>
          <ListItemIcon className="list-icon">
            <Icon>{item.icon}</Icon>
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>{item.text}</Typography>}
            className="list-text"
          />
        </ListItem>
      </Link>
    ))
  }

  createMobileMenu = () => {
    const userMenu = this.props.userStore.isSeller? sellerMenu : buyerMenu;
    return userMenu.Items.map((item) => (
      <Link key={`${item.text}mobile`} to={item.path}>
        <li className={` menu-item ${this.state.isMenuOpen ? 'open' : ''}`}>
          {item.text}
        </li>
      </Link>
    ))
  }

  render() {
    const { user } = this.props.userStore;
    const { profileStore } = this.props;
    const { business } = this.props.profileStore;
    let profilePic = require('../assets/placeholder.png');
    let profileName = null;
    if(business){
      if(business.picture){
        profilePic = business.picture;
      }
      profileName = business.name;
    }
    return (
      <React.Fragment>
        <div className={`menu-bar ${this.state.isMenuOpen ? '' : 'close'}`}>
          <div className="topBar">
            <img src={logo} alt="logo" className="freshspire-logo" />
          </div>
          <div className="profile">
            <div className="picture-container">
              <img src={profilePic} alt="user picture" className="profile-picture" />
            </div>
            <div className="name">
              {profileName ? profileName : ''}
          </div>
          </div>
          <Divider />
          <List subheader={<ListSubheader component="div" className="list-item">Main</ListSubheader>} className="list-container">
            {this.createSideBarMainMenuItems()}
          </List>
          <List className="list-container bottom">
            <Link to="/help">
              <ListItem className="logout-link list-item">
                <ListItemIcon className="list-icon">
                  <Icon>headset_mic</Icon>
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>Help</Typography>}
                  className="list-text"
                />
              </ListItem>
            </Link>
            <Link to="/login" onClick={this.logout}>
              <ListItem className="logout-link list-item">
                <ListItemIcon className="list-icon">
                  <Icon>subdirectory_arrow_right</Icon>
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={<Typography type="body2" style={{ color: '#FFFFFF' }}>Logout</Typography>}
                  className="list-text"
                />
              </ListItem>
            </Link>
          </List>
        </div>
        <div className={`bar-toggle ${this.state.isMenuOpen ? '' : 'close'}`} onClick={this.onToggleMenu}>
          {this.state.isMenuOpen ? (<Icon>close</Icon>) : <Icon>menu</Icon>}
        </div>
        <div className="menu-fab">
          <div className={`fab-overlay ${this.state.isMenuOpen? 'open':''}`}></div>
          <div className={`top-logo ${this.state.isMenuOpen ? 'open' : ''}`}>
            <div className="fab-background"></div>
            <div onClick={() => this.onToggleMenu(false)} className="close-icon">
              <Icon className="icon">close</Icon>
            </div>
            <img src={logoFab} alt="logo" onClick={()=>this.onToggleMenu(!this.state.isMenuOpen)} className={`${this.state.isMenuOpen ? 'open' : ''}`} />
            <ul className={`dropdown-menu ${this.state.isMenuOpen ? 'open' : ''}`}>
              {this.createMobileMenu()}
              <Link to="/help">
                <li className={` menu-item ${this.state.isMenuOpen ? 'open' : ''}`}>
                  Help
                </li>
              </Link>
              <Link to="/login" onClick={this.logout}>
                <li className={` menu-item ${this.state.isMenuOpen ? 'open' : ''}`}>
                  Logout
                </li>
              </Link>
            </ul>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(Menu)
