import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import Button from './atomic/Button';
import Typography from '@material-ui/core/Typography';
import {inventoryStore,shoppingCartStore} from '../stores'
import Modal from './Modal';
import Chip from '@material-ui/core/Chip';
import {AlertMessage} from './AlertMessage';
import DoneIcon from '@material-ui/icons/Done';
import { message } from 'antd';
import Icon from '@material-ui/core/Icon';
import moment from 'moment';

@inject('userStore', 'orderStore','inventoryStore', 'errorStore')
@observer
class ListItem extends Component {
  constructor(props) {
    super(props);
    this.modal = React.createRef();
  }

  componentDidMount() {
    this.setState()
  }

  openModal = (type) => {
    this.modal.handleOpen(type);
  }

  handleAcceptRequest = async (id) => {
    try {
      await this.props.orderStore.acceptRequest(id);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during ListItem#handleAcceptRequest for id ' + id);
    }
  }

  handleDeclineRequest = async (id) => {
    try {
      await this.props.orderStore.declineRequest(id);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during ListItem#handleDeclineRequest for id ' + id);
    }
  }
  
  handleCancelRequest = async (id) => {
    try {
      await this.props.orderStore.cancelRequest(id);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during ListItem#handleCancelRequest for id ' + id);
    }
  }

  handleMarkAsPaid = async (id) => {
    try {
      await this.props.orderStore.markAsPaid(id);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during ListItem#handleMarkAsPaid for id ' + id);
    }
  }

  handleMarkAsExchanged = async (id) => {
    try {
      await this.props.orderStore.markAsExchanged(id);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during ListItem#handleMarkAsExchanged for id ' + id);
    }
  }

  handleCancelOrder = async (id) => {
    try {
      await this.props.orderStore.cancelOrder(id);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during ListItem#handleCancelOrder for id ' + id);
    }
  }

  handleEdit = (id) => {
    inventoryStore.loadDeal(id);
  }

  handleCardClick = () => {
    if ((document.body.clientWidth <= 768) && this.props.type.match(/^(market)$/)) {
      this.openModal(this.props.type);
    }
  }

  handleSellerClick = (event) => {
    if (document.body.clientWidth <= 768) {
      event.preventDefault();
    }
  }

  handleCartDelete = (id) => {
    shoppingCartStore.removeFromShoppingCart(id);
  }

  checkPicture = (object) => {
    if(!object.picture){
      object.picture = require('../assets/placeholder.png');
    }
  }

  createSubInfo = (label, value, webFeature) => {
    return (
      <div className={`subinfo ${webFeature ? `web-ft` : ''}`}>
        <Typography variant="subheading" className="label sm">
          {label}
        </Typography>
        <Typography variant="subheading" className="value sm">
          {value}
        </Typography>
      </div>
    )
  }

  statusChips = (status, paymentStatus, exchangeStatus, exchange, isSeller) => {
    let pay = null, exchangeMessage = null;
    switch(status ){
      case 'accepted':
        pay = (<Chip className={`chip ${paymentStatus? 'positive':'negative'}`} label={paymentStatus ? "Payment Received" : "Awaiting Payment"} />)
        exchangeMessage = (<Chip className={`chip ${exchangeStatus ? 'positive':'negative'}`} label={exchangeStatus ? (exchange === 'delivery' ? "Delivery Completed" : "Pickup Completed") : (exchange === 'delivery' ? "Awaiting Delivery" : "Awaiting Pickup")} />)
        break;
      case 'completed':
        pay = (<Chip className={`chip null`} label="Completed" deleteIcon={<DoneIcon />} />)
        exchangeMessage = '';
        break;
      default:
        pay = (<Chip className={`chip ${!isSeller? 'positive':'negative'}`} label={isSeller ? "Confirmation Needed" : "Awaiting Seller Confirmation"} />)
        exchangeMessage = '';
        break;
    }
    return (
      <div className="status">
        {pay}
        {exchangeMessage}
      </div>
    )
  }

  handleDelete = async (id) => {
    try {
      await inventoryStore.archiveDeal(id);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during ListItem#handleDelete for id ' + id);
    }
  }

  chooseButton = (isSeller,type,id,requestInfo) => {
    let exchangeStatus, paymentStatus, exchange;
    if(requestInfo){
      id = requestInfo.id? requestInfo.id:id;
      exchangeStatus = requestInfo.exchangeStatus;
      paymentStatus = requestInfo.paymentStatus;
      exchange = requestInfo.exchange;
    }
    switch(type) {
      case 'inventory':
        return (
          <React.Fragment>
            <Link to="/deals/editdeal">
              <Button size="small" color="primary" className="action-button" onClick={() => this.handleEdit(id)}>
                Edit
              </Button>
            </Link>
            <div className="btn-border"></div>
            <Button size="small" color="secondary" className="action-button" onClick={() => AlertMessage('Delete Item','Are you sure you want to delete this inventory item?',(async () => {await this.handleDelete(id)}))}>
              Delete
            </Button>
          </React.Fragment>
        )
        break;
      case 'basket':
        return (
          <React.Fragment>
            <Button size="small" color="primary" className="action-button" onClick={() => this.openModal('basket')}>
              Edit
            </Button>
            <div className="btn-border"></div>
            <Button size="small" color="secondary" className="action-button" onClick={() => this.handleCartDelete(id)}>
              Delete
            </Button>
          </React.Fragment>
        )
        break;
      case 'request':
        return  isSeller? (
          <React.Fragment>
            <Button size="small" color="primary" className="action-button" onClick={ async () => await this.handleAcceptRequest(id)}>
              Accept
            </Button>
            <div className="btn-border"></div>
            <Button size="small" color="secondary" className="action-button" onClick={() => AlertMessage('Decline Request','Are you sure you want to decline this request?', async () => await this.handleDeclineRequest(id))}>
              Decline
            </Button>
          </React.Fragment>
        )
        :
        (
          <Button size="small" color="secondary" className="action-button" onClick={() => AlertMessage('Cancel Request','Are you sure you want to cancel this request?', async () => await this.handleCancelRequest(id))}>
            Cancel
          </Button>
        )
        break;
      case 'active':
        return  (
          <React.Fragment>
            <Button size="small" color="primary" className="action-button" disabled={paymentStatus} onClick={async () => await this.handleMarkAsPaid(id)}>
              Mark as Paid
            </Button>
            <div className="btn-border"></div>
            <Button size="small" color="primary" className="action-button" disabled={exchangeStatus} onClick={async () => await this.handleMarkAsExchanged(id)}>
              {(exchange === 'delivery' ? 'Mark as Delivered' : 'Mark as Picked Up')}
            </Button>
            <div className="btn-border"></div>
            <Button size="small" color="secondary" className="action-button" onClick={() => AlertMessage('Cancel Request','Are you sure you want to cancel this order?', async () => await this.handleCancelOrder(id))}>
              Cancel
            </Button>
          </React.Fragment>
        )
        break;
      case 'completed':
        return (
          <Button size="small" style={{visibility: 'hidden'}}disabled={true} color="secondary" className="action-button" onClick={() => AlertMessage('Appeal Order','Are you sure you want to appeal this Order?')}>
            Appeal
          </Button>
        )
        break;
      default:
        break;
    }
  }

  textSnipper = (text, limit) => {
    if (text.length > limit) {
      text = (text.substring(0, limit)) + "...";
    }
    return text;
  }

  createModal = (props) => {
    return (
      <Modal
        ref={(instance) => { this.modal = instance }}
        deal={props.deal}
        item={props.item? props.item: null}
        sellerInfo={props.item? props.item.seller: null}
        buyerInfo={props.item? props.item.buyer: null}
        isSeller={props.userStore.isSeller}
        controller={props.controller}
        type={props.type}
      />
    )
  }

  render() {
    let dealInfo = null, requestInfo = null;
    dealInfo = this.props.deal;

    if (this.props.item) {
      requestInfo = this.props.item;
    }
    this.checkPicture(dealInfo);

    return (
      <div className="item-wrapper">
        <div className="item-container" onClick={() => this.handleCardClick()}>
          <div className="item-info" >
            <div className="image-container" onClick={() => this.openModal(this.props.type)}>
              <img src={dealInfo.picture} className="item-img" />
            </div>
            <section className="info-section">
              <div className="top-info">
                <div className="major-text">
                  <div className="name-container">
                  {
                    (!this.props.userStore.isSeller && this.props.type.match(/^(market|basket)$/))?
                    (
                      <Link to={`/profile/${dealInfo.seller.uid}`} onClick={(e) => this.handleSellerClick(e)}>
                        <Typography variant="subinfo" className="seller sm">
                          {this.textSnipper(dealInfo.seller.name, 30)}<Icon className="text_icon">open_in_new</Icon>
                        </Typography>
                      </Link>
                    )
                    :
                    ''
                  }
                    <Typography variant="subheading" className="date sm" onClick={() => this.openModal(this.props.type)}>
                      {this.props.type.match(/^(request|active|completed)$/) ? `Order Placed: ${moment(requestInfo.timestamp).format("MM/DD/YYYY h:mma")}`:''}
                    </Typography>
                    <Typography variant="title" className="name lg" onClick={() => this.openModal(this.props.type)}>
                      {this.textSnipper(dealInfo.name, 30)}
                    </Typography>
                  </div>
                  <div className="notes web-ft">
                    <Typography variant="subheading" className="sm">
                      {dealInfo.notes ? this.textSnipper(dealInfo.notes, 80):''}
                    </Typography>
                  </div>
                </div>
                <div className="minor-text">
                  <div className="info-container">
                    {this.props.type.match(/^(inventory|market)$/) ?this.createSubInfo('Qty Available:', `${dealInfo.quantity} ${dealInfo.quantityUnit}(s)`):''}
                    {this.props.type.match(/^(inventory|market)$/) ?this.createSubInfo('Use By:', `${moment(dealInfo.useByDate).format('MM-DD-YYYY')}` ):''}
                    {this.props.type.match(/^(inventory|market)$/) ? this.createSubInfo('Reason:', `${dealInfo.reasonForPost ? this.textSnipper(dealInfo.reasonForPost.join(", "), 17) : "None"}`, true) : ''}
                    {this.props.type.match(/^(inventory)$/) ?this.createSubInfo('Visibility:', `${dealInfo.isPublic ? 'Public' : 'Restricted'}`):''}
                    {this.props.type.match(/^(basket|active|request|completed)$/) ? this.createSubInfo('Qty Requested:', `${requestInfo.quantityRequested} ${dealInfo.quantityUnit}(s)`):''}
                    {this.props.type.match(/^(basket|active|request|completed)$/) ? this.createSubInfo('Price:', `$${dealInfo.price.toFixed(2)}/${dealInfo.priceUnit}`):''}
                    {this.props.type.match(/^(basket|active|request|completed)$/) ? this.createSubInfo('Need by:', `${moment(requestInfo.needByDate).format('MM-DD-YYYY')}`):''}
                    {this.props.type.match(/^(basket|active|request|completed)$/) ? this.createSubInfo('Exchange:', `${requestInfo.exchange.replace(/^\w/, c => c.toUpperCase())}`) : ''}
                    <div className="detail-container web-ft">
                      <Typography variant="subheading" color="secondary" className={`detail md ${dealInfo.isOrganic ? '' : 'hidden'}`}>
                        Organic
                      </Typography>
                      <Typography variant="subheading" color="secondary" className={`detail md ${dealInfo.isLocallyGrown ? '' : 'hidden'}`}>
                        Local
                      </Typography>
                    </div>
                  </div>
                  <div className="content-divider web-ft"></div>
                  <div className="price">
                    <div className="price-container">
                      {
                        requestInfo?
                        <Typography variant="subheading" className="label md">
                          Total:&nbsp;
                        </Typography>
                        :
                        ''
                      }
                      <Typography variant="subheading" className="price-value md">
                        ${requestInfo? requestInfo.totalCost.toFixed(2) : dealInfo.price.toFixed(2)}
                      </Typography>
                      {
                        requestInfo?
                        ''
                        :
                        <Typography variant="subheading" className="label md">
                          /{dealInfo.priceUnit}
                        </Typography>
                      }
                    </div>
                    <div className="detail-button-container web-ft top-mar">
                      <Button size="small" variant="contained" color="primary" className="action-button" onClick={() => this.openModal(this.props.type)}>
                        Details
                      </Button>
                    </div>
                    {
                      this.props.type.match(/^(request|active|completed)$/)?
                      (
                        <div className="detail-button-container mobil-ft top-mar">
                          <Button size="small" variant="contained" color="primary" className="action-button" onClick={() => this.openModal(this.props.type)}>
                            Details
                          </Button>
                        </div>
                      )
                      :
                      (
                          <div className="detail-container mobil-ft">
                          <Typography variant="subheading" color="secondary" className={`detail sm ${dealInfo.isOrganic ? '' : 'hidden'}`}>
                            Organic
                          </Typography>
                          <Typography variant="subheading" color="secondary" className={`detail sm ${dealInfo.isLocallyGrown ? '' : 'hidden'}`}>
                            Local
                          </Typography>
                          </div>
                      )
                    }
                  </div>
                </div>
              </div>
              <div className="actions">
                {this.createModal(this.props)}
              </div>
            </section>
          </div>
          {this.props.type.match(/^(request|active|completed)$/) ? this.statusChips(requestInfo.status, requestInfo.paymentStatus, requestInfo.exchangeStatus, requestInfo.exchange, this.props.userStore.isSeller) : ''}
          <div className={`button-container ${this.props.actionButtons? '':'hidden'}`}>
            {this.chooseButton(this.props.userStore.isSeller,this.props.type,dealInfo.id,requestInfo)}
          </div>
        </div>
      </div>
    )
  }
}

export default ListItem;