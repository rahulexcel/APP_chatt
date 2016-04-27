(function() {
    'use strict';

    angular.module('chattapp')
            .controller('publicChatsController', publicChatsController);

    function publicChatsController($ionicModal, $scope, socketService, tostService, publicChatService, timeStorage, $state, publicChatFactory, getRoomInfoFactory, timeZoneService) {
        var self = this;
        var network;
//        self.displayPublicChat = timeStorage.get('displayPublicChats');
        if (timeStorage.get('network')) {
            window.plugins.toast.showShortTop('Connect to come online');
            network = false;
        }
        else {
            publicChatService.listRooms();
            network = true;
        }
        $scope.$on('now_device_is_online', function(event, response) {
            network = true;
            publicChatService.listRooms();
        });
         $scope.$on('now_device_is_ofline', function(event, response) {
            network = false;
        });
        $scope.$on('updatedDisplayPublicChats', function(event, response) {
            self.displayPublicChat = response.data;
            $scope.$evalAsync();
        });

        self.createGroupOption = false;
        self.createGroup = function() {
            console.log(network)
            if (network) {
                if (self.userGroupName && self.userGroupDescription) {
                    self.createGroupOption = true;
                    var userData = timeStorage.get('userData');
                    var query = publicChatFactory.save({
                        accessToken: userData.data.access_token,
                        room_type: 'public',
                        chat_with: '',
                        room_name: self.userGroupName,
                        room_description: self.userGroupDescription,
                        currentTimestamp: _.now()
                    });
                    query.$promise.then(function(data) {
                        if (data.data.room_id) {
                            self.createGroupOption = false;
                            self.userGroupName = '';
                            self.userGroupDescription = '';
                            tostService.notify(data.message, 'top');
                            publicChatService.listRooms();
                            $scope.modal.hide();
                            $state.go('app.chats');
                        }
                    });
                } else {
                    tostService.notify('Please fill details', 'top');
                }
            }
            else{
                 window.plugins.toast.showShortTop('Connect to come online');
            }
        };

        self.clickOnRoom = function(roomData, index) {
            console.log(network)
            if (network) {
                self.clickRoomSpinner = index;
                $scope.room_id = roomData.id;
                var userData = timeStorage.get('userData');
                var query = getRoomInfoFactory.save({
                    accessToken: userData.data.access_token,
                    room_id: roomData.id,
                    currentTimestamp: _.now()
                });
                query.$promise.then(function(data) {
                    self.groupName = data.data.room.room_name;
                    self.groupId = data.data.room.id;
                    if (data.data.room.room_image == '') {
                        self.groupImage = 'lib/group.png';
                    } else {
                        self.groupImage = data.data.room.room_image;
                    }
                    if (data.data.room.room_background == '') {
                        self.groupBackground = 'lib/group.png';
                    } else {
                        self.groupBackground = data.data.room.room_background;
                    }
                    self.groupCreatedOn = moment(parseInt(data.data.room.registration_time)).format("Do MMMM hh:mm a");
                    self.groupDescription = data.data.room.room_description;
                    for (var i = 0; i < data.data.room.room_users.length; i++) {
                        data.data.room.room_users[i].last_seen = moment.unix(data.data.room.room_users[i].last_seen).tz(timeZoneService.getTimeZone()).format("Do MMMM hh:mm a");
                        if (data.data.room.room_users[i].id == data.data.room.room_owner.id) {
                            data.data.room.room_users[i].name = data.data.room.room_users[i].name + ' (owner)';
                        }
                    }
                    self.groupUserList = data.data.room.room_users;
                    $scope.groupModel.show();
                    self.clickRoomSpinner = -1;
                });
            }
             else{
                 window.plugins.toast.showShortTop('Connect to come online');
            }
        };
        self.joinRoom = function() {
            var userData = timeStorage.get('userData');
            self.joinRoomSpinner = true;
            socketService.joinPublicRoom(self.groupId).then(function(response) {
                tostService.notify(response.data.message, 'top');
                var clickRoomUserData = {
                    "name": self.groupName,
                    "id": '',
                    "pic": self.groupImage,
                    "lastSeen": self.groupDescription
                }
                timeStorage.set('chatWithUserData', clickRoomUserData, 1);
                socket.emit('APP_SOCKET_EMIT', 'room_open', {accessToken: userData.data.access_token, room_id: response.data.data.room_id, currentTimestamp: _.now()});
                $scope.groupModel.hide();
                $state.go('app.chatpage', {roomId: response.data.data.room_id});
            });
        }
        $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            scope: $scope
        });
        $ionicModal.fromTemplateUrl('groupDetails.html', function($ionicModal) {
            $scope.groupModel = $ionicModal;
        }, {
            scope: $scope
        });
        self.roomTypes = [
            'Public',
            'Private'
        ];
        self.userGroupType = 'Public';
    }
})();