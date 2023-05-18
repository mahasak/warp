const functions = require('firebase-functions');

const { processWebhookMessages } = require('./processWebhookMessages')
const { processWebhookChanges } = require('./processWebhookChanges')
const { debug, logger } = require('./lib/logger')

exports.webhook = functions.https.onRequest(async (req, res) => {
    switch (req.method) {
        case 'GET':
            verifySubscription(req, res)
            break
        case 'POST':
            webhookImpl(req, res)

            break
    }
})

const verifySubscription = (req, res) => {
    logger.info('[webhook-verify] Incoming webhook verification request')
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === functions.config().warp.facebook.verify_token) {
        logger.info('[webhook-verify] Successfully validating webhook token')
        res.status(200).send(req.query['hub.challenge'])
    } else {
        logger.error('[webhook-verify] Failed validation. Make sure the validation tokens match.')
        res.sendStatus(403)
    }
}

const webhookImpl = (req, res) => {
    logger.info('[webhook-handler] Incoming webhook messages/changes')

    const data = req.body;
    if (data.object == 'page' && data.entry !== undefined) {
        data.entry.forEach(pageEntry => {
            // process messaging
            if (pageEntry.messaging !== undefined) {
                pageEntry.messaging.forEach(async function (event) {
                    await processWebhookMessages(event)
                });
            }
            //process changes
            if (pageEntry.changes !== undefined) {
                pageEntry.changes.forEach(async function (change) {
                    await processWebhookChanges(change);
                });
            }
        });
    }
    res.sendStatus(200)
}
