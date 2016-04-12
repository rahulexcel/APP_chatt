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
                            console.log();
                            if(configURL.substring(0, 10) == 'http://144'){
                                config.url = config.url + '?access_token='+accessToken+'&currentTimestamp='+_.now()+'';
                            }
                        }
                        if(config.method == 'POST'){
                            $localStorage.lastTimeStampFireApi = _.now();
                        }
                        return config;
                    },
                    response: function(response){
                        if(response.data.status == 401 || response.data.message == 'UnAuthorized'){
                            var timeStorage = $injector.get('timeStorage');
                            $injector.get('socketService').logout();
                            $injector.get('tostService').notify(response.data.message+ ' Please login again !', 'top');
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