const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../intgrations/messenger')
const { getPaymentList } = require('../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../intgrations/P2MLitePH')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../shared/products')
const { createOrderHandler ,cancelOrderHandler ,completeOrderHandler , editOrderHandler , helpHandler , listProductHandler } = require('./handlers')

exports.P2MLitePHPostbackHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const postback = event.postback

    if (postback.payload == 'P2M_PH_HELP') {
        await helpHandler(recipientID, senderID)
    }

    if (postback.payload == 'P2M_PH_LIST_PRODUCT') {
        await listProductHandler(recipientID, senderID)
    }

    if (postback.payload == 'P2M_PH_CREATE_ORDER') {
        await createOrderHandler(recipientID, senderID, default_product_items, defaultAdditionalAmount)
    }

    if (postback.payload == 'P2M_PH_CANCEL_ORDER') {
        await cancelOrderHandler(recipientID, senderID)
    }

    if (postback.payload == 'P2M_PH_COMPLETE_ORDER') {
        await completeOrderHandler(recipientID, senderID)
    }

    if (postback.payload.startsWith('P2M_PH_ADD_TO_ORDER')) {
        const [keyword, item_id] = postback.payload.toString().split(':')
        await editOrderHandler(recipientID, senderID, [item_id])
    }
}