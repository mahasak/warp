const admin = require('firebase-admin');
// const fs = require('fs')
// const path = require('path')
// //const { initializeApp } = require('firebase-admin/app');
// const JSONfile = fs.readFileSync(path.join(__dirname, '..', '..', `/service-account.json`), 'utf8');
// const serviceAccount = JSON.parse(JSONfile);
// const FIREBASE_CONFIG = {
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://midas-3ca5e-default-rtdb.firebaseio.com/'
// };
const { debug, logger } = require('../logger')

const FIREBASE_CONFIG = {
    databaseURL: 'https://warp-9999-default-rtdb.asia-southeast1.firebasedatabase.app/'
}
if (admin.apps.length === 0) {
    admin.initializeApp(FIREBASE_CONFIG);
}

const db = admin.database()
const dbAdmin = admin.database

//const { ref, get } =  require('firebase/database')


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
