 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('chatpageService', chatpageService);

     function chatpageService() {
         var service = {};
         service.oldMessages = function(data) {
             var roomMessages = [];
             for (var i = 0; i < data.length; i++) {
                 var newData = [];
                 newData.id = data[i].id;
                 newData.message = data[i].message.body;
                 newData.messageTime = moment.unix(data[i].message_time).tz('Asia/Kolkata').format("hh:mm a");
                 newData.timeStamp = data[i].message_time;
                 newData.name = data[i].message_owner.name;
                 newData.user_id = data[i].message_owner.id;
                 newData.image = data[i].message_owner.profile_image;
                 newData.message_status = data[i].message_status;
                 roomMessages.push(newData);
             }
             return roomMessages;
         }
         return service;
     };

 })();