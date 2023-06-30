const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../../intgrations/messenger')
const { getPaymentList } = require('../../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../../intgrations/P2MLitePH')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../../shared/products')

exports.cancelOrderHandler = async (context, recipientID, senderID) => {
    const currentOrder = await getCurrentOrderId(senderID)

    if (currentOrder && currentOrder.invoice_id && currentOrder.invoice_id != 0) {
        const result = await cancelInvoice(recipientID, senderID, currentOrder.invoice_id)
        if (result === false) {
            await sendTextMessage(context, recipientID, senderID, `Failed to cancel order ID [${currentOrder.order_id}]/invoice ID [${currentOrder.invoice_id}]`)
        } else {
            await sendTextMessage(context, recipientID, senderID, `Successfully cancel order ID [${currentOrder.order_id}]/invoice ID [${currentOrder.invoice_id}]`)
        }
    } else {
        await sendTextMessage(context, recipientID, senderID, "No current active order")
    }
}