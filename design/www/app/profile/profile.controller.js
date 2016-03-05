 (function() {
     'use strict';

     angular.module('starter')
         .controller('profileController', profileController);

     function profileController(cameraService) {
         console.log('profileController');
         var self = this;
         self.displayprofile = [{
             "image": "https://s3.amazonaws.com/uifaces/faces/twitter/homka/128.jpg",
             "status": "I am designing something.",
             "userName": "David M."
         }];
         self.editProfilePic = function() {
             cameraService.changePic().then(function(imageData) {
                 self.displayprofile[0].image = "data:image/jpeg;base64," + imageData;
             }, function(err) {
                 console.log("Picture failure: " + err);
             });
         };
     }
 })();