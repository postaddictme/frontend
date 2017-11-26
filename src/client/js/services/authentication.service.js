(function () {

    'use strict';

    angular
        .module('postaddict')
        .factory('authenticationService', authenticationService);

    /* jshint -W101 */
    authenticationService.$inject = ['$http', '$q', '$window', '$state', 'API'];

    /* @ngInject */
    function authenticationService($http, $q, $window, $state, API) {
        var userInfo;
        var api = API.HOST;

        init();

        return {
            signup: signup,
            login: login,
            resetPassword: resetPassword,
            verifyPasswordRecoveryKey: verifyPasswordRecoveryKey,
            changePasswordByKey: changePasswordByKey,
            getUserInfo: getUserInfo,
            changeAccessToken: changeAccessToken,
            updateUserInfo: updateUserInfo,
            logout: logout
        };

        function signup(email, language) {
            var url = api + 'user/registration';
            var data = {email: email, language: language};

            return $http.post(url, data)
                .then(parseResult());
        }

        function login(email, password) {
            return $http.post(api + 'user/login', {
                    email: email,
                    password: password
                })
                .then(parseResult(function (result) {
                    userInfo = result.data.data;
                    var moment1 = moment(result.data.data.activeBefore, 'YYYY-MM-DD HH:mm:ss');
                    userInfo.activeBefore = moment1.format('DD MMMM YYYY');
                    $window.localStorage['userInfo'] = JSON.stringify(userInfo);
                    return userInfo;
                }));
        }

        function resetPassword(email) {
            return $http.post(api + 'user/reset-password', {
                    email: email
                })
                .then(parseResult());
        }

        function verifyPasswordRecoveryKey(key) {
            return $http({
                    url: api + 'user/verify-password-recovery-key',
                    method: 'GET',
                    params: {key: key},
                    headers: {'Content-Type': 'application/json'}
                })
                .then(parseResult());
        }

        function changePasswordByKey(key, password) {
            return $http.post(api + 'user/change-password-by-key', {
                    key: key,
                    password: password
                })
                .then(parseResult());
        }

        function getUserInfo() {
            return userInfo;
        }

        function changeAccessToken(newAccessToken) {
            userInfo.accessToken = newAccessToken;
            $window.localStorage['userInfo'] = JSON.stringify(userInfo);
        }

        function updateUserInfo(newUserInfo) {
            userInfo = newUserInfo;
            $window.localStorage['userInfo'] = JSON.stringify(userInfo);
        }

        function logout() {
            userInfo = null;
            $window.localStorage.removeItem('userInfo');
            $state.go('login');

            return true;
        }

        function init() {
            if ($window.localStorage['userInfo']) {
                userInfo = JSON.parse($window.localStorage['userInfo']);
            }
        }

        function parseResult(fn) {
            return function (result) {
                if (result.data.error === 0) {
                    if (fn) return fn(result);
                    return result.data.data;
                }
                else return $q.reject(result.data);
            };
        }
    }

})();
