 (function() {
     'use strict';

     angular.module('starter')
         .controller('contactsController', contactsController);

     function contactsController(contactsFactory, $ionicLoading) {
         console.log('contactsController');
         var self = this;
         $ionicLoading.show();
         var query = contactsFactory.query({
             user_id: '123456'
         });
         query.$promise.then(function(data) {
             console.log(data);
             $ionicLoading.hide();
             self.displaycontacts = data;
         });
     }
 })();