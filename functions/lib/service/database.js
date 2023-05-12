const admin = require('firebase-admin');
const { debug, logger } = require('../logger')

const FIREBASE_CONFIG = {
    databaseURL: 'https://warp-9999-default-rtdb.asia-southeast1.firebasedatabase.app/'
}

if (admin.apps.length === 0) {
    admin.initializeApp(FIREBASE_CONFIG);
}

const db = admin.database()


exports.genOrderID = async (page_id) => {
    const orderCountRef = await db.ref(`/store/${page_id}/orderCount`).once('value');
    const updates = {}
    let result = 1
    
    if(orderCountRef.val() === null) {
        updates[`store/${page_id}/orderCount`] = 1
    } else {
        result = parseInt(orderCountRef.val())+1
        updates[`store/${page_id}/orderCount`] = result
    }
    
    db.ref().update(updates);

    return result
}

exports.setCurrentOrderId = async (psid, order_id, invoice_id) => {
    const updates = {}
    
    updates[`users/${psid}/currentOrder`] = order_id
    updates[`users/${psid}/currentInvoice`] = invoice_id

    db.ref().update(updates);
}

exports.getCurrentOrderId = async (psid) => {
    const currentOrderRef = await db.ref(`/users/${psid}/currentOrder`).once('value')
    const currentInvoiceRef = await db.ref(`/users/${psid}/currentInvoice`).once('value')

    return {
        order_id: currentOrderRef.val() ?? 0,
        invoice_id: currentInvoiceRef.val() ?? 0
    }
}

