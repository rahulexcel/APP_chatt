(function() {
    'use strict';

    angular.module('chattapp')
            .controller('profileController', profileController);

    function profileController(cameraService, profileImageFactory, profileFactory, $timeout, $ionicModal, timeStorage, $scope, $filter, $ionicPopup) {
        var self = this;

        if (timeStorage.get('userData').data.access_token) {
            console.log('hello');
            var query = profileFactory.save({
                accessToken: timeStorage.get('userData').data.access_token,
                currentTimestamp: Date.now()
            });
            query.$promise.then(function(data) {
                self.displayprofile = data.data;
                self.date = $filter('date')(new Date(data.data.last_seen * 1000), "MMM d, y");
                if ($filter('date')(new Date(), "MMM d, y") == self.date) {
                    self.last_seen = $filter('date')(new Date(data.data.last_seen * 1000), "hh:mm a");
                } else {
                    self.last_seen = $filter('date')(new Date(data.data.last_seen * 1000), "MMM d y hh:mm a");
                }
                console.log(timeStorage.get('profile_pic'));
                if (timeStorage.get('profile_pic')) {
                    console.log(timeStorage.get('profile_pic'));
                    self.displayprofile.profile_image = timeStorage.get('profile_pic');
                }
                else {
                    self.displayprofile.profile_image = "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg";
                }
            });
        }

        self.editProfilePic = function() {

            $scope.myCroppedImage = '';
            cameraService.changePic().then(function(imageData) {
                var img = "data:image/jpeg;base64," + imageData;
                $scope.modal.show();
                $scope.myimage = img;
            }, function(err) {
                console.log("Picture failure: " + err);
            });
        };

        $scope.result = function(image) {
            $scope.myCroppedImage = image;

        };
        $scope.status = function(status, demo) {
            $scope.data = {
                text: ''
            };
            if (status) {
                $scope.data.text = status;
            }
            else {
                $scope.data.text = demo;
            }
            var myPopup = $ionicPopup.show({
                template: '<input id="statustxt" type="text"  ng-model="data.text">',
                title: 'Add new status',
                subTitle: '',
                scope: $scope,
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            console.log(profileFactory);
                            var query = profileFactory.status({
                                accessToken: timeStorage.get('userData').data.access_token,
                                status: $scope.data.text,
                                currentTimestamp: Date.now()
                            });
                            query.$promise.then(function(data) {
                                console.log(data);
                                if (data.status == 1) {
                                    self.displayprofile.profile_status = data.data.status;
                                    myPopup.close();
                                    console.log($scope.data.text);
                                }
                                else {
                                    console.log('status not update');
                                    myPopup.close();
                                }

                            });


                        }
                    }
                ]
            });
        };
        $ionicModal.fromTemplateUrl('app/profile/template/imgCropModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
//        $timeout(function(){
//            $scope.modal.show();
//        },500);
        function fixBinary(bin) {
            var length = bin.length;
            var buf = new ArrayBuffer(length);
            var arr = new Uint8Array(buf);
            for (var i = 0; i < length; i++) {
                arr[i] = bin.charCodeAt(i);
            }
            return buf;
        }

        $scope.imgChange = function() {
            $scope.modal.hide();
            var imageBase64 = $scope.myCroppedImage.replace(/^data:image\/(png|jpeg);base64,/, "");
            var binary = fixBinary(atob(imageBase64));
            var blob = new Blob([binary], {type: 'image/png', name: 'hello'});
            blob.name = 'hello';
            blob.$ngfName = 'hello';

            console.log(blob);
            var query = profileImageFactory.upload({
                accessToken: timeStorage.get('userData').data.access_token,
                file: blob,
                currentTimestamp: Date.now(),
                file_type: 'profile_image'
            });
            query.then(function(data) {
                console.log(data);
            });

            self.displayprofile.profile_image = $scope.myCroppedImage;
            timeStorage.set('profile_pic', self.displayprofile.profile_image, 10000);
        };
        $scope.imgCancel = function() {
            $scope.modal.hide();
        };
    }

})();