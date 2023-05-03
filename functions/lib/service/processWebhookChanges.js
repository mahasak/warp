const functions = require('firebase-functions');
const fetch = require('node-fetch');
const { sendOrderCTA, sendQuickReplies, sendTextMessage, sendMessageTemplate } = require('./messenger')
const { getSessionData, getOrderData } = require('./session')
const PAGE_ID = functions.config().warp.facebook.page_id;
const ACCESS_TOKEN = functions.config().warp.facebook.access_token;
const {getPageConfig } = require('../context')
const { debug, logger } = require('../logger')

exports.receivedChanges = async (change) => {
    if (change.field === 'invoice_access_bank_slip_events') {
        if(change.value.event === 'bank_slip_detected') {
            debug('BANK SLIP DETECTED', change)

            const message = "We seen bank slip attached to this chat with followin data:\n"+
            "Time: " + change.value.timestamp + "\n" +
            "Message ID:" + change.value.id + "\n" +
            "Media ID: " + change.value.media_id + "\n" +
            "Buyer ID: " + change.value.buyer_id + "\n" +
            "Page ID: " + change.value.page_id + "\n" +
            "Event: " + change.value.event + "\n" 

            await sendTextMessage(change.value.page_id, change.value.buyer_id, message)
        }

        if(change.value.event === 'consent_accepted') {
            debug('CONSENT ACCEPTED', change)
            debug('CONSENT ACCEPTED DETAIL', change.value.payment.metadata)

            const message = "Thank you for confirming your payment, This is your payment information:\n"+
            "Time: " + change.value.timestamp + "\n" +
            "Media ID: " + change.value.media_id + "\n" +
            "Buyer ID: " + change.value.buyer_id + "\n" +
            "Page ID: " + change.value.page_id + "\n" +
            "Event: " + change.value.event + "\n" +
            "Payment Method: " + change.value.payment.payment_method + "\n" +
            "Payment ID: " + change.value.payment.payment_id + "\n" +
            "Payment Validation: " + change.value.payment.metadata.bank_slip.validation_status + "\n" +
            "Payment Slip: " + change.value.payment.metadata.bank_slip.image_url + "\n"
              
            await sendTextMessage(change.value.page_id, change.value.payment.buyer_id, message)
        }
            

        if(change.value.event === 'consent_dismissed') {
            debug('CONSENT DISMISSED', change)
            await sendQuickReplies(change.value.page_id, change.value.buyer_id, "We noticed you have been dismiss payment confirmation.Do you want to retry confirmation flow ?",[
                {
                    content_type: "text",
                    title: "Yes",
                    payload: "YES_RETRY_CONFIRMATION"
                },
                {
                    content_type: "text",
                    title: "No",
                    payload: "NO_RETRY_CONFIRMATION"
                }
            ])
        }

        if(change.value.event === 'bank_slip_verified') {
            debug('BANK SLIP VERIFIED', change)
        }
    }

}