const { markSeen } = require('./markSeen')
const { sendButtonTemplate } = require('./sendButtonTemplate')
const { sendGenericTemplate } = require('./sendGenericTemplate')
const { sendMessageTemplate } = require('./sendMessageTemplate')
const { sendOrderCTA } = require('./sendOrderCTA')
const { sendQuickReplies } = require('./sendQuickReplies')
const { sendTextMessage } = require('./sendTextMessage')

module.exports = {
    markSeen: markSeen,
    sendButtonTemplate: sendButtonTemplate,
    sendGenericTemplate: sendGenericTemplate,
    sendMessageTemplate: sendMessageTemplate,
    sendOrderCTA: sendOrderCTA,
    sendQuickReplies: sendQuickReplies,
    sendTextMessage: sendTextMessage
}