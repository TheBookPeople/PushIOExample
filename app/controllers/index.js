var utils = require('uk.co.tbp.pushioutils');

utils.registerForNotifications();

$.pushUUID.setText(utils.pushIOUUID());

$.index.open();
