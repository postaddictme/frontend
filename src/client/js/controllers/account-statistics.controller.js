(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('AccountStatisticsController', AccountStatisticsController);

    AccountStatisticsController.$inject = ['$scope', '$state', 'userService', 'authenticationService', 'notificationService', '$interval', '$timeout', '$filter', 'ngDialog', 'SweetAlert', 'account', 'accounts', 'INSTAGRAM_POST_STATUS'];
    function AccountStatisticsController($scope, $state, userService, authenticationService, notificationService, $interval, $timeout, $filter, ngDialog, SweetAlert, account, accounts, INSTAGRAM_POST_STATUS) {
        var vm = this;
        $scope.account = account;
        $scope.INSTAGRAM_POST_STATUS = INSTAGRAM_POST_STATUS;
        console.log($scope.account);

        vm.userInfo = authenticationService.getUserInfo();
        vm.state = $state.current;
        vm.accounts = accounts;
        vm.loadImagesBusy = true; // do not load images by default
        vm.getPostsByPage = getPostsByPage ;
        vm.confirmDeleteAccount = confirmDeleteAccount;
        vm.deleteAccount = deleteAccount;
        vm.updateAccounts = updateAccounts;
        vm.nextPage = nextPage;
        vm.confirmCancelPost = confirmCancelPost;
        vm.cancelPost = cancelPost;
        vm.editPost = editPost;
        vm.repeatPost = repeatPost;
        vm.confirmDeletePost = confirmDeletePost;
        vm.deletePost = deletePost;

        /** Kick off */
        if ($scope.account.isVerified === 1  && ($scope.account.shouldPay === 1 || $scope.account.shouldPay === 0)) {
            vm.currentPage = 0;
            vm.loadImagesBusy = false;
            //vm.getPostsByPage (vm.currentPage);
        }




        /**
         * =========
         * Functions
         * =========
         */

        function getPostsByPage (page) {
            userService.getUserFutureMedia(page, $scope.account.id, vm.userInfo.accessToken)
                .then(function (result) {
                    if ($scope.posts != null) {
                        $scope.posts = $scope.posts.concat(result.medias);
                    } else {
                        $scope.posts = result.medias;
                    }

                    console.log($scope.posts);

                    vm.pages = result.pageCount;
                    vm.currentPage = page;

                    /** Configure pages */
                    if (page%5 !== 0) {
                        vm.currentRange = page - page%5 + 1;
                    } else {
                        vm.currentRange = page - 5 + 1;
                    }

                    // Able to load some more images
                    vm.loadImagesBusy = false;

                    /** Show pagination and configure post thumbnails */
                    // $timeout(function () {
                    //     fixWidthAndHeightOfCard(CARD_MEDIA_MAX_WIDTH);
                    // }, 500);

                }, function (error) {
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }

                    // Able to load some more images
                    vm.loadImagesBusy = false;
                });
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
                    var deletedAccount,
                        index;

                    vm.accounts.forEach(function (entry) {
                        if (entry.id === accountId) {
                            deletedAccount = entry;
                        }
                    });
                    index = vm.accounts.indexOf(deletedAccount);

                    vm.accounts.splice(index, 1);
                    /** Update Accounts in navigation sidebar and topnavbar */
                    vm.updateAccounts();
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

        function updateAccounts() {
            $scope.updateAccounts(vm.accounts);
        }

        function nextPage() {
            if (vm.loadImagesBusy || vm.pages <= vm.currentPage) {
                return;
            }

            vm.loadImagesBusy = true;
            vm.getPostsByPage(vm.currentPage + 1);
        }

        function confirmCancelPost(id) {
            SweetAlert.swal({
                    title: $filter('translate')('ARE_YOU_SURE'),
                    text: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_POST'),
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',confirmButtonText: $filter('translate')('YES_I_AM_SURE'),
                    cancelButtonText: $filter('translate')('NO'),
                    closeOnConfirm: false,
                    closeOnCancel: false},
                function (isConfirm){
                    if (isConfirm) {
                        vm.cancelPost(id);
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

        function cancelPost(id) {
            userService.cancelPost(id, vm.userInfo.accessToken)
                .then(function (result) {
                    SweetAlert.swal($filter('translate')('DONE'), $filter('translate')('POST_HAS_BEEN_SUCCESSFULLY_DELETED'), 'success');
                    var index;
                    for (index = 0; index < $scope.posts.length; index++) {
                        if ($scope.posts[index].id === id) {
                            $scope.posts.splice(index, 1);
                            break;
                        }
                    }
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
            userService.getFuturePostMedia(mediaId, vm.userInfo.accessToken)
                .then(function (result) {
                    var isFirstPost = $scope.posts.length > 0 ? false : true;
                    $state.go('dashboard.post-media', { account: $scope.account, media: result, edit: true, repeat: false, isFirstPost: isFirstPost, mediaType: MEDIA_TYPE.instagramPost});
                }, function (error) {

                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });
        }

        function repeatPost(mediaId) {
            userService.getFuturePostMedia(mediaId, vm.userInfo.accessToken).
            then(function (result) {
                var isFirstPost = $scope.posts.length > 0 ? false : true;
                $state.go('dashboard.post-media', { account: $scope.account, media: result, edit: false, repeat: true, isFirstPost: isFirstPost, mediaType: MEDIA_TYPE.instagramPost });
            }, function (error) {
                if (error.error === 100) {
                    authenticationService.logout();
                } else {
                    vm.errorMessage = error.message;
                    notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                }
            });
        }

        function confirmDeletePost(id) {
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
                        vm.deletePost(id);
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

        function deletePost(id) {
            userService.deletePost(id, $scope.account.id, vm.userInfo.accessToken)
                .then(function (result) {
                    SweetAlert.swal($filter('translate')('DONE'), $filter('translate')('POST_HAS_BEEN_SCHEDULED_TO_DELETE_FROM_INSTAGRAM'), 'success');
                    $scope.posts.forEach(function (entry) {
                        if (entry.id === id) {
                            entry.isPublished = 8;
                        }
                    });
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
