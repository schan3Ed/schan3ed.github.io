import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'
import { userStore, ErrorStore } from '../stores';
import { withRouter } from 'react-router-dom'
import Button from './atomic/Button';
import { message } from 'antd';
import Badge from '@material-ui/core/Badge';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Close from '@material-ui/icons/Close';
import { LoadingSpinnerButton } from './LoadingSpinner';
import moment from 'moment';

const styles = theme => ({
    indicator: {
        backgroundColor: '#3dd28f',
        height: '5px',
    },
})

@inject('userStore','shoppingCartStore','notificationStore', 'errorStore')
@observer
class CommonTopBar extends Component {
    state = {
        anchorEl: null
    };

    componentDidMount(){
    }

    createTabs = (tabs) => {
        return tabs.map((tab) => {
            if (tab.child) {
                return [
                    <Tab key={`${tab['name']}-label`} label="&#62;" className="breadcrumb" disabled />,
                    <Tab key={tab['name']} label={tab.name} to={tab.path} component={Link} className="tab-item" />
                ]
            } else {
                return (<Tab key={tab['name']} label={tab.name} to={tab.path} component={Link} className="tab-item" />)
            }
        })
    }

    fromNowTimeStamp = (timestamp) => {
        const now = moment().format("YYYYMMDD HH:mm:ss");
        const stamp = moment(timestamp).format("YYYYMMDD HH:mm:ss");
        const timeDiffMinutes = moment(now,"YYYYMMDD HH:mm:ss").diff(moment(stamp,"YYYYMMDD HH:mm:ss"), 'minutes');
        if(timeDiffMinutes<=0){
            return 'just now';
        } else if (timeDiffMinutes<60){
            return `${timeDiffMinutes} minute(s) ago`;
        } else if (timeDiffMinutes<1439){
            return `${Math.floor(timeDiffMinutes/60)} hour(s) ago`;
        } else {
            return moment(stamp).format("MMM Do, H:mma");
        }
    }

    createMenuItems = (notificationList) => {
         return notificationList.map((item) => {
            return !item.read? (
                <Link key={`${item['id']}-menu-item`} to={item.link} >
                    <MenuItem onClick={this.handleClose} className="notification-container">
                        <div className="notification-item">
                            <Avatar className="avatar" alt={item.message} src={item.pictureURL? item.pictureURL:require('../assets/placeholder.png')} />
                            <div className="text-wrapper">
                                <div className="heading">
                                    <Typography variant="caption" className="subject">
                                        {item.subject}
                                    </Typography>
                                    <Typography variant="caption" className="time">
                                        {this.fromNowTimeStamp(item.timestamp)}
                                    </Typography>
                                </div>
                                <div variant="subheading" className="message">
                                    {item.message}
                                </div>
                            </div>
                            <ListItemIcon className="closeicon" onClick={ async (e) =>  {await this.markAsRead(item.id, e, notificationList)}}>
                                <Close />
                            </ListItemIcon>
                        </div>
                    </MenuItem>
                </Link>
            )
            :
            ''
        })
    }

    handleClick = list => (e) => {
        if(list.length>0) {
            this.setState({ anchorEl: e.currentTarget});
        }
    };
    
    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    markAsRead = async (notificationID, event, list) => {
        event.preventDefault();
        event.stopPropagation();
        await this.props.notificationStore.markAsRead(notificationID);
        if(list.length===0) {
            this.handleClose();
        }
    }

    clearAllNotifications = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            await this.props.notificationStore.clearNotifications()
            this.handleClose();
        }
        catch (e) {
            message.error(e);
            await this.props.errorStore.reportError(e, 'Error during NotificationStore#clearNotifications in CommonTopBar#clearAllNotifications');
        }
    }

    render() {
        const { title, sub, tabs, classes, tabIndex, isChildPath, userStore, topBarButton, shoppingCartStore, mobilft, notificationStore } = this.props;
        let parentPath = "/";
        let notificationList = notificationStore.notifications;
        if(tabs){
            parentPath = tabs[tabIndex].path;
            if (isChildPath) {
                parentPath = tabs[tabIndex - 1].path;
            }
        }
        const open = Boolean(this.state.anchorEl);
        return (
            <div className="topbar">
                <AppBar position="static" color="default" className="appbar">
                    <Toolbar className="text">
                        {
                            tabs ? (
                                <Link to={parentPath} className="back-arrow-link">
                                    <IconButton className={`back-arrow ${isChildPath ? 'return' : ''}`} color="inherit">
                                        <Icon>
                                            arrow_back
                                        </Icon>
                                    </IconButton>
                                </Link>
                            )
                            :
                            <div></div>
                        }
                        <Typography variant="title" color="inherit" className="main">
                            <div className="icon-wrapper">
                                <Icon 
                                    className="icon extra"
                                    onClick={this.handleClick(notificationList)}
                                >
                                    notifications
                                </Icon>
                                <Badge badgeContent={notificationList.length} color="secondary" className={`badge ${notificationList.length<1? 'hidden':''} extra`}></Badge>
                                <Menu
                                    anchorEl={this.state.anchorEl}
                                    open={open}
                                    onClose={this.handleClose}
                                    className="notification-menu"
                                    >
                                    <MenuItem onClick={this.handleClose} className="notification-container notificaiton-action">
                                        <Button variant="contained" color="secondary" className="clear-button" onClick={ async (e) =>  {await this.clearAllNotifications(e)}}>
                                            Clear All
                                        </Button>
                                    </MenuItem>
                                    {this.createMenuItems(notificationList)}
                                </Menu>
                                {
                                    userStore.isSeller ?
                                    ''
                                    :
                                     (
                                        <Link to='/shoppingcart' >
                                            <Icon className="icon">
                                                shopping_basket
                                            </Icon>
                                            <Badge badgeContent={shoppingCartStore.shoppingCart.length} color="secondary" className={`badge ${shoppingCartStore.shoppingCart.length<1? 'hidden':''}`}></Badge>
                                            <Typography className="total web-ft">
                                                ${shoppingCartStore.totalCost.toFixed(2)}
                                            </Typography>
                                        </Link>
                                     )
                                }
                            </div>
                            {title}
                        </Typography>
                        <Typography variant="caption" color="inherit" className="subtext">
                            {sub}
                        </Typography>
                        {
                            topBarButton?
                            (
                                <div className="button-wrapper">
                                    <Button variant="contained" color="secondary" className="button" to={topBarButton.path} component={Link}>
                                        {topBarButton.text} <Icon className="icon">{topBarButton.icon}</Icon>
                                    </Button>
                                </div>
                            )
                            :
                            ''
                        }
                    </Toolbar>
                    {
                        tabs ? (
                            <Tabs value={(isChildPath ? tabIndex + 1 : tabIndex)} onChange={this.handleChange} className={`tabs ${mobilft?'mobil-ft':''}`} classes={{ indicator: classes.indicator }}>
                                {this.createTabs(tabs)}
                            </Tabs>
                        )
                            :
                            <div className="tabs"></div>
                    }
                </AppBar>
            </div>
        )
    }
}

export default withStyles(styles)(CommonTopBar);
