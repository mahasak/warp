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


if (admin.apps.length === 0) {
    admin.initializeApp();
}

exports.db = admin.database()

// exports.dbAdmin = admin.database

// // at the top of the file:
// const admin = require('firebase-admin');
// admin.initializeApp();

// // in your function:
// const root = admin.database().ref();
// // root is now a Reference to the root of your database.