const { invoiceAPIPHMessageHook, invoiceAPIPHPostbackHook } = require('./P2MLitePH')
const { bankslipDetectionMessageHook, bankslipDetectionPostbackHook, bankslipDetectionChangesHook, bankslipDetectionQuickReplyHook } = require('./BankSlipDetection')

exports.featureHooks = (pageId) => {
    const messagesHooks = []
    const changesHooks = []
    const postbackHooks = []
    const quickReplyHooks = []

    const pageConfig = getPageConfig(pageId);
    if (pageConfig === undefined) {
        logger.error(`[messenger] Page ID [${pageId}] not onboarded`)
        return
    }

    if (pages_config.features.p2m_ph === "true") {
        messagesHooks.push(invoiceAPIPHMessageHook)
        postbackHooks.push(invoiceAPIPHPostbackHook)
    }

    if (pages_config.features.slip_detection_api === "true") {
        messagesHooks.push(bankslipDetectionMessageHook)
        postbackHooks.push(bankslipDetectionPostbackHook)
        changesHooks.push(bankslipDetectionChangesHook)
        quickReplyHooks.push(bankslipDetectionQuickReplyHook)
    }

    return {
        messagesHooks: messagesHooks,
        changesHooks: changesHooks,
        postbackHooks: postbackHooks,
        quickReplyHooks: quickReplyHooks
    }
}