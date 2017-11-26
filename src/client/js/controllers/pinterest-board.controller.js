(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('PinterestBoardController', PinterestBoardController);

    PinterestBoardController.$inject = ['$rootScope', '$scope', 'account', 'board', 'breadcrumbSteps', '$state', 'userService', 'authenticationService', 'notificationService', '$interval', '$timeout', '$filter', 'ngDialog', 'SweetAlert', 'MEDIA_TYPE', 'CARD_MEDIA_MAX_WIDTH'];

    /* @ngInject */
    function PinterestBoardController($rootScope, $scope, account, board, breadcrumbSteps, $state, userService, authenticationService, notificationService, $interval, $timeout, $filter, ngDialog, SweetAlert, MEDIA_TYPE, CARD_MEDIA_MAX_WIDTH) {
        var vm = this;
        $scope.account = account;
        // $scope.boardMedia = boardMedia.medias;
        $scope.board = board;
        $scope.breadcrumbSteps = breadcrumbSteps;
        $scope.obj = {};

        vm.userInfo = authenticationService.getUserInfo();
        vm.state = $state.current;
        vm.showChooseMethods = false;
        vm.uploading = false;
        vm.uploadingFromUrl = false;
        vm.uploadingFromStorage = false;
        vm.loadImagesBusy = true; // do not load images by default
        vm.addPostCardTitle = $filter('translate')('NEW_PIN');
        vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
        vm.uploadFromUrlButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_URL_BUTTON');
        vm.nextPage = nextPage;
        vm.getBoardDataByPage = getBoardDataByPage;
        vm.addNewPost = addNewPost;
        vm.confirmCancelPost = confirmCancelPost;
        vm.cancelPost = cancelPost;
        vm.editPost = editPost;
        vm.repeatPost = repeatPost;
        vm.confirmDeletePost = confirmDeletePost;
        vm.deletePost = deletePost;
        vm.upload = upload;
        vm.uploadByUrl = uploadByUrl;
        vm.isValidUrl = isValidUrl;
        vm.convertFromTimestamp = convertFromTimestamp;

        /** Correct cards width, height and content on DomReady */
        angular.element(document).ready(function () {
            fixWidthAndHeightOfCard(CARD_MEDIA_MAX_WIDTH);
        });

        /** Kick off */
        if ($scope.account.isVerified === 1  && ($scope.account.shouldPay === 1 || $scope.account.shouldPay === 0)) {
            console.log("kick off");
            vm.currentPage = 0;
            vm.loadImagesBusy = false;
        }

        function nextPage() {
            if (vm.loadImagesBusy || vm.pages <= vm.currentPage) {
                return;
            }

            vm.loadImagesBusy = true;
            vm.getBoardDataByPage(vm.currentPage + 1);
        }

        function getBoardDataByPage(page) {
            userService.getPinterestBoardMediaByPage($scope.board.id, vm.userInfo.accessToken, page)
                .then(function (result) {
                    console.log(result);
                    if ($scope.boardMedia != null) {
                        $scope.boardMedia = $scope.boardMedia.concat(result.medias);
                    } else {
                        $scope.boardMedia = result.medias;
                    }

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

                    /** Correct cards width, height and content */
                    $timeout(function () {
                        fixWidthAndHeightOfCard(CARD_MEDIA_MAX_WIDTH);
                    }, 500);

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

        function addNewPost() {
            vm.showChooseMethods = true;
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
            userService.cancelPostPinterest(id, vm.userInfo.accessToken)
                .then(function (result) {
                    SweetAlert.swal($filter('translate')('DONE'), $filter('translate')('POST_HAS_BEEN_SUCCESSFULLY_DELETED'), 'success');
                    var index;
                    for (index = 0; index < $scope.boardMedia.length; index++) {
                        if ($scope.boardMedia[index].id === id) {
                            $scope.boardMedia.splice(index, 1);
                            break;
                        }
                    }
                }, function (error) {
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        console.log(error);
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    }
                });
        }

        function editPost(mediaId) {
            userService.getPinterestMediaById(mediaId, vm.userInfo.accessToken)
                .then(function (result) {
                    var isFirstPost = $scope.boardMedia.length > 0 ? false : true;
                    $state.go('dashboard.post-media', { account: $scope.account, media: result, edit: true, repeat: false, isFirstPost: isFirstPost, mediaType: MEDIA_TYPE.pinterestPost, pinterestBoard: $scope.board });
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
                var isFirstPost = $scope.boardMedia.length > 0 ? false : true;
                $state.go('dashboard.post-media', { account: $scope.account, media: result, edit: false, repeat: true, isFirstPost: isFirstPost, mediaType: MEDIA_TYPE.pinterestPost, pinterestBoard: $scope.board });
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
                    $scope.boardMedia.forEach(function (entry) {
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

        function upload (file) {
            vm.uploading = true;
            vm.uploadingFromStorage = true;
            vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOADING');

            console.log($scope.board);
            /**
             * Calculate file size
             * Allowable size: smaller than 20 MB and larger than 30 KB
             * */

            if (file.size > 20*1024*1024 || file.size < 5*1024) {
                if (file.size > 20*1024*1024) {
                    vm.errorMessage = $filter('translate')('DASH_ACCOUNTS_FILE_SIZE_LARGE_ERROR');
                } else if (file.size < 5*1024) {
                    vm.errorMessage = $filter('translate')('DASH_ACCOUNTS_FILE_SIZE_SMALL_ERROR');
                }
                notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                vm.uploading = false;
                vm.uploadingFromStorage = false;
                vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
            } else {
                userService.uploadFromStorage(file, null, vm.userInfo.accessToken, MEDIA_TYPE.pinterestPost)
                    .then(function (result) {
                        var isFirstPost = $scope.boardMedia.length > 0 ? false : true;
                        $state.go('dashboard.post-media', { account: $scope.account, media: result.data.data, edit: false, repeat: false, isFirstPost: isFirstPost, mediaType: MEDIA_TYPE.pinterestPost, pinterestBoard: $scope.board });

                        vm.uploading = false;
                        vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
                        vm.uploadingFromStorage = false;
                    }, function (error) {
                        vm.uploading = false;
                        vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
                        vm.uploadingFromStorage = false;

                        if (error.error === 100) {
                            authenticationService.logout();
                        } else {
                            vm.errorMessage = error.message;
                            notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                        }
                    });
            }
        }

        function uploadByUrl() {
            console.log($scope.obj);
            if ($scope.obj.url) {
                if (vm.isValidUrl($scope.obj.url)) {
                    vm.uploading = true;
                    vm.uploadingFromUrl = true;
                    vm.uploadFromUrlButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOADING');

                    userService.uploadByUrlPinterest($scope.obj.url, $scope.account.id, vm.userInfo.accessToken)
                        .then(function (result) {
                            var isFirstPost = $scope.boardMedia.length > 0 ? false : true;
                            $state.go('dashboard.post-media', { account: $scope.account, media: result, edit: false, repeat: false, isFirstPost: isFirstPost, mediaType: MEDIA_TYPE.pinterestPost, pinterestBoard: $scope.board });

                            vm.uploading = false;
                            vm.uploadFromUrlButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_URL_BUTTON');
                            vm.uploadingFromUrl = false;
                        }, function (error) {
                            vm.uploading = false;
                            vm.uploadFromUrlButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_URL_BUTTON');
                            vm.uploadingFromUrl = false;

                            if (error.error === 100) {
                                authenticationService.logout();
                            } else {
                                vm.errorMessage = error.message;
                                notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                            }
                        });
                } else {
                    vm.errorMessage = $filter('translate')('DASH_ACCOUNTS_INVALID_URL_ERROR');
                    notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                }
            }
        }

        function isValidUrl(s) {
            var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            return regexp.test(s);
        }

        function convertFromTimestamp(timestamp) {
            var formattedDateTime = moment.unix(timestamp);
            return formattedDateTime.format('D MMMM ') + formattedDateTime.format('HH:mm');
        }
    }

})();
