import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import Menu from '../../components/Menu'
import Topbar from '../../components/CommonTopBar'
import {LoadingSpinnerPage} from '../../components/LoadingSpinner'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import { List } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Button from '../../components/atomic/Button';
import Divider from '@material-ui/core/Divider';
import moment from 'moment'
import { message } from 'antd'

@inject('invoiceStore', 'errorStore')
@observer
export default class History extends Component {
	state = {
		isLoadingHistory: true,
		history: null
	}

	async componentDidMount() {
		const { invoiceStore } = this.props
		try {
			await invoiceStore.refresh()
			let history = invoiceStore.items;
			this.setState({
				isLoadingHistory: false,
				history
			})
			window.scroll(0, 0);
		}
		catch (e) {
			message.error(e.message);
			await this.props.errorStore.reportError(e, 'Error during invoiceStore#refresh in History#componentDidMount');
		}
	}

	createTableItem = (list) => {
		return list.map((item) => (
			<Tr key={`${item['id']}-history-item`} className="info-container">
				<Td>{item.deal.name}</Td>
				<Td>{item.quantityRequested} {item.deal.quantityUnit}(s)</Td>
				<Td>{item.totalCost.toFixed(2)}</Td>
				<Td> {item.exchange.replace(/^\w/, c => c.toUpperCase())}</Td>
				<Td><Icon color={item.exchangeStatus ? "primary" : "secondary"}>{item.exchangeStatus ? "check" : "close"}</Icon></Td>
				<Td><Icon color={item.paymentStatus ? "primary" : "secondary"}>{item.paymentStatus ? "check" : "close"}</Icon></Td>
			</Tr>
		))
	}

	handleAppeal = () => {
		return;
	}

	getHistoryItems() {
		const { history } = this.state

		if(history.length === 0){
			return (
			  <div className="empty-text">
				<Typography variant="title" className="text">
				  No Records Found
				</Typography>
			  </div>
			)
		}

		return history.map((history) => {
			const { timestamp, id, orders, totalCost, seller, buyer} = history
			return (
				<ExpansionPanel key={`${id}-history-item`} className="table-container">
					<ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>} className="table-summary">
						<Grid container justify="space-between">
							<Grid container item xs={12} sm={6} direction="column" justify="center">
								<Typography  className="md">
									<span className="colored-text">Buyer: </span>  {buyer.name}
								</Typography>
								<Typography  className="md">
									<span className="colored-text">Seller: </span> {seller.name}
								</Typography>
							</Grid>
							<Grid container item xs={12} sm={6} direction="column" justify="center" className="bottom-info">
								<Typography  className="md">
								<span className="colored-text">Date: </span> {moment(timestamp).format("MM/DD/YYYY h:mma")}
								</Typography>
								<Typography className="md">
									<span className="colored-text">ID: </span> {id}
								</Typography>
							</Grid>
						</Grid>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails className="product-list">
						<Table>
							<Thead>
								<Tr>
									<Th>Product</Th>
									<Th>Quantity</Th>
									<Th>Total</Th>
									<Th>Exchange Method</Th>
									<Th>Exchange Status</Th>
									<Th>Payment Status</Th>
								</Tr>
							</Thead>
							<Tbody>
								{this.createTableItem(orders)}
							</Tbody>
						</Table>
						<div className="summary">
						<Grid container justify="space-between">
							<Grid container item xs={12} sm={7} direction="column" justify="center" className="right-bound">
								<Typography  className="sm">
									<span className="colored-text spaced">Subtotal:</span>  ${totalCost.toFixed(2)}
								</Typography>
								<Typography  className="sm">
									<span className="colored-text spaced">Discount:</span> $0.00
								</Typography>
								<Divider/>
								<Typography  className="sm">
								<span className="colored-text spaced">Total:</span> ${totalCost.toFixed(2)}
								</Typography>
							</Grid>
						</Grid>
						</div>
						<Button style={{visibility: 'hidden'}}variant="contained" disabled={true} color="secondary" className="appeal-button" onClick={(e) => this.handleAppeal(e)}>
                            Appeal
                        </Button>
					</ExpansionPanelDetails>
				</ExpansionPanel>
			)
		})
	}

	render() {
		const { isLoadingHistory } = this.state
		// const tabs = [
		// 	{
		// 		name: 'History',
		// 		child: false,
		// 		path: '/history'
		// 	},
		// ];
		return (
			<React.Fragment>
				<Menu />
				<Topbar title="Invoice" sub="View your order receipts" tabIndex={0} isChildPath={false} />
				<div className="historys-container">
					{
						isLoadingHistory ?
							<LoadingSpinnerPage />
							:
							<ul className="historys-list">
								{this.getHistoryItems()}
							</ul>
					}
				</div>
			</React.Fragment>
		)
	}

}