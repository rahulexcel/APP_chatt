(function() {
    'use strict';
    angular.module('starter')
        .factory('forgotPasswordFactory', forgotPasswordFactory);

    function forgotPasswordFactory($resource, Configurations) {
        return $resource(Configurations.api_url + '/users/forgot_password/:email', {}, {});
    };
})();