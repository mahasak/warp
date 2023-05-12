const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../service/messenger')
const { getPaymentList } = require('../../intgrations/BankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/BankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/BankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../intgrations/P2MLitePH')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../shared/products')
const { createOrderHandler ,cancelOrderHandler ,completeOrderHandler , editOrderHandler , helpHandler , listProductHandler } = require('./handlers')

exports.P2MLitePHMessageHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const message = event.message

    if (message.text.toString().startsWith("#order") || message.text.toString().startsWith("#create")) {
        const createCmd = message.text.split(" ");
        const cart = [];

        if (createCmd.length === 1 || createCmd[1] === '' || !isNaN(parseInt(createCmd[1]))) {
            // default order creation
            cart['T01'] = 1
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

        await createOrderHandler(recipientID, senderID, productItems, defaultAdditionalAmount)
    }

    if (message.text.toString().startsWith("#list")) {
        await sendTextMessage(recipientID, senderID, "Not implemented")
    }

    if (message.text.toString().startsWith("#help")) {
        await helpHandler(recipientID, senderID)
    }

    if (message.text.toString().startsWith("#product")) {
        await listProductHandler(recipientID, senderID)
    }

    if (message.text.toString().startsWith("#cancel")) {
        await cancelOrderHandler(recipientID, senderID)
    }

    if (message.text.toString().startsWith("#add")) {

        const addCmd = message.text.split(" ");
        if (addCmd.length == 1) {
            await sendTextMessage(recipientID, senderID, "No item specified.")
        } else {
            const items = addCmd[1].toString().split(",")
            await editOrderHandler(recipientID, senderID, items)
        }
    }

    if (message.text.toString().startsWith("#complete")) {
        await completeOrderHandler(recipientID, senderID)
    }

}