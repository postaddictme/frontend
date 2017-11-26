(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('AccountSettingsController', AccountSettingsController);

    /* jshint -W101 */
    AccountSettingsController.$inject = ['$scope', '$state', '$filter', '$timeout', 'account', 'breadcrumbSteps', 'authenticationService', 'userService', 'notificationService'];

    /* @ngInject */
    function AccountSettingsController($scope, $state, $filter, $timeout, account, breadcrumbSteps, authenticationService, userService, notificationService) {
        var vm = this;

        $scope.breadcrumbSteps = breadcrumbSteps;

        vm.userInfo = authenticationService.getUserInfo();
        vm.account = account;
        vm.suggestStatus = vm.account.suggestStatus == 1 ? true : false;
        vm.sending = false;
        vm.checked = false;
        vm.linkToCopy = 'postaddict.me/suggest/i/' + vm.account.username;
        vm.checkPassword = checkPassword;
        vm.changePassword = changePassword;
        vm.changeSuggestStatus = changeSuggestStatus;
        vm.debounceValue = 100;

        vm.suggests = false;

        $scope.$watch('changePasswordForm.$valid', function (newVal) {
            vm.valid = newVal;
        });

        function checkPassword() {
            if (vm.sending) return;
            if (vm.userPassword) {
                vm.sending = true;
                userService.checkUserPassword(vm.userPassword, vm.userInfo.accessToken).
                    then(function (result) {
                        vm.checked = true;
                        vm.sending = false;
                    }, function (error) {
                        vm.sending = false;
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    });
            } else {
                vm.warningMessage = $filter('translate')('DASH_SETTINGS_PASSWORD_WARNING');
                notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
            }
        }

        function changePassword() {
            if (vm.sending) return;
            if (vm.valid) {
                vm.sending = true;
                $timeout(function () {
                    userService.changeAccountPassword(vm.userPassword, vm.newPassword, vm.account.id, vm.userInfo.accessToken)
                        .then(function (result) {
                            vm.sending = false;
                            vm.newPassword = '';
                            $state.go('dashboard.account.wall', {accountId: vm.account.id});
                            // TODO: Use translation
                            vm.successMessage = "Password has been changed";
                            notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});

                        }, function (error) {
                            vm.sending = false;
                            if (error.error === 100) {
                                authenticationService.logout();
                            } else {
                                vm.errorMessage = error.message;
                                notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                            }
                        });
                }, vm.debounceValue);


            } else {
                vm.warningMessage = $filter('translate')('DASH_ACCOUNT_SETTINGS_PASSWORD_WARNING');
                notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
            }
        }

        function changeSuggestStatus(suggestStatus) {
            if (vm.sending) return;
            suggestStatus = suggestStatus === true ? 1 : 0;
            vm.sending = true;
            userService.changeSuggestStatus(suggestStatus, vm.account.id, vm.userInfo.accessToken).
                then(function (result) {
                    vm.sending = false;
                    vm.account.suggestStatus = result.suggestStatus;
                    // TODO: Use translation
                    vm.successMessage = "Settings have been changed successfully";
                    notificationService.simpleNotify({message: vm.successMessage, classes: 'alert-success'});
                }, function (error) {
                    vm.sending = false;
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });

        }
    }
})();
