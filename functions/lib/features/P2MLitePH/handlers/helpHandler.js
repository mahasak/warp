const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../../intgrations/messenger')
const { getPaymentList } = require('../../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../../intgrations/P2MLitePH')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../../shared/products')

exports.helpHandler = async (recipientID, senderID) => {
    const message = "Available commands:\n\n"
        + "#order/#create - create order\n\n"
        + "#product - get product list\n\n"
        + "#order <product_id> - create order with specific product\n\n"
        + "#create <product_id> - create order with specific product\n\n"
        + "#add <product_id> - Cancel last order\r\n"
        + "#cancel - Cancel last order\r\n"
        + "#complete - Mark last order as completed"

    const buttons = [
        {
            "type": "postback",
            "payload": "P2M_PH_CREATE_ORDER",
            "title": "Create Order"
        },
        {
            "type": "postback",
            "payload": "P2M_PH_CANCEL_ORDER",
            "title": "Cancel Last Order"
        }, {
            "type": "postback",
            "payload": "P2M_PH_COMPLETE_ORDER",
            "title": "Complete Last Order"
        }

    ]

    await sendButtonTemplate(recipientID, senderID, message, buttons)
}