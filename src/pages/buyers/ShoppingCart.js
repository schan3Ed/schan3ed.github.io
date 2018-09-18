import React, { Component, Fragment } from 'react'
import { observer, inject } from 'mobx-react'
import { LocationIcon } from '../../components/Icons'
import {LoadingSpinnerPage, LoadingSpinnerButton} from '../../components/LoadingSpinner'
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
import ListItem from '../../components/ListItem';
import { message } from 'antd'
import { withRouter} from 'react-router-dom';

@inject('shoppingCartStore', 'errorStore')
@observer
class ShoppingCart extends Component {
	state = {
		isLoadingBasket: true,
		isEmpty: false
	}

	componentWillMount() {
		this.state = {
			isLoadingBasket: false,
		}
		window.scroll(0, 0);
	}

	componentWillUpdate() {
		switch (this.props.shoppingCartStore.latestChange) {
			case 'updated':
				console.log('Cart has been updated');
				//message.info('An item in your cart has been updated by the seller.');
				break;
			case 'removed':
				message.info('An item from your cart has been removed.');
				//message.info('An item in your cart that is no longer for sell has been removed.');
				break;
		}
	}

	getCartItems() {
		if(this.props.shoppingCartStore.shoppingCart.length === 0 && !this.state.isEmpty){
			this.setState({isEmpty: true});
			return;
		}
		return this.props.shoppingCartStore.shoppingCart.map((item) => {
			return (
				<ListItem 
					key={item.deal.id}
					item={item}
					deal={item.deal}
					controller={true}
					actionButtons={true}
					type={'basket'}
					basketItem={true}
				/>
			)
		})
	}

	handleSubmit = async () => {
		try {
			await this.props.shoppingCartStore.checkout();
			const { history } = this.props;
			history.push('/request')
		}
		catch (e) {
			message.error(e.message + '\nPlease refresh the page and try again.');
			await this.props.errorStore.reportError(e, 'Error during ShoppingCartStore#checkout in ShoppingCart#handleSubmit');
		}
	}

	render() {
		const { isLoadingBasket,isEmpty } = this.state
		const tabs = [
			{
				name: 'Basket',
				child: false,
				path: '/shoppingcart'
			},
		];
		return (
			<Fragment>
				<Menu />
				<Topbar title="Basket" tabs={tabs} sub="View your collected items" tabIndex={0} isChildPath={false} />
				<div className="baskets-container">
					{
						isLoadingBasket ?
							<LoadingSpinnerPage />
							:
							<Fragment>
								<ul className="baskets-list">
									{this.getCartItems()}
								</ul>
								{
									isEmpty?
										(
											<div className="empty-text">
												<Typography variant="title" className="text">
													There Is Nothing In Your Basket
												</Typography>
											</div>
										)
										:
										(
											<React.Fragment>
												<div className="basket-total-purchase">Request Total: ${this.props.shoppingCartStore.totalCost.toFixed(2)}</div>
												<div className="button-submit">
													<Button onClick={this.handleSubmit}>
														{(this.props.shoppingCartStore.shoppingCart.length === 1? 'Request Item': 'Request All')}
													</Button>
												</div>
											</React.Fragment>
										)
								}
							</Fragment>
					}
				</div>
			</Fragment>

		)
	}
}

export default withRouter(ShoppingCart)