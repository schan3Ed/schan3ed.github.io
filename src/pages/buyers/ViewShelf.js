import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
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
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import ListItem from '../../components/ListItem';
import Topbar from '../../components/CommonTopBar'
import SearchBar from '../../components/SearchBar'
import Bottombar from '../../components/CommonBottomBar'
import { message } from 'antd'


@inject('shoppingStore','searchStore', 'errorStore')
@observer
class ViewShelf extends Component {
  state = {
    isLoadingDeals: true,
    deals: [],
    searchQueryType: 'name',
  }

  async componentDidMount() {
    const { shoppingStore,searchStore } = this.props;
    
    try {
      await shoppingStore.refresh();
      let deals = shoppingStore.deals;
      this.setState({
        isLoadingDeals: false,
        deals,
      })
      searchStore.setList(deals);
      window.scroll(0, 0);
    }
    catch (e) {
      message.error(e.message);
      await this.props.errorStore.reportError(e, 'Error during shoppingStore#refresh in ViewShelf#componentDidMount');
    }
  }

  componentWillUpdate(nextProps, nextState){
    if(this.state.deals !== this.props.searchStore.List && !this.state.isLoadingDeals){
      this.setState({deals: this.props.searchStore.List})
    }
  }

  getDealItems() {
    const { deals, dealSearchQuery, searchQueryType } = this.state
    let filteredDeals = this.props.searchStore.List;

    if(filteredDeals.length === 0){
      return (
        <div className="empty-text">
          <Typography variant="title" className="text">
            No Results Found
          </Typography>
        </div>
      )
    }
    
    return filteredDeals.map((deal) => {
      return (
        <ListItem key={deal['id']} deal={deal} controller={true} type={'market'} />
      )
    })
  }

  checkout = () => {
    //route to shopping cart
    const { history } = this.props
    history.push('/shoppingcart')
  }



  render() {
    const { isLoadingDeals,isEmpty } = this.state
    const tabs = [
			{
				name: 'All Produce',
				child: false,
				path: '/shelf'
      },
      /* TODO: enable My Suppliers
      {
				name: 'My Suppliers',
				child: false,
				path: '/shelf'
      },
      */
    ];
    return (
      <React.Fragment>
        <Menu />
        <Topbar title="View Produce" tabs={tabs} sub={`${this.state.deals.length} Result(s)`} tabIndex={0} isChildPath={false}/>
        {/* <Bottombar/> */}
        <div className="deals-container">
          <SearchBar/>
          {
            isLoadingDeals ?
              <LoadingSpinnerPage />
              :
              <React.Fragment>
                <ul className="deals-list"> 
                  {this.getDealItems()}
                </ul>
              </React.Fragment>
          }
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(ViewShelf)
