const { sendTextMessage, sendButtonTemplate, sendGenericTemplate,sendQuickReplies } = require('../service/messenger')
const { getPaymentList } = require('../service/paymentList')
const { getPaymentDetail } = require('../service/paymentDetail')
const { triggerConfirmationFlow } = require('../service/triggerConfirmationFlow')
const { debug, logger } = require('../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../intgrations/invoice/p2m_ph')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../shared/products')

exports.invoiceAPIPHMessageHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const message = event.message

    if (message.text.toString().startsWith("#order")) {
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

exports.invoiceAPIPHPostbackHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const postback = event.postback

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
        await editOrderHandler(recipientID, senderID, item_id)
    }
}

const helpHandler = async (recipientID, senderID) => {
    const message = "Available commands:\n\n"
        + "#order - create order\n\n"
        + "#product - get product list\n\n"
        + "#order <product_id> - create order with specific product\n\n"
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

const createOrderHandler = async (recipientID, senderID, product_items, additional_amounts) => {
    const order_id = await genOrderID(recipientID)

    // TODO: Fix this :(
    const features = {
        "enable_messaging": true,
        "enable_product_item_removal": false,
        "allowed_payment_methods": ["hpp_payment_link"]
    }

    await createInvoice(recipientID, senderID, order_id.toString().padStart(5, '0'), "Test", product_items, additional_amounts, null, null)
}

const completeOrderHandler = async (recipientID, senderID) => {
    const currentOrder = await getCurrentOrderId(senderID)

    if (currentOrder && currentOrder.invoice_id && currentOrder.invoice_id != 0) {
        const result = await completeInvoice(recipientID, senderID, currentOrder.invoice_id)
        if (result === false) {
            await sendTextMessage(recipientID, senderID, `Failed to mark order ID [${currentOrder.order_id}]/invoice ID [${currentOrder.invoice_id}] as completed`)
        } else {
            await sendTextMessage(recipientID, senderID, `Successfully mark order ID [${currentOrder.order_id}]/invoice ID [${currentOrder.invoice_id}] as completed`)
        }
    } else {
        await sendTextMessage(recipientID, senderID, "No current active order")
    }
}

const cancelOrderHandler = async (recipientID, senderID) => {
    const currentOrder = await getCurrentOrderId(senderID)

    if (currentOrder && currentOrder.invoice_id && currentOrder.invoice_id != 0) {
        const result = await cancelInvoice(recipientID, senderID, currentOrder.invoice_id)
        if (result === false) {
            await sendTextMessage(recipientID, senderID, `Failed to cancel order ID [${currentOrder.order_id}]/invoice ID [${currentOrder.invoice_id}]`)
        } else {
            await sendTextMessage(recipientID, senderID, `Successfully cancel order ID [${currentOrder.order_id}]/invoice ID [${currentOrder.invoice_id}]`)
        }
    } else {
        await sendTextMessage(recipientID, senderID, "No current active order")
    }
}

const editOrderHandler = async (recipientID, senderID, items) => {
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

const listProductHandler = async (recipientID, senderID) => {
    const currentOrder = await getCurrentOrderId(senderID)
    let elements = []
    for (const product in products) {
        const item = {
            title: `${products[product].external_id} - ${products[product].name}`,
            subtitle: `${products[product].description} (${products[product].price} PHP)`,
            buttons: [{
                type: "postback",
                title: "Add to Order",
                payload: `P2M_PH_ADD_TO_ORDER:${products[product].external_id}`
            }]
        }
        elements.push(item)
    }

    sendGenericTemplate(recipientID, senderID, elements)
}