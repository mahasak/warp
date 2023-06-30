const functions = require('firebase-functions');
const { genContext, getPageConfig } = require('./lib/context')
const { sendTextMessage, markSeen } = require('./lib/intgrations/messenger')

const { greetCommand } = require('./lib/commands/greetCommand')

const Pipeline = require('./lib/pipeline')
const PAGE_IDS = functions.config().warp.facebook.page_id;

const isPageID = (page_id) => PAGE_IDS.includes(page_id)

const { bankslipDetectionQuickReplyHook, bankslipDetectionPostbackHook, bankslipDetectionMessageHook } = require('./lib/features/BankSlipDetection')
const { P2MLitePHMessageHook, P2MLitePHPostbackHook } = require('./lib/features/P2MLitePH')
const { debug, logger } = require('./lib/logger')

exports.processWebhookMessages = async (context, event) => {
  if (event.message) {
    await receivedMessage(context, event)
  } else if (event.delivery) {
    receivedDeliveryConfirmation(context, event)
  } else if (event.postback) {
    receivedPostback(context, event)
  } else if (event.read) {
    receivedMessageRead(context, event)
  } else if (event.account_linking) {
    receivedAccountLink(context, event)
  } else {
    logger.error(`Webhook received unknown messagingEvent: ${event}`)
  }
}

const receivedPostback = async (context, event) => {
  const senderID = event.sender.id
  const recipientID = event.recipient.id
  const postback = event.postback

  // PSID not in page id list, process as user messages
  if (!isPageID(senderID)) {
    const pages_config = getPageConfig(recipientID);

    if (pages_config.features.p2m_ph === "true") {
      context.country = 'PH'
      await P2MLitePHPostbackHook(context, event)
    }

    if (pages_config.features.slip_detection_api === 'true') {
      context.country = 'TH'
      await bankslipDetectionPostbackHook(context, event)
    }

  }
}

const receivedMessage = async (context, event) => {
  const senderID = event.sender.id
  const recipientID = event.recipient.id
  const message = event.message
  const pipeline = Pipeline()

  // debug('Incoming event', event)
  // debug('Incoming message', message)

  // PSID not in page id list, process as user messages
  if (!isPageID(senderID)) {
    // await markSeen(recipientID, senderID)
    const ctx = genContext()
    ctx.message = message
    ctx.pageScopeID = senderID
    ctx.pageID = recipientID;
    const pages_config = getPageConfig(recipientID);
    if (message.text) {
      logger.info(`Received TEXT message ${message.mid}`)

      if (pages_config.features.p2m_ph === "true") {
        context.country = 'PH'
        await P2MLitePHMessageHook(context, event)
      }

      if (pages_config.features.pipeline === "true") {
        // pipeline.push(currentOrder)
        // pipeline.push(orderDetail)
        // pipeline.push(addOrder)
        // pipeline.push(createOrder)
        // pipeline.push(orderCommand)
        // pipeline.push(helpCommand)
        // pipeline.push(menuCommand)
        //pipeline.push(greetCommand)

        //await pipeline.execute(ctx)
      }

      if (pages_config.features.slip_detection_api === 'true') {
        context.country = 'TH'
        await bankslipDetectionMessageHook(context, event)
      }
    }

    if (message.is_echo) {
      logger.info(`Received echo for message ${message.mid}`)

    }

    if (message.quick_reply) {
      const quickReplyPayload = message.quick_reply.payload
      logger.info(`Quick reply for message ${message.mid} with payload ${quickReplyPayload}`)

      // Bankslip detection api feature
      if (pages_config && pages_config.features.slip_detection_api === 'true') {
        context.country = 'TH'
        await bankslipDetectionQuickReplyHook(context, event);
      }
    }
  }
}

const receivedDeliveryConfirmation = (context, event) => {
  const delivery = event.delivery
  const messageIDs = delivery.mids
  const watermark = delivery.watermark

  if (messageIDs) {
    messageIDs.forEach((messageID) => {
      logger.info(`Received delivery confirmation for message ID: ${messageID}`)
    })
  }

  logger.info(`All message before ${watermark} were delivered.`)
}

const receivedMessageRead = (context, event) => {
  const watermark = event.read.watermark
  const sequenceNumber = event.read.seq

  logger.info(`Received message read event for watermark ${watermark} and sequence number ${sequenceNumber}`)
}
