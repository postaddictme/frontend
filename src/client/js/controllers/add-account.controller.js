(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('AddAccountController', AddAccountController);

    /* jshint -W101 */
    AddAccountController.$inject = ['$scope', '$location', '$window', '$state', '$stateParams', 'userService', 'authenticationService', 'notificationService', '$timeout', '$filter', 'API'];

    /* @ngInject */
    function AddAccountController($scope, $location, $window, $state, $stateParams, userService, authenticationService, notificationService, $timeout, $filter, API) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        vm.sending = false;
        vm.instagram = false;
        vm.pinterest = false;
        vm.addAccount = addAccount;
        vm.getAccounts = getAccounts;

        $scope.$watch('addAccountForm.$valid', function (newVal) {
            vm.valid = newVal;
        });

        function addAccount(type) {
            if (vm.sending) return;
            if (type === 'instagram') {
                if (vm.valid) {
                    vm.sending = true;

                    userService.addAccount(vm.userInfo.accessToken, vm.username, vm.password)
                        .then(function (result) {
                            // TODO: Use translation
                            vm.successMessage = "Account has been added";
                            notificationService.simpleNotify({message: vm.successMessage, classes: 'alert-success'});

                            /** Update Accounts */
                            vm.getAccounts();
                            vm.sending = false;
                            $state.go('dashboard.account.wall', {accountId: result.id});
                        }, function (error) {
                            console.log(error);
                            vm.sending = false;
                            if (error.error === 100) {
                                authenticationService.logout();
                            } else {
                                vm.errorMessage = error.message;
                                notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                            }
                        });
                } else {
                    vm.warningMessage = $filter('translate')('DASH_ADD_ACCOUNT_WARNING');
                    notificationService.simpleNotify({message: vm.warningMessage, classes: 'alert-warning'});
                }
            } else if (type === 'pinterest') {
                $window.location.href = API.HOST + 'pinterest-account/login-url&accessToken=' + vm.userInfo.accessToken;
            }
        }

        function getAccounts() {
            $scope.getAccounts();
        }
    }

})();
