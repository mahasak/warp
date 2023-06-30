const { sendTextMessage, sendQuickReplies } = require('../../intgrations/messenger')
const { getPaymentList } = require('../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')

exports.bankslipDetectionPostbackHook = async (context, event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const postback = event.postback

    if (postback.payload.startsWith('BANK_SLIP_DETAIL:')) {
        const [keyword, payment_id] = postback.payload.toString().split(':')
        if (payment_id !== undefined && keyword == 'BANK_SLIP_DETAIL') {
            //await sendTextMessage(recipientID, senderID, `Fetching payment detail for ${payment_id}`)
            await getPaymentDetail(context, recipientID, senderID, payment_id)
        }
    }

    if (postback.payload.startsWith('YES_RETRY_CONFIRMATION:')) {
        const [keyword, payment_id] = postback.payload.toString().split(':')
        await sendTextMessage(context, recipientID, senderID, `Triggering confimation flow for ${payment_id}`)
        await triggerConfirmationFlow(context, recipientID, senderID, payment_id)
    }

    if (postback.payload === 'NO_RETRY_CONFIRMATION') {
        await sendTextMessage(context, recipientID, senderID, "Thankyou we valued your opinions. Good day !")
    }
}