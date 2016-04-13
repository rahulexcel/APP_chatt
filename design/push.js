var gcm = require('node-gcm');

var message = new gcm.Message();

message.addData('key1', 'msg1');

message.addNotification({
  title: 'YUvraj',
  body: 'hi he si saying',
  icon: 'ic_launcher'
});
var regTokens = [
'c1io1ptp9ZE:APA91bHTz02Cy0-i5iikKM_Bz4u2q5MO18AnB99oJ0xgjAGca5PevgmXZA5JKxkKTVAC0QbURxw9NbDuuD2jgX65OHZIVlU677oTSt_E05XswevlPieFkhT40YGpl4IPyU6aEeZxVa1e'
];

// Set up the sender with you API key
var sender = new gcm.Sender('AIzaSyDluTER917Kc6usic9OaHWw3rEXdG3_gTg');

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
