 (function() {
     'use strict';

     angular.module('starter')
         .controller('verificationController', verificationController);

     function verificationController($state, verificationFactory, tostService, timeStorage,resendVerificationCodeFactory) {
         var self = this;
         self.data = {
             verificationCode: '',
             email: ''
         }
         if (timeStorage.get('userEmail')) {
             self.data.email = timeStorage.get('userEmail');
         }
         self.verify = function() {
             if (_.isEmpty(self.data.email) || _.isEmpty(self.data.verificationCode)) {
                 tostService.notify('Please all fill the fields.', 'top');
             } else {
                 var query = verificationFactory.save({
                     email: self.data.email,
                     code: self.data.verificationCode
                 });
                 query.$promise.then(function(data) {
                     tostService.notify(data.message, 'top');
                     if (data.status == 1) {
                         $state.go('login');
                     }
                 });
             }
         };
         self.resendVerification = function(){
                var query = resendVerificationCodeFactory.save({
                    email: self.data.email
                });
                query.$promise.then(function(data) {
                    console.log(data);
                    tostService.notify(data.message, 'top');
                });
            };
     }
 })();