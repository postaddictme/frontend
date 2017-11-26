(function () {
    'use strict';

    angular
        .module('postaddict')
        .factory('instagramService', instagramService);

    instagramService.$inject = ['$http', '$q'];

    function instagramService($http, $q) {
        var clientId = 'b63a163ff05c4df2bfcd1cd4fd276bf6';
        return {
            getUsers: getUsers
        };


        function getUsers(q) {
            var deferred = $q.defer();

            $.ajax({
                type: 'GET',
                url: 'https://api.instagram.com/v1/users/search?q=' + q + '&client_id=' + clientId,
                dataType: 'jsonp',
                success: function (result){
                    if (result.data) deferred.resolve(result);
                    else deferred.reject(result.meta);
                }
            });

            return deferred.promise;
        }

    }
})();
