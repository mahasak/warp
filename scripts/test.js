// let pino = require('pino');
// let pinoToSeq = require('pino-seq');

// let stream = pinoToSeq.createStream({ serverUrl: 'https://seq.femto.sh' , apiKey: 'lNOHoKeA7OH88PIVHhjP'});
// let logger = pino({ name: 'pino-seq example', applicationName: 'xxx' }, stream);

// logger.warn('Hello Seq, from Pino yyy {applicationName}', {applicationName: "Warp"});

// let frLogger = logger.child({ applicationName: 'Warp', service: 'test' });
// frLogger.warn('au reviour');
const context = {}

context.country = 'TH'
const property = {}

property.country = 'TH'


if (context.country) {
  property.country = context.country
}

if (context.request_id) {
  property.request_id = context.request_id
}

if (context.service) {
  property.service = context.service
}


console.log(property)