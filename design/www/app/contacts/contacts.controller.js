 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('contactsController', contactsController);

     function contactsController(contactsFactory, $ionicLoading, timeStorage, $localStorage, $state, socketService) {
         delete $localStorage.chatWithUserData;
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
             $ionicLoading.hide();
             self.displaycontacts = data.data;
         });
         self.chatWithUser = function(chatWithUser){
            timeStorage.set('chatWithUserData', chatWithUser, 1);
            socketService.create_private_room(chatWithUser.id).then(function(data){
                $state.go('app.chatpage', {roomId:data.data.room_id});
            });
         }
     }
 })();