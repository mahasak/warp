const functions = require('firebase-functions');
const Pino = require('pino')
const { gcpLogOptions } = require('pino-cloud-logging')
let pinoToSeq = require('pino-seq');

var colors = require('colors');

const ENV_MODE = functions.config().warp.env;
const SEQ_SERVER = functions.config().warp.seq.server;
const SEQ_API_KEY = functions.config().warp.seq.api_key;

exports.debug = (label, ...data) => {
  if (ENV_MODE == 'dev') {
    console.log(`---------- debug: ${label} ----------`.red)
    data.forEach(item => console.log(colors.yellow(item)))
  }
}

exports.logger = Pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
}, gcpLogOptions())


exports.getLogger = (context) => {
  const stream = pinoToSeq.createStream({ serverUrl: `https://${SEQ_SERVER}`, apiKey: SEQ_API_KEY });
  const logger = Pino({ name: 'warp' }, stream);

  const property = {}
  console.log(context)
  if (context.country) {
    property.country = context.country
  }

  if (context.request_id) {
    property.request_id = context.request_id
  }

  if (context.service) {
    property.service = context.service
  }

  return logger.child(property);
}

