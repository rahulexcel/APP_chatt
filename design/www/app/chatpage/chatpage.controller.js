 (function() {
     'use strict';

     angular.module('starter')
         .controller('chatPageController', chatPageController);

     function chatPageController($state, $timeout, $ionicScrollDelegate, chatPageFactory, $ionicLoading) {
         console.log('Chat Page');
         var self = this;
         $ionicLoading.show();
         var query = chatPageFactory.query({});
         query.$promise.then(function(data) {
             console.log(data);
             $ionicLoading.hide();
             self.displayChatMessages = data;
         });
         $timeout(function() {
             $ionicScrollDelegate.scrollBottom(false);
         });
     }
 })();