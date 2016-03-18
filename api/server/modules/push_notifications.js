var gcm = require('node-gcm');

var api_key = "AIzaSyD_wSZOrBcCjEQZw755auNvt1oC89UjYVc";


var message = new gcm.Message();

message.addData('key1', 'msg1');

var regTokens = ['fqx3WO7vu3E:APA91bGoLpN9nGKaGA_X2OJmBS2pHdHPqNKQ9yb-SbGfYiI3gJYQ6LDqX4kFkkbeg444bMXYexByG_sgOTmxdaRAcv6MNHl7tF6D7CCcqhNWj-_zfAcqRFhhWeM5YULpfeAXO-wZ0ucO'];

// Set up the sender with you API key
var sender = new gcm.Sender( api_key );

// Now the sender can be used to send messages
sender.send(message, { registrationTokens: regTokens }, function (err, response) {
    if(err) console.error(err);
    else    console.log(response);
});

// Send to a topic, with no retry this time
sender.sendNoRetry(message, { topic: '/topics/global' }, function (err, response) {
    if(err) console.error(err);
    else    console.log(response);
});


   
//var gcm = require('node-gcm');
//
//// Create a message
//// ... with default values
//var message = new gcm.Message();
//
//// ... or some given values
//var message = new gcm.Message({
//    collapseKey: 'demo',
//    priority: 'high',
//    contentAvailable: true,
//    delayWhileIdle: true,
//    timeToLive: 3,
//    restrictedPackageName: "somePackageName",
//    dryRun: true,
//    data: {
//        key1: 'message1',
//        key2: 'message2'
//    },
//    notification: {
//        title: "Hello, World",
//        icon: "ic_launcher",
//        body: "This is a notification that will be displayed ASAP."
//    }
//});
//
//// Change the message data
//// ... as key-value
//message.addData('key1','message1');
//message.addData('key2','message2');
//
//// ... or as a data object (overwrites previous data object)
//message.addData({
//    key1: 'message1',
//    key2: 'message2'
//});
//
//// Set up the sender with you API key
//var sender = new gcm.Sender('insert Google Server API Key here');
//
//// Add the registration tokens of the devices you want to send to
//var registrationTokens = [];
//registrationTokens.push('regToken1');
//registrationTokens.push('regToken2');
//
//// Send the message
//// ... trying only once
//sender.sendNoRetry(message, { registrationTokens: registrationTokens }, function(err, response) {
//  if(err) console.error(err);
//  else    console.log(response);
//});
//
//// ... or retrying
//sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
//  if(err) console.error(err);
//  else    console.log(response);
//});
//
//// ... or retrying a specific number of times (10)
//sender.send(message, { registrationTokens: registrationTokens }, 10, function (err, response) {
//  if(err) console.error(err);
//  else    console.log(response);
//});