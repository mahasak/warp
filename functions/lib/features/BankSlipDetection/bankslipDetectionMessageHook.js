const { sendTextMessage, sendQuickReplies } = require('../service/messenger')
const { getPaymentList } = require('../../service/paymentList')
const { getPaymentDetail } = require('../../service/paymentDetail')
const { triggerConfirmationFlow } = require('../../service/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')

exports.bankslipDetectionMessageHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const message = event.message

    debug("message", message)

    if (message.text.toString().startsWith("#payment")) {
        await getPaymentList(recipientID, senderID)
    }
}
