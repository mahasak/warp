const { cancelOrderHandler } = require('./cancelOrderHandler')
const { completeOrderHandler } = require('./completeOrderHandler')
const { createOrderHandler } = require('./createOrderHandler')
const { editOrderHandler } = require('./editOrderHandler')
const { listProductHandler } = require('./listProductHandler')
const { helpHandler } = require('./helpHandler')

module.exports = {
    cancelOrderHandler: cancelOrderHandler,
    completeOrderHandler: completeOrderHandler,
    createOrderHandler: createOrderHandler,
    editOrderHandler: editOrderHandler,
    listProductHandler: listProductHandler,
    helpHandler: helpHandler
}