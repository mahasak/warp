const { sendTextMessage, sendQuickReplies } = require('../../intgrations/messenger')
const { getPaymentList } = require('../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')

exports.bankslipDetectionQuickReplyHook = async (context, event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const quickReplyPayload = event.message.quick_reply.payload

    if (quickReplyPayload.startsWith('YES_RETRY_CONFIRMATION:')) {
        const [keyword, payment_id] = quickReplyPayload.toString().split(':')
        await sendTextMessage(context, recipientID, senderID, `Triggering confimation flow for ${payment_id}`)
        await triggerConfirmationFlow(context, recipientID, senderID, payment_id)
    }

    if (quickReplyPayload === 'NO_RETRY_CONFIRMATION') {
        await sendTextMessage(context, recipientID, senderID, "Thankyou we valued your opinions. Good day !")
    }
}

