(function() {
    'use strict';
    angular.module('chattapp')
            .factory('profileFactory', profileFactory);

    function profileFactory($resource, Configurations) {
        return $resource(Configurations.api_url + '/users/my_profile/:accessToken/:currentTimestamp/', {}, {
            status: {
                method: 'POST',
                url: Configurations.api_url + '/users/update_profile_status/:accessToken/:status/:currentTimestamp'
            }
        });
    }
    ;
})();
