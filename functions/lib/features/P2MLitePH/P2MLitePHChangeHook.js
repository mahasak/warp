const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../intgrations/messenger')
const { getPaymentList } = require('../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../intgrations/P2MLitePH')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../shared/products')
const { createOrderHandler ,cancelOrderHandler ,completeOrderHandler , editOrderHandler , helpHandler , listProductHandler } = require('./handlers')

exports.P2MLitePHChangeHook = async (context, change) => {
    debug('CHANGE', change)
    if (change.value.event === 'invoice_access_invoice_change') {
        debug('INVOICE CHANGE', change)

        const message = "We seen invoice updated with following data:\n\n" +
            "⏱️ Time: " + change.value.timestamp + "\n" +
            "🖼️ Media ID: " + change.value.media_id + "\n" +
            "💸 Buyer ID: " + change.value.buyer_id + "\n" +
            "📄 Page ID: " + change.value.page_id + "\n" +
            "📁 Event: " + change.value.event + "\n"

        await sendTextMessage(context, change.value.page_id, change.value.buyer_id, message)
    }

}