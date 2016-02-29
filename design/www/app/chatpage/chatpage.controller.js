 (function() {
     'use strict';

     angular.module('starter')
         .controller('chatPageController', chatPageController);

     function chatPageController($scope,$state, $timeout, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory) {
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
         $scope.userfooter.sendMessage = function(){
         }
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