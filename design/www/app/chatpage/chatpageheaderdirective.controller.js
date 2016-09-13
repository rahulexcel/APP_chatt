(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageHeaderDirectiveController', chatPageHeaderDirectiveController);

    function chatPageHeaderDirectiveController($state, timeStorage, $rootScope, $ionicScrollDelegate, cameraService, profileImageFactory, $ionicPopover, $scope, $ionicModal, $stateParams, getRoomInfoFactory, socketService, $ionicActionSheet, tostService, $ionicHistory, $interval, chatsService, getUserProfileFactory, timeZoneService, sqliteService, $ionicLoading, geoLocation, $localStorage, Upload) {
        var self = this;
        self.leaveGroupSpinner = false;
        self.deleteGroupSpinner = false;
        var chatWithUserData = timeStorage.get('chatWithUserData');
        self.name = chatWithUserData.name;
        self.image = chatWithUserData.pic;
        self.id = chatWithUserData.id;
        if (self.id == undefined)
        {
            self.shareLocation = false;
        }
        else
        {
            self.shareLocation = true;
        }
        if (!isNaN(chatWithUserData.lastSeen)) {
            self.lastSeen = moment.unix(chatWithUserData.lastSeen).tz(timeZoneService.getTimeZone()).format("hh:mm a");
        } else {
            self.lastSeen = chatWithUserData.lastSeen;
        }
        self.goBack = function() {
            $rootScope.isFocused = 'focusOut';
            $state.go('app.chats');
        };
        self.openModelWithSpinner = true;
        if (!chatWithUserData.id) {
            infoApi();
        } else {
            infoApiUser(self.id);
        }

        function infoApi() {
            var userData = timeStorage.get('userData');
            var query = getRoomInfoFactory.save({
                accessToken: userData.data.access_token,
                room_id: $stateParams.roomId,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                if (data.data.admin_friends_not_room_members) {
                    for (var i = 0; i < data.data.admin_friends_not_room_members.length; i++) {
                        data.data.admin_friends_not_room_members[i].last_seen = moment.unix(data.data.admin_friends_not_room_members[i].last_seen).tz(timeZoneService.getTimeZone()).format("Do MMMM hh:mm a");
                    }
                    self.admin_friends_not_room_members = data.data.admin_friends_not_room_members;
                }
                self.openModelWithSpinner = false;
                self.is_room_owner = data.data.room.is_room_owner;
                self.infoNameShort = data.data.room.short_room_name;
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
                    self.infoBackground = data.data.room.room_image;
                }
                self.infoCreatedOn = moment(parseInt(data.data.room.registration_time)).format("Do MMMM hh:mm a");
                self.infoDescription = data.data.room.room_description;
                for (var i = 0; i < data.data.room.room_users.length; i++) {
                    if (data.data.room.room_users[i].id == data.data.room.room_owner.id) {
                        data.data.room.room_users[i].name = data.data.room.room_users[i].name + ' (owner)';
                        data.data.room.room_users[i].owner = true;
                    }
                    data.data.room.room_users[i].last_seen = moment.unix(data.data.room.room_users[i].last_seen).tz(timeZoneService.getTimeZone()).format("Do MMMM hh:mm a");
                }
                self.infoUserList = data.data.room.room_users;
            });
        }

        function infoApiUser(userId) {
            var userData = timeStorage.get('userData');
            var query = getUserProfileFactory.save({
                accessToken: userData.data.access_token,
                user_id: userId,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                self.displayUserProfileName = data.data.name;
                self.displayUserProfileId = data.data.user_id;
                self.displayUserProfileLastSeenInTimeStamp = data.data.last_seen;
                if (data.data.profile_image) {
                    self.displayUserProfileImage = data.data.profile_image;

                } else {
                    self.displayUserProfileImage = "img/user.png";

                }
                self.displayUserProfileLastSeen = moment.unix(data.data.last_seen).tz(timeZoneService.getTimeZone()).format("Do MMMM hh:mm a");
                self.displayUserProfilePrivateRooms = data.data.user_private_rooms;
                self.displayUserProfilePublicRooms = data.data.user_public_rooms;
                self.displayUserProfileStatus = data.data.profile_status;
                self.displayUserProfileGender = data.data.gender;
                self.displayUserProfileDOB = data.data.dob;
            });
        }
        self.openInfo = function() {
            self.deleteIconRotate = -1;
            if (!chatWithUserData.id) {
                infoApi();
                $scope.infoModel.show();
            } else {
                infoApiUser(self.id);
                $scope.infoModelUser.show();
            }
        };
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
                        socketService.removeUserFromGroup(userData, $stateParams.roomId);
                    }
                }
            });
        }
        $scope.$on('removed_public_room_member', function(event, data) {
            infoApi();
        });
        $scope.$on('got_user_profile_for_room', function(event, data) {
            if(data.data.data.status == 'online')
                self.lastSeen = 'online';
            else
                self.lastSeen = 'last seen '+moment.unix(data.data.data.last_seen).tz(timeZoneService.getTimeZone()).format("hh:mm a");
        });
        $ionicModal.fromTemplateUrl('infoModel.html', function($ionicModal) {
            $scope.infoModel = $ionicModal;
        }, {
            scope: $scope
        });
        $ionicModal.fromTemplateUrl('infoModelUser.html', function($ionicModal) {
            $scope.infoModelUser = $ionicModal;
        }, {
            scope: $scope
        });
        var getUserProfileForRoomInterval = $interval(function() {
            if ($ionicHistory.currentView().stateName != 'app.chatpage') {
                $interval.cancel(getUserProfileForRoomInterval);
            } else {
                if (!$rootScope.room) {
                    socketService.getUserProfileForRoom($stateParams.roomId, self.id);
                }
            }
        }, 60000);
        self.deleteRoom = function() {
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
        $ionicModal.fromTemplateUrl('app/profile/template/imgCropModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.imageModal = modal;
        });
        self.infoUserClick = function(userData) {
            self.displayUserProfileName = '';
            self.displayUserProfileId = '';
            self.displayUserProfileLastSeenInTimeStamp = '';
            self.displayUserProfileImage = '';
            self.displayUserProfileLastSeen = '';
            self.displayUserProfilePrivateRooms = '';
            self.displayUserProfilePublicRooms = '';
            self.displayUserProfileStatus = '';
            infoApiUser(userData.id);
            $scope.infoModelUser.show();
        };

        function fixBinary(bin) {
            var length = bin.length;
            var buf = new ArrayBuffer(length);
            var arr = new Uint8Array(buf);
            for (var i = 0; i < length; i++) {
                arr[i] = bin.charCodeAt(i);
            }
            return buf;
        }

        var userData = timeStorage.get('userData');
        function onSuccess(imageData) {
            $ionicLoading.show({template: 'Image Uploading...'});
            var img = "data:image/jpeg;base64," + imageData;
            var userData = timeStorage.get('userData');
            var currentMessage = {
                "id": 78524,
                "image": userData.data.profile_image,
                "message": "<img class='sendImage' src=" + img + ">",
                "messageTime": moment(_.now()).format("hh:mm a"),
                "timeStamp": _.now(),
                "name": userData.data.name,
                "user_id": userData.data.user_id,
                "message_status": 'sent'
            };
            $rootScope.$broadcast('displayChatMessages', {data: currentMessage});
            $ionicScrollDelegate.scrollBottom(false);
            var imageBase64 = img.replace(/^data:image\/(png|jpeg);base64,/, "");
            var binary = fixBinary(atob(imageBase64));
            var blob = new Blob([binary], {type: 'image/png', name: 'png'});
            blob.name = 'png';
            blob.$ngfName = 'png';
            $scope.imagesample = img;
            self.imagesend(blob);
        }
        ;
        function onFail(message) {
            $ionicLoading.hide();
        };
        self.attachImage = function(file) {
            if (file) {
                var filedata = file[0];
                Upload.base64DataUrl(file).then(function(urls){
                    console.log(urls);
                    var userData = timeStorage.get('userData');
                    var currentMessage = {
                        "id": 785412,
                        "image": userData.data.profile_image,
                        "message": "<img class='sendImage' src=" + urls[0] + ">",
                        "messageTime": moment(_.now()).format("hh:mm a"),
                        "timeStamp": _.now(),
                        "name": userData.data.name,
                        "user_id": userData.data.user_id,
                        "message_status": 'sent'
                    };
                    $rootScope.$broadcast('displayChatMessages', {data: currentMessage});
                    $ionicScrollDelegate.scrollBottom(false);
                });
                self.imagesend(filedata);
            } else {
                navigator.camera.getPicture(onSuccess, onFail, {
                    quality: 9,
                    destinationType: Camera.DestinationType.DATA_URL,
                    correctOrientation: true,
                    // allowEdit: true,
                    sourceType: Camera.PictureSourceType.CAMERA
                });
            }
        };

        self.sendLocation = function() {
            cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
                if (!enabled) {
                    geoLocation.share();
                } else {
                    var userData = timeStorage.get('userData');
                    var currentTimeStamp = _.now();
                    socketService.roomOpen($stateParams.roomId);
                    sqliteService.saveMessageInDb("<img src='https://lh3.googleusercontent.com/MOf9Kxxkj7GvyZlTZOnUzuYv0JAweEhlxJX6gslQvbvlhLK5_bSTK6duxY2xfbBsj43H=w300' id='map' height='70' width='100' value='{lat:" + $localStorage.lat + ",lng:" + $localStorage.lng + "}'/>", 'post', userData.data.user_id, userData.data.name, userData.data.profile_image, $stateParams.roomId, currentTimeStamp).then(function(lastInsertId) {
                        if (timeStorage.get('network')) {
                        } else {
                            socketService.room_message(lastInsertId, $stateParams.roomId, "<img src='https://lh3.googleusercontent.com/MOf9Kxxkj7GvyZlTZOnUzuYv0JAweEhlxJX6gslQvbvlhLK5_bSTK6duxY2xfbBsj43H=w300' id='map' height='70' width='100' value='{lat:" + $localStorage.lat + ",lng:" + $localStorage.lng + "}'/>", currentTimeStamp);
                        }
                        $ionicLoading.hide();
                        var currentMessage = {
                            "id": lastInsertId,
                            "image": userData.data.profile_image,
                            "message": "<img src='https://lh3.googleusercontent.com/MOf9Kxxkj7GvyZlTZOnUzuYv0JAweEhlxJX6gslQvbvlhLK5_bSTK6duxY2xfbBsj43H=w300' id='map' height='70' width='100' value='{lat:" + $localStorage.lat + ",lng:" + $localStorage.lng + "}'/>",
                            "messageTime": moment(currentTimeStamp).format("hh:mm a"),
                            "timeStamp": currentTimeStamp,
                            "name": userData.data.name,
                            "user_id": userData.data.user_id,
                            "message_status": 'post'
                        };

                        $rootScope.$broadcast('displayChatMessages', {
                            data: currentMessage
                        });
                        $ionicScrollDelegate.scrollBottom(false);
                    }, 100);
                }
            }, function(error) {
                //error
            });
        }

        var userData = timeStorage.get('userData');


        self.imagesend = function(filedata) {
            var query = profileImageFactory.upload({
                file: filedata,
                currentTimestamp: Date.now(),
                append_data: {room_id: $stateParams.roomId, file_type: 'room_file', accessToken: timeStorage.get('userData').data.access_token}
            });
            query.then(function(data) {
                if (data.data.status == 1) {
                    var currentTimeStamp = _.now();
                    socketService.roomOpen($stateParams.roomId);
                    sqliteService.saveMessageInDb("<img class='sendImage' src=" + data.data.data.url + ">", 'post', userData.data.user_id, userData.data.name, userData.data.profile_image, $stateParams.roomId, currentTimeStamp).then(function(lastInsertId) {
                        if (timeStorage.get('network')) {
                        } else {
                            socketService.room_message(lastInsertId, $stateParams.roomId, "<img class='sendImage' src=" + data.data.data.url + ">", currentTimeStamp);
                        }
                        $ionicLoading.hide();
                    }, 100);


                } else {
                    window.plugins.toast.showShortTop('Image not upload');
                }
            });
        }
        $ionicPopover.fromTemplateUrl('app/chatpage/templates/privateChatPopover.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
        });
        self.openPopover = function($event) {
            $scope.popover.show($event);
        };
        $ionicPopover.fromTemplateUrl('app/chatpage/templates/publicChatPopover.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.openGroupPopover = popover;
        });
        self.openGroupPopover = function($event) {
            $scope.openGroupPopover.show($event);
        };
        self.leavePrivateChat = function() {
            var leaveChatSheet = $ionicActionSheet.show({
                buttons: [{
                        text: '<p class="text-center">Yes</p>'
                    }],
                titleText: 'Confirm to Leave!',
                cancelText: 'Cancel',
                cancel: function() {
                },
                buttonClicked: function(index) {
                    if (index == 0) {
                        socketService.leavePrivateChat($stateParams.roomId);
                    }
                }
            });
        }
        $scope.$on('private_room_deleted', function(event, data) {
            sqliteService.leavePrivateChat($stateParams.roomId);
            $state.go('app.chats');
        });
        self.blockPrivateUser = function() {
            var blockPrivateUserSheet = $ionicActionSheet.show({
                buttons: [{
                        text: '<p class="text-center">Yes</p>'
                    }],
                titleText: 'Confirm to Block!',
                cancelText: 'Cancel',
                cancel: function() {
                },
                buttonClicked: function(index) {
                    if (index == 0) {
                        socketService.blockPrivateUser($stateParams.roomId);
                    }
                }
            });
        };
        $scope.$on('private_room_blocked', function(event, data) {
            sqliteService.leavePrivateChat($stateParams.roomId);
            $state.go('app.chats');
        });
        self.addInGroup = function() {
            $state.go('app.addInGroup');
            $scope.popover.hide();
        };
        $ionicPopover.fromTemplateUrl('app/chatpage/templates/attachfilepopover.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.openAttachFilePopover = popover;
        });
        self.openAttachFilePopover = function($event) {
            $scope.openAttachFilePopover.show($event);
        };
        self.closeAttachFilePopover = function() {
            $scope.openAttachFilePopover.hide();
        };
        self.hidePop=function(){
            
            $scope.openAttachFilePopover.hide();
        };
        self.inviteInGroup = function() {
            timeStorage.set('inviteInGroupId', $stateParams.roomId, 1);
        };
        self.muteNotifications = true;
        $scope.myCroppedImage = '';
        self.editProfilePic = function() {
            cameraService.changePic().then(function(imageData) {
                $scope.modal.show();
                var img = "data:image/jpeg;base64," + imageData;
                $scope.myimage = img;
                $ionicLoading.hide();
            }, function(err) {
                $ionicLoading.hide();
                window.plugins.toast.showShortTop('Unable to retrieve image');
            });
        };
        $ionicModal.fromTemplateUrl('app/profile/template/imgCropModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.result = function(image) {
            $scope.myCroppedImage = image;
        };
        $scope.imgChange = function() {
            if ($scope.myCroppedImage || $scope.myBgCroppedImage) {

                var imageData, appenddata;
                imageData = $scope.myCroppedImage;
                appenddata = {file_type: 'room_image', room_id: $stateParams.roomId, accessToken: timeStorage.get('userData').data.access_token}

                $scope.startLoading = true;
                var imageBase64 = imageData.replace(/^data:image\/(png|jpeg);base64,/, "");
                var binary = fixBinary(atob(imageBase64));
                var blob = new Blob([binary], {type: 'image/png', name: 'png'});
                blob.name = 'png';
                blob.$ngfName = 'png';
                var query = profileImageFactory.upload({
                    file: blob,
                    currentTimestamp: Date.now(),
                    append_data: appenddata
                });
                query.then(function(data) {
                    if (data.data.status == 1) {
                        self.infoImage = data.data.data.url;
                        $scope.startLoading = false;
//                        var pr_image = timeStorage.get('userData');
//                        pr_image.data.profile_image = self.displayprofile.profile_image;
//                        sqliteService.updateUserProfie(self.displayprofile.profile_image);
                        $scope.modal.hide();

                    } else {
                        $scope.startLoading = false;
                        window.plugins.toast.showShortTop('Image not upload');
                    }
                });
            } else {
                window.plugins.toast.showShortTop('Please set your pic');
            }
        };

        $scope.imgCancel = function() {
            $scope.modal.hide();
            $scope.backGroundModal.hide();
        };
        $scope.stopLoading = function() {
            $scope.startLoading = false;
            $scope.start = false;
        };
    }
})();

