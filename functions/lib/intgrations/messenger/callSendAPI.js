const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger, getLogger } = require('../../logger')
const { getPageConfig } = require('../../context')

exports.callSendAPI = async (context, page_id, messageData) => {
  try {
    const pageConfig = getPageConfig(page_id)

    context.service = 'messenger'
    const seqLogger = getLogger(context)

    if (pageConfig === undefined) {
      seqLogger.error(`[messenger] Page ID [${page_id}] not onboarded`)
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
      seqLogger.info(`[messenger] Successfully send message to PSID: ${recipientId} ${messageId !== undefined ? 'messageId:' + messageId : ''}`)
      logger.info(`[messenger] Successfully send message to PSID: ${recipientId} ${messageId !== undefined ? 'messageId:' + messageId : ''}`)
    } else {
      seqLogger.error(`[messenger] Failed to send message to PSID: ${recipientId}`)
      logger.error(`[messenger] Failed to send message to PSID: ${recipientId}`)
    }
  } catch (error) {
    seqLogger.error(`[messenger] Send API error`, error)
    logger.error(`[messenger] Send API error`, error)
  }
}