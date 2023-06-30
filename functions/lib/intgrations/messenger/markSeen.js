const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { callSendAPI } = require('./callSendAPI')

exports.markSeen = async (context, page_id, psid) => {
    logger.info(`[messenger] Marking messages as seen for ${psid}`)

    const messageData = {
        recipient: {
            id: psid
        },
        "sender_action": "mark_seen"
    }

    await callSendAPI(context, page_id, messageData)
}