const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')

const PAGE_CONFIGS = functions.config().warp.facebook.pages_config;

exports.createInvoice = async (page_id, buyer_id, external_invoice_id, note, product_items, additional_amounts, features, shipping_address) => {
    const payload = {
        buyer_id: buyer_id,
        product_items: product_items,
    }

    if (external_invoice_id !== null && external_invoice_id !== undefined) {
        payload.external_invoice_id = external_invoice_id
    }

    if (note !== null && note !== undefined) {
        payload.note = note
    }

    if (additional_amounts !== null && additional_amounts !== undefined) {
        payload.additional_amounts = additional_amounts
    }

    if (features !== null && features !== undefined) {
        payload.features = features
    }

    if (shipping_address !== null && shipping_address !== undefined) {
        payload.shipping_address = shipping_address
    }

    debug("payload", payload)

    try {
        const pageConfig = getPageConfig(page_id);
        if (pageConfig === undefined) {
            logger.error(`[messenger] Page ID [${page_id}] not onboarded`)
            return
        }
        const res = await fetch('https://graph.facebook.com/v14.0/' + page_id + '/invoice_access_invoice_create?access_token=' + pageConfig.access_token, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }

        })

        const data = await res.json()
        const recipientId = data.recipient_id
        const messageId = data.message_id

        console.log(data)

        if (res.ok) {
            logger.info(`[messenger] Successfully send message to PSID: ${recipientId} ${messageId !== undefined ? 'messageId:' + messageId : ''}`)
        } else {
            logger.error(`[messenger] Failed to send message to PSID: ${recipientId}`)
        }

    } catch (error) {
        logger.error(`[messenger] Send API error`, error)
    }
}

exports.listInvoice = async (page_id, buyer_id) => {
    try {
        const pageConfig = getPageConfig(page_id);
        if (pageConfig === undefined) {
            logger.error(`[messenger] Page ID [${page_id}] not onboarded`)
            return
        }

        const res = await fetch(`https://graph.facebook.com/v14.0/${page_id}/invoice_access_invoice_lists?access_token=${pageConfig.access_token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }

        })

        const data = await res.json()
        const recipientId = data.recipient_id
        const messageId = data.message_id

        console.log(data)

        if (res.ok) {
            logger.info(`[messenger] Successfully send message to PSID: ${recipientId} ${messageId !== undefined ? 'messageId:' + messageId : ''}`)
        } else {
            logger.error(`[messenger] Failed to send message to PSID: ${recipientId}`)
        }

    } catch (error) {
        logger.error(`[messenger] Send API error`, error)
    }
}