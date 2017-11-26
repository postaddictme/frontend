(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('AccountsController', AccountsController);

    /* jshint -W101 */
    AccountsController.$inject = ['$scope', '$state', '$filter', '$window', 'authenticationService', 'userService', 'notificationService', 'accounts', 'pinterestAccounts', 'ngDialog', 'SweetAlert', 'API', 'breadcrumbSteps'];

    /* @ngInject */
    function AccountsController($scope, $state, $filter, $window, authenticationService, userService, notificationService, accounts, pinterestAccounts, ngDialog, SweetAlert, API, breadcrumbSteps) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        vm.instagramAccounts = accounts;
        vm.pinterestAccounts = pinterestAccounts;
        console.log(pinterestAccounts);
        vm.confirmDeleteAccount = confirmDeleteAccount;
        vm.deleteAccount = deleteAccount;
        vm.openAddAccountDialog = openAddAccountDialog;
        vm.updateAccounts = updateAccounts;
        vm.getAccounts = getAccounts;
        vm.state = $state.current;
        $scope.breadcrumbSteps = breadcrumbSteps;
        $scope.showAccounts = {
            Instagram: true,
            Pinterest: true
        };

        function confirmDeleteAccount(accountId) {
            SweetAlert.swal({
                    title: $filter('translate')('ARE_YOU_SURE'),
                    text: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_ACCOUNT'),
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',confirmButtonText: $filter('translate')('YES_I_AM_SURE'),
                    cancelButtonText: $filter('translate')('NO'),
                    closeOnConfirm: false,
                    closeOnCancel: false },
                function (isConfirm){
                    if (isConfirm) {
                        vm.deleteAccount(accountId);
                    } else {
                        SweetAlert.swal({
                            title: $filter('translate')('CANCELLED'),
                            text: '',
                            timer: 700,
                            type: 'error',
                            showConfirmButton: false });
                    }
                });
        }

        function deleteAccount(accountId) {
            userService.deleteAccount(vm.userInfo.accessToken, accountId)
                .then(function (result) {
                    SweetAlert.swal($filter('translate')('DONE'), $filter('translate')('ACCOUNT_HAS_BEEN_SUCCESSFULLY_DELETED'), 'success');
                    var deletedAccount,
                        index;

                    vm.instagramAccounts.forEach(function (entry) {
                        if (entry.id === accountId) {
                            deletedAccount = entry;
                        }
                    });
                    index = vm.instagramAccounts.indexOf(deletedAccount);

                    vm.instagramAccounts.splice(index, 1);
                    /** Update Accounts in navigation sidebar and topnavbar */
                    vm.updateAccounts();
                    // TODO: Use translation
                    vm.successMessage = "Account has been deleted";
                    notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});
                }, function (error) {
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });
        }

        function openAddAccountDialog() {
               ngDialog.openConfirm({
                   template: 'views/common/add-account-dialog.html',
                   className: 'ngdialog-theme-plain',
                   controller: addAccountDialogController,
                   showClose: false,
                   closeByDocument: true,
                   closeByEscape: true,
                   scope: $scope
               })
               .then(function (value) {
                   console.log(value);
               }, function (reason) {

               });
        }

        function updateAccounts() {
            $scope.updateAccounts(vm.instagramAccounts);
        }

        function getAccounts() {
            $scope.getAccounts();
        }

        addAccountDialogController.$inject = ["$scope"];
        function addAccountDialogController($scope) {
            $scope.choose = choose;
            $scope.showOptions = showOptions;
            $scope.addAccount = addAccount;
            $scope.optionsVisible = true;
            $scope.instagramVisible = false;
            $scope.pinterestVisible = false;
            $scope.sending = false;

            $scope.$watch('addAccountForm.$valid', function (value) {
                $scope.valid = value;
            });

            function choose(option) {
                $scope.optionsVisible = false;
                if (option === 1) $scope.instagramVisible = true;
                else if (option === 2) {
                    $scope.pinterestVisible = true;
                    $window.location.href = API.HOST + 'pinterest-account/login-url&accessToken=' + vm.userInfo.accessToken;
                }
            }

            function showOptions() {
                $scope.optionsVisible = true;
                $scope.instagramVisible = false;
                $scope.pinterestVisible = false;
            }

            function addAccount() {
                if ($scope.sending) return;
                if ($scope.valid) {
                    $scope.sending = true;
                    userService.addAccount(vm.userInfo.accessToken, $scope.username, $scope.password)
                        .then(function (result) {
                            // TODO: Use translation
                            vm.successMessage = "Account has been added";
                            notificationService.simpleNotify({message: vm.successMessage, classes: 'alert-success'});

                            /** Update Accounts */
                            vm.getAccounts();
                            $scope.sending = false;
                            $state.go('dashboard.account.wall', {accountId: result.id});
                            $scope.closeThisDialog();
                        }, function (error) {
                            console.log(error);
                            $scope.sending = false;
                            if (error.error === 100) {
                                authenticationService.logout();
                            } else {
                                vm.errorMessage = error.message;
                                notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                            }
                        });
                }
                else {
                    vm.warningMessage = $filter('translate')('DASH_ADD_ACCOUNT_WARNING');
                    notificationService.simpleNotify({message: vm.warningMessage, classes: 'alert-warning'});
                }

            }
        }
    }

})();
