(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('DashboardController', DashboardController);

    /* jshint -W101 */
    DashboardController.$inject = ['$rootScope', '$scope', '$location', 'authenticationService', 'userService', 'notificationService'];

    /* @ngInject */
    function DashboardController($rootScope, $scope, $location, authenticationService, userService, notificationService) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        vm.logout = logout;
        $scope.getManagers = getManagers;
        $scope.getAccounts = getAccounts;
        $scope.updateManagers = updateManagers;
        $scope.updateAccounts = updateAccounts;

        /** Activate */
        $scope.getAccounts();
        $scope.getManagers();
        setNewsDate();
        /** Watch language settings changes */
        $rootScope.$watch('language', function () {
            setNewsDate();
        });

        function logout() {
            if (authenticationService.logout()) {
                vm.userInfo = null;
                $location.path('/login');
            }
        }

        function getManagers() {
            userService.getManagers(vm.userInfo.accessToken, vm.userInfo.companyId).
                then(function (result) {
                    $scope.managers = result;
                }, function (error) {
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });
        }

        function getAccounts() {
            userService.getAccounts(vm.userInfo.companyId, vm.userInfo.accessToken).
                then(function (result) {
                    $scope.accounts = result;
                    $scope.notifications = 0;
                    $scope.accounts.forEach(function (entry) {
                        if (entry.shouldPay !== 0 && entry.isVerified === 1) {
                            $scope.notifications++;
                        }
                        entry.activeUntilWord = moment(entry.activeUntil).format('D MMMM YYYY');
                    });
                }, function (error) {
                    console.log(error);
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });
        }

        function updateManagers(managers) {
            $scope.managers = managers;
        }

        function updateAccounts(accounts) {
            $scope.accounts = accounts;
            $scope.notifications = 0;
            $scope.accounts.forEach(function (entry) {
                if (entry.shouldPay !== 0 && entry.isVerified === 1) {
                    $scope.notifications++;
                }
                entry.activeUntilWord = moment(entry.activeUntil).format('D MMMM YYYY');
            });
        }

        function setNewsDate() {
            moment.locale($rootScope.language);
            $scope.newsDate = moment("2017-05-17").format('D MMMM YYYY');
        }
    }

})();
