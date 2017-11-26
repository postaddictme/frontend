(function () {

    'use strict';

    angular
        .module('postaddict')
        .factory('adminService', adminService);

    /* jshint -W101 */
    adminService.$inject = ['$http', '$q', '$window', '$sce', 'API'];

    /* @ngInject */
    function adminService($http, $q, $window, $sce, API) {
        var api = API.HOST;

        return {
            getAccountsByVerify: getAccountsByVerify,
            getAllAccountsByPage: getAllAccountsByPage,
            verifyAccount: verifyAccount,
            changeSuggestStatus: changeSuggestStatus,
            prolongateAccount: prolongateAccount,
            authorize: authorize,
            adminLogin: adminLogin,
            getAllMediaByPage: getAllMediaByPage
        };

        function getAccountsByVerify(verifyStatus, password, accessToken) {
            return $http({
                    url: api + 'account/get-by-verify&accessToken=' + accessToken,
                    method: 'GET',
                    params: {password: password, verifyStatus: verifyStatus},
                    headers: {'Content-Type': 'application/json'}
                })
                .then(function (result) {
                    if (result.data.error === 0) return result.data.data;
                    else return $q.reject(result.data);
                });
        }

        function getAllMediaByPage(page, password, accessToken) {
            return $http({
                    url: api + 'media/get-all&accessToken=' + accessToken,
                    method: 'GET',
                    params: {page : page, password: password},
                    headers: {'Content-Type': 'application/json'}
                })
                .then(function (result) {
                    if (result.data.error === 0) {
                        result.data.data.medias.forEach(function (entry) {
                            if (entry.caption) {
                                entry.caption = $window.atob(entry.caption);

                                entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                                entry.caption = $sce.trustAsHtml(twemoji.parse(entry.caption));
                            }
                            entry.localMediaUrl = $sce.trustAsResourceUrl(entry.localMediaUrl);
                            entry.thumbnailUrl = $sce.trustAsResourceUrl(entry.thumbnailUrl);
                        });
                        return result.data.data;
                    }
                    else return $q.reject(result.data);
                });
        }

        function getAllAccountsByPage(page, password, accessToken) {
            return $http({
                    url: api + 'account/get-by-verify&accessToken=' + accessToken,
                    method: 'GET',
                    params: {page: page, password: password},
                    headers: {'Content-Type': 'application/json'}
                })
                .then(function (result) {
                    if (result.data.error === 0) {
                        result.data.data.accounts.forEach(function (entry) {
                            /** convert activeUntil from timestamp format to date */
                            entry.activeUntil = (entry.activeUntil === null ? entry.activeUntil : moment(entry.activeUntil).format('YYYY-MM-DD'));
                        });
                        return result.data.data;
                    }
                    else return $q.reject(result.data);
                });
        }

        function prolongateAccount(accountId, activeUntil, password, accessToken) {
            return $http.post(api + 'account/prolongate&accessToken=' + accessToken, {
                    password: password,
                    accountId: accountId,
                    activeUntil: activeUntil
                })
                .then(function (result) {
                    if (result.data.error === 0) {
                        result.data.activeUntil = (result.data.activeUntil === null ? result.data.activeUntil : moment(result.data.activeUntil).format('YYYY-MM-DD'));
                        return result.data;
                    }
                    else return $q.reject(result.data);
                });
        }

        function verifyAccount(verifyStatus, instagramId, accountId, password, accessToken) {
            return $http.post(api + 'account/verify&accessToken=' + accessToken, {
                    password: password,
                    instagramId: instagramId,
                    accountId: accountId,
                    verifyStatus: verifyStatus
                })
                .then(function (result) {
                    if (result.data.error === 0) return result.data;
                    else return $q.reject(result.data);
                });
        }

        function changeSuggestStatus(password, accountId, canUseSuggest, accessToken) {
            return $http.post(api + 'account/change-can-use-suggest&accessToken=' + accessToken, {
                    password: password,
                    accountId: accountId,
                    canUseSuggest: canUseSuggest
                })
                .then(function (result) {
                    if (result.data.error === 0) return result.data;
                    else return $q.reject(result.data);
                });
        }

        function authorize(password, accessToken) {
            return $http({
                    url: api + 'site/verify-password&accessToken=' + accessToken,
                    method: 'GET',
                    params: {password: password},
                    headers: {'Content-Type': 'application/json'}
                })
                .then(function (result) {
                    if (result.data.error === 0) return result.data.data;
                    else return $q.reject(result.data);
                });
        }

        function adminLogin(accessToken) {
            return $http({
                    url: api + 'site/admin-login&accessToken=' + accessToken,
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'}
                })
                .then(function (result) {
                    if (result.data.error === 0) return result.data;
                    else return $q.reject(result.data);
                });
        }
    }

})();
