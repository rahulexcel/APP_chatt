 (function() {
     'use strict';

     angular.module('starter')
         .controller('chatPageController', chatPageController);

     function chatPageController($scope,$state, $timeout, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage) {
         console.log('Chat Page');
         var self = this;
         $ionicLoading.show();
         $scope.userHeader ={};
         $scope.userHeader.name = 'kush';
         $scope.userHeader.image = 'http://lorempixel.com/640/480/nature';
         $scope.userHeader.lastSeen = 'LAST SEEN TODAY 08:03 PM';
         $scope.userHeader.goBack = function(){
             $ionicHistory.goBack();
         }
         $scope.userfooter = {};
         $scope.userfooter.image = 'http://lorempixel.com/640/480/nature';
         var messageToBeSend = [];
         $scope.userfooter.sendMessage = function(){
            messageToBeSend.push($scope.userfooter.message);
            console.log(messageToBeSend);
            timeStorage.set('messageToBeSend',messageToBeSend,1);
            self.displayChatMessages.push({
                    "image": "http://lorempixel.com/640/480/nature",
                    "message":$scope.userfooter.message,
                    "messageTime":"2:12",
                    "userName":"User 12"
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
         var query = chatPageFactory.query({});
         query.$promise.then(function(data) {
             $ionicLoading.hide();
             self.displayChatMessages = data;
         });
         $timeout(function() {
             $ionicScrollDelegate.scrollBottom(false);
         });
     }
 })();