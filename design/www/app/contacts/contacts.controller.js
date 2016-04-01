 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('contactsController', contactsController);

     function contactsController($scope, contactsFactory, contactsService, $ionicLoading, timeStorage, $localStorage, $state, socketService) {
         delete $localStorage.chatWithUserData;
         var self = this;
         var userData =  timeStorage.get('userData');
         var accessToken = userData.data.access_token;
         self.displaycontacts = timeStorage.get('listUsers');
         contactsService.listUsers();
         $scope.$on('updatedlistUsers', function (event, response) {
            self.displaycontacts = response.data;
            $scope.$evalAsync();
         });
         self.chatWithUser = function(chatWithUser){
            timeStorage.set('chatWithUserData', chatWithUser, 1);
            socketService.create_room(chatWithUser.id).then(function(data){
                $state.go('app.chatpage', {roomId:data.data.room_id});
            });
         }
         self.isSearchOpen = false;
         self.searchOpen = function(){
            if(self.isSearchOpen){
                self.isSearchOpen = false;
            } else{
                self.isSearchOpen = true;
            }
         }
     }
 })();