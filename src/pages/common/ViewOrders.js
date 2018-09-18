import React, { Component, Fragment } from 'react'
import {observable, action, autorun} from "mobx";
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { LocationIcon } from '../../components/Icons'
import {LoadingSpinnerPage} from '../../components/LoadingSpinner'
import Topbar from '../../components/CommonTopBar'
import Menu from '../../components/Menu';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Item from 'antd/lib/list/Item';
import { ExpansionPanelActions } from '@material-ui/core';
import {AlertMessage} from '../../components/AlertMessage'
import Bottombar from '../../components/CommonBottomBar'
import Chip from '@material-ui/core/Chip';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Send from '@material-ui/icons/Send';
import LocalShipping from '@material-ui/icons/LocalShipping';
import OrderContainer from './OrderContainer';
import { message } from 'antd';
import Pagination from 'material-ui-pagination';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const pageInfo = [
  {
    title: 'Requests',
    sub: 'View the status of your requests'
  },
  {
    title: 'In Progress',
    sub: 'See orders that are awaiting payment or delivery/pickup.'
  },
  {
    title: 'Completed',
    sub: 'Review orders that have been completed.'
  },
]


@inject('orderStore', 'userStore', 'errorStore')
@observer
class ViewOrders extends Component {

  state = {
    page: null,
    isLoadingOrders: true,
    requests: [],
    childrenWatcher: false,
    ordersInProgress: [],
    ordersCompleted: [],
    total: 1,
    display: 4,
    number: 1,
  }

  async componentDidMount() {
    const { orderStore, location } = this.props
    let total;
    const { requests, ordersInProgress, ordersCompleted } = orderStore;
    let page = this.getPage(location.pathname);
    switch(page) {
      case 'request':
        try {
          // Both are refreshed so that the total count numbers on the tabs are updated properly
          await Promise.all([orderStore.refreshRequests(), orderStore.refreshOrdersInProgress()]);
        }
        catch (e) {
          message.error(e.message);
          await this.props.errorStore.reportError(e, 'Error during OrderStore#refreshRequests in ViewOrders#ComponentDidMount');
          return;
        }
        total = Math.ceil(requests.length/5);
        break;
      case 'active':
        try {
          // Both are refreshed so that the total count numbers on the tabs are updated properly
          await Promise.all([orderStore.refreshRequests(), orderStore.refreshOrdersInProgress()]);
        }
        catch (e) {
          message.error(e.message);
          await this.props.errorStore.reportError(e, 'Error during OrderStore#refreshOrdersInProgress in ViewOrders#ComponentDidMount');
          return;
        }
        total = Math.ceil(ordersInProgress.length/5);
        break;
      case 'completed':
        try {
          await orderStore.refreshOrdersCompleted();
        }
        catch (e) {
          message.error(e.message);
          await this.props.errorStore.reportError(e, 'Error during OrderStore#refreshRequests in ViewOrders#ComponentDidMount');
          return;
        }
        total = Math.ceil(ordersCompleted.length/5);
        break;
    }
    this.setState({
      page,
      total,
      isLoadingOrders: false,
      requests,
      ordersInProgress,
      ordersCompleted,
    })
    window.scroll(0, 0);
  }

  paginate = (list) => {
    const size = 5
    const start = (this.state.number-1) * size;
    const end = start + size;
    return observable.array(list.slice(start, end),{deep: true});
  }

  async componentWillUpdate(nextProps, nextState) {
    if(nextProps !== this.props ){
      const { orderStore, location } = nextProps
      let total;
      const { requests, ordersInProgress, ordersCompleted } = orderStore;
      let page = this.getPage(location.pathname);
      this.setState({isLoadingOrders: true});
      switch(page) {
        case 'request':
          try {
            await orderStore.refreshRequests();
          }
          catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#refreshRequests in ViewOrders#ComponentDidMount');
            return;
          }
          total = Math.ceil(requests.length/5);
          break;
        case 'active':
          try {
            await orderStore.refreshOrdersInProgress();
          }
          catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#refreshOrdersInProgress in ViewOrders#ComponentDidMount');
            return;
          }
          total = Math.ceil(ordersInProgress.length/5);
          break;
        case 'completed':
          try {
            await orderStore.refreshOrdersCompleted();
          }
          catch (e) {
            message.error(e.message);
            await this.props.errorStore.reportError(e, 'Error during OrderStore#refreshRequests in ViewOrders#ComponentDidMount');
            return;
          }
          total = Math.ceil(ordersCompleted.length/5);
          break;
      }
      this.setState({
        page,
        total,
        isLoadingOrders: false,
        requests,
        ordersInProgress,
        ordersCompleted,
      })
      window.scroll(0, 0);
    }
  }

  getPage(url) {
    return url.substring(url.lastIndexOf("/")+1);
  }

  getTabIndex(tabs) {
    const path = this.props.location.pathname;
    let index = null;
    for (let i of tabs.keys()) {
      if(tabs[i].path.indexOf(path) > -1){
        return i;
      }
    }
  }
  
  getTotalInCategory(list) {
    let sum = 0;
    if(list.length > 0){
      let cloneList = list.peek();
      cloneList.slice();
      for (let i = 0; i <= cloneList.length; i++) {
        if(cloneList[i]) {
          sum += cloneList[i].orders.slice().length;
        }
      }
    }
    return sum;
  }

  getOrderItems() {
    let list = [];
    let emptyText = "";
    const path = this.getPage(this.props.location.pathname);
    switch(path) {
      case 'request':
        list = this.state.requests;
        emptyText = "No Requests Available";
        break;
      case 'active':
        list = this.state.ordersInProgress;
        emptyText = "No Active Orders";
        break;
      case 'completed':
        list = this.state.ordersCompleted;
        emptyText = "No Orders Completed";
        break;
    }
    
    list = list? this.paginate(list): [];

    if(list.length === 0){
      return (
        <div className="empty-text">
          <Typography variant="title" className="text">
            {emptyText}
          </Typography>
        </div>
      )
    }
    return list.map((item ,i) => {
      return (
        <OrderContainer key={`${item['id']}-order-item`} info={item} path={this.state.page} notifier={this.watcherShift}/>
      )
    })

  }

  render() {
    const { isLoadingOrders } = this.state
    const { requests, ordersInProgress, ordersCompleted } = this.props.orderStore;
    const requestsTotal = this.getTotalInCategory(requests);
    const ordersInProgressTotal = this.getTotalInCategory(ordersInProgress);
    // const ordersCompletedTotal = this.getTotalInCategory(ordersCompleted);
    const tabs = [
      {
        name: `Requests (${requestsTotal})`,
        child: false,
        path: '/request'
      },
      {
        name: `In Progress (${ordersInProgressTotal})`,
        child: false,
        path: '/active'
      },
      {
        name: `Completed`,
        child: false,
        path: '/completed'
      },
    ];
    const tabIndex = this.getTabIndex(tabs)
    return (
      <MuiThemeProvider>
        <Fragment>
          <Menu />
          <Topbar title={pageInfo[tabIndex].title} tabs={tabs} sub={pageInfo[tabIndex].sub} tabIndex={tabIndex} isChildPath={false} mobilft={true}/>
          <div className="request-container">
            {
              isLoadingOrders ?
              <LoadingSpinnerPage />
              :
                <Fragment>
                  <ul className="request-list">
                    {this.getOrderItems()}
                  </ul>
                </Fragment>
            }
            {
              this.state.total >1?(
                <Pagination
                  className="pagination"
                  total = { this.state.total }
                  current = { this.state.number }
                  display = { this.state.display }
                  onChange = { number => this.setState({ number }) }
                />
              )
              :
              ''
            }
          </div>
        </Fragment>
      </MuiThemeProvider>
    )
  }
}

export default withRouter(ViewOrders);