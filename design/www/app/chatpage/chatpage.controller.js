 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('chatPageController', chatPageController);

     function chatPageController($scope, $state, $timeout, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage, socketService, $stateParams) {
         var self = this;
         var chatWithUserData = timeStorage.get('chatWithUserData');
         $scope.userHeader = {};
         $scope.userHeader.name = chatWithUserData.name;
         $scope.userHeader.image = chatWithUserData.pic;
         $scope.userHeader.lastSeen = chatWithUserData.lastSeen;
         $scope.userHeader.goBack = function() {
             $ionicHistory.goBack();
         }
         $scope.userfooter = {};
         $scope.userfooter.image = 'http://lorempixel.com/640/480/nature';
         socket.on('new_room_message', function(data) {
             self.displayChatMessages.push({
                 "image": data.image,
                 "message": data.message,
                 "messageTime": "2:12",
                 "userName": data.name
             });
             $scope.$evalAsync();
             $ionicScrollDelegate.scrollBottom(false);
         });
         var messageToBeSend = [];
         $scope.userfooter.sendMessage = function() {
             socketService.room_message($stateParams.roomId, $scope.userfooter.message);
             messageToBeSend.push($scope.userfooter.message);
             timeStorage.set('messageToBeSend', messageToBeSend, 1);
             self.displayChatMessages.push({
                 "image": "http://lorempixel.com/640/480/nature",
                 "message": $scope.userfooter.message,
                 "messageTime": "2:12",
                 "userName": "User 1"
             });
             $scope.userfooter.message = '';
             $ionicScrollDelegate.scrollBottom(false);
         }
         $scope.userfooter.inputUp = function() {
             $timeout(function() {
                 $ionicScrollDelegate.scrollBottom(true);
             }, 300);
         };
         $scope.userfooter.inputDown = function() {
             $ionicScrollDelegate.resize();
         };
         self.displayChatMessages = [];
         // var query = chatPageFactory.query({});
         // query.$promise.then(function(data) {
         //     $ionicLoading.hide();
         //     self.displayChatMessages = data;
         // });
         $timeout(function() {
             $ionicScrollDelegate.scrollBottom(false);
         });
     }
 })();