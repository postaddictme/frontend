(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('SettingsController', SettingsController);

    /* jshint -W101 */
    SettingsController.$inject = ['$rootScope', '$scope', '$timeout', 'userService', 'authenticationService', 'telegramService', 'notificationService', '$filter', '$translate', 'subscriptions', 'telegramUsername', 'breadcrumbSteps'];

    /* @ngInject */
    function SettingsController($rootScope, $scope, $timeout, userService, authenticationService, telegramService, notificationService, $filter, $translate, subscriptions, telegramUsername, breadcrumbSteps) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        vm.sending = false;
        vm.subscriptions = subscriptions;
        vm.changePassword = changePassword;
        vm.addTelegram = addTelegram;
        vm.changeLanguage = changeLanguage;
        vm.subscribeEmail = subscribeEmail;
        vm.currentTelegramUsername = telegramUsername;
        vm.telegramUsername = vm.currentTelegramUsername;
        vm.debounceValue = 100;

        $scope.breadcrumbSteps = breadcrumbSteps;

        $scope.$watch('changePasswordForm.$valid', function (newVal) {
            vm.changePasswordIsValid = newVal;
        });
        $scope.$watch('addTelegramForm.$valid', function (newVal) {
            vm.addTelegramIsValid = newVal;
        });

        function changePassword() {
            if (vm.sending) return;
            if (vm.changePasswordIsValid) {
                if (vm.currPassword !== vm.newPassword) {
                    vm.sending = true;

                    $timeout(function () {
                        userService.changePassword(vm.currPassword, vm.newPassword, vm.userInfo.accessToken)
                            .then(function (result) {
                                authenticationService.changeAccessToken(result.accessToken);
                                vm.userInfo = authenticationService.getUserInfo();
                                vm.sending = false;
                                vm.successMessage = $filter('translate')('DASH_SETTINGS_PASSWORD_CHANGE_SUCCESS');
                                notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});
                            }, function (error) {
                                console.log(error);
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
                    vm.warningMessage = $filter('translate')('DASH_SETTINGS_PASSWORDS_ARE_SAME_WARNING');
                    notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
                }
            } else {
                vm.warningMessage = $filter('translate')('DASH_SETTINGS_PASSWORD_WARNING');
                notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
            }
        }

        function addTelegram() {
            if (vm.sending) return;
            if (vm.addTelegramIsValid) {
                if (vm.telegramUsername != vm.currentTelegramUsername) {
                    vm.sending = true;
                    telegramService.addTelegram(vm.telegramUsername, vm.userInfo.accessToken)
                        .then(function (result) {

                            vm.currentTelegramUsername = result.data.username;
                            vm.telegramUsername = vm.currentTelegramUsername;
                            vm.sending = false;
                            vm.successMessage = result.message;
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
                } else {
                    vm.warningMessage = $filter('translate')('THIS_TELEGRAM_USERNAME_IS_ALREADY_LINKED_TO_YOU');
                    notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
                }
            } else {
                vm.warningMessage = $filter('translate')('PLEASE_WRITE_YOUR_TELEGRAM_USERNAME');
                notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
            }
        }

        function changeLanguage(newLanguage) {
            if (vm.sending) return;
            vm.sending = true;
            userService.changeLanguage(newLanguage, vm.userInfo.accessToken)
                .then(function (result) {
                    authenticationService.updateUserInfo(result);

                    vm.userInfo = authenticationService.getUserInfo();
                    $rootScope.language = result.language.replace('-', '_');
                    $translate.use($rootScope.language);

                    vm.sending = false;
                    // TODO: use translation
                    vm.successMessage = "Language has been changed successfully";
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
        }

        function subscribeEmail(type, isActive) {
            if (vm.sending) return;
            isActive = isActive === true ? 1 : 0;
            vm.sending = true;
            userService.subscribeEmail(type, isActive, vm.userInfo.accessToken).
                then(function (result) {
                    vm.userInfo.subscriptions = result;
                    authenticationService.updateUserInfo(vm.userInfo);

                    vm.sending = false;
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
