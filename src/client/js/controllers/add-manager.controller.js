(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('AddManagerController', AddManagerController);

    /* jshint -W101 */
    AddManagerController.$inject = ['$scope', 'userService', 'authenticationService', 'notificationService', '$filter', '$state'];

    /* @ngInject */
    function AddManagerController($scope, userService, authenticationService, notificationService, $filter, $state) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        vm.sending = false;
        vm.addManager = addManager;
        vm.getManagers = getManagers;

        $scope.$watch('addManagerForm.$valid', function (newVal) {
            vm.valid = newVal;
        });

        function addManager() {
            if (vm.sending) return;
            if (vm.valid) {
                vm.sending = true;
                userService.addManager(vm.userInfo.accessToken, vm.newManagerEmail)
                    .then(function (result) {
                        vm.sending = false;
                        // TODO: Use translation
                        vm.successMessage = "Manager has been added";
                        notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});

                        vm.getManagers();

                        $state.go('dashboard.managers');
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
                vm.warningMessage = $filter('translate')('DASH_INVITE_MANAGER_EMAIL_WARNING');
                notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
            }
        }

        function getManagers() {
            $scope.getManagers();
        }
    }

})();
