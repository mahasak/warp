const { sendTextMessage, sendQuickReplies } = require('../service/messenger')
const { debug, logger } = require('../logger')

exports.bankslipDetectionChangesHook = async (change) => {
    if (change.value.event === 'bank_slip_detected') {
        debug('BANK SLIP DETECTED', change)

        const message = "We seen bank slip attached to this chat with followin data:\n" +
            "Time: " + change.value.timestamp + "\n" +
            "Message ID:" + change.value.id + "\n" +
            "Media ID: " + change.value.media_id + "\n" +
            "Buyer ID: " + change.value.buyer_id + "\n" +
            "Page ID: " + change.value.page_id + "\n" +
            "Event: " + change.value.event + "\n"

        await sendTextMessage(change.value.page_id, change.value.buyer_id, message)
    }

    if (change.value.event === 'consent_accepted') {
        debug('CONSENT ACCEPTED', change)
        debug('CONSENT ACCEPTED DETAIL', change.value.payment.metadata)

        const message = "Thank you for confirming your payment, This is your payment information:\n" +
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


    if (change.value.event === 'consent_dismissed') {
        debug('CONSENT DISMISSED', change)
        await sendQuickReplies(change.value.page_id, change.value.buyer_id, "We noticed you have been dismiss payment confirmation.Do you want to retry confirmation flow ?", [
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

    if (change.value.event === 'bank_slip_verified') {
        debug('BANK SLIP VERIFIED', change)
    }
}

exports.bankslipDetectionQuickReplyHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const quickReplyPayload = event.message.quick_reply.payload

    if (quickReplyPayload === 'YES_RETRY_CONFIRMATION') {
        await sendTextMessage(recipientID, senderID, "Sorry, we're unable to do re-confirmation at the moments !")
    }

    if (quickReplyPayload === 'NO_RETRY_CONFIRMATION') {
        await sendTextMessage(recipientID, senderID, "Thankyou we valued your opinions. Good day !")
    }
}