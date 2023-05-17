const { cancelInvoice } = require('./cancelInvoice')
const { completeInvoice } = require('./completeInvoice')
const { createInvoice } = require('./createInvoice')
const { editInvoice } = require('./editInvoice')
const { listInvoice } = require('./listInvoice')

module.exports = {
    cancelInvoice: cancelInvoice,
    completeInvoice: completeInvoice,
    createInvoice: createInvoice,
    editInvoice: editInvoice,
    listInvoice: listInvoice
}