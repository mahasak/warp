const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../logger')
const { getPageConfig } = require('../context')
const { sendGenericTemplate } = require('./messenger')
const PAGE_CONFIGS = functions.config().warp.facebook.pages_config;

exports.getPaymentDetail = async (page_id, psid, payment_id) => {
    try {
        const pageConfig = getPageConfig(page_id);
        if (pageConfig === undefined) {
            logger.error(`[messenger] Page ID [${page_id}] not onboarded`)
            return
        }

        const res = await fetch('https://graph.facebook.com/v14.0/' + page_id + '/invoice_access_payments/?payment_id=' + payment_id +'&access_token=' + pageConfig.access_token, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }

        })
        const data = await res.json()
    } catch (error) {
        console.log(error)
    }
}



