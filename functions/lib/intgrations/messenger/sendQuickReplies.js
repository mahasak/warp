const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { callSendAPI } = require('./callSendAPI')

exports.sendQuickReplies = async (page_id, recipientId, messageText, choices) => {
    logger.info(`[messenger] Sending text message to PSID: ${recipientId}`)

    const payload = {
        recipient: {
            id: recipientId
        },
        messaging_type: "RESPONSE",
        message: {
            text: messageText,
            quick_replies: choices
        }
    }

    await callSendAPI(page_id, payload)
}