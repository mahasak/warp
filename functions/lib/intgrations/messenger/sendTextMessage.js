const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { callSendAPI } = require('./callSendAPI')

exports.sendTextMessage = async (context, page_id, recipientId, messageText) => {
    logger.info(`[messenger] Sending text message to PSID: ${recipientId}, page: ${page_id}`)

    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    }

    await callSendAPI(context, page_id, messageData)
}
