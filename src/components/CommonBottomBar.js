import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Add from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom'

const styles = theme => ({
    root: {
        background: '#3dd28f',
        color: 'white'
    },
})

class CommonBottomBar extends Component {

    createButtons = (buttons) => {
        const{ classes } = this.props
        return buttons.map((item,index) => {
            if(!item.text) {
                return (<BottomNavigationAction
                    key={`${item.text}-bottom`}
                    label={item.text} 
                    className={index===0? 'invisible':'squish'}
                />)
            } else if(item.path){
                return (<BottomNavigationAction
                    key={`${item.text}-bottom`}
                    label={item.text} 
                    icon = {item.icon}
                    onClick ={() => item.onClick()}
                    classes={{ root: classes.root }}
                    component={Link} 
                    to={item.path} 
                />)
            } else {
                return (<BottomNavigationAction
                    key={`${item.text}-bottom`}
                    label={item.text} 
                    icon = {item.icon}
                    onClick ={() => item.onClick()}
                    classes={{ root: classes.root }}
                />)
            }
        })
    }

    render() {
        const { buttons, classes } = this.props;
        
        return (
            <div className="bottom-Appbar">
                <BottomNavigation
                    value={-1}
                    showLabels
                    classes={{ root: classes.root }}
                >
                    {this.createButtons(buttons)}
                </BottomNavigation>
          </div>
        )
    }
}

export default withStyles(styles)(CommonBottomBar);
