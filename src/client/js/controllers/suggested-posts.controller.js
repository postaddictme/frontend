/**
 * Created by yelnar on 14/07/15.
 */

(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('SuggestedPostsController', SuggestedPostsController);

    /* jshint -W101 */
    /* jshint -W072 */
    SuggestedPostsController.$inject = ['$scope', '$state', 'userService', 'authenticationService', 'notificationService', '$interval', '$timeout', '$filter', 'account', 'accounts', 'breadcrumbSteps', 'ngDialog', 'SweetAlert', 'MEDIA_TYPE', 'CARD_MEDIA_MAX_WIDTH'];
    /* ngInject */
    function SuggestedPostsController($scope, $state, userService, authenticationService, notificationService, $interval, $timeout, $filter, account, accounts, breadcrumbSteps, ngDialog, SweetAlert, MEDIA_TYPE, CARD_MEDIA_MAX_WIDTH) {
        var vm = this;

        $scope.breadcrumbSteps = breadcrumbSteps;

        vm.userInfo = authenticationService.getUserInfo();
        vm.state = $state.current;
        vm.account = account;
        vm.accounts = accounts;
        vm.getSuggestedMediaByPage = getSuggestedMediaByPage;
        vm.editPost = editPost;
        vm.confirmRejectPost = confirmRejectPost;
        vm.rejectPost = rejectPost;

        /** Correct cards width, height and content on DomReady */
        angular.element(document).ready(function () {
            fixWidthAndHeightOfCard(CARD_MEDIA_MAX_WIDTH);
        });

        /** Kick off */
        if (vm.account.isVerified === 1  && (vm.account.shouldPay === 1 || vm.account.shouldPay === 0)) {
            vm.getSuggestedMediaByPage(1);
        }

        function getSuggestedMediaByPage(page) {
            userService.getSuggestedMediaByPage(page, vm.account.instagramId, vm.userInfo.accessToken).
                then(function (result) {
                    console.log(result);
                    vm.suggestedMedias = result.medias;
                    vm.pages = result.pageCount;
                    vm.currentPage = page;

                    /** Configure pages */
                    if (page%5 !== 0) {
                        vm.currentRange = page - page%5 + 1;
                    } else {
                        vm.currentRange = page - 5 + 1;
                    }

                    /** Show pagination and configure post thumbnails */
                    $timeout(function () {
                        if (vm.pages > 1) {
                            vm.showPagination = true;
                        }

                        fixWidthAndHeightOfCard(CARD_MEDIA_MAX_WIDTH);
                    }, 500);

                }, function (error) {
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });
        }

        function editPost(mediaId) {
            userService.getSuggestedMedia(mediaId, vm.userInfo.accessToken).
                then(function (result) {
                    //var isFirstPost = $scope.accountMedia.length > 0 ? false : true;
                    $state.go('dashboard.post-media', { account: vm.account, media: result, edit: false, repeat: true, isFirstPost: false, mediaType: MEDIA_TYPE.instagramPost });
                }, function (error) {
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });
        }

        function confirmRejectPost(id) {
            SweetAlert.swal({
                    title: $filter('translate')('ARE_YOU_SURE'),
                    text: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_POST_FROM_INSTAGRAM'),
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',confirmButtonText: $filter('translate')('YES_I_AM_SURE'),
                    cancelButtonText: $filter('translate')('NO'),
                    closeOnConfirm: false,
                    closeOnCancel: false },
                function (isConfirm){
                    if (isConfirm) {
                        vm.rejectPost(id);
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

        function rejectPost(id) {
            userService.rejectSuggestedMedia(id, vm.userInfo.accessToken).
                then(function (result) {
                    SweetAlert.swal($filter('translate')('DONE'), $filter('translate')('POST_HAS_BEEN_SCHEDULED_TO_DELETE_FROM_INSTAGRAM'), 'success');
                    var index;
                    for (index = 0; index < vm.suggestedMedias.length; index++) {
                        if (vm.suggestedMedias[index].id === id) {
                            vm.suggestedMedias.splice(index, 1);
                            break;
                        }
                    }
                    // TODO: Use translation
                    vm.successMessage = "Post has been rejected";
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
    }
})();
