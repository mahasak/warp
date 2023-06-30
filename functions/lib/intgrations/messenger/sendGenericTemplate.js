
const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { callSendAPI } = require('./callSendAPI')

exports.sendGenericTemplate = async (context, page_id, recipientId, elements) => {
    logger.info(`[messenger] Sending generic message to PSID: ${recipientId}, page: ${page_id}`)

    const payload = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        }
    }

    await callSendAPI(context, page_id, payload)
}