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

export default class ModalCartController extends Component {

    state = {
      quantityRequested: 0,
      needByDate: this.getCurrentDate(),
      exchange: '',
      total: 0,
    }

    componentDidMount() {
			this.handleDefaultExchange();
			if(this.props.requestInfo){
				shoppingStore.resetForm();
				const { quantityRequested = 0, needByDate = this.getCurrentDate(), exchange = '' } = this.props.requestInfo;
				let total = quantityRequested*this.props.dealInfo.price;
				this.setState({ quantityRequested, needByDate, total, exchange })
			}
    }
    
  
    getCurrentDate() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1; // January is 0!
      var yyyy = today.getFullYear();
  
      if (dd < 10) {
        dd = '0' + dd
      }
  
      if (mm < 10) {
        mm = '0' + mm
      }
  
      today = yyyy + '-' + mm + '-' + dd;
      return today;
    }
  
    quantityStep = (num) => {
      let qty = this.state.quantityRequested;
      qty += num;
			this.handleQuantitySet(qty);
    }
  
    handleQuantitySet = (qty) => {
      qty = Math.min(this.props.dealInfo.quantity, Math.max(0, qty));
  
      let amount = (qty * this.props.dealInfo.price);
  
      this.setState({ quantityRequested: qty, total: amount });
    }

    handleDeliveryChange = event => {
        this.setState({ exchange: event.target.value });
    };
  
    handleDefaultExchange = () => {
      if (this.props.dealInfo['delivery'] && !this.props.dealInfo['pickup']) {
        this.setState({exchange:'delivery'});
      }
      else if (this.props.dealInfo['pickup'] && !this.props.dealInfo['delivery']) {
        this.setState({exchange:'pickup'});
      }
    }
  
    radioCheck(delivery, pickup) {
      let snippet;
      if (delivery && pickup) {
        snippet = (
          <FormControl>
            <RadioGroup
              name="delivery-status"
              value={this.state.exchange}
              onChange={this.handleDeliveryChange}
              row={true}
            >
              <FormControlLabel value="delivery" control={<Radio />} label="Delivery" className="radio-button" />
              <FormControlLabel value="pickup" control={<Radio />} label="Pickup" className="radio-button" />
            </RadioGroup>
          </FormControl>
        )
      } else if (delivery) {
        snippet = (<Typography variant="headline" color="secondary" className="transporation-text md">Delivery Only</Typography>)
      } else {
        snippet = (<Typography variant="headline" color="secondary" className="transporation-text md">Pickup Only</Typography>)
      }
      return snippet;
    }

    returnFields() {
      return this.state;
    }
  
    render() {
      return (
        <Grid container className="order-controllers">
          <Grid container item wrap="nowrap">
            <Grid container item xs={5}>
              <Typography variant="subheading" className="label md">
                Quantity:
              </Typography>
            </Grid>
            <Grid container item wrap="nowrap" alignItems="center" justify="space-around" className="quantity-controls" xs={7}>
              <button variant="fab" className="order-button" onClick={() => this.quantityStep(-1)}>
                <Typography variant="subheading" className="step-button sm">
                  -
                </Typography>
              </button>
              <input
                value={this.state.quantityRequested}
                onChange={(e) => this.setState({ quantityRequested: e.target.value })}
                onBlur={(e) => this.handleQuantitySet(e.target.value)}
                type="number"
                className="quantity-input lg"
              />
              <button variant="fab" className="order-button" onClick={() => this.quantityStep(1)}>
                <Typography variant="subheading" className="step-button sm">
                  +
                </Typography>
              </button>
            </Grid>
          </Grid>
          <Grid container item wrap="nowrap">
            <Grid container item className="needby" xs={5}>
              <Typography variant="subheading" className="label md">
                Need by:
              </Typography>
            </Grid>
            <Grid container item alignItems="center" justify="space-around" xs={7} className="width-restrict">
              <TextField
                type="date"
                value={this.state.needByDate}
                onChange={(e) => this.setState({ needByDate: e.target.value })}
                className="date md"
                InputProps={{
                  disableUnderline: true,
                }}
              />
            </Grid>
          </Grid>
          <Grid container item>
            <Grid container item xs={5}>
              <Typography variant="subheading" className="label md">
                Total:
              </Typography>
            </Grid>
            <Grid container item justify="center" xs={7}>
              <Typography variant="subheading" className="total md">
                ${this.state.total.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item wrap="nowrap" justify="center">
            {this.radioCheck(this.props.dealInfo.delivery, this.props.dealInfo.pickup)}
          </Grid>
        </Grid>
      )
    }
  }