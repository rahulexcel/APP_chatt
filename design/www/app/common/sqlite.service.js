 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('sqliteService', sqliteService);

     function sqliteService($ionicPlatform, $q) {
         var service = {};
         service.createTable = function() {
                var dbobj = window.sqlitePlugin.openDatabase({
                     name: "chattappDB"
                 });
                 dbobj.transaction(createSchema, errorInSchema, successInSchema);
                 function createSchema(tx) {
                     tx.executeSql('CREATE TABLE IF NOT EXISTS messageToBeSend(id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, user_id TEXT, roomId TEXT, message_type TEXT,  messageTime INTEGER)');
                 }
                 function errorInSchema() {
                     console.log("Error to create schema");
                 }
                 function successInSchema() {
                     console.log("Schema creation successful");
                 }
             },
             service.messageToBeSend = function(message, user_id, roomId, messageTime) {
                var q = $q.defer();
                var dbobj = window.sqlitePlugin.openDatabase({
                     name: "chattappDB"
                 });
                 dbobj.transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql('INSERT INTO messageToBeSend(message,user_id,roomId, messageTime) VALUES ("' + message + '", "' + user_id + '", "' + roomId + '", "'+ messageTime +'")',[],function(tx, results){
                        q.resolve(results.insertId);
                     });
                 }
                 function error(err) {
                     console.log("Error processing SQL: " + err.code);
                     q.reject(err);
                 }
                 function success(results) {
                     console.log("success!");
                 }
                 return q.promise;
             },
             service.deleteSentMessage = function(messageId) {
                var dbobj = window.sqlitePlugin.openDatabase({
                     name: "chattappDB"
                 });
                 dbobj.transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql('DELETE FROM messageToBeSend WHERE id='+messageId);
                 }
                 function error(err) {
                     console.log("Error processing SQL: " + err.code);
                 }
                 function success() {
                     console.log("success!");
                 }
             }
         return service;
     };

 })();