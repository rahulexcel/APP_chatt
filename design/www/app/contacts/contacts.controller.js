 (function() {
     'use strict';

     angular.module('starter')
         .controller('contactsController', contactsController);

     function contactsController(contactsFactory, $ionicLoading, timeStorage, $localStorage, createPrivateChatroomFactory, $state) {
         console.log('contactsController');
         delete $localStorage.chatWithUserId;
         var self = this;
         $ionicLoading.show();
         var query = contactsFactory.query({
             user_id: '123456'
         });
         query.$promise.then(function(data) {
             $ionicLoading.hide();
             self.displaycontacts = data;
         });
         self.chatWithUser = function(chatWithUserId){
            $state.go('app.chatpage');
            var userData =  timeStorage.get('userData');
            var accessToken = userData.data.access_token;
            timeStorage.set('chatWithUserId',chatWithUserId,1);
            var query = createPrivateChatroomFactory.save({
                 chat_with: chatWithUserId,
                 currentTimestamp: _.now(),
                 access_token: accessToken
             });
             query.$promise.then(function(data) {
                 console.log(data);
             });
         }
     }
 })();