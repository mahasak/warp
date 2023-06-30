const functions = require('firebase-functions');
const fetch = require('node-fetch');
const { sendOrderCTA, sendQuickReplies, sendTextMessage, sendMessageTemplate } = require('./lib/intgrations/messenger')
const { getSessionData, getOrderData } = require('./lib/service/session')
const PAGE_ID = functions.config().warp.facebook.page_id;
const ACCESS_TOKEN = functions.config().warp.facebook.access_token;
const { getPageConfig } = require('./lib/context')
const { debug, logger } = require('./lib/logger')

const { bankslipDetectionChangesHook } = require('./lib/features/BankSlipDetection')
const { P2MLitePHChangeHook } = require('./lib/features/P2MLitePH')

exports.processWebhookChanges = async (context, change) => {
    const page_id = change.value.page_id ?? ''
    const pages_config = getPageConfig(page_id);
    debug('INCOMING CHANGE', change)
    // Bank slip detection api feature
    if (pages_config && pages_config.features.slip_detection_api === 'true' && change.field === 'invoice_access_bank_slip_events') {
        //debug('INCOMING CHANGE - BANK SLIP', change)
        context.country = 'TH';
        await bankslipDetectionChangesHook(context, change)
    }

    // P2MLite PH feature
    if (pages_config && pages_config.features.slip_detection_api === 'true' && change.field === 'invoice_access_invoice_change') {
        //debug('INCOMING CHANGE - P2M Lite', change)
        context.country = 'PH';
        await P2MLitePHChangeHook(context, change)
    }
}