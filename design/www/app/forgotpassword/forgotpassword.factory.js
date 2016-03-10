(function() {
    'use strict';
    angular.module('chattapp')
        .factory('forgotPasswordFactory', forgotPasswordFactory);

    function forgotPasswordFactory($resource, Configurations) {
        return $resource(Configurations.api_url + '/users/forgot_password/:email', {}, {});
    };
})();