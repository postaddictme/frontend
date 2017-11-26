(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('SuggestController', SuggestController);

    /* jshint -W101 */
    SuggestController.$inject = ['$scope', 'userService', 'notificationService', '$filter', '$translate', 'data'];

    /* ngInject */
    function SuggestController($scope, userService, notificationService, $filter, $translate, data) {
        var vm = this;

        if (data.error != 0) {
            vm.isAllowed = false;
            vm.successfullySuggested = false;
            vm.notAllowedMessage = data.message;
        } else {
            vm.isAllowed = true;
            vm.successfullySuggested = false;

            var tit = new TwemojiInput(document.querySelector('textarea'));
            var textarea = document.querySelector('textarea');

            vm.account = data.data;
            vm.uploading = false;
            vm.uploaded = false;
            vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
            vm.upload = upload;
            vm.suggestPost = suggestPost;
        }


        function upload(file) {
            console.log(file);
            vm.uploading = true;
            vm.uploaded = false;
            vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOADING');

            /**
             * Calculate file size
             * Allowable size: smaller than 20 MB and larger than 30 KB
             */
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
                console.log("File size is wrong");
            } else {
                userService.uploadSuggestedPost(file, vm.account.instagramId).
                    then(function (result) {
                        var resultData = result.data.data;
                        console.log(resultData);
                        if (result.data.error === 0) {
                            $scope.localMediaUrl = resultData.localMediaUrl;
                            $scope.thumbnailUrl = resultData.thumbnailUrl;
                            $scope.fileType = resultData.type;

                            vm.uploading = false;
                            vm.uploaded = true;
                            vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
                        } else {
                            vm.uploading = false;
                            vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
                            vm.errorMessage = result.data.message;
                            notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                        }
                    }, function (error) {
                        vm.uploading = false;
                        vm.uploadFromStorageButtonText = $filter('translate')('DASH_ACCOUNTS_UPLOAD_FROM_STORAGE_BUTTON');
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    });

                /** Clear val */
                $('.upload').val('');
            }
        }

        function suggestPost() {
            if (vm.sending) return;
            vm.sending = true;
            vm.postButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_SENDING');
            $scope.caption = textarea.value;

            if ($scope.caption.length > 2000) {
                vm.sending = false;
                vm.postScheduleVisible = false;
                vm.postButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');
                vm.errorMessage = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_OVER_LIMIT_ERROR');
                notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
            } else {
                userService.suggestPost($scope.localMediaUrl, $scope.thumbnailUrl, $scope.caption, vm.account.instagramId, $scope.mediaType).
                    then(function (result) {
                        vm.successfullySuggested = true;
                        vm.sending = false;
                        notificationService.simpleNotify({message: 'Well done!', classes: 'alert-success'});
                    }, function (error) {
                        vm.sending = false;
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                    });
            }
        }

    }

})();
