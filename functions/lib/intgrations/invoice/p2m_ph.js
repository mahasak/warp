const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { setCurrentOrderId } = require('../../service/database')

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
            await setCurrentOrderId(buyer_id, external_invoice_id ?? 0, data.invoice_id ?? 0)

            logger.info(`[messenger] Successfully create invoice ID [${data.invoice_id ?? o}] for buyer ID [${recipientId}], page ID [${recipientId}]`)
            return {
                order_id: external_invoice_id,
                invoice_id: data.invoice_id
            }
        } else {
            logger.info(`[messenger] Failed to create invoice for buyer ID [${recipientId}], page ID [${recipientId}]`)
            return false
        }

    } catch (error) {
        console.log(error)
        logger.error(`[messenger] Create API error`, error)
        return false
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

        if (res.ok) {
            logger.info(`[messenger] Successfully list for buyer ID [${buyer_id}], page ID [${page_id}]`)
        } else {
            logger.error(`[messenger] Failed list for buyer ID [${buyer_id}], page ID [${page_id}]`)
        }

    } catch (error) {
        logger.error(`[messenger] List API error`, error)
    }
}

exports.cancelInvoice = async (page_id, buyer_id, invoice_id) => {
    try {
        const pageConfig = getPageConfig(page_id);
        if (pageConfig === undefined) {
            logger.error(`[messenger] Page ID [${page_id}] not onboarded`)
            return
        }

        const payload = {
            invoice_id: invoice_id
        }

        const res = await fetch(`https://graph.facebook.com/v14.0/${page_id}/invoice_access_invoice_cancel?access_token=${pageConfig.access_token}`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }

        })

        const data = await res.json()
        const recipientId = data.recipient_id
        const messageId = data.message_id

        if (res.ok) {
            await setCurrentOrderId(buyer_id, 0, 0)
            logger.info(`[messenger] Successfully cancel for invoice ID [${invoice_id}], page ID [${page_id}]`)
            return true
            
        } else {
            logger.error(`[messenger] Failed cancel for invoice ID [${invoice_id}], page ID [${page_id}]`)
            return false
        }
    } catch (error) {
        console.log(error)
        logger.error(`[messenger] Cancel API error`, error)
        return false
    }
}