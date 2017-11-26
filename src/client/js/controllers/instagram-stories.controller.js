(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('InstagramStoriesController', InstagramStoriesController);

    InstagramStoriesController.$inject = ['$scope', '$state', '$filter', '$interval', '$timeout', 'userService', 'authenticationService', 'SweetAlert', 'account', 'accounts', 'breadcrumbSteps', 'CARD_MEDIA_MAX_WIDTH', 'MEDIA_TYPE'];
    function InstagramStoriesController($scope, $state, $filter, $interval, $timeout, userService, authenticationService, SweetAlert, account, accounts, breadcrumbSteps, CARD_MEDIA_MAX_WIDTH, MEDIA_TYPE) {
        var vm = this;

        $scope.obj = {};
        $scope.account = account;
        $scope.breadcrumbSteps = breadcrumbSteps;
        vm.accounts = accounts;

        vm.userInfo = authenticationService.getUserInfo();
        vm.state = $state.current;
        vm.showChooseMethods = false;
        vm.uploading = false;
        vm.uploadingFromUrl = false;
        vm.uploadingFromStorage = false;
        vm.loadImagesBusy = false; // from ngInfiniteScroll: to prevent duplicate load
        vm.loadImagesBusy = true; // do not load images by default
        vm.addPostCardTitle = $filter('translate')('NEW_STORY');
        vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
        vm.uploadFromUrlButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_URL_BUTTON');
        vm.refreshStoriesByPage = refreshStoriesByPage;
        vm.confirmDeleteAccount = confirmDeleteAccount;
        vm.deleteAccount = deleteAccount;
        vm.updateAccounts = updateAccounts;
        vm.nextPage = nextPage;
        vm.getStoriesByPage = getStoriesByPage;
        vm.addNewPost = addNewPost;
        vm.upload = upload;
        vm.uploadByUrl = uploadByUrl;
        vm.editStory = editStory;
        vm.confirmCancelStory = confirmCancelStory;
        vm.cancelStory = cancelStory;
        vm.isValidUrl = isValidUrl;
        vm.convertFromTimestamp = convertFromTimestamp;

        /** Correct cards width, height and content on DomReady */
        angular.element(document).ready(function () {
            fixWidthAndHeightOfCard(CARD_MEDIA_MAX_WIDTH);
        });

        /** Call refresh medias function by interval */
        vm.intervalFunction = $interval(function () {
            vm.refreshStoriesByPage(1);
        }, 5000);

        /** Kick off */
        if ($scope.account.isVerified === 1  && ($scope.account.shouldPay === 1 || $scope.account.shouldPay === 0)) {
            vm.currentPage = 0;
            vm.loadImagesBusy = false;
        }

        /** Destroy interval call */
        $scope.$on('$destroy', function (){
            $interval.cancel(vm.intervalFunction);
        });

        /**
         * =========
         * Functions
         * =========
         */

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
            vm.getStoriesByPage(vm.currentPage + 1);
        }

        function getStoriesByPage(page) {
            userService.getInstagramStoriesByPage(page, $scope.account.id, vm.userInfo.accessToken)
                .then(function (result) {
                    if ($scope.accountMedia != null) {
                        $scope.accountMedia = $scope.accountMedia.concat(result.medias);
                    } else {
                        $scope.accountMedia = result.medias;
                    }

                    console.log($scope.accountMedia);

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

        function refreshStoriesByPage(page) {
            if ($scope.account.isVerified === 1 && ($scope.account.shouldPay === 1 || $scope.account.shouldPay === 0)) {
                userService.updateInstagramStoriesByPage(page, $scope.account.id, vm.userInfo.accessToken)
                    .then(function (result) {
                        if (needToRefresh(result.medias) === true) {
                            $interval.cancel(vm.intervalFunction);
                            $scope.accountMedia = null;
                            vm.getStoriesByPage(1);

                            $timeout(function () {
                                vm.intervalFunction = $interval(function () {
                                    vm.refreshStoriesByPage(1);
                                }, 5000);
                            }, 5000);
                        } else {
                            refreshMediaData(result.medias);
                        }

                    }, function (error) {
                        if (error.error === 100) {
                            authenticationService.logout();
                        }
                    });
            }
        }

        /** Check out the need to update the data */
        function needToRefresh(newMedia) {
            var newArr = extractMediaId(newMedia);
            var oldArr = extractMediaId($scope.accountMedia.slice(0, 9));

            return !newArr.equals(oldArr);
        }

        /** Push medias id into array */
        function extractMediaId(obj) {
            var i;
            var arr = [];
            var length = obj.length;

            for (i = 0; i < length; i++) {
                arr.push(obj[i].id);
            }

            return arr;
        }

        /** Refresh current medias data */
        function refreshMediaData(newMedia) {
            var i, j;
            var newMediaLength = newMedia.length;
            var oldMediaLength = $scope.accountMedia.slice(0, 9).length;

            for (i = 0; i < newMediaLength; i++) {
                for (j = 0; j < oldMediaLength; j++) {
                    if (newMedia[i].id === $scope.accountMedia[j].id) {
                        $scope.accountMedia[j].isPublished = newMedia[i].isPublished;
                        $scope.accountMedia[j].publishDate = newMedia[i].publishDate;
                        $scope.accountMedia[j].instagramMediaUrl = newMedia[i].instagramMediaUrl;
                        break;
                    }
                }
            }
        }

        function addNewPost() {
            vm.showChooseMethods = true;
        }

        function upload (file) {
            vm.uploading = true;
            vm.uploadingFromStorage = true;
            vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOADING');

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
                userService.uploadFromStorage(file, $scope.account.id, vm.userInfo.accessToken, MEDIA_TYPE.instagramStory)
                    .then(function (result) {
                        console.log("uploadFromStorage result: ");
                        console.log(result);
                        var isFirstPost = $scope.accountMedia.length > 0 ? false : true;
                        $state.go('dashboard.post-media', { account: $scope.account, media: result.data.data, edit: false, repeat: false, isFirstPost: isFirstPost, mediaType: MEDIA_TYPE.instagramStory });

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
            console.log($scope.obj.url);
            if ($scope.obj.url) {
                if (vm.isValidUrl($scope.obj.url)) {
                    vm.uploading = true;
                    vm.uploadingFromUrl = true;
                    vm.uploadFromUrlButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOADING');

                    userService.uploadByUrl($scope.obj.url, $scope.account.id, vm.userInfo.accessToken).then(function (result) {
                        var isFirstPost = $scope.accountMedia.length > 0 ? false : true;
                        $state.go('dashboard.post-media', {
                            account: $scope.account,
                            media: result,
                            edit: false,
                            repeat: false,
                            isFirstPost: isFirstPost,
                            mediaType: MEDIA_TYPE.instagramStory
                        });

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
                            notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                        }
                    });
                } else {
                    vm.errorMessage = $filter('translate')('DASH_ACCOUNTS_INVALID_URL_ERROR');
                    notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                }
            }
        }

        function editStory(storyId) {
            userService.getFuturePostMedia(storyId, vm.userInfo.accessToken)
                .then(function (result) {
                    var isFirstPost = $scope.accountMedia.length > 0 ? false : true;
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

        function confirmCancelStory(id) {
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
                        vm.cancelStory(id);
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

        function cancelStory(id) {
            userService.cancelStory(id, vm.userInfo.accessToken)
                .then(function (result) {
                    SweetAlert.swal($filter('translate')('DONE'), $filter('translate')('POST_HAS_BEEN_SUCCESSFULLY_DELETED'), 'success');
                    var index;
                    for (index = 0; index < $scope.accountMedia.length; index++) {
                        if ($scope.accountMedia[index].id === id) {
                            $scope.accountMedia.splice(index, 1);
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
