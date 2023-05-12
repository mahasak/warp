const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { callSendAPI } = require('./callSendAPI')

exports.sendButtonTemplate = async (page_id, recipientId, message, buttons) => {
    logger.info(`[messenger] Sending button template message to PSID: ${recipientId}, page: ${page_id}`)

    const payload = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: message,
                    buttons: buttons
                }
            }
        }
    }

    await callSendAPI(page_id, payload)
}