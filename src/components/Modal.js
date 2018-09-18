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
import { errorStore, shoppingStore, inventoryStore } from '../stores';
import { message } from 'antd';
import ShoppingBasket from '@material-ui/icons/ShoppingBasket';
import Chip from '@material-ui/core/Chip';
import Call from '@material-ui/icons/Call';
import Chat from '@material-ui/icons/Chat';
import Email from '@material-ui/icons/Email';
import Delete from '@material-ui/icons/Delete';
import Create from '@material-ui/icons/Create';
import moment from 'moment'
import { ModalMarketContent, ModalContactContent } from './ModalContent';
import ModalCartController from './ModalCartController';

class CartModal extends Component {

  constructor(props) {
    super(props);
    this.modal = React.createRef();
    this.controller = React.createRef();
    this.showTotal = props.showTotal;
    this.status = props.status;
    this.hasBusiness = props.business;
  }

  state = {
    open: false,
    type: '',
  }

  handleEdit = (id) => {
    this.lockScroll(false);
    inventoryStore.loadDeal(id);
  }

  componentWillUnmount(){
    this.lockScroll(false);
  }

  lockScroll = (bool) => {
    document.body.style.overflow = bool? 'hidden':'auto';
  }

  handleOpen = (type) => {
    this.setState({ open: true, type });
    this.lockScroll(true);
  }

  handleClose = () => {
    this.setState({ open: false, type: '' });
    this.lockScroll(false);
  }

  textSnipper = (text, limit) => {
    if (text.length > limit) {
      text = (text.substring(0, limit)) + "...";
    }
    return text;
  }

  handleDelete = async (id) => {
    // TODO: ask for confirmation
    try {
      await inventoryStore.archiveDeal(id);
      this.handleClose();
    }
    catch (e) {
      message.error(e.message);
      await errorStore.reportError(e, 'Error during Modal#handleDelete for id ' + id);
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

  contactLink = (item) => {
    const contactInfo = this.props.isSeller? this.props.buyerInfo : this.props.sellerInfo;
    const phone = contactInfo.phone.replace('(', '').replace(')', '').replace(' ', '').replace('-', '');
    switch(item){
      case 'Call':
        window.open(`tel:${phone}`);
      case 'Text':
        window.open(`sms:${phone}`);
      case 'Email':
        window.open(`mailto:${contactInfo.email}`);
    }
  }

  labelCreate = (text,icon) => {
    return (
      {
        text: text,
        icon: icon,
        onClick: (() => this.contactLink(text)),
      }
    )
  }

  createBottomBarButtons = (array) => {
    let buttons = [];
    for (let i = 0; i < array.length; i++) {
      let item = array[i];
      switch(item){
        case 'Call':
          buttons.push(this.labelCreate('Call',(<Call/>)));
          break;
        case 'Text':
          buttons.push(this.labelCreate('Text',(<Chat/>)));
          break;
        case 'Email':
          buttons.push(this.labelCreate('Email',(<Email/>)));
          break;
        default:
          break;
      }
    }
    return buttons;
  }

  createContactButtons = (array) => {
    return Object.values(array).map(item => (
      <Button variant="contained" color="primary" onClick={()=> this.contactLink(item)}>{item}</Button>
    ))
  }

  chooseModalButton = (type,id,contact) => {
    switch(type) {
      case 'inventory':
        return (
          <React.Fragment>
            <Link to="/deals/editdeal">
              <Button className="inventory-button" variant="contained" color="primary" onClick={() => {this.handleEdit(id)}}>Edit</Button>
            </Link>
            <Button className="inventory-button" variant="contained" color="secondary" onClick={() => AlertMessage('Delete Deal','Are you sure you want to delete this deal?', (async () => await this.handleDelete(id)))}>
              Delete
            </Button>
          </React.Fragment>
        )
        break;
      case 'contact':
        return this.createContactButtons(contact.communicationOptions.slice())
        break;
    }
  }

  chooseNavButtons = (type,id,contact) => {
    switch(type) {
      case 'inventory':
        return [
          {
            text: 'Edit',
            icon: (<Create/>),
            onClick: (() => this.handleEdit(id)),
            path: '/deals/editdeal'
          },
          {
            text: 'Delete',
            icon: (<Delete/>),
            onClick: (() => AlertMessage('Delete Deal','Are you sure you want to delete this deal?', (async () => await this.handleDelete(id)))),
          },
        ]
        break;
      case 'contact':
        return this.createBottomBarButtons(contact.communicationOptions.slice());
        break;
      case 'basket':
        return [
          {
            text: 'Update',
            icon: (<ShoppingBasket/>),
            onClick: this.handleAddToBasket,
          },
        ]
        break;
      case 'market':
        return [
          {
            text: 'Add to Basket',
            icon: (<ShoppingBasket/>),
            onClick: this.handleAddToBasket,
          },
        ]
        break;
    }
  }
  
  formatPhoneNumber = (s) => {
    var s2 = (""+s).replace(/\D/g, '');
    var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
  }

  handleQuantitySet = (qty) => {
    qty = Math.min(this.state.quantity, Math.max(0, qty));

    let amount = (qty * this.state.price);

    this.setState({ quantityRequested: qty, total: amount });
  }

  handleDeliveryChange = event => {
    this.setState({ exchange: event.target.value });
  };

  handleAddToBasket = async () => {
    const {quantityRequested,needByDate,exchange } = this.controller.returnFields();
    try {
      shoppingStore.onFieldChange('quantityRequested', quantityRequested);
      shoppingStore.onFieldChange('needByDate', needByDate);
      shoppingStore.onFieldChange('exchange', exchange);
      await shoppingStore.addToShoppingCart(this.props.deal['id']);
      message.success(this.props.deal['name'] + ' has been added to your basket!');
      this.handleClose();
    }
    catch (e) {
      message.error(e.message)
    }
  }

  checkPicture = (object) => {
    if(!object.picture){
      object.picture = require('../assets/placeholder.png');
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

  render() {
    let dealInfo = null, contactInfo = null, requestInfo = null;
    const infoAvailable = (this.props.sellerInfo && this.props.buyerInfo);
    dealInfo = this.props.deal;
    
    if(infoAvailable){
      contactInfo = this.props.isSeller? this.props.buyerInfo : this.props.sellerInfo;
      this.checkPicture(contactInfo);
    }

    if(this.props.item){
      requestInfo = this.props.item;
    }
    if(dealInfo){
      this.checkPicture(dealInfo);
    }

    let navButtons;
    if(this.state.type.match(/^(inventory|contact|basket|market)$/)){
      const id = dealInfo? dealInfo.id:null;
      navButtons = this.chooseNavButtons(this.state.type,id,contactInfo);
    }

    return (
      <React.Fragment>
        <Popup
          modal
          closeOnDocumentClick
          open={this.state.open}
          onClose={this.handleClose}
          className="modal-generic"
        >
          {close => (
            <div className="modal-scroll">
              <div className="item-topbar">
                <AppBar position="static" color="default" className="appbar">
                  <Toolbar className="text">
                    <IconButton className='return' color="inherit" onClick={close}>
                      <Icon>
                        arrow_back
                        </Icon>
                    </IconButton>
                    <Typography variant="subheading" color="inherit" className="main">
                      {this.state.type==='contact'?contactInfo.name:dealInfo.name}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </div>
              {
                this.state.type.match(/^(inventory|contact|basket|market)$/)?
                (
                  <Bottombar buttons={navButtons}/>
                )
                :
                ''
              }
              <div className={`popup ${this.props.type.match(/^(basket|market)$/)? '': 'float'}`}>
                <IconButton className="modal-close-btn" onClick={close}>
                  <Icon>close</Icon>
                </IconButton>
                <div className={`modal-container ${this.props.type.match(/^(basket|market)$/)? '': 'rounded'}`}>
                  <div className="deal-display">
                    <div className="img-crop">
                      <img src={this.state.type==='contact'? contactInfo.picture:dealInfo.picture} alt={this.state.type==='contact'?contactInfo.name:dealInfo.name} className="modal-img" />
                    </div>
                    {
                      this.state.type==='contact'? ''
                      :
                      (
                        <Link to={`/profile/${this.state.type==='contact'?contactInfo.uid:dealInfo.seller.uid}`}>
                          <Typography variant="headline" className="modal-seller md">
                            {this.state.type==='contact'?contactInfo.name:dealInfo.seller.name}&nbsp;<Icon className="text_icon">open_in_new</Icon>
                          </Typography>
                        </Link>
                      )
                    }
                    {
                      this.state.type==='contact'?
                      (
                        <Link to={`/profile/${this.state.type==='contact'?contactInfo.uid:dealInfo.seller.uid}`}>
                          <Typography variant="title" className="modal-title lg profile-link">
                            {contactInfo.name}&nbsp;<Icon className="text_icon">open_in_new</Icon>
                          </Typography>
                        </Link>
                      )
                      :
                      (
                        <Typography variant="title" className="modal-title lg">
                          {dealInfo.name}
                        </Typography>
                      )
                    }
                    <div className="chip-wrapper">
                      {this.state.type === 'contact'? <Chip className="hours" label={`${moment(contactInfo.opening+'','hh:mm').format('hh:mm A')} - ${moment(contactInfo.closing+'','hh:mm').format('hh:mm A')}`}/> : (
                      <React.Fragment>
                        <Chip className="chip" label={dealInfo.foodOption}/>
                        {
                          this.props.isSeller?
                          (
                            <Chip className="chip" label={dealInfo.isPublic? 'Public Visibility' : 'Restricted Visibility'} />
                          )
                          :
                          ''
                        }
                      </React.Fragment>
                      )}
                    </div>
                    {
                      this.state.type.match(/^(basket|market)$/)? (
                        <ModalCartController dealInfo={dealInfo}  requestInfo={requestInfo} ref={(instance) => { this.controller = instance }}/>
                      )
                      :
                      ''
                    }
                  </div>
                  <div className="info">
                    {
                      (this.state.type === 'contact')? (
                        <ModalContactContent contactInfo = {contactInfo} dealInfo={dealInfo}/>
                      )
                      :
                      (
                        <ModalMarketContent dealInfo={dealInfo}/>
                      )
                    }
                    {
                      this.state.type.match(/^(inventory)$/)?(
                        <div className={`modal-buttons`}>
                          {this.chooseModalButton(this.state.type,dealInfo.id,contactInfo)}
                        </div>
                      )
                      :
                      ''
                    }
                  </div>
                </div>
              </div>
              <div className={`submit-button-container ${this.props.type.match(/^(basket|market)$/)? '': 'hidden'}`}>
                <Button variant="contained" color="primary" className="submit" onClick={this.handleAddToBasket}>
                  {(this.props.type === 'basket'? 'Update' : 'Add to Basket')}
                </Button>
              </div>
            </div>
          )}
        </Popup>
      </React.Fragment> 
    )
  }
}

export default CartModal;