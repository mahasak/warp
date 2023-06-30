const { sendTextMessage, sendQuickReplies } = require('../../intgrations/messenger')
const { getPaymentList } = require('../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')

exports.bankslipDetectionMessageHook = async (context, event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const message = event.message

    debug("message", message)

    if (message.text.toString().startsWith("#payment")) {
        await getPaymentList(context, recipientID, senderID)
    }

    if (message.text.toString().startsWith("#help")) {
        await getPaymentList(context, recipientID, senderID)
    }
}
