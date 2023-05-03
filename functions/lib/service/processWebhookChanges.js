const functions = require('firebase-functions');
const fetch = require('node-fetch');
const { sendOrderCTA, sendQuickReplies, sendTextMessage, sendMessageTemplate } = require('./messenger')
const { getSessionData, getOrderData } = require('./session')
const PAGE_ID = functions.config().warp.facebook.page_id;
const ACCESS_TOKEN = functions.config().warp.facebook.access_token;
const { getPageConfig } = require('../context')
const { debug, logger } = require('../logger')

const { bankslipDetectionChangesHook } = require('../features/BankSlipDetection')

exports.processWebhookChanges = async (change) => {
    const page_id = change.value.page_id ?? ''
    const pages_config = getPageConfig(page_id);

    // Bank slip detection api feature
    if (pages_config && pages_config.features.slip_detection_api === 'true' && change.field === 'invoice_access_bank_slip_events') {
        await bankslipDetectionChangesHook(change)
    }
}