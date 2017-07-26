 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('sqliteService', sqliteService);

     function sqliteService($ionicPlatform, $q, timeStorage, timeZoneService) {
         var service = {};
         var self = this;
         service.createTable = function() {
                 service.DbConnection().transaction(createSchema, errorInSchema, successInSchema);
                 function createSchema(tx) {
                     tx.executeSql('CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY AUTOINCREMENT, message_id TEXT, message TEXT, message_status TEXT, user_id TEXT, user_name TEXT, user_profile_image TEXT, roomId TEXT, message_type TEXT,  messageTime INTEGER)');
                 }
                 function errorInSchema() {
                    
                 }
                 function successInSchema() {
                    
                 }
             },
             service.saveMessageInDb = function(message, message_status, user_id, user_name, user_profile_image, roomId, messageTime) {
                var q = $q.defer();
                message = message.replace(/"/g,"\\'");
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql('INSERT INTO messages(message, message_status, user_id, user_name,user_profile_image, roomId, messageTime, message_type) VALUES ("' + message + '","' + message_status + '","' + user_id + '","' + user_name + '", "' + user_profile_image + '", "' + roomId + '", "'+ messageTime +'", "text")',[],function(tx, results){
                        q.resolve(results.insertId);
                     });
                 }
                 function error(err) {
                     q.reject(err);
                 }
                 function success(results) {
                     
                 }
                 return q.promise;
             },
             service.updateMessageStatusToSent = function(localMessageId, messageId, messageTime) {
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql("UPDATE messages SET message_id='"+messageId+"', messageTime='"+messageTime+"', message_status='sent' WHERE id="+localMessageId);
                 }
                 function error(err) {
                     
                 }
                 function success() {
                     
                 }
             },
             service.updateMessageStatusToSeen = function(messageId) {
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql("UPDATE messages SET message_status= 'seen' WHERE message_id= '"+messageId+"'");
                 }
                 function error(err) {
                    
                 }
                 function success() {
                     
                 }
             },
                service.updateUserProfie = function(prifilePic) {
                 var userData = timeStorage.get('userData');
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql("UPDATE messages SET user_profile_image= '"+prifilePic+"' WHERE user_id= '"+userData.data.user_id+"'");
                 }
                 function error(err) {
                    
                 }
                 function success() {
                    
                 }
             },
             service.gotNewRoomMessage = function(message, message_id, message_status, message_time, user_name, user_profile_image, room_id, message_type,user_id) {
                message = message.replace(/"/g,"\\'");
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql('INSERT INTO messages(message, message_status, message_id, user_name,user_profile_image, roomId, messageTime, message_type,user_id) VALUES ("' + message + '","' + message_status + '","' + message_id + '","' + user_name + '", "' + user_profile_image + '", "' + room_id + '", "' + message_time + '", "' + message_type +'","' + user_id +'")',[],function(tx, results){
                       
                     });
                 }
                 function error(err) {
                     
                 }
                 function success(results) {
                     
                 }
             },
             service.updateDbOnRoomOpen = function(messages, roomId) {
                var q = $q.defer();
                var userData = timeStorage.get('userData');
                var newmes=[];
                angular.copy(messages,newmes);
                service.getMessageDataFromDB(roomId).then(function(response){
                    var k=0;
                    for(var i = 0; i < messages.length; i++){
                        for(var j = 0; j < response.length; j++){
                            if(messages[i].id == response[j].id){
                                newmes.splice(i-k,1);
                               k=k+1;
                            }
                        }
                    }
                    for(var k = 0; k < newmes.length; k++){
                        service.gotNewRoomMessage(newmes[k].message.body, newmes[k].id, newmes[k].message_status, newmes[k].message_time, newmes[k].message_owner.name, newmes[k].message_owner.profile_image, newmes[k].room_id, newmes[k].message.type,newmes[k].message_owner.id);
                    }
                    for(var x = 0; x < messages.length; x++){
                        if(messages[x].message_status == 'seen'){
                            service.updateMessageStatusToSeen(messages[x].id);
                        }
                    }
                    q.resolve('resole');
                });
                return q.promise;
             },
             service.getMessageDataFromDB = function(roomId) {
                var q = $q.defer();
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql("select * from messages WHERE roomId= '"+roomId+"' order by id DESC;",[],function(tx,results){
                        var roomMessages = [];
                        for (var i = 0; i < results.rows.length; i++) {
                                 var newData = {};
                                 newData.id = results.rows.item(i).message_id;
                                 newData.message = results.rows.item(i).message.replace(/\\'/g,'"');
                                 newData.messageTime = moment.unix(results.rows.item(i).messageTime).tz(timeZoneService.getTimeZone()).format("hh:mm a");
                                 newData.timeStamp = results.rows.item(i).messageTime;
                                 newData.name = results.rows.item(i).user_name;
                                 newData.user_id = results.rows.item(i).user_id;
                                 newData.image = results.rows.item(i).user_profile_image;
                                 newData.message_status = results.rows.item(i).message_status;
                                 newData.message_type = results.rows.item(i).message_type;
                                 roomMessages.push(newData);
                            }
                        q.resolve(roomMessages);
                     });
                 }
                 function error(err) {
                     q.reject(err);
                 }
                 function success(results) {
                    
                 }
                 return q.promise;
             },
             service.deviceIsNowOnline = function() {
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql("select * from messages WHERE message_status='post'",[],function(tx, results){
                        var userData = timeStorage.get('userData');
                        var accessToken = userData.data.access_token;
                        for (var i = 0; i < results.rows.length; i++) {
                            socket.emit('APP_SOCKET_EMIT', 'room_message', { msg_local_id: results.rows.item(i).id, accessToken:  accessToken, room_id: results.rows.item(i).roomId, message_type:'text', message:results.rows.item(i).message, currentTimestamp: results.rows.item(i).messageTime});
                            service.updateMessageStatusToSentWhenAppComesOnline(results.rows.item(i).id);
                            }
                     });
                 }
                 function error(err) {
                     
                 }
                 function success(results) {
                     
                 }
             },
             service.updateMessageStatusToSentWhenAppComesOnline = function(localMessageId) {
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql("UPDATE messages SET message_status='sent' WHERE id="+localMessageId);
                 }
                 function error(err) {
                    
                 }
                 function success() {
                    
                 }
             },
             service.leavePrivateChat = function(roomId) {
                 service.DbConnection().transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql("DELETE from messages WHERE roomid='"+roomId+"'");
                 }
                 function error(err) {
                 }
                 function success() {
                 }
             }

             service.DbConnection = function(){
                 if(window.cordova){ 
                      var dbobj = window.sqlitePlugin.openDatabase({
                     name: "chattappDB"
                 });
                  }else{
                    dbobj =  window.openDatabase("chattappDB.db", '1', 'my', 1024 * 1024 * 100); 
                  }
                return dbobj;
             }
         return service;
     };

 })();