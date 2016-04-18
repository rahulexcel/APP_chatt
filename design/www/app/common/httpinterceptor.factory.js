(function() {
    'use strict';
    angular.module('chattapp')
            .factory('myInterceptor', function($localStorage, $injector) {
                var requestInterceptor = {
                    data: null,
                    request: function(config) {
                        var currentUser = $localStorage.userData;
                        if (currentUser) {
                            var accessToken = currentUser.data.access_token;
                            var configURL = config.url;
                            if (configURL.substring(0, 38) == 'http://144.76.34.244:3033/api/uploads/') {

                                config.url = config.url + '?file_type=profile_image&accessToken=' + accessToken + '&currentTimestamp=' + _.now() + '';
                            }
                            else
                            if (configURL.substring(0, 10) == 'http://144') {
                                config.url = config.url + '?access_token=' + accessToken + '&currentTimestamp=' + _.now() + '';
                            }
                        }
                        if (config.method == 'POST') {
                            $localStorage.lastTimeStampFireApi = _.now();
                        }
                        return config;
                    },
                    response: function(response) {
                        if (response.data.status == 401 || response.data.message == 'UnAuthorized') {
                            var timeStorage = $injector.get('timeStorage');
                            $injector.get('socketService').logout();
                            $injector.get('tostService').notify(response.data.message + ' Please login again !', 'top');
                            timeStorage.remove('google_access_token');
                            timeStorage.remove('userEmail');
                            timeStorage.remove('userData');
                            timeStorage.remove('displayPrivateChats');
                            timeStorage.remove('listUsers');
                            timeStorage.remove('chatWithUserData');
                            timeStorage.remove('displayPublicChats');
                            $injector.get('$state').go('login');
                        }
                        return response;
                    }
                };
                return requestInterceptor;
            });
})();