import React, { Component, Fragment } from 'react'
import {observable, autorun} from "mobx";
import { observer, inject, renderReporter } from 'mobx-react'
import { Link, withRouter } from 'react-router-dom'
import { LocationIcon } from '../../components/Icons'
import { LoadingSpinnerPage } from '../../components/LoadingSpinner'
import Topbar from '../../components/CommonTopBar'
import Menu from '../../components/Menu';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '../../components/atomic/Button';
import Item from 'antd/lib/list/Item';
import Modal from '../../components/Modal';
import ListItem from '../../components/ListItem';
import { ExpansionPanelActions } from '@material-ui/core';
import { AlertMessage } from '../../components/AlertMessage'
import Bottombar from '../../components/CommonBottomBar';
import Chip from '@material-ui/core/Chip';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Send from '@material-ui/icons/Send';
import LocalShipping from '@material-ui/icons/LocalShipping';
import DoneIcon from '@material-ui/icons/Done';
import { message } from 'antd';
import Pagination from 'material-ui-pagination';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';


@inject('orderStore', 'userStore', 'errorStore')
@observer
class OrderContainer extends Component {

    state = {
        pageItems: [],
        total: 1,
        display: 3,
        number: 1
    }

    componentDidMount() {
        const total = Math.ceil(this.props.info.orders.length/5);
        this.setState({
          total,
        })
        window.scroll(0, 0);
    }

    componentDidUpdate(nextProps, nextState) {
        if((nextProps.info.orders !== this.props.info.orders)){
            const total = Math.ceil(this.props.info.orders.length/5);
            this.setState({
              total,
              number:1,
            })
        }
    }

    async handleAcceptAllRequests(orderIDs) {
        try {
            await this.props.orderStore.acceptRequests(orderIDs);
        }
        catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#acceptRequests in OrderContainer#handleAcceptAllRequests');
        }
    }

    async handleDeclineAllRequests(orderIDs) {
        try {
            await this.props.orderStore.acceptRequests(orderIDs);
        }
        catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#declineRequests in OrderContainer#handleDeclineAllRequests');
        }
    }

    async handleCancelAllRequests(orderIDs) {
        try {
            await this.props.orderStore.cancelRequests(orderIDs);
        }
        catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#cancelRequests in OrderContainer#handleCancelAllRequests');
        }
    }

    async handleMarkAllAsExchanged(orderIDs) {
        try {
            await this.props.orderStore.markAllAsExchanged(orderIDs);
        }
        catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#markAllAsExchanged in OrderContainer#handleMarkAllAsExchanged');
        }
    }

    async handleCancelAllOrders(orderIDs) {
        try {
            await this.props.orderStore.cancelOrders(orderIDs);
        }
        catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#cancelOrders in OrderContainer#handleCancelAllOrders');
        }
    }

    async handleMarkAllAsPaid(orderIDs) {
        try {
            await this.props.orderStore.markAllAsPaid(orderIDs);
        }
        catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#markAllAsPaid in OrderContainer#handleMarkAllAsPaid');
        }
    }

    paginate = (list) => {
        const size = 5
        const start = (this.state.number-1) * size;
        const end = start + size;
        const page = list.slice(start, end);
        if(!page[0]){
            window.location.reload(false);
        }
        return observable.array(page);
    }

    getContainerButtons = (isSeller) => {
        const orderStore = this.props.orderStore
        const requests = this.props.info.orders
        let orderIDs = requests.map((request) => { return request.id});
        switch (this.props.path) {
            case 'request':
                return isSeller ?
                    (<Fragment>
                        <Button variant="contained" size="small" color="primary" className="button" onClick={async () => this.handleAcceptAllRequests(orderIDs)}>
                            Accept All
                        </Button>
                        <Button variant="contained" size="small" color="secondary" className="button"
                            onClick={() => AlertMessage('Decline All Requests', 'Are you sure you want to decline ALL requests?', async () => await this.handleDeclineAllRequests(orderIDs))}>
                            Decline All
                            </Button>
                    </Fragment>)
                    :
                    (<Button variant="contained" size="small" color="secondary" className="button" onClick={() => AlertMessage('Cancel All Requests', 'Are you sure you want to cancel ALL requests?', async () => await this.handleCancelAllRequests(orderIDs))}>
                        Cancel All
                        </Button>)
                break;
            case 'active':
                return (<Fragment>
                        <Button variant="contained" size="small" color="primary" className="button" onClick={async () => await this.handleMarkAllAsPaid(orderIDs)}>
                            Mark All as Paid
                        </Button>
                        <Button variant="contained" size="small" color="primary" className="button" onClick={async () => await this.handleMarkAllAsExchanged(orderIDs)}>
                            Mark All as Delivered
                        </Button>
                        <Button variant="contained" size="small" color="secondary" className="button" onClick={() => AlertMessage('Cancel All Orders', 'Are you sure you want to cancel ALL orders?', async () => await this.handleCancelAllOrders(orderIDs))}>
                            Cancel All
                        </Button>
                    </Fragment>)
                break;
            case 'completed':
                return (
                    <Button style={{visibility: 'hidden'}}variant="contained" disabled={true} size="small" color="secondary" className="button" onClick={() => AlertMessage('Appeal All Orders', 'Are you sure you want to appeal ALL orders?')}>
                        Appeal All
                    </Button>)
                break;
        }
    }

    openModal = (type,event) => {
        event.stopPropagation();
        this.modal.handleOpen(type);
    }

    createModal = (props) => {
        return (
          <Modal
            ref={(instance) => { this.modal = instance }}
            item={props.item? props.item: null}
            sellerInfo={props.info? props.info.business: null}
            buyerInfo={props.info? props.info.business: null}
            isSeller={props.userStore.isSeller}
            type='contact'
          />
        )
    }

    checkPicture = (object) => {
        if(!object.picture){
            object.picture = require('../../assets/placeholder.png');
        }
    }

    createStatus = (isSeller) => {
        const requests = this.props.info.orders
        const requestsCount = requests.length;
        switch (this.props.path) {
            case 'request':
                return <Chip className={`chip ${!isSeller? 'positive':'negative'}`} label={`${isSeller ? 'Confirmation Needed' : 'Awaiting Seller Confirmation'}(${requestsCount})`} />
                break;
            case 'active':
                let payPositive = requests.slice().reduce((sum,item) => {return sum += item['paymentStatus']? 1:0}, 0);
                let payNegative = requestsCount - payPositive;
                let exPositive = requests.slice().reduce((sum,item) => {return sum += item['exchangeStatus']? 1:0}, 0);
                let exNegative = requestsCount - exPositive;
                return (
                    <Fragment>
                        {payNegative > 0? <Chip className="chip negative" label={`Awaiting Payment(${payNegative})`} />:''}
                        {exNegative > 0? <Chip className="chip negative" label={`Awaiting Delivery/Pickup(${exNegative})`} />:''}
                    </Fragment>
                )
                break;
            case 'completed':
                return <Chip className="chip null" label={`Completed(${requestsCount})`} deleteIcon={<DoneIcon />} />
                break;
        }
    }

    render() {
        const { user } = this.props.userStore;
        let items = this.props.info.orders;
        const totalPages = Math.ceil(items.length/5);
        const requests_queued = items.length;
        items = items? this.paginate(items):[];
        const totalCost = this.props.info.totalCost
        const seller = this.props.info.business.name
        this.checkPicture(this.props.info.business);
        return (
            <ExpansionPanel className="panel" defaultExpanded={false}>
                {this.createModal(this.props)}
                <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>} className="card-author" >
                    <section className="text">
                        <div className="contact-container">
                            <div className="image-container">
                                <div className="image-floater">
                                    <img src={this.props.info.business.picture} className="card-image" />
                                </div>
                            </div>
                            <div className="detail-button-container contact-button">
                                <Button size="small" variant="outlined" className="action-button" onClick={(e) => this.openModal('contact',e)}>
                                    Contact
                                </Button>
                            </div>
                        </div>
                        <section className="info-section">
                            <section className="major-text">
                                <div className="card-name-container">
                                    <Link to={`/profile/${this.props.info.business.uid}`}>
                                        <Typography variant="title" className="name lg profile-link">
                                            {seller}&nbsp;<Icon className="text_icon">open_in_new</Icon>
                                        </Typography>
                                    </Link>
                                    <div className="filler"></div>
                                </div>
                                <div className="card-info-container">
                                    <section className="subinfo">
                                        <Typography variant="subheading" className="label sm">
                                            Number of Items:
                    						</Typography>
                                        <Typography variant="subheading" className="value sm ">
                                            {requests_queued}
                                        </Typography>
                                    </section>
                                    <div className="subinfo">
                                        <Typography variant="subheading" className="label sm">
                                            Total:
                    	                </Typography>
                                        <Typography variant="subheading" className="value sm">
                                            ${totalCost.toFixed(2)}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="card-label-container">
                                    {this.createStatus(user.isSeller())}
                                </div>
                            </section>
                        </section>
                    </section>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className="product-list">
                    {items.map((order, i) => {
                            return (<ListItem key={i} deal={order.deal} item={order} business={order.business} isSeller={(user.isSeller())} actionButtons={true} type={this.props.path} />)
                        })
                    }
                </ExpansionPanelDetails>
                <ExpansionPanelActions className="panel-buttons">
                    <div className="buttons-container">
                        {this.getContainerButtons(user.isSeller())}
                    </div>
                    <div className="pagination">
                    {
                        this.state.total > 1?(
                        <Pagination
                            total = { totalPages }
                            current = { this.state.number }
                            display = { this.state.display }
                            onChange = { number => this.setState({ number }) }
                        />
                        )
                        :
                        ''
                    }
                    </div>
                </ExpansionPanelActions>
            </ExpansionPanel>
        )
    }
}

export default OrderContainer;
