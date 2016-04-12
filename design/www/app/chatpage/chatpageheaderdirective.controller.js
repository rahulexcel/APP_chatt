(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageHeaderDirectiveController', chatPageHeaderDirectiveController);

    function chatPageHeaderDirectiveController($state, timeStorage, $ionicPopover, $scope, $ionicModal, $stateParams, getRoomInfoFactory, socketService, $ionicActionSheet, tostService, $ionicHistory, $interval, chatsService) {
        var self = this;
        self.leaveGroupSpinner = false;
        self.deleteGroupSpinner = false;
        var chatWithUserData = timeStorage.get('chatWithUserData');
        self.name = chatWithUserData.name;
        self.image = chatWithUserData.pic;
        self.id = chatWithUserData.id;
        console.log(typeof(chatWithUserData.lastSeen))
        if(!isNaN(chatWithUserData.lastSeen)){
            self.lastSeen = moment(parseInt(chatWithUserData.lastSeen)).format("hh:mm a");
        } else{
            self.lastSeen = chatWithUserData.lastSeen;
        }
        self.goBack = function() {
            $state.go('app.chats');
        };
        self.openModelWithSpinner = true;
        infoApi();
        function infoApi() {
            var userData = timeStorage.get('userData');
            var query = getRoomInfoFactory.save({
                accessToken: userData.data.access_token,
                room_id: $stateParams.roomId,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                self.openModelWithSpinner = false;
                self.is_room_owner = data.data.room.is_room_owner;
                self.infoName = data.data.room.room_name;
                self.infoId = data.data.room.id;
                if (data.data.room.room_image == '') {
                    self.infoImage = 'lib/group.png';
                } else {
                    self.infoImage = data.data.room.room_image;
                }
                if (data.data.room.room_background == '') {
                    self.infoBackground = 'lib/group.png';
                } else {
                    self.infoBackground = data.data.room.room_background;
                }
                self.infoCreatedOn = moment(parseInt(data.data.room.registration_time)).format("Do MMMM hh:mm a");
                self.infoDescription = data.data.room.room_description;
                for (var i = 0; i < data.data.room.room_users.length; i++) {
                    if (data.data.room.room_users[i].id == data.data.room.room_owner.id) {
                        data.data.room.room_users[i].name = data.data.room.room_users[i].name + ' (owner)';
                        data.data.room.room_users[i].owner = true;
                    }
                    data.data.room.room_users[i].last_seen = moment(parseInt(data.data.room.room_users[i].last_seen)).format("Do MMMM hh:mm a");
                }
                self.infoUserList = data.data.room.room_users;
            });
        }
        self.openInfo = function() {
            self.deleteIconRotate = -1;
            if (!chatWithUserData.id) {
                $scope.infoModel.show();
            }
        }
        var hideSheet;
        self.leaveGroup = function() {
            $scope.infoModel.hide();
            hideSheet = $ionicActionSheet.show({
                buttons: [{
                        text: '<p class="text-center">Yes</p>'
                    }],
                titleText: 'Confirm to leave ' + self.infoName + ' !',
                cancelText: 'Cancel',
                cancel: function() {

                },
                buttonClicked: function(index) {
                    if (index == 0) {
                        self.leaveGroupSpinner = true;
                        socketService.leaveGroup($stateParams.roomId);
                    }
                }
            });
        }
        $scope.$on('leaved_public_group', function(event, data) {
            hideSheet();
            tostService.notify(data.data.data.message, 'top');
            $state.go('app.chats');
        });
        self.deleteUserFromGroup = function(userData, index) {
            $scope.infoModel.hide();
            var deleteUserFromGroupSheet = $ionicActionSheet.show({
                buttons: [{
                        text: '<p class="text-center">Yes</p>'
                    }],
                titleText: 'Confirm to delete ' + userData.name + ' From ' + self.infoName + ' !',
                cancelText: 'Cancel',
                cancel: function() {

                },
                buttonClicked: function(index) {
                    if (index == 0) {
                        deleteUserFromGroupSheet();
                        $scope.infoModel.show();
                        self.deleteIconRotate = index;
                        socketService.removeUserFromGroup(userData, $stateParams.roomId);
                    }
                }
            });
        }
        $scope.$on('removed_public_room_member', function(event, data) {
            infoApi();
        });
        $scope.$on('got_user_profile_for_room', function(event, data) {
            self.lastSeen = moment(parseInt(data.data.data.last_seen)).format("hh:mm a");
        });
        $ionicModal.fromTemplateUrl('infoModel.html', function($ionicModal) {
            $scope.infoModel = $ionicModal;
        }, {
            scope: $scope
        });
        var getUserProfileForRoomInterval = $interval(function () {
            if($ionicHistory.currentView().stateName != 'app.chatpage'){
                $interval.cancel(getUserProfileForRoomInterval);
            } else{
                if(self.id){
                    socketService.getUserProfileForRoom($stateParams.roomId, self.id);
                }
            }
        }, 60000);
        self.deleteRoom = function(){
            $scope.infoModel.hide();
            var deleteRoomSheet = $ionicActionSheet.show({
                buttons: [{
                        text: '<p class="text-center">Yes</p>'
                    }],
                titleText: 'Confirm to delete ' + self.infoName + ' !',
                cancelText: 'Cancel',
                cancel: function() {
                    $scope.infoModel.show();
                },
                buttonClicked: function(index) {
                    if (index == 0) {
                        self.deleteGroupSpinner = true;
                        deleteRoomSheet();
                        socketService.deleteRoom($stateParams.roomId);
                        $scope.infoModel.show();
                    }
                }
            });
        }
        $scope.$on('deleted_public_room', function(event, data) {
            $scope.infoModel.hide();
            chatsService.listMyRooms();
            tostService.notify(data.data.message, 'top');
            $state.go('app.chats');
        });
    }
})();