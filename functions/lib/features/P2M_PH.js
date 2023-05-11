const { sendTextMessage, sendButtonTemplate, sendQuickReplies } = require('../service/messenger')
const { getPaymentList } = require('../service/paymentList')
const { getPaymentDetail } = require('../service/paymentDetail')
const { triggerConfirmationFlow } = require('../service/triggerConfirmationFlow')
const { debug, logger } = require('../logger')
const { createInvoice, listInvoice } = require('../intgrations/invoice/p2m_ph')

const { genOrderID } = require('../service/database')

exports.invoiceAPIPHMessageHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const message = event.message

    console.log("PH Message received")
    if (message.text.toString().startsWith("#order")) {
        await createOrderHandler(recipientID, senderID)
    }

    if (message.text.toString().startsWith("#list")) {
        await sendTextMessage(recipientID, senderID, "Not implemented")
    }

    if (message.text.toString().startsWith("#help")) {
        await helpHandler(recipientID, senderID)
    }

    if (message.text.toString().startsWith("#product")) {
        await sendTextMessage(recipientID, senderID, "Not implemented")
    }

    if (message.text.toString().startsWith("#cancel")) {
        await sendTextMessage(recipientID, senderID, "Not implemented")
    }

    if (message.text.toString().startsWith("#complete")) {
        await sendTextMessage(recipientID, senderID, "Not implemented")
    }

    if (message.text.toString().startsWith("#complete")) {
        await sendTextMessage(recipientID, senderID, "Not implemented")
    }

}

exports.invoiceAPIPHPostbackHook = async (event) => {
    const senderID = event.sender.id
    const recipientID = event.recipient.id
    const postback = event.postback

    if (postback.payload == 'P2M_PH_CREATE_ORDER') {
        await createOrderHandler(recipientID, senderID)
    }

    if (postback.payload == 'P2M_PH_CANCEL_ORDER') {
        //await sendTextMessage(recipientID, senderID, `Fetching payment detail for ${payment_id}`)
        //await getPaymentDetail(recipientID, senderID, payment_id)
        await sendTextMessage(recipientID, senderID, "Not implemented")
    }

    if (postback.payload == 'P2M_PH_COMPLETE_ORDER') {
        //await sendTextMessage(recipientID, senderID, `Fetching payment detail for ${payment_id}`)
        //await getPaymentDetail(recipientID, senderID, payment_id)
        await sendTextMessage(recipientID, senderID, "Not implemented")
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

const createOrderHandler = async (recipientID, senderID) => {
    const order_id = await genOrderID(recipientID)

    const product_items = [{
        external_id: "A20",
        name: "Pokemon mousepad",
        quantity: 1,
        description: "Red and blue Pokemon mousepad.",
        currency_amount: {
            amount: "50.0",
            currency: "PHP"
        }
    }]

    const features = {
        "enable_messaging": true,
        "enable_product_item_removal": false,
        "allowed_payment_methods": ["hpp_payment_link"]
    }

    await createInvoice(recipientID, senderID, order_id.toString().padStart(5, '0'), "Test", product_items, null, null, null)
}
