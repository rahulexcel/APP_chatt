 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('chatPageHeaderDirectiveController', chatPageHeaderDirectiveController);

     function chatPageHeaderDirectiveController($state, $timeout, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage, socketService, $stateParams, sqliteService, chatpageService) { 
         var self = this;
         var chatWithUserData = timeStorage.get('chatWithUserData');
             self.name = chatWithUserData.name;
             self.image = chatWithUserData.pic;
             self.lastSeen = moment(parseInt(chatWithUserData.lastSeen)).format("hh:mm a");
             self.goBack = function() {
                 $ionicHistory.goBack();
             }
     }
 })();