 (function() {
    'use strict';

    angular.module('starter')
        .controller('verificationController', verificationController);

    function verificationController($scope, $state, verificationFactory, tostService, timeStorage) {
            console.log('verificationController');
            this.data={
                varificationCode:'',
                email:''
                }
                if(timeStorage.get('userEmail')){
                 this.data.email = timeStorage.get('userEmail');
                }
            this.verify = function(){
                if(_.isEmpty(this.data.email) || _.isEmpty(this.data.varificationCode)){
                    tostService.notify('Please all fill the fields.', 'top');
                } else{
                    var query = verificationFactory.save({
                    email: this.data.email,
                    code: this.data.varificationCode
                    });
                    query.$promise.then(function(data) {
                        console.log(data);
                        tostService.notify(data.message, 'top');
                        if(data.status == 1){
                            $state.go('login');
                        }
                    });
                }
            };
           if(timeStorage.get('fromLoginPage')){
               console.log('fromLoginPage');
               this.showEmailInput = true;
           }
    }
})();