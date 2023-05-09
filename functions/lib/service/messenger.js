const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../logger')
const { getPageConfig } = require('../context')

const PAGE_CONFIGS = functions.config().warp.facebook.pages_config;

exports.sendTextMessage = async (page_id, recipientId, messageText) => {
    logger.info(`[messenger] Sending text message to PSID: ${recipientId}, page: ${page_id}`)

    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    }

    await callSendAPI(page_id, messageData)
}

exports.sendGenericTemplate = async (page_id, recipientId, elements) => {
    logger.info(`[messenger] Sending generic message to PSID: ${recipientId}, page: ${page_id}`)

    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type:  "template",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        }
    }

    await callSendAPI(page_id, messageData)
}

exports.sendMessageTemplate = async (page_id, recipientId, template) => {
    logger.info(`[messenger] Sending text message to PSID: ${recipientId}, page: ${page_id}`)

    const messageData = {
        recipient: {
            id: recipientId
        },
        message: template
    }

    await callSendAPI(page_id, messageData)
}

exports.sendQuickReplies = async (page_id, recipientId, messageText, choices) => {
    logger.info(`[messenger] Sending text message to PSID: ${recipientId}`)

    const messageData = {
        recipient: {
            id: recipientId
        },
        messaging_type: "RESPONSE",
        message: {
            text: messageText,
            quick_replies: choices
        }
    }

    await callSendAPI(page_id, messageData)
}

exports.sendOrderCTA = async (recipientId, messageText, orderID = 0) => {
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

    await callSendAPI(page_id, payload)
}

const callSendAPI = async (page_id, messageData) => {
    try {
        const pageConfig = getPageConfig(page_id);
        if (pageConfig === undefined) {
            logger.error(`[messenger] Page ID [${page_id}] not onboarded`)
            return
        }

        const res = await fetch('https://graph.facebook.com/v14.0/' + page_id + '/messages?access_token=' + pageConfig.access_token, {
            method: 'POST',
            body: JSON.stringify(messageData),
            headers: { 'Content-Type': 'application/json' }

        })

        const data = await res.json()
        const recipientId = data.recipient_id
        const messageId = data.message_id

        console.log(data)

        if (res.ok) {
            logger.info(`[messenger] Successfully send message to PSID: ${recipientId} ${messageId !== undefined ? 'messageId:' + messageId : ''}`)
        } else {
            logger.error(`[messenger] Failed to send message to PSID: ${recipientId}`)
        }
    } catch (error) {
        logger.error(`[messenger] Send API error`, error)
    }
}

exports.markSeen = async (page_id, psid) => {
    logger.info(`[messenger] Marking messages as seen for ${psid}`)

    const messageData = {
        recipient: {
            id: psid
        },
        "sender_action": "mark_seen"
    }

    await callSendAPI(page_id, messageData)
}