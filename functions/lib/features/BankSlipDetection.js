const { sendTextMessage, sendQuickReplies } = require('../service/messenger')
const { getPaymentList } = require('../service/paymentList')
const { getPaymentDetail } = require('../service/paymentDetail')
const { triggerConfirmationFlow } = require('../service/triggerConfirmationFlow')
const { debug, logger } = require('../logger')

exports.bankslipDetectionChangesHook = async (change) => {
    if (change.value.event === 'bank_slip_detected') {
        debug('BANK SLIP DETECTED', change)

        const message = "We seen bank slip attached to this chat with followin data:\n" +
            "Time: " + change.value.timestamp + "\n" +
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
                payload: `YES_RETRY_CONFIRMATION:${change.value.media_id}`
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
        debug('BANK SLIP VERIFIED, PAYMENT DETAILS', change.value.payment)
        debug('BANK SLIP VERIFIED, PAYMENT METADATA', change.value.payment.metadata)
        debug('BANK SLIP VERIFIED, PAYMENT VALIDATION INFO', change.value.payment.metadata.bank_slip.validation_status)

        const message = "Your payment verified, This is your payment information:\n" +
            "Time: " + change.value.timestamp + "\n" +
            "Buyer ID: " + change.value.buyer_id + "\n" +
            "Page ID: " + change.value.page_id + "\n" +
            "Event: " + change.value.event + "\n" +
            "Payment Method: " + change.value.payment.payment_method + "\n" +
            "Payment amount: " + `${change.value.payment.payment_amount.amount} ${change.value.payment.payment_amount.currency}` + "\n" +
            "Transaction ID: " + change.value.payment.metadata.bank_slip.bank_transfer_id + "\n" +
            "Transaction ID: " + change.value.payment.metadata.bank_slip.transaction_time + "\n" +
            "Payment Validation: " + change.value.payment.metadata.bank_slip.validation_status + "\n" +
            "Sender Info: " + `${change.value.payment.metadata.bank_slip.sender_bank_code} - ${change.value.payment.metadata.bank_slip.sender_bank_account_id} - ${change.value.payment.metadata.bank_slip.sender_name}` + "\n" +
            "Receiver Info: " + `${change.value.payment.metadata.bank_slip.receiver_bank_code} - ${change.value.payment.metadata.bank_slip.receiver_bank_account_id} - ${change.value.payment.metadata.bank_slip.receiver_name}` + "\n"

        await sendTextMessage(change.value.page_id, change.value.payment.buyer_id, message)
    }
}

exports.bankslipDetectionPostbackHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const postback = event.postback

    if (postback.payload.startsWith('BANK_SLIP_DETAIL:')) {
        const [keyword, payment_id] = postback.payload.toString().split(':')
        console.log(postback.payload, keyword, payment_id)
        if (payment_id !== undefined && keyword == 'BANK_SLIP_DETAIL') {
            await sendTextMessage(recipientID, senderID, `Fetching payment detail for ${payment_id}`)
            await getPaymentDetail(recipientID, senderID, payment_id)
        }
    }
}

exports.bankslipDetectionQuickReplyHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const quickReplyPayload = event.message.quick_reply.payload

    console.log(quickReplyPayload)

    if (quickReplyPayload.startsWith('YES_RETRY_CONFIRMATION:')) {
        const [keyword, payment_id] = quickReplyPayload.toString().split(':')
        await sendTextMessage(recipientID, senderID, `Triggering confimation flow for ${payment_id}`)
        await triggerConfirmationFlow(recipientID, senderID, payment_id)
    }

    if (quickReplyPayload === 'NO_RETRY_CONFIRMATION') {
        await sendTextMessage(recipientID, senderID, "Thankyou we valued your opinions. Good day !")
    }
}

exports.bankslipDetectionMessageHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const message = event.message

    debug("message", message)

    if (message.text.toString().startsWith("#payment")) {
        console.log("test")
        console.log(recipientID, senderID)
        await getPaymentList(recipientID, senderID)
    }
}