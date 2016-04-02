 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('chatPageHeaderDirectiveController', chatPageHeaderDirectiveController);

     function chatPageHeaderDirectiveController($state, timeStorage, $ionicPopover, $scope, $ionicModal) { 
         var self = this;
         var chatWithUserData = timeStorage.get('chatWithUserData');
         self.name = chatWithUserData.name;
         self.image = chatWithUserData.pic;
         self.lastSeen = moment(parseInt(chatWithUserData.lastSeen)).format("hh:mm a");
         self.goBack = function() {
             $state.go('app.chats');
         }
         $ionicPopover.fromTemplateUrl('templates/chatpagePopover.html', {
             scope: $scope,
         }).then(function(popover) {
             self.popover = popover;
         });
         $ionicModal.fromTemplateUrl('groupModal.html', function($ionicModal) {
            $scope.modal = $ionicModal;
            }, {
                scope: $scope,
         }); 
     }
 })();