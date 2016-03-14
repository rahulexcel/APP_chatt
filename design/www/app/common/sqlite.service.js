 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('sqliteService', sqliteService);

     function sqliteService() {
         var service = {};
         service.createTable = function() {
                 var dbobj = window.sqlitePlugin.openDatabase({
                     name: "chattappDB"
                 });
                 dbobj.transaction(createSchema, errorInSchema, successInSchema);
                 function createSchema(tx) {
                     tx.executeSql('CREATE TABLE IF NOT EXISTS messageToBeSend(id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, userName TEXT, roomId TEXT,  messageTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
                 }
                 function errorInSchema() {
                     console.log("Error to create schema");
                 }
                 function successInSchema() {
                     console.log("Schema creation successful");
                 }
             },
             service.messageToBeSend = function(message, userName, roomId) {
                 var dbobj = window.sqlitePlugin.openDatabase({
                     name: "chattappDB"
                 });
                 dbobj.transaction(populateDB, error, success);
                 function populateDB(tx) {
                     tx.executeSql('INSERT INTO messageToBeSend(message,userName,roomId) VALUES ("' + message + '", "' + userName + '", "' + roomId + '")');
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