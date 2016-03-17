 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('chatPageController', chatPageController);

     function chatPageController($scope, $rootScope, $state, $timeout, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage, socketService, $stateParams, sqliteService, chatpageService) {
         var self = this;
         var chatWithUserData = timeStorage.get('chatWithUserData');
         var userData = timeStorage.get('userData');
         document.addEventListener("online", onOnline, false);
         function onOnline() {
            socketService.create_room(chatWithUserData.id).then(function(data){
                roomOpenApi();
            });
         }
         
         $scope.userHeader = {};
         $scope.userHeader.name = chatWithUserData.name;
         $scope.userHeader.image = chatWithUserData.pic;
         $scope.userHeader.lastSeen = moment(parseInt(chatWithUserData.lastSeen)).format("hh:mm a");
         $scope.userHeader.goBack = function() {
             $ionicHistory.goBack();
         }
         $scope.userfooter = {};
         $scope.userfooter.image = userData.data.profile_image;
         $scope.userfooter.name = userData.data.name;
         $scope.userfooter.user_id = userData.data.user_id;
         $scope.$on('newRoomMessage', function (event, response) {
            if(response.data.room_id == $stateParams.roomId){
                socketService.update_message_status_room_open(response.data.message_id, $stateParams.roomId);
                self.displayChatMessages.push({
                     "image": response.data.profile_image,
                     "message": response.data.message_body,
                     "messageTime": moment(_.now()).format("hh:mm a"),
                     "name": response.data.name,
                     "timeStamp": _.now(),
                 });
                $scope.$evalAsync();
                $ionicScrollDelegate.scrollBottom(false);
            }
         });
         $scope.$on('sentMessagesIds', function (event, response) {
            for(var i =0; i < self.displayChatMessages.length; i++){
                if(self.displayChatMessages[i].id == response.data.msg_local_id){
                    self.displayChatMessages[i].message_status = 'sent';
                    self.displayChatMessages[i].id = response.data.message_id;
                }
            }
            $scope.$evalAsync();
         });
         $scope.$on('response_update_message_status_response', function (event, response) {
            for(var i =0; i < self.displayChatMessages.length; i++){
                for(var j = 0; j < response.data.length; j++){
                    if(self.displayChatMessages[i].id == response.data[j]){
                        self.displayChatMessages[i].message_status = 'seen';
                    }
                }
            }
            $scope.$evalAsync();
         });

         $scope.userfooter.sendMessage = function() {
            sqliteService.messageToBeSend($scope.userfooter.message, userData.data.user_id, $stateParams.roomId, _.now()).then(function(lastInsertId){
                socketService.room_message(lastInsertId, $stateParams.roomId, $scope.userfooter.message);
                self.displayChatMessages.push({
                 "id": lastInsertId,
                 "image": userData.data.profile_image,
                 "message": $scope.userfooter.message,
                 "messageTime": moment(_.now()).format("hh:mm a"),
                 "timeStamp": _.now(),
                 "name": userData.data.name,
                 "user_id":userData.data.user_id,
                 "message_status":'post'
                });
                $ionicScrollDelegate.scrollBottom(false);
                $scope.userfooter.message = '';
            })
             $ionicScrollDelegate.scrollBottom(false);
         }
         $scope.userfooter.inputUp = function() {
            console.log('inputUp');
             $timeout(function() {
                 $ionicScrollDelegate.scrollBottom(false);
             }, 300);
         };
         $scope.userfooter.inputDown = function() {
            console.log('inputDown');
             $ionicScrollDelegate.resize();
         };
         roomOpenApi();
         function roomOpenApi(){
            var query = chatPageFactory.save({
            accessToken:userData.data.access_token,
            room_id:$stateParams.roomId,
            page: 0,
            limit:20,
            currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                socketService.update_message_status(data.data.messages, $stateParams.roomId);
                self.displayChatMessages = chatpageService.oldMessages(data.data.messages);
                $ionicScrollDelegate.scrollBottom(false);
            });
            $timeout(function() {
                 $ionicScrollDelegate.scrollBottom(false);
            });
         }
         var doRefreshPageValue = 0;
         $scope.doRefresh = function(){
            var query = chatPageFactory.save({
                accessToken:userData.data.access_token,
                room_id:$stateParams.roomId,
                page: doRefreshPageValue,
                limit:20,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                doRefreshPageValue++;
                var oldData = chatpageService.oldMessages(data.data.messages);
                for(var i = oldData.length-1; i >= 0; i--) {
                    self.displayChatMessages.unshift(oldData[i]);
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
         }
     }
 })();