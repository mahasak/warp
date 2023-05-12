const fetch = require('node-fetch')
const { debug, logger } = require('../../logger')
const { getPageConfig } = require('../../context')

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