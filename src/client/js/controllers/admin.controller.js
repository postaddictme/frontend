(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('AdminController', AdminController);

    /* jshint -W101 */
    AdminController.$inject = ['$scope', '$q', '$state', 'authenticationService', 'adminService', 'notificationService', '$sce', '$filter', '$timeout', 'CARD_MEDIA_MAX_WIDTH'];

    /* @ngInject */
    function AdminController($scope, $q, $state, authenticationService, adminService, notificationService, $sce, $filter, $timeout, CARD_MEDIA_MAX_WIDTH) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        vm.password = '';
        vm.authorized = false;
        vm.postDate = postDate;
        vm.setMediaStatusFilter = setMediaStatusFilter;
        vm.setAccountStatusFilter = setAccountStatusFilter;
        vm.accountStatusFilter = accountStatusFilter;
        vm.mediaStatusFilter = mediaStatusFilter;
        vm.getAllAccountsByPage = getAllAccountsByPage;
        vm.prolongate = prolongate;
        vm.getAllMediaByPage = getAllMediaByPage;
        vm.verifyAccount = verifyAccount;
        vm.changeSuggestStatus = changeSuggestStatus;
        vm.authorize = authorize;

        vm.mediaStatuses = [];
        vm.accountStatuses = [];

        /** Correct cards width, height and content on DomReady */
        angular.element(document).ready(function () {
            fixWidthAndHeightOfCard(CARD_MEDIA_MAX_WIDTH);
        });

        function postDate(dateTime) {
            var formattedDateTime = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').add(moment().utcOffset(), 'minutes');
            return formattedDateTime.format('D MMMM ') + $filter('translate')('AT') + formattedDateTime.format(' HH:mm');
        }

        function setMediaStatusFilter(status) {
            var i = $.inArray(status, vm.mediaStatuses);
            if (i > -1) {
                vm.mediaStatuses.splice(i, 1);
            } else {
                vm.mediaStatuses.push(status);
            }
        }

        function setAccountStatusFilter(status) {
            var i = $.inArray(status, vm.accountStatuses);
            if (i > -1) {
                vm.accountStatuses.splice(i, 1);
            } else {
                vm.accountStatuses.push(status);
            }
        }

        function accountStatusFilter(account) {
            if (vm.accountStatuses.length > 0) {
                if ($.inArray(account.isVerified, vm.accountStatuses) < 0) {
                    return;
                }
            }

            return account;
        }

        function mediaStatusFilter(media) {
            if (vm.mediaStatuses.length > 0) {
                if ($.inArray(media.isPublished, vm.mediaStatuses) < 0) {
                    return;
                }
            }

            return media;
        }

        function getAllAccountsByPage(page) {
            adminService.getAllAccountsByPage(page, vm.password, vm.userInfo.accessToken)
                .then(function (result) {
                    vm.accounts = result.accounts;
                    vm.pages = result.pageCount;
                    vm.currentPage = page;
                    if (page%5 !== 0) {
                        vm.currentRange = page - page%5 + 1;
                    } else {
                        vm.currentRange = page - 5 + 1;
                    }
                    $timeout(function () {
                        vm.showPagination = true;
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

        function prolongate(accountId, newActiveUntil) {
            var activeUntil = moment(newActiveUntil, 'YYYY-MM-DD');
            adminService.prolongateAccount(accountId, activeUntil.unix(), vm.password, vm.userInfo.accessToken)
                .then(function (result) {
                    vm.successMessage = result.message;
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

        function getAllMediaByPage(page) {
            adminService.getAllMediaByPage(page, vm.password, vm.userInfo.accessToken)
                .then(function (result) {
                    vm.futureMedia = result.medias;

                    vm.pages = result.pageCount;
                    vm.currentPage = page;
                    if (page%5 !== 0) {
                        vm.currentRange = page - page%5 + 1;
                    } else {
                        vm.currentRange = page - 5 + 1;
                    }
                    $timeout(function () {
                        vm.showPagination = true;
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

        function verifyAccount(verifyStatus, instagramId, accountId) {
            adminService.verifyAccount(verifyStatus, instagramId, accountId, vm.password, vm.userInfo.accessToken)
                .then(function (result) {
                    vm.getAllAccountsByPage(vm.currentPage);
                    vm.successMessage = result.message;
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

        function changeSuggestStatus(accountId, canUseSuggest) {
            adminService.changeSuggestStatus(vm.password, accountId, canUseSuggest, vm.userInfo.accessToken).
                then(function (result) {
                    vm.getAllAccountsByPage(vm.currentPage);
                    vm.successMessage = result.message;
                    notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});
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

        function authorize() {
            adminService.authorize(vm.password, vm.userInfo.accessToken)
                .then(function (result) {
                    vm.authorized = true;
                    $state.go('dashboard.admin.accounts');
                    vm.getAllAccountsByPage(1);
                    //vm.getAllMediaByPage(1);
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
