import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import Popup from 'reactjs-popup'
import { SearchIconIcon } from '../components/Icons'
import Menu from '../components/Menu'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from './atomic/Button';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import {AlertMessage} from './AlertMessage';
import Input from '@material-ui/core/Input';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Bottombar from '../components/CommonBottomBar';
import { shoppingStore, inventoryStore } from '../stores';
import { message } from 'antd';
import ShoppingBasket from '@material-ui/icons/ShoppingBasket';
import Chip from '@material-ui/core/Chip';
import moment from 'moment'

function formatPhoneNumber(s) {
    var s2 = (""+s).replace(/\D/g, '');
    var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
}

export const ModalContactContent = (props) => {
    let options = props.contactInfo.communicationOptions;
    let hasEmail = options.includes("Email");
    let hasPhone = (options.includes("Text") || options.includes("Call"));
    let phonePrefer;
    if(hasPhone){
        if (options.includes("Text") && !options.includes("Call")){
            phonePrefer = " (Text Only)";
        } else if (!options.includes("Text") && options.includes("Call")){
            phonePrefer = " (Call Only)";
        } else {
            phonePrefer = "";
        }
    }
    return (
        <React.Fragment>
            {
                hasPhone?
                <div className="reason-info">
                    <Typography variant="subheading" className="label md">
                        {`Phone${phonePrefer}:`}
                    </Typography>
                    <Typography variant="subheading" className="value sm">
                        {formatPhoneNumber(props.contactInfo.phone)}
                    </Typography>
                </div>
                :
                ''
            }
            {
                hasEmail?
                <div className="reason-info">
                    <Typography variant="subheading" className="label md">
                        Email:
                    </Typography>
                    <Typography variant="subheading" className="value sm">
                        {props.contactInfo.email}
                    </Typography>
                </div>
                :
                ''
            }
            <div className="reason-info">
                <Typography variant="subheading" className="label md">
                    Address:
                </Typography>
                <Typography variant="subheading" className="value sm">
                    {`${props.contactInfo.streetAddress}, ${props.contactInfo.city} ${props.contactInfo.state} ${props.contactInfo.zipcode}`}
                </Typography>
            </div>
            <div className="bottom">
                <Typography variant="subheading" className="label md">
                    Description:
                </Typography>
                {
                    props.contactInfo.description ?
                        (
                            <Typography variant="subheading" className="note-body sm">
                                {props.contactInfo.description}
                            </Typography>
                        )
                        :
                        (<div className="empty"></div>)
                }
            </div>
        </React.Fragment>
    )
}


export const ModalMarketContent = (props) => {
    return (
        <React.Fragment>
            <Grid container spacing={0} justify="space-between" className="top-info-modal">
                <Grid className="grid-item">
                    <Typography variant="subheading" className="label md">
                        Price:
            </Typography>
                    <Typography variant="subheading" className="value sm">
                        ${parseFloat(props.dealInfo.price).toFixed(2)}/{props.dealInfo.priceUnit}
                    </Typography>
                </Grid>
                <Grid className="grid-item">
                    <Typography variant="subheading" className="label md">
                        Qty Available:
            </Typography>
                    <Typography variant="subheading" className="value sm">
                        {props.dealInfo.quantity} {props.dealInfo.quantityUnit}(s)
            </Typography>
                </Grid>
                <Grid className="grid-item">
                    <Typography variant="subheading" className="label md">
                        Use by:
                    </Typography>
                    <Typography variant="subheading" className="value sm">
                        {moment(props.dealInfo.useByDate).format('MM-DD-YYYY')}
                    </Typography>
                </Grid>
            </Grid>
            <div className="details">
                <Typography variant="subheading" className="label md">
                    Details:
            </Typography>
                <Grid container spacing={24} justify="space-around">
                    <Grid item xs={3} className="grid-item">
                        <Icon color={props.dealInfo.isOrganic ? "primary" : "secondary"} >{props.dealInfo.isOrganic ? "check" : "close"}</Icon><Typography className="value gd sm">Organic</Typography>
                    </Grid>
                    <Grid item xs={3} className="grid-item">
                        <Icon color={props.dealInfo.isLocallyGrown ? "primary" : "secondary"}>{props.dealInfo.isLocallyGrown ? "check" : "close"}</Icon><Typography className="value gd sm">Local</Typography>
                    </Grid>
                </Grid>
                <Grid container spacing={24} justify="space-around">
                    <Grid item xs={3} className="grid-item">
                        <Icon color={props.dealInfo.delivery ? "primary" : "secondary"}>{props.dealInfo.delivery ? "check" : "close"}</Icon><Typography className="value gd sm">Delivery</Typography>
                    </Grid>
                    <Grid item xs={3} className="grid-item">
                        <Icon color={props.dealInfo.pickup ? "primary" : "secondary"}>{props.dealInfo.pickup ? "check" : "close"}</Icon><Typography className="value gd sm">Pickup</Typography>
                    </Grid>
                </Grid>
            </div>
            <div className="reason-info">
                <Typography variant="subheading" className="label md">
                    Reason:
        </Typography>
                <Typography variant="subheading" className="value sm">
                    {props.dealInfo.reasonForPost ? props.dealInfo.reasonForPost.join(", ") : "None"}
                </Typography>
            </div>
            <div className="bottom">
                <Typography variant="subheading" className="label md">
                    Notes:
            </Typography>
                {
                    props.dealInfo.notes ?
                        (
                            <Typography variant="subheading" className="note-body sm">
                                {props.dealInfo.notes}
                            </Typography>
                        )
                        :
                        (<div className="empty"></div>)
                }
            </div>
        </React.Fragment>
    )
}