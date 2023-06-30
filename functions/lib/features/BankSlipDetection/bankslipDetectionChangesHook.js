
const { sendTextMessage, sendGenericTemplate, sendButtonTemplate } = require('../../intgrations/messenger')
const { getPaymentList } = require('../../intgrations/bankslipDetection/paymentList')
const { getPaymentDetail } = require('../../intgrations/bankslipDetection/paymentDetail')
const { triggerConfirmationFlow } = require('../../intgrations/bankslipDetection/triggerConfirmationFlow')
const { debug, logger } = require('../../logger')


exports.bankslipDetectionChangesHook = async (context, change) => {
    if (change.value.event === 'bank_slip_detected') {
        debug('BANK SLIP DETECTED', change)

        const message = "We seen bank slip with following data:\n\n" +
            "⏱️ Time: " + change.value.timestamp + "\n" +
            "🖼️ Media ID: " + change.value.media_id + "\n" +
            "💸 Buyer ID: " + change.value.buyer_id + "\n" +
            "📄 Page ID: " + change.value.page_id + "\n" +
            "📁 Event: " + change.value.event + "\n"

        await sendTextMessage(context, change.value.page_id, change.value.buyer_id, message)
    }

    if (change.value.event === 'consent_accepted') {
        debug('CONSENT ACCEPTED', change)
        debug('CONSENT ACCEPTED DETAIL', change.value.payment.metadata)

        const item = {
            title: `Thanks for confirming Payment ID: ${change.value.payment.payment_id}`,
            image_url: change.value.payment.metadata.bank_slip.image_url,
            subtitle: `Event: ${change.value.event}\nMethod: ${change.value.payment.payment_method}\nMedia ID: ${change.value.media_id}`
        }

        sendGenericTemplate(context, change.value.page_id, change.value.payment.buyer_id, [item])
    }


    if (change.value.event === 'consent_dismissed') {
        debug('CONSENT DISMISSED', change)

        const message = "We noticed you have been dismiss payment confirmation.Do you want to retry confirmation flow ?"

        const buttons = [
            {
                "type": "postback",
                "payload": `YES_RETRY_CONFIRMATION:${change.value.media_id}`,
                "title": "Retry Confirmation"
            },
            {
                "type": "postback",
                "payload": "NO_RETRY_CONFIRMATION",
                "title": "No, Thanks"
            }
        ]

        await sendButtonTemplate(context, change.value.page_id, change.value.buyer_id, message, buttons)
    }

    if (change.value.event === 'bank_slip_verified') {
        debug('BANK SLIP VERIFIED', change)
        debug('BANK SLIP VERIFIED, PAYMENT DETAILS', change.value.payment)
        debug('BANK SLIP VERIFIED, PAYMENT METADATA', change.value.payment.metadata)
        debug('BANK SLIP VERIFIED, PAYMENT VALIDATION INFO', change.value.payment.metadata.bank_slip.validation_status)
        
        const message = "Your payment verified, This is your payment information:\n\n" +
            "💸 Buyer ID: " + change.value.buyer_id + "\n" +
            "📄 Page ID: " + change.value.page_id + "\n" +
            "📁 Event: " + change.value.event + "\n" +
            "🏦 Method: " + change.value.payment.payment_method + "\n" +
            "💰 amount: " + `${change.value.payment.payment_amount.amount} ${change.value.payment.payment_amount.currency}` + "\n" +
            "🆔 Tx ID: " + change.value.payment.metadata.bank_slip.bank_transfer_id + "\n" +
            "⏱️ Tx time: " + change.value.payment.metadata.bank_slip.transaction_time + "\n" +
            "✅ Validation: " + change.value.payment.metadata.bank_slip.validation_status + "\n" +
            matches(change.value.payment.metadata.bank_slip.validation_info.is_seller_onboarded) + " Seller Onboarded: " + change.value.payment.metadata.bank_slip.validation_info.is_seller_onboarded + "\n" +
            matches(change.value.payment.metadata.bank_slip.validation_info.matches_seller_account) + " Match Seller A/C: " + change.value.payment.metadata.bank_slip.validation_info.matches_seller_account + "\n" +
            check(change.value.payment.metadata.bank_slip.validation_info.is_duplicate) + " Duplicated: " + change.value.payment.metadata.bank_slip.validation_info.is_duplicate + "\n" +
            "😑 Sender: " + `${change.value.payment.metadata.bank_slip.sender_bank_code} - ${change.value.payment.metadata.bank_slip.sender_bank_account_id} - ${change.value.payment.metadata.bank_slip.sender_name}` + "\n" +
            "🤑 Receiver: " + `${change.value.payment.metadata.bank_slip.receiver_bank_code} - ${change.value.payment.metadata.bank_slip.receiver_bank_account_id} - ${change.value.payment.metadata.bank_slip.receiver_name}` + "\n"

        await sendTextMessage(context, change.value.page_id, change.value.payment.buyer_id, message)
    }
}

const matches = (val) => val.toString() === 'true' ? '✅' : '❌'
const check = (val) => val.toString() === 'true' ? '❌' : '✅'

