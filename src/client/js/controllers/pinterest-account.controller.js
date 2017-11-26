(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('PinterestAccountController', PinterestAccountController);

    /* jshint -W101 */
    /* jshint -W072 */
    PinterestAccountController.$inject = ['$scope', '$state', 'userService', '$sce', 'authenticationService', 'notificationService', '$filter', 'account', 'boards', 'breadcrumbSteps', 'ngDialog', 'SweetAlert', 'CARD_MEDIA_MAX_WIDTH'];

    /* @ngInject */
    function PinterestAccountController($scope, $state, userService, $sce, authenticationService, notificationService, $filter, account, boards, breadcrumbSteps, ngDialog, SweetAlert, CARD_MEDIA_MAX_WIDTH) {
        var vm = this;

        $scope.account = account;
        $scope.boards = boards;
        $scope.breadcrumbSteps = breadcrumbSteps;

        vm.userInfo = authenticationService.getUserInfo();
        vm.state = $state.current;
        console.log(boards);

        vm.confirmDeleteAccount = confirmDeleteAccount;
        vm.deleteAccount = deleteAccount;

        /** Correct cards width, height and content on DomReady */
        angular.element(document).ready(function () {
            fixWidthAndHeightOfCard(CARD_MEDIA_MAX_WIDTH); // Not third line
        });

        /** Kick off */
        if ($scope.account.isVerified === 1  && ($scope.account.shouldPay === 1 || $scope.account.shouldPay === 0)) {
            vm.currentPage = 0;
            vm.loadImagesBusy = false;
        }

        function confirmDeleteAccount(accountId) {

            SweetAlert.swal({
                    title: $filter('translate')('ARE_YOU_SURE'),
                    text: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_ACCOUNT'),
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',confirmButtonText: $filter('translate')('YES_I_AM_SURE'),
                    cancelButtonText: $filter('translate')('NO'),
                    closeOnConfirm: false,
                    closeOnCancel: false},
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
                    // TODO: Use translation
                    vm.successMessage = "Account has been deleted";
                    notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});

                    $state.go('dashboard.accounts');
                }, function (error) {
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });
        }
    }

})();
