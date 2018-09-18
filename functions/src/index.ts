import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as AWS from 'aws-sdk';
var moment = require('moment-timezone');
import MessageBuilder from './MessageBuilder';

var defaultApp = admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

AWS.config.update({
  accessKeyId: functions.config().aws.access_key_id,
  secretAccessKey: functions.config().aws.secret_access_key,
  region: 'us-east-1'
})

const REQUESTS_LINK = '/request'
const ACTIVES_LINK = '/active'
const COMPLETED_LINK = '/completed'
const INVOICE_LINK = '/history'
const DEALS_LINK = '/deals'
const PRODUCE_LINK = '/shelf'

const CC_EMAIL = 'transaction@getfreshspired.com'
const REPLY_TO_EMAIL = 'help@getfreshspired.com'

const createNotification = (subject, message, link = null, pictureURL = null) => {
    let notification = {
        subject: subject,
        message: message,
        link: link,
        pictureURL: pictureURL,
        read: false,
        timestamp: +(new Date())
    }
    return notification;
}

const getEmailAddress = async (uid) => {
    let snapshot = await db.collection('users').doc(uid).get();
    return snapshot.get('email');
}

const sendEmailToAddress = async (subject, message, emailAddress) => {
    try {
        var params = {
            Destination: { /* required */
            CcAddresses: [
                CC_EMAIL,
                /* more items */
            ],
            ToAddresses: [
                emailAddress,
                /* more items */
            ]
            },
            Message: { /* required */
            Body: { /* required */
                Html: {
                Charset: "UTF-8",
                Data: message //"HTML_FORMAT_BODY"
                },
                Text: {
                Charset: "UTF-8",
                Data: message //"TEXT_FORMAT_BODY"
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
            },
            Source: 'no-reply@freshspire.io', /* required */
            ReplyToAddresses: [
                REPLY_TO_EMAIL,
            /* more items */
            ],
        }; 
        
        let data = await new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
        console.log('sendEmail: Sent message to ' + emailAddress, data);
        return true;
    }
    catch (e) {
        console.error(`Failed to send email to ${emailAddress}`, e);
        return false;
    }
}

const sendEmail = async (subject, message, recipientUID) => {
    try {
        let emailAddress = await getEmailAddress(recipientUID);
        var params = {
            Destination: { /* required */
            CcAddresses: [
                CC_EMAIL,
                /* more items */
            ],
            ToAddresses: [
                emailAddress,
                /* more items */
            ]
            },
            Message: { /* required */
            Body: { /* required */
                Html: {
                Charset: "UTF-8",
                Data: message //"HTML_FORMAT_BODY"
                },
                Text: {
                Charset: "UTF-8",
                Data: message //"TEXT_FORMAT_BODY"
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
            },
            Source: 'no-reply@freshspire.io', /* required */
            ReplyToAddresses: [
                REPLY_TO_EMAIL,
            /* more items */
            ],
        }; 
        
        let data = await new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
        console.log('sendEmail: Sent message to ' + emailAddress, data);
        return true;
    }
    catch (e) {
        console.error(`Failed to send email to ${recipientUID}`, e);
        return false;
    }
}

exports.createOrder = functions.firestore.document('orders/{orderID}').onCreate( async (snap, context) => {
    const order = snap.data();
    let sellerUID = order['sellerUID'];
    try {
        let buyerSnapshot = await db.collection('businesses').doc(order['buyerUID']).get();
        let buyer = buyerSnapshot.data();
        let dealSnapshot = await db.collection('deals').doc(order['dealID']).collection('versions').doc(order['dealVersion'] + '').get();
        let deal = dealSnapshot.data();
        let picURL;
        if (deal.pictures && deal.pictures.length !== 0) {
            let picID = deal.pictures[0];
            let picSnapshot = await db.collection('deal_pictures').doc(picID).get();
            picURL = picSnapshot.get('url');
        }
        order.deal = deal;
        let subject =  `You have a new request from ${buyer['name']}!`
        let notificationMessage = `${buyer['name']} has requested ${deal['name']}!`
        let emailMessage = (new MessageBuilder())
                                .addCustom(`${buyer['name']} has put in the following request.`)
                                .addOrderInfo(order)
                                .addBuyerContactInfo(buyer)
                                .addAppLink()
                                .getMessage();
        let notification = createNotification(subject, notificationMessage, REQUESTS_LINK, picURL);
        await db.collection('sessions').doc(sellerUID).collection('notifications').add(notification)
        console.log('createOrder: Notification created for ' + sellerUID);
        await sendEmail(subject, emailMessage, sellerUID);
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
    
    
    // TODO: enable push notifications with the code below
    // TODO: send out emails
    /*
    db.collection('sessions').doc(sellerUID).get()
      .then( (sessionSnap) => {
        if (!sessionSnap.exists) {
          return;
        }
        
        let token = sessionSnap.get('pushToken');
        if (!token) {
          return;
        }
        let message = {
          notification: {
            title: '$GOOG up 1.43% on the day',
            body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
          },
          webpush: {
            notification: {
              title: '$GOOG up 1.43% on the day',
              body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
              icon: 'https://my-server/icon.png'
            }
          },
          token: token
        }
        admin.messaging().send(message)
          .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
          })
          .catch((error) => {
            console.log('Error sending message:', error);
          });
          
      })
      .catch( (error) => {
        console.log(error);
      })
      */
    
});

exports.createDeal = functions.firestore.document('deals/{dealID}').onCreate( async (snap, context) => {
    const dealInfo = snap.data();
    const sellerUID = dealInfo.uid;
    const sellerSnapshot = await db.collection('businesses').doc(sellerUID).get();
    const seller = sellerSnapshot.data();
    const dealSnapshot = await db.collection('deals').doc(snap.id).collection('versions').doc(dealInfo.currentVersion + '').get();
    const deal = dealSnapshot.data();
    let picURL;
    if (deal.pictures && deal.pictures.length !== 0) {
        let picID = deal.pictures[0];
        let picSnapshot = await db.collection('deal_pictures').doc(picID).get();
        picURL = picSnapshot.get('url');
    }
    const notification = createNotification('New item for sale!', `${seller.name} has added "${deal.name}" for sale.`, PRODUCE_LINK, picURL);
    const emailSubject = `${seller.name} has added "${deal.name}" for sale!`
    const emailMessage = (new MessageBuilder())
                            .addCustom(`${seller.name} has added a new item for sale!`)
                            .addDetailedDealInfo(deal)
                            .addPictureURL(picURL, 'Picture of ' + deal.name)
                            .addSellerContactInfo(seller)
                            .addProduceLink()
                            .getMessage();

    // Get a list of buyers corresponding to the seller
    let query = db.collection('client_relationships').where('sellerUID', '==', sellerUID);
    let dataSnapshot = await query.get();
    let buyerUIDs = dataSnapshot.docs.map( (doc) => {
        return doc.data()['buyerUID'];
    });
    /* TODO: enable this
    for (let i = 0; i < buyerUIDs.length; i++) {
        let buyerUID = buyerUIDs[i];
        await db.collection('sessions').doc(buyerUID).collection('notifications').add(notification);
        await sendEmail(emailSubject, emailMessage, buyerUID);
    }
    */
    await sendEmailToAddress(emailSubject, emailMessage, 'matt@getfreshspired.com');
});

exports.updateDeal = functions.firestore.document('deals/{dealID}').onUpdate( async (change, context) => {
    let oldDeal = change.before.data();
    let newDeal = change.after.data();
    let picURL;
    let dealSnapshot = await db.collection('deals').doc(change.after.id).collection('versions').doc(newDeal.currentVersion + '').get();
    let deal = dealSnapshot.data();
    if (deal.pictures && deal.pictures.length !== 0) {
        let picID = deal.pictures[0];
        let picSnapshot = await db.collection('deal_pictures').doc(picID).get();
        picURL = picSnapshot.get('url');
    }
    if (oldDeal.archived === false && newDeal.archived === true) {
        let recipient = oldDeal['uid'];
        let subject = `${deal.name} removed`
        let notificationMessage, emailMessage;
        if (deal.quantity <= 0) {
            notificationMessage = `${deal.name} has no quantity remaining and has been removed from your inventory`;
            emailMessage = (new MessageBuilder())
                            .addCustom(`${deal.name} has no quantity remaining. We have removed the item from your inventory.<br>`)
                            .addDealInfo(deal)
                            .addAppLink()
                            .getMessage();
        }
        else {
            notificationMessage = `${deal.name} has been removed from your inventory`;
            emailMessage = (new MessageBuilder())
                            .addCustom(`${deal.name} has been removed from your inventory.<br>
                                        This could be due to several reasons, including<br>
                                        -The deal has expired<br>
                                        -There is no quantity left<br>
                                        -You have manually removed the deal<br>`)
                            .addDealInfo(deal)
                            .addAppLink()
                            .getMessage();
        }
        let notification = createNotification(subject, notificationMessage, DEALS_LINK, picURL);
        await db.collection('sessions').doc(recipient).collection('notifications').add(notification);
        await sendEmail(subject, emailMessage, recipient);
    }
})

exports.updateOrder = functions.firestore.document('orders/{orderID}').onUpdate( async (change, context) => {
    // TODO: add deal specific details and fields in the notification
    let newOrder = change.after.data();
    let oldOrder = change.before.data();
    let notifications = [];
    let dealSnapshot = await db.collection('deals').doc(oldOrder['dealID']).collection('versions').doc(oldOrder['dealVersion'] + '').get();
    let deal = dealSnapshot.data();
    let buyerSnapshot = await db.collection('businesses').doc(oldOrder['buyerUID']).get();
    let buyer = buyerSnapshot.data();
    let sellerSnapshot = await db.collection('businesses').doc(oldOrder['sellerUID']).get();
    let seller = sellerSnapshot.data();
    var recipient, subject, notificationMessage, emailMessage;
    let order = oldOrder;
    order.deal = deal;
    let picURL;
    if (deal.pictures && deal.pictures.length !== 0) {
        let picID = deal.pictures[0];
        let picSnapshot = await db.collection('deal_pictures').doc(picID).get();
        picURL = picSnapshot.get('url');
    }
    if (newOrder['status'] !== oldOrder['status']) { 
        switch (newOrder['status']) {
            case 'accepted':
                // Update the quantity available in the deal now
                let dealInfoSnapshot = await db.collection('deals').doc(order.dealID).get();
                let dealInfo = dealInfoSnapshot.data();
                let version = dealInfo.currentVersion;
                version++;
                order.deal.quantity -= order.quantityRequested;
                await db.collection('deals').doc(order.dealID).collection('versions').doc(version + '').set(order.deal);
                let updates = {
                    currentVersion: version
                }
                if (order.deal.quantity <= 0) {
                    updates['archived'] = true;
                    console.log('Archiving deal');
                    console.log(dealInfo);
                    console.log(updates);
                    console.log(order);
                }
                await db.collection('deals').doc(order.dealID).update(updates);

                recipient = oldOrder['buyerUID'];
                subject = 'Request accepted!'
                notificationMessage = `${seller.name} has accepted your request for ${deal.name}!`;
                emailMessage = (new MessageBuilder())
                                    .addCustom(`${seller.name} has accepted your request for ${deal.name}!`)
                                    .addOrderInfo(order)
                                    .addSellerContactInfo(seller)
                                    .addAppLink()
                                    .getMessage();
                notifications.push({recipient, subject, notificationMessage, link: ACTIVES_LINK, emailMessage});
                break;
            case 'declined':
                recipient = oldOrder['buyerUID'];
                subject = 'Request declined'
                notificationMessage = `${seller.name} has declined your request for ${deal.name}.`;
                emailMessage = (new MessageBuilder)
                                    .addCustom(`${seller.name} has declined your request for ${deal.name}.`)
                                    .addOrderInfo(order)
                                    .addSellerContactInfo(seller)
                                    .addAppLink()
                                    .getMessage();
                notifications.push({recipient, subject, notificationMessage, link: REQUESTS_LINK, emailMessage});
                break;
            case 'completed':
                recipient = oldOrder['buyerUID'];
                subject = 'Order completed'
                notificationMessage = `Your order for ${deal.name} has been marked as completed.`;
                emailMessage = (new MessageBuilder())
                                    .addCustom(`Your order for ${deal.name} has been marked as completed.`)
                                    .addOrderInfo(order)
                                    .addSellerContactInfo(seller)
                                    .addAppLink()
                                    .getMessage();
                notifications.push({recipient, subject, notificationMessage, link: COMPLETED_LINK, emailMessage});

                recipient = oldOrder['sellerUID'];
                subject = 'Order completed'
                notificationMessage = `Your order for ${deal.name} has been marked as completed.`;
                emailMessage = (new MessageBuilder())
                                    .addCustom(`Your order for ${deal.name} has been marked as completed.`)
                                    .addOrderInfo(order)
                                    .addBuyerContactInfo(buyer)
                                    .addAppLink()
                                    .getMessage();
                notifications.push({recipient, subject, notificationMessage, link: COMPLETED_LINK, emailMessage});
                break;
            case 'cancelled':
                recipient = oldOrder['buyerUID'];
                subject = 'Order cancelled'
                notificationMessage = `Your order for ${deal.name} has been cancelled.`;
                emailMessage = (new MessageBuilder())
                                    .addCustom(`Your order for ${deal.name} has been cancelled.`)
                                    .addOrderInfo(order)
                                    .addSellerContactInfo(seller)
                                    .addAppLink()
                                    .getMessage();
                notifications.push({recipient, subject, notificationMessage, link: REQUESTS_LINK, emailMessage});

                recipient = oldOrder['sellerUID'];
                subject = 'Order cancelled'
                notificationMessage = `Your order for ${deal.name} has cancelled.`;
                emailMessage = (new MessageBuilder())
                                    .addCustom(`Your order for ${deal.name} has been cancelled.`)
                                    .addOrderInfo(order)
                                    .addBuyerContactInfo(buyer)
                                    .addAppLink()
                                    .getMessage();
                notifications.push({recipient, subject, notificationMessage, link: REQUESTS_LINK, emailMessage});
                break;
            default:
                break;
        }
    }
    if (newOrder['paymentStatus'] !== oldOrder['paymentStatus']) {
        recipient = oldOrder['sellerUID'];
        subject = 'Payment Completed'
        notificationMessage = `${deal.name} has been marked as paid.`;
        emailMessage = (new MessageBuilder())
                                    .addCustom(`${deal.name} has been marked as paid.`)
                                    .addOrderInfo(order)
                                    .addBuyerContactInfo(buyer)
                                    .addAppLink()
                                    .getMessage();
        notifications.push({recipient, subject, notificationMessage, link: ACTIVES_LINK, emailMessage});

        recipient = oldOrder['buyerUID'];
        subject = 'Payment Completed'
        notificationMessage = `${deal.name} has been marked as paid.`;
        emailMessage = (new MessageBuilder())
                                    .addCustom(`${deal.name} has been marked as paid.`)
                                    .addOrderInfo(order)
                                    .addSellerContactInfo(seller)
                                    .addAppLink()
                                    .getMessage();
        notifications.push({recipient, subject, notificationMessage, link: ACTIVES_LINK, emailMessage});
    }
    if (newOrder['exchangeStatus'] !== oldOrder['exchangeStatus']) {
        recipient = oldOrder['buyerUID'];
        let exchangePastTense = (order.exchange === 'delivery' ? 'delivered' : 'picked up');
        subject = order.exchange.replace(/^\w/, c => c.toUpperCase()) + ' Completed'
        notificationMessage = `${deal.name} has been marked as ` + exchangePastTense;
        emailMessage = (new MessageBuilder())
                                    .addCustom(`${deal.name} has been marked as ` + exchangePastTense)
                                    .addOrderInfo(order)
                                    .addSellerContactInfo(seller)
                                    .addAppLink()
                                    .getMessage();
        notifications.push({recipient, subject, notificationMessage, link: ACTIVES_LINK, emailMessage});

        recipient = oldOrder['sellerUID'];
        emailMessage = (new MessageBuilder())
                                    .addCustom(`${deal.name} has been marked as ` + exchangePastTense)
                                    .addOrderInfo(order)
                                    .addBuyerContactInfo(buyer)
                                    .addAppLink()
                                    .getMessage();
        notifications.push({recipient, subject, notificationMessage, link: ACTIVES_LINK, emailMessage});
    }
    if (newOrder.status !== 'completed' && newOrder.exchangeStatus && newOrder.paymentStatus) {
        await db.collection('orders').doc(change.after.id).update({status: "completed"});
        // This will trigger another update that will call the above code to send an email
    }
    let promises = [];
    for (let i = 0; i < notifications.length; i++) {
        recipient = notifications[i].recipient;
        subject = notifications[i].subject;
        notificationMessage = notifications[i].notificationMessage;
        let link = notifications[i].link;
        emailMessage = notifications[i].emailMessage;
        let notification = createNotification(subject, notificationMessage, link, picURL);
        await db.collection('sessions').doc(recipient).collection('notifications').add(notification);
        await sendEmail(subject, emailMessage, recipient);
    }
    return true;
});

exports.removeExpiredDeals = functions.https.onRequest( async (req, res) => {
    let querySnapshot = await db.collection('deals').where('archived', '==', false).get();
    if (querySnapshot.empty) {
        res.status(200).end();
        return Promise.resolve(false);
    }
    let dealInfoSnapshots = querySnapshot.docs;
    await Promise.all(dealInfoSnapshots.map( async (dealInfoSnapshot) => {
        let dealInfo = dealInfoSnapshot.data();
        dealInfo['id'] = dealInfoSnapshot.id;
        let dealSnapshot = await db.collection('deals').doc(dealInfo['id']).collection('versions').doc(dealInfo['currentVersion'] + '').get();
        let deal = dealSnapshot.data();
        deal['id'] = dealInfo['id'];

        let picURL;
        if (deal.pictures && deal.pictures.length !== 0) {
            let picID = deal.pictures[0];
            let picSnapshot = await db.collection('deal_pictures').doc(picID).get();
            picURL = picSnapshot.get('url');
        }
        
        let dealMoment = moment(deal['useByDate']);
        let dealTimestamp = dealMoment.unix();
        let today = moment().tz("America/New_York").format('YYYY-MM-DD');
        let currentMoment = moment(today);
        let currentTimestamp = currentMoment.unix();
        if (currentTimestamp > dealTimestamp) {
            // Archive the deal
            let dbPromise = db.collection('deals').doc(deal['id']).update({archived: true});
            let subject = `${deal.name} has expired.`
            let message = (new MessageBuilder())
                            .addCustom(`Your inventory item of ${deal.name} has past the use by date ${moment(deal.useByDate).format('MM-DD-YYYY')} that you have listed.  We have removed the item for you.`)
                            .addDealInfo(deal)
                            .addAppLink()
                            .getMessage();
            let emailPromise = sendEmail(subject, message, dealInfo['uid']);
            let notification = createNotification(subject, `${deal.name} has past the listed use by date ${moment(deal.useByDate).format('MM-DD-YYYY')} and has been removed.`, DEALS_LINK, picURL);
            let notificationPromise = db.collection('sessions').doc(dealInfo['uid']).collection('notifications').add(notification);
            console.log('Removed expired deal ' + deal['id']);
            return Promise.all([dbPromise, emailPromise, notificationPromise]);
        }
        return Promise.resolve();
    }));
    res.status(200).end();
    return Promise.resolve(true);
});