(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('NavigationController', NavigationController);

    NavigationController.$inject = ['$scope', 'userService', 'authenticationService', '$location'];

    function NavigationController($scope, userService, authenticationService, $location) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        //vm.deleteManager = deleteManager;
        //vm.deleteAccount = deleteAccount;
        //vm.getManagers = getManagers;
        //vm.getAccounts = getAccounts;

        //function deleteManager(managerId) {
        //    userService.deleteManager(vm.userInfo.accessToken, managerId)
        //        .then(function (result) {
        //            vm.getManagers();
        //        }, function (error) {
        //            if (error.error === 100) {
        //                authenticationService.logout();
        //            } else {
        //                vm.errorMessage = error.message;
        //                notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
        //            }
        //        });
        //}
        //
        //function deleteAccount(accountId) {
        //    userService.deleteAccount(vm.userInfo.accessToken, accountId)
        //        .then(function (result) {
        //            vm.getAccounts();
        //            $location.path("/dashboard/main");
        //        }, function (error) {
        //            if (error.error === 100) {
        //                authenticationService.logout();
        //            } else {
        //                vm.errorMessage = error.message;
        //                notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
        //            }
        //        });
        //}
        //
        //function getManagers() {
        //    $scope.getManagers();
        //}
        //
        //function getAccounts() {
        //    $scope.getAccounts();
        //}

    }

})();
