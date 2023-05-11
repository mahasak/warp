const functions = require('firebase-functions')
const ACCESS_TOKEN = functions.config().warp.facebook.access_token
const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { setCurrentOrderId } = require('../../service/database')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../shared/products')
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

exports.completeInvoice = async (page_id, buyer_id, invoice_id) => {
    try {
        const pageConfig = getPageConfig(page_id);
        if (pageConfig === undefined) {
            logger.error(`[messenger] Page ID [${page_id}] not onboarded`)
            return
        }

        const payload = {
            invoice_id: invoice_id
        }

        const res = await fetch(`https://graph.facebook.com/v14.0/${page_id}/invoice_access_invoice_complete?access_token=${pageConfig.access_token}`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }

        })

        const data = await res.json()
        const recipientId = data.recipient_id
        const messageId = data.message_id

        if (res.ok) {
            await setCurrentOrderId(buyer_id, 0, 0)
            logger.info(`[messenger] Successfully mark as complete for invoice ID [${invoice_id}], page ID [${page_id}]`)
            return true

        } else {
            logger.error(`[messenger] Failed mark as complete for invoice ID [${invoice_id}], page ID [${page_id}]`)
            return false
        }
    } catch (error) {
        console.log(error)
        logger.error(`[messenger] Mark as complete API error`, error)
        return false
    }
}


exports.editInvoice = async (page_id, buyer_id, invoice_id, items) => {
    try {
        const pageConfig = getPageConfig(page_id);
        if (pageConfig === undefined) {
            logger.error(`[messenger] Page ID [${page_id}] not onboarded`)
            return
        }
        // Read invoice details
        const res = await fetch(`https://graph.facebook.com/v14.0/${page_id}/invoice_access_invoice_details?invoice_id=${invoice_id}&access_token=${pageConfig.access_token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }

        })

        const data = await res.json()
        const recipientId = data.recipient_id
        const messageId = data.message_id

        if (res.ok) {
            logger.info(`[messenger] Read detail for invoice ID [${invoice_id}], page ID [${page_id}]`)
            console.log(data.data[0])

            const cart = [];
            for (const item of data.data[0].product_items) {
                cart[item.external_id] = item.quantity
            }
            console.log(products)
            const menuCode = Object.keys(products);

            for (const itemCode of items) {
                if (menuCode.includes(itemCode.trim())) {
                    const currentCartItems = Object.keys(cart);
                    if (currentCartItems.includes(itemCode)) {
                        cart[itemCode]++
                    } else {
                        cart[itemCode] = 1
                    }
                }
            }

            const updated_product_items = genProductItems(cart);

            const payload = {
                invoice_id: invoice_id,
                product_items: updated_product_items,
                additional_amounts: defaultAdditionalAmount,
            }

            console.log(payload)

            const update_res = await fetch(`https://graph.facebook.com/v14.0/${page_id}/invoice_access_invoice_edit?access_token=${pageConfig.access_token}`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            })

            if (update_res.ok) {
                logger.info(`[messenger] Successfully update for invoice ID [${invoice_id}], page ID [${page_id}]`)
                return true

            } else {
                logger.error(`[messenger] Failed to update for invoice ID [${invoice_id}], page ID [${page_id}]`)
                return false
            }

        } else {
            logger.error(`[messenger] Failed to read detail  for invoice ID [${invoice_id}], page ID [${page_id}]`)
            return false
        }
    } catch (error) {
        console.log(error)
        logger.error(`[messenger] Edit API error`, error)
        return false
    }
}


