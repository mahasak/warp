const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { products, genProductItems, default_product_items, defaultAdditionalAmount } = require('../../shared/products')

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

            const cart = [];
            for (const item of data.data[0].product_items) {
                cart[item.external_id] = item.quantity
            }
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

            debug("P2M Lite PH - UPDATE ORDER", payload)

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
        logger.error(`[messenger] Edit API error`, error)
        return false
    }
}


