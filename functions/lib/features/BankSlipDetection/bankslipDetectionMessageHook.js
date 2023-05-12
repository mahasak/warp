const { sendTextMessage, sendQuickReplies } = require('../../intgrations/messenger')
const { getPaymentList } = require('../../intgrations/BankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/BankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/BankslipDetection/triggerConfirmationFlow')
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
