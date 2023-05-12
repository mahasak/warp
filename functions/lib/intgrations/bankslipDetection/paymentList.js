const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { sendGenericTemplate } = require('../messenger')
const PAGE_CONFIGS = functions.config().warp.facebook.pages_config;

exports.getPaymentList = async (page_id, psid) => {
    try {
        const pageConfig = getPageConfig(page_id);
        if (pageConfig === undefined) {
            logger.error(`[messenger] Page ID [${page_id}] not onboarded`)
            return
        }

        const res = await fetch('https://graph.facebook.com/v14.0/' + page_id + '/invoice_access_payments?limit=5&buyer_ids=[' + psid + ']&access_token=' + pageConfig.access_token, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }

        })
        const data = await res.json()

        const receiverID = data.data[0].payments[0].buyer_id
        let elements = []
        for (i = 0; i < data.data[0].payments.length; i++) {
            const obj = data.data[0].payments[i]
            const item = {
                title: `Payment ID: ${obj.payment_id}`,
                image_url: obj.metadata.bank_slip.image_url,
                subtitle: `${obj.payment_amount.amount} ${obj.payment_amount.currency} (${obj.metadata.bank_slip.validation_status})`,
                default_action: {
                    type: "web_url",
                    url: obj.metadata.bank_slip.image_url,
                    messenger_extensions: false,
                    webview_height_ratio: "FULL"
                },
                buttons: [{
                    type: "web_url",
                    url: obj.metadata.bank_slip.image_url,
                    title: "View Bankslip"
                }, {
                    type: "postback",
                    title: "Details",
                    payload: `BANK_SLIP_DETAIL:${obj.payment_id}`
                }]
            }
            elements.push(item)
        }        

        sendGenericTemplate(page_id, psid, elements)
    } catch (error) {
        console.log(error)
    }
}



