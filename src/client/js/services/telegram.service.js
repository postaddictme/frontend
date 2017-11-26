/**
 * Created by yelnar on 09/07/15.
 */

(function () {

    'use strict';

    angular
        .module('postaddict')
        .factory('telegramService', telegramService);

    /* jshint -W101 */
    telegramService.$inject = ['$http', '$q', 'API'];

    /* @ngInject */
    function telegramService($http, $q, API) {
        // var api = '/InstagramPosting/web/index.php?r=';
        var api = API.HOST;

        return {
            addTelegram: addTelegram,
            getUsername: getUsername
        };

        function addTelegram(username, accessToken) {
            var deferred = $q.defer();

            $http.post(api + 'telegram-user/add&accessToken=' + accessToken, { username: username })
                .then(function (result) {
                    if (result.data.error === 0) {
                        deferred.resolve(result.data);
                    }
                    else {
                        deferred.reject(result.data);
                    }
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }

        function getUsername(accessToken) {
            var deferred = $q.defer();

            $http.post(api + 'telegram-user/get&accessToken=' + accessToken)
                .then(function (result) {
                    if (result.data.error === 0) {
                        deferred.resolve(result.data);
                    }
                    else {
                        deferred.reject(result.data);
                    }
                }, function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;
        }
    }

})();
