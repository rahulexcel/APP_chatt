 (function() {
     'use strict';

     angular.module('starter')
         .controller('verificationController', verificationController);

     function verificationController($state, verificationFactory, tostService, timeStorage) {
         this.data = {
             verificationCode: '',
             email: ''
         }
         if (timeStorage.get('userEmail')) {
             this.data.email = timeStorage.get('userEmail');
         }
         this.verify = function() {
             if (_.isEmpty(this.data.email) || _.isEmpty(this.data.verificationCode)) {
                 tostService.notify('Please all fill the fields.', 'top');
             } else {
                 var query = verificationFactory.save({
                     email: this.data.email,
                     code: this.data.verificationCode
                 });
                 query.$promise.then(function(data) {
                     tostService.notify(data.message, 'top');
                     if (data.status == 1) {
                         $state.go('login');
                     }
                 });
             }
         };
     }
 })();