const { sendTextMessage, sendQuickReplies } = require('../../service/messenger')
const { getPaymentList } = require('../../intgrations/BankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/BankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/BankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')

exports.bankslipDetectionPostbackHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const postback = event.postback

    if (postback.payload.startsWith('BANK_SLIP_DETAIL:')) {
        const [keyword, payment_id] = postback.payload.toString().split(':')
        if (payment_id !== undefined && keyword == 'BANK_SLIP_DETAIL') {
            await sendTextMessage(recipientID, senderID, `Fetching payment detail for ${payment_id}`)
            await getPaymentDetail(recipientID, senderID, payment_id)
        }
    }
}