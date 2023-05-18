const { P2MLitePHMessageHook } = require('./P2MLitePHMessageHook')
const { P2MLitePHPostbackHook } = require('./P2MLitePHPostbackHook')
const { P2MLitePHChangeHook } = require('./P2MLitePHChangeHook')
module.exports = {
    P2MLitePHChangeHook: P2MLitePHChangeHook,
    P2MLitePHMessageHook: P2MLitePHMessageHook,
    P2MLitePHPostbackHook: P2MLitePHPostbackHook
}