const { sendTextMessage, sendQuickReplies } = require('../service/messenger')
const { getPaymentList } = require('../../service/paymentList')
const { getPaymentDetail } = require('../../service/paymentDetail')
const { triggerConfirmationFlow } = require('../../service/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')

exports.bankslipDetectionQuickReplyHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const quickReplyPayload = event.message.quick_reply.payload

    if (quickReplyPayload.startsWith('YES_RETRY_CONFIRMATION:')) {
        const [keyword, payment_id] = quickReplyPayload.toString().split(':')
        await sendTextMessage(recipientID, senderID, `Triggering confimation flow for ${payment_id}`)
        await triggerConfirmationFlow(recipientID, senderID, payment_id)
    }

    if (quickReplyPayload === 'NO_RETRY_CONFIRMATION') {
        await sendTextMessage(recipientID, senderID, "Thankyou we valued your opinions. Good day !")
    }
}

