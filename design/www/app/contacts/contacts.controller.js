 (function() {
     'use strict';

     angular.module('starter')
         .controller('contactsController', contactsController);

     function contactsController(contactsFactory, $ionicLoading, timeStorage, $localStorage, createPrivateChatroomFactory, $state, socketService) {
         delete $localStorage.chatWithUserId;
         var self = this;
         $ionicLoading.show();
         var userData =  timeStorage.get('userData');
         var accessToken = userData.data.access_token;
         var query = contactsFactory.save({
             page: 0,
             limit:10,
             currentTimestamp: _.now()
         });
         query.$promise.then(function(data) {
            console.log(data);
             $ionicLoading.hide();
             self.displaycontacts = data.data;
         });
         self.chatWithUser = function(chatWithUserId){  
            socketService.create_private_room(chatWithUserId).then(function(data){
                $state.go('app.chatpage', {roomId:data.data.room_id});
            });
         }
     }
 })();