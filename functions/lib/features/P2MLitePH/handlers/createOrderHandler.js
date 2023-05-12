const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../../service/messenger')
const { getPaymentList } = require('../../../service/paymentList')
const { getPaymentDetail } = require('../../../service/paymentDetail')
const { triggerConfirmationFlow } = require('../../../service/triggerConfirmationFlow')
const { debug, logger } = require('../../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../../intgrations/p2m_ph/p2m_ph')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../../shared/products')


exports.createOrderHandler = async (recipientID, senderID, product_items, additional_amounts) => {
    const order_id = await genOrderID(recipientID)

    // TODO: Fix this :(
    const features = {
        "enable_messaging": true,
        "enable_product_item_removal": false,
        "allowed_payment_methods": ["hpp_payment_link"]
    }

    await createInvoice(recipientID, senderID, order_id.toString().padStart(5, '0'), "Test", product_items, additional_amounts, null, null)
}