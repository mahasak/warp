const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { callSendAPI } = require('./callSendAPI')

exports.sendOrderCTA = async (context, recipientId, messageText, orderID = 0) => {
    logger.info(`[messenger] Sending Order CTA ${orderID !== 0 ? 'for order ID: ' + orderID : ''} to PSID: ${recipientId}`)

    const order = orderID == 0 ? '568543855056670' : `${orderID}`
    const payload = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: messageText,
                    buttons: [
                        {
                            type: "web_url",
                            url: "https://www.messenger.com",
                            fallback_url: `https://vrich.vrich619.com/o/rR0ls0sLL2?fb_order_id=${order}/`,
                            title: "View Order",
                            messenger_extensions: true,
                            internal_native_url: `https://vrich.vrich619.com/o/rR0ls0sLL2?fb_order_id=${order}`
                        }
                    ]
                }
            }
        }
    }

    await callSendAPI(context, page_id, payload)
}