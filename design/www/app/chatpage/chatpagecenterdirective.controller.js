 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('chatPageCenterDirectiveController', chatPageCenterDirectiveController);

     function chatPageCenterDirectiveController($scope, $state, $timeout, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage, socketService, $stateParams, sqliteService, chatpageService, timeZoneService) {
         var self = this;
         var chatWithUserData = timeStorage.get('chatWithUserData');
         var userData = timeStorage.get('userData');
         self.user_id = userData.data.user_id;
         self.user_name = userData.data.name;
        
         $scope.$on('newRoomMessage', function (event, response) {
            if(response.data.room_id == $stateParams.roomId){
                socketService.update_message_status_room_open(response.data.message_id, $stateParams.roomId);
                self.displayChatMessages.push({
                     "image": response.data.profile_image,
                     "message": response.data.message_body,
                     "messageTime": moment.unix(response.data.message_time).tz(timeZoneService.getTimeZone()).format("hh:mm a"),
                     "name": response.data.name,
                     "timeStamp": response.data.message_time,
                     "message_type": response.data.message_type,
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
                    self.displayChatMessages[i].messageTime = moment.unix(response.data.message_time).tz(timeZoneService.getTimeZone()).format("hh:mm a");
                    self.displayChatMessages[i].timeStamp = response.data.message_time;
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
         $scope.$on('displayChatMessages', function (event, response) {
            self.displayChatMessages.push(response.data);
            $scope.$evalAsync();
         });
         $scope.$on('now_device_is_online', function (event, response) {
            socket.emit('APP_SOCKET_EMIT', 'room_open', { accessToken:  userData.data.access_token, room_id: $stateParams.roomId, currentTimestamp: _.now() });
            $timeout(function() {
                roomOpenApi();
            }, 3000);
         });
         sqliteService.getMessageDataFromDB($stateParams.roomId).then(function(response){
            self.displayChatMessages = response;
           
            $ionicScrollDelegate.scrollBottom(false);
         });
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
                sqliteService.updateDbOnRoomOpen(data.data.messages, $stateParams.roomId).then(function(){
                    sqliteService.getMessageDataFromDB($stateParams.roomId).then(function(response){
                        self.displayChatMessages = response;
                        $scope.$evalAsync();
                        $ionicScrollDelegate.scrollBottom(false);
                    });
                });
            });
            $timeout(function() {
                 $ionicScrollDelegate.scrollBottom(false);
            });
         }
         var doRefreshPageValue = 0;
         self.doRefresh = function(){
            var query = chatPageFactory.save({
                accessToken:userData.data.access_token,
                room_id:$stateParams.roomId,
                page: doRefreshPageValue,
                limit:20,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                doRefreshPageValue++;
                $scope.$broadcast('scroll.refreshComplete');
            });
         }
     }
 })();