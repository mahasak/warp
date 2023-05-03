const functions = require('firebase-functions');
const PAGE_IDS = functions.config().warp.facebook.pages;
const PAGE_CONFIGS = functions.config().warp.facebook.pages_config;

exports.getPageConfig =(page_id) => PAGE_CONFIGS.find(page => page.page_id == page_id)

exports.genContext = () => {
    return {
        order_id: '',
        cart: {},
        shouldEnd: false
    }
}
