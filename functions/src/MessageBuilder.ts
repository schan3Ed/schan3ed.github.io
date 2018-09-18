var moment = require('moment-timezone');
export default class MessageBuilder {
    message = '';

    appendMessage(msg) {
        let mb = new MessageBuilder();
        mb.message = this.message;
        mb.message += msg;
        return mb;
    }

    addCustom(msg) {
        return this.appendMessage('<br>' + msg + '<br>');
    }

    addDealInfo(deal) {
        let newMsg = `<br>
                    <b>Item Information:</b><br>
                    Name: ${deal.name} <br>
                    Quantity Available: ${deal.quantity} ${deal.quantityUnit}(s) <br>
                    Price: ${deal.price.toFixed(2)}/${deal.priceUnit} <br>
                    Use by date: ${moment(deal.useByDate).format('MM-DD-YYYY')} <br>`
        return this.appendMessage(newMsg);
    }

    addDetailedDealInfo(deal) {
        let newMsg = `<br>
                    <b>Item Information</b><br>
                    <b>Name:</b> ${deal.name} <br>
                    <b>Quantity Available:</b> ${deal.quantity} ${deal.quantityUnit}(s) <br>
                    <b>Price:</b> ${deal.price.toFixed(2)}/${deal.priceUnit} <br>
                    <b>Use by date:</b> ${moment(deal.useByDate).format('MM-DD-YYYY')} <br>
                    <b>Reason for post:</b> ${deal.reasonForPost.join(', ')} <br>
                    <b>Method of exchange:</b> ${deal.delivery ? (deal.pickup ? 'Delivery and Pickup' : 'Delivery') : (deal.pickup ? 'Pickup' : '')} <br>
                    <b>Notes:</b> ${deal.notes || ''} <br>`
        if (deal.isLocallyGrown) {
            newMsg += '<b> Locally Grown </b> <br>'
        }
        if (deal.isOrganic) {
            newMsg += '<b> Organic </b> <br>'
        }
        return this.appendMessage(newMsg);
    }

    addPictureURL(url, name) {
        if (url) {
            let newMsg = `<br> <img src="${url}" alt="${name}"> <br>`
            return this.appendMessage(newMsg);
        }
        else {
            return this;
        }
        
    }

    addProduceLink() {
        let newMsg = `<br> View this item and more on <a href="https://freshspire.io/shelf">Freshspire</a>. <br>`
        return this.appendMessage(newMsg);
    }

    addOrderInfo(order) {
        let deal = order.deal;
        let newMsg = `<br>
                        <b>Order information:</b><br>
                        Product: ${deal['name']}<br>
                        Quantity Requested: ${order['quantityRequested']} ${deal['quantityUnit']}(s)<br>
                        Need By Date: ${moment(order['needByDate']).format('MM-DD-YYYY')}<br>
                        Method of exchange: ${order['exchange']}<br>
                        Total cost: ${order['totalCost'].toFixed(2)}<br>`
                        return this.appendMessage(newMsg);
    }

    addBuyerContactInfo(buyer) {
        return this.addContactInfo(buyer, 'buyer');
    }

    addContactInfo(entity, entityType) {
        let newMsg = `<br>
                    The ${entityType}'s contact information is<br>
                    ${entity['name']}<br>
                    ${entity['phone']}<br>
                    ${entity['email']}<br>
                    ${entity['streetAddress']}<br>
                    ${entity['city']}, ${entity['state']} ${entity['zipcode']}<br>`
        return this.appendMessage(newMsg);
    }

    addSellerContactInfo(seller) {
        return this.addContactInfo(seller, 'seller');
    }

    addAppLink() {
        let newMsg = `<br> Visit <a href="https://freshspire.io">Freshspire</a> to see more details. <br>`
        return this.appendMessage(newMsg);
    }

    getMessage() {
        return this.message;
    }
}