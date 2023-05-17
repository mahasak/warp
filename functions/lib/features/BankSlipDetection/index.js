const { bankslipDetectionChangesHook } = require('./bankslipDetectionChangesHook')
const { bankslipDetectionMessageHook } = require('./bankslipDetectionMessageHook')
const { bankslipDetectionPostbackHook } = require('./bankslipDetectionPostbackHook')
const { bankslipDetectionQuickReplyHook } = require('./bankslipDetectionQuickReplyHook')

module.exports = {
    bankslipDetectionChangesHook: bankslipDetectionChangesHook,
    bankslipDetectionMessageHook: bankslipDetectionMessageHook,
    bankslipDetectionPostbackHook: bankslipDetectionPostbackHook,
    bankslipDetectionQuickReplyHook: bankslipDetectionQuickReplyHook
}