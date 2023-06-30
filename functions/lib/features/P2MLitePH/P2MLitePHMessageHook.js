const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../intgrations/messenger')
const { getPaymentList } = require('../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../intgrations/P2MLitePH')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../shared/products')
const { createOrderHandler ,cancelOrderHandler ,completeOrderHandler , editOrderHandler , helpHandler , listProductHandler } = require('./handlers')

exports.P2MLitePHMessageHook = async (context, event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const message = event.message

    if (message.text.toString().startsWith("#order") || message.text.toString().startsWith("#create")) {
        const createCmd = message.text.split(" ");
        const cart = [];

        if (createCmd.length === 1 || createCmd[1] === '' || !isNaN(parseInt(createCmd[1]))) {
            // default order creation
            cart['P1'] = 1
        } else {
            const menuCode = Object.keys(products);

            const items = createCmd[1].toString().split(",")

            for (const itemCode of items) {
                if (menuCode.includes(itemCode.trim())) {
                    const currentCartItems = Object.keys(cart);
                    if (currentCartItems.includes(itemCode)) {
                        cart[itemCode]++
                    } else {
                        cart[itemCode] = 1
                    }
                }
            }
        }

        const productItems = genProductItems(cart);

        await createOrderHandler(context, recipientID, senderID, productItems, defaultAdditionalAmount)
    }

    if (message.text.toString().startsWith("#list")) {
        await sendTextMessage(context, recipientID, senderID, "Not implemented")
    }

    if (message.text.toString().startsWith("#help")) {
        await helpHandler(context, recipientID, senderID)
    }

    if (message.text.toString().startsWith("#product")) {
        await listProductHandler(context, recipientID, senderID)
    }

    if (message.text.toString().startsWith("#cancel")) {
        await cancelOrderHandler(context, recipientID, senderID)
    }

    if (message.text.toString().startsWith("#add")) {

        const addCmd = message.text.split(" ");
        if (addCmd.length == 1) {
            await sendTextMessage(context, recipientID, senderID, "No item specified.")
        } else {
            const items = addCmd[1].toString().split(",")
            await editOrderHandler(context, recipientID, senderID, items)
        }
    }

    if (message.text.toString().startsWith("#complete")) {
        await completeOrderHandler(context, recipientID, senderID)
    }

}