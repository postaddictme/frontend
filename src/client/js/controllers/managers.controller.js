(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('ManagersController', ManagersController);

    /* jshint -W101 */
    ManagersController.$inject = ['$scope', '$filter', 'authenticationService', 'userService', 'notificationService', 'managers', 'breadcrumbSteps', 'ngDialog', 'SweetAlert'];

    /* @ngInject */
    function ManagersController($scope, $filter, authenticationService, userService, notificationService, managers, breadcrumbSteps, ngDialog, SweetAlert) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        vm.managers = managers;
        vm.confirmDeleteManager = confirmDeleteManager;
        vm.deleteManager = deleteManager;
        vm.updateManagers = updateManagers;
        $scope.breadcrumbSteps = breadcrumbSteps;

        function confirmDeleteManager(managerId) {
            //ngDialog.openConfirm({
            //    template: 'views/common/confirm-delete-manager.html',
            //    className: 'ngdialog-theme-plain',
            //    showClose: true,
            //    closeByDocument: true,
            //    closeByEscape: true
            //}).then(function (value) {
            //    //console.log('Modal promise resolved. Value: ', value);
            //    vm.deleteManager(managerId);
            //}, function (reason) {
            //    //console.log('Modal promise rejected. Reason: ', reason);
            //});

            SweetAlert.swal({
                    title: $filter('translate')('ARE_YOU_SURE'),
                    text: $filter('translate')('ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_MANAGER'),
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#DD6B55',confirmButtonText: $filter('translate')('YES_I_AM_SURE'),
                    cancelButtonText: $filter('translate')('NO'),
                    closeOnConfirm: false,
                    closeOnCancel: false },
                function (isConfirm){
                    if (isConfirm) {
                        vm.deleteManager(managerId);
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

        function deleteManager(managerId) {
            userService.deleteManager(vm.userInfo.accessToken, managerId)
                .then(function (result) {
                    SweetAlert.swal($filter('translate')('DONE'), $filter('translate')('MANAGER_HAS_BEEN_SUCCESSFULLY_DELETED'), 'success');
                    var deletedManager;
                    var index;

                    vm.managers.forEach(function (entry) {
                        if (entry.id === managerId) {
                            deletedManager = entry;
                        }
                    });
                    index = vm.managers.indexOf(deletedManager);
                    vm.managers.splice(index, 1);

                    /** Update Managers in navigation sidebar */
                    vm.updateManagers();
                    // TODO: Use translation
                    vm.successMessage = "Manager has been deleted";
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

        function updateManagers() {
            $scope.updateManagers(vm.managers);
        }
    }

})();
