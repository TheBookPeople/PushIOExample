var PushIO = require('uk.co.tbp.pushio');

exports.pushIOUUID = function() {
	return PushIO.pushIOUUID;
};

exports.registerForNotifications = function(options) {
	options = options || {};
	
  _debug("registerForNotifications ", options);
  
   var platform = Ti.Platform.osname;
  _debug("Ti.Platform.osname  " + platform);
  
  
  
  _.defaults(options, {
    success : _deviceTokenSuccess,
    error : _deviceTokenError,
    callback : _receivePush
  });
  
 
  
  if (platform === 'iphone' || platform === 'ipad') {
     _iOS(options);
  }
  
  if (platform === 'android') {
    _android(options);
  }
};

function _android(options){
	_debug("_android ", options);
	
	PushIO.addEventListener(PushIO.CALLBACK_EVENT, options.callback);
  PushIO.addEventListener(PushIO.SUCCESS_EVENT, options.success);
  PushIO.addEventListener(PushIO.ERROR_EVENT, options.error);
}

/**
 * iOS setup
 */
function _iOS(options) {
  _debug("_iOS ", options);

  if (_isiOS8orGreater()) {
    _iOS8(options);
  } else {
    _iOS7(options);
  }
}

/**
 * Return true if running on iOS 8 or greater
 */
function _isiOS8orGreater() {
  var result = Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8;
  _debug("_isiOS8orGreater " + result);
  return result;
}

/**
 * Push notification setup for iOS8 and above.
 */
function _iOS8(options) {
  _debug("_iOS8 ", options);
  var registerForPush = function() {
    Ti.Network.registerForPushNotifications({
      success : options.success,
      error : options.error,
      callback : options.callback
    });
    // Remove event listener once registered for push notifications
    Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush);
  };

  // Wait for user settings to be registered before registering for push notifications
  Ti.App.iOS.addEventListener('usernotificationsettings', registerForPush);

  // Register notification types to use
  Ti.App.iOS.registerUserNotificationSettings({
    types : [Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND, Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE]
  });
}

/**
 * Push notification setup for iOS7 and below.
 */
function _iOS7(options) {
  _debug("_iOS7 ", options);
  Ti.Network.registerForPushNotifications({
    types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
    success : options.success,
    error : options.error,
    callback : options.callback
  });
}

/**
 * Default callback used PushIO gets device token.
 * @param {Object} e - object returned
 */
function _deviceTokenSuccess(e) {
  _debug("_deviceTokenSuccess ", e);
  PushIO.registerDevice(e.deviceToken);
  PushIO.registerUserID(Alloy.Globals.userId);
}

/**
 * Default callback used PushIO fails to get device token.
 * @param {Object} e - error object returned
 */
function _deviceTokenError(e) {
  _debug("_deviceTokenError ", e);
  Ti.API.error('Failed to register for push notifications! ' + e.error);
}

/**
 * Default callback called when PushIO notification is received.
 * If a valid deal id is supplied in the data URL (e.data.p_dl deal)
 * the app will open at the deal details page.
 *
 * @param {Object} e - notification object, e.data.p_dl deal id if supplied
 */
function _receivePush(e) {
  _debug('_receivePush', e);
  PushIO.recordNotification(e.data);
  alert(JSON.stringify(e,null,' '));
}

/**
 * Log internal debug messages
 *
 * @param {Object} message - message to log
 * @param {Object} data - data (optional)
 */
function _debug(message, data) {
  if (data) {
    Ti.API.debug('pushIOUtils : ' + message + ' ' + JSON.stringify(data, null, ""));
  } else {
    Ti.API.debug('pushIOUtils : ' + message);
  }

}
