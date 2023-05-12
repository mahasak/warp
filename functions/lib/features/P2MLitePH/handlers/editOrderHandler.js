const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../../service/messenger')
const { getPaymentList } = require('../../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../../intgrations/p2m_ph/p2m_ph')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../../shared/products')


exports.editOrderHandler = async (recipientID, senderID, items) => {
    const currentOrder = await getCurrentOrderId(senderID)
    if (currentOrder && currentOrder.invoice_id && currentOrder.invoice_id != 0) {
        const result = await editInvoice(recipientID, senderID, currentOrder.invoice_id, items)
        if (result === false) {
            await sendTextMessage(recipientID, senderID, `Failed to update order ID [${currentOrder.order_id}]/invoice ID [${currentOrder.invoice_id}]`)
        } else {
            await sendTextMessage(recipientID, senderID, `Successfully update order ID [${currentOrder.order_id}]/invoice ID [${currentOrder.invoice_id}]`)
        }
    } else {
        await sendTextMessage(recipientID, senderID, "No current active order")
    }
}