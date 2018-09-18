import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import Popup from 'reactjs-popup'
import { SearchIcon, LocationIcon } from '../../components/Icons'
import Menu from '../../components/Menu'
import {LoadingSpinnerPage} from '../../components/LoadingSpinner'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '../../components/atomic/Button';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Topbar from '../../components/CommonTopBar'
import SearchBar from '../../components/SearchBar'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ListItem from '../../components/ListItem';
import Bottombar from '../../components/CommonBottomBar'
import Add from '@material-ui/icons/Add';
import { message } from 'antd';

@inject('inventoryStore','searchStore', 'errorStore')
@observer
class ViewDeals extends Component {
  state = {
    isLoadingDeals: true,
    deals: [],
    dealSearchQuery: '',
    searchQueryType: 'name',
    open: false
  }

  async componentDidMount() {
    const { inventoryStore, searchStore } = this.props
    try {
      let deals = await inventoryStore.getDeals();
      this.setState({
        isLoadingDeals: false,
        deals
      })
      searchStore.setList(deals);
      window.scroll(0, 0);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during InventoryStore#getDeals in ViewDeals#componentDidMount');
    }
    
  }

  componentWillUpdate(nextProps, nextState){
    if(this.state.deals !== this.props.searchStore.List && !this.state.isLoadingDeals){
      this.setState({deals: this.props.searchStore.List})
    }
  }

  searchIfPressEnter = (e) => {
    if (e.key === 'Enter') {
      this.onDealSearchQueryChange()
    }
  }

  onDealSearchQueryChange = () => {
    this.setState({
      dealSearchQuery: this.searchQuery.value
    })
  }

  onChangeSearchQueryType = (e) => {
    this.setState({
      searchQueryType: e.target.value
    })
  }

  handleOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  textSnipper = (text, limit) => {
    if (text.length > limit) {
      text = (text.substring(0, limit)) + "...";
    }

    return text;
  }

  getDealItems() {
    const { deals, dealSearchQuery, searchQueryType } = this.state
    let filteredDeals = this.props.searchStore.List;

    if(filteredDeals.length === 0){
      return (
        <div className="empty-text">
          <Typography variant="title" className="text">
            No Deals Found
          </Typography>
        </div>
      )
    }

    return filteredDeals.map((deal) => {
      return (
        <ListItem key={deal['id']} deal={deal} type={'inventory'} actionButtons={true}/>
      )
    })
  }

  checkout = () => {
    //route to shopping cart
    const { history } = this.props
    history.push('/shoppingcart')
  }

  render() {
    const { isLoadingDeals } = this.state
    const tabs = [
			{
				name: 'Inventory',
				child: false,
				path: '/deals'
      },
		];
    const navButtons = [
      {
        text: null
      },
      {
        text: 'Add Item',
        icon: (<Add/>),
        onClick: (() => null),
        path: '/deals/adddeal'
      },
    ]
    const topBarButton = {
      text: 'Add Item',
      icon: 'add',
      path: '/deals/adddeal'
    }
    return (
      <React.Fragment>
        <Menu/>
        <Topbar title="Inventory" tabs={tabs} sub={`${this.state.deals.length} Result(s)`} tabIndex={0} isChildPath={false} topBarButton={topBarButton}/>
        <div className="deals-container">
          <Bottombar buttons={navButtons}/>
          <SearchBar visibility={true}/>
          {
            isLoadingDeals ?
              <LoadingSpinnerPage />
              :
              <ul className="deals-list">
                {this.getDealItems()}
              </ul>
          }
          <div className="tool-tip-container">
            <Tooltip title="Add Item" placement="bottom-end">
              {/*TODO: add a link to add a deal page*/}
              <Link to="/deals/adddeal">
                <Button variant="fab" color="secondary">
                  <Icon>add</Icon>
                </Button>
              </Link>
            </Tooltip>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(ViewDeals)
