const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')

exports.callSendAPI = async (page_id, messageData) => {
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


        if (res.ok) {
            logger.info(`[messenger] Successfully send message to PSID: ${recipientId} ${messageId !== undefined ? 'messageId:' + messageId : ''}`)
        } else {
            logger.error(`[messenger] Failed to send message to PSID: ${recipientId}`)
        }
    } catch (error) {
        logger.error(`[messenger] Send API error`, error)
    }
}