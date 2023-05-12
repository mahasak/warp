const { sendTextMessage, sendButtonTemplate, sendGenericTemplate, sendQuickReplies } = require('../../../service/messenger')
const { getPaymentList } = require('../../../intgrations/BankslipDetection/paymentList')
const { getPaymentDetail } = require('../../../intgrations/BankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../../intgrations/BankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../../logger')
const { cancelInvoice, completeInvoice, createInvoice, listInvoice, editInvoice } = require('../../../intgrations/P2MLitePH')

const { genOrderID, getCurrentOrderId, setCurrentOrderId } = require('../../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../../shared/products')


exports.listProductHandler = async (recipientID, senderID) => {
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