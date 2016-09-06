var googleLoginService = angular.module('GoogleLoginService', ['ngStorage']);
googleLoginService.factory('timeStorage', ['$localStorage', function($localStorage) {
        var timeStorage = {};
        timeStorage.cleanUp = function() {
            var cur_time = new Date().getTime();
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.indexOf('_expire') === -1) {
                    var new_key = key + "_expire";
                    var value = localStorage.getItem(new_key);
                    if (value && cur_time > value) {
                        localStorage.removeItem(key);
                        localStorage.removeItem(new_key);
                    }
                }
            }
        };
        timeStorage.remove = function(key) {
            //this.cleanUp();
            var time_key = key + '_expire';
            $localStorage[key] = false;
            $localStorage[time_key] = false;
        };
        timeStorage.set = function(key, data, hours) {
            //this.cleanUp();
            $localStorage[key] = data;
            var time_key = key + '_expire';
            var time = new Date().getTime();
            time = time + (hours * 1 * 60 * 60 * 1000);
            $localStorage[time_key] = time;
        };
        timeStorage.get = function(key) {
            //this.cleanUp();
            var time_key = key + "_expire";
            if (!$localStorage[time_key]) {
                return false;
            }
            var expire = $localStorage[time_key] * 1;
            // if (new Date().getTime() > expire) {
            //     $localStorage[key] = null;
            //     $localStorage[time_key] = null;
            //     return false;
            // }
            return $localStorage[key];
        };
        return timeStorage;
    }]);


googleLoginService.factory('googleLogin', [
    '$http', '$q', '$interval', '$log', 'timeStorage', 'Configurations',
    function($http, $q, $interval, $log, timeStorage, Configurations) {
        var service = {};
        service.access_token = false;
        service.redirect_url = 'http://localhost';
        service.client_id = '1009675706541-dmc2t32u755as3pms8f6llcrhed8lvt6.apps.googleusercontent.com';
        service.secret = 'BQSLccofHJjg9t-_-w66Q_qc';
        service.scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/plus.me';
//        service.redirect_url = 'http://projects.excellencetechnologies.in:8080/chatApp/';
//        service.client_id = '49249722713-ekm1v14jmp90r283r08vapu7ktndb7ag.apps.googleusercontent.com';
//        service.secret = 'YiGvTPyzcf7_IqfuY8sO9WjZ';
//        service.scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/plus.me';
        service.gulp = function(url, name) {
            url = url.substring(url.indexOf('?') + 1, url.length);

            return url.replace('code=', '');
        };
        service.authorize = function(options) {
            var def = $q.defer();
            var self = this;

            var access_token = timeStorage.get('google_access_token');
            if (access_token) {
                $log.info('Direct Access Token :' + access_token);
                service.getUserInfo(access_token, def);
            } else {

                var params = 'client_id=' + encodeURIComponent(options.client_id);
                params += '&redirect_uri=' + encodeURIComponent(options.redirect_uri);
                params += '&response_type=code';
                params += '&scope=' + encodeURIComponent(options.scope);
                var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + params;

                var win = window.open(authUrl, '_blank', 'location=no,toolbar=no,width=800, height=800');
                var context = this;

                if (ionic.Platform.isWebView()) {
                    win.addEventListener('loadstart', function(data) {
                        if (data.url.indexOf(context.redirect_url) === 0) {
                            win.close();
                            var url = data.url;
                            var access_code = context.gulp(url, 'code');
                            if (access_code) {
                                context.validateToken(access_code, def);
                            } else {
                                def.reject({
                                    error: 'Access Code Not Found'
                                });
                            }
                        }

                    });
                } else {
                    var pollTimer = $interval(function() {
                        try {
                            if (win.document.URL.indexOf(context.redirect_url) === 0) {
                                win.close();
                                $interval.cancel(pollTimer);
                                pollTimer = false;
                                var url = win.document.URL;
                                $log.debug('Final URL ' + url);
                                var access_code = context.gulp(url, 'code');
                                if (access_code) {
                                    $log.info('Access Code: ' + access_code);
                                    context.validateToken(access_code, def);
                                } else {
                                    def.reject({
                                        error: 'Access Code Not Found'
                                    });
                                }
                            }
                        } catch (e) {
                        }
                    }, 100);
                }
            }
            return def.promise;
        };
        service.validateToken = function(token, def) {
            $log.info('Code: ' + token);
            var http = $http({
                url: 'https://www.googleapis.com/oauth2/v3/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: {
                    code: token,
                    client_id: this.client_id,
                    client_secret: this.secret,
                    redirect_uri: this.redirect_url,
                    grant_type: 'authorization_code',
                    scope: ''
                }
            });
            var context = this;
            http.then(function(data) {
                $log.debug(data);
                var access_token = data.data.access_token;
                var expires_in = data.data.expires_in;
                expires_in = expires_in * 1 / (60 * 60);
                timeStorage.set('google_access_token', access_token, expires_in);
                if (access_token) {
                    $log.info('Access Token :' + access_token);
                    context.getUserInfo(access_token, def);
                } else {
                    def.reject({
                        error: 'Access Token Not Found'
                    });
                }
            });
        };
        service.getUserInfo = function(access_token, def) {
            var http = $http({
                url: 'https://www.googleapis.com/oauth2/v3/userinfo',
                method: 'GET',
                params: {
                    access_token: access_token
                }
            });
            http.then(function(data) {
                $log.debug(data);
                var user_data = data.data;
                var user = {
                    name: user_data.name,
                    gender: user_data.gender,
                    email: user_data.email,
                    google_id: user_data.sub,
                    picture: user_data.picture,
                    profile: user_data.profile
                };
                def.resolve(user);
            });
        };
        service.getUserFriends = function() {
            var access_token = this.access_token;
            var http = $http({
                url: 'https://www.googleapis.com/plus/v1/people/me/people/visible',
                method: 'GET',
                params: {
                    access_token: access_token
                }
            });
            http.then(function(data) {
            });
        };
        service.getUserFullDetails = function(userId) {
            var def = $q.defer();
            var http = $http({
                url: 'https://www.googleapis.com/plus/v1/people/' + userId,
                method: 'GET',
                params: {
                    key: Configurations.googleApiKey
                }
            });
            http.then(function(data) {
                def.resolve(data.data);
            }, function(data) {
                $log.error(data);
                def.reject(data.error);
            });
            return def.promise;
        };
        service.startLogin = function() {
            var def = $q.defer();
            var promise = this.authorize({
                client_id: this.client_id,
                client_secret: this.secret,
                redirect_uri: this.redirect_url,
                scope: this.scope
            });
            promise.then(function(data) {
                def.resolve(data);
            }, function(data) {
                $log.error(data);
                def.reject(data.error);
            });
            return def.promise;
        };
        return service;
    }
]);