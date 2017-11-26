(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('PaymentSuccessController', PaymentSuccessController);

    /* jshint -W101 */
    PaymentSuccessController.$inject = ['$scope', 'authenticationService', 'userService', 'notificationService', 'accounts'];

    /* @ngInject */
    function PaymentSuccessController($scope, authenticationService, userService, notificationService, accounts) {
        var vm = this;
        vm.userInfo = authenticationService.getUserInfo();
        vm.accounts = accounts;
        vm.updateAccounts = updateAccounts;

        /** Update Accounts info in topnavbar */
        vm.updateAccounts();

        function updateAccounts() {
            $scope.updateAccounts(vm.accounts);
        }
    }

})();
