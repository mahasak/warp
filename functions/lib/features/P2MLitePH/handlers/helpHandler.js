const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../../service/messenger')
const { getPaymentList } = require('../../../service/paymentList')
const { getPaymentDetail } = require('../../../service/paymentDetail')
const { triggerConfirmationFlow } = require('../../../service/triggerConfirmationFlow')
const { debug, logger } = require('../../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../../intgrations/p2m_ph/p2m_ph')

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