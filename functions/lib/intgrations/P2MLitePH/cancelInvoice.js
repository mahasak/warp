const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')
const { setCurrentOrderId } = require('../../service/database')

exports.cancelInvoice = async (context, page_id, buyer_id, invoice_id) => {
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
        logger.error(`[messenger] Cancel API error`, error)
        return false
    }
}