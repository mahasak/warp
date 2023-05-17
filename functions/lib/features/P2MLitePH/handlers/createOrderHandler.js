const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../../intgrations/messenger')
const { getPaymentList } = require('../../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../../intgrations/P2MLitePH')

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