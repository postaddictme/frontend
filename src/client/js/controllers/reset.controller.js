(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('ResetController', ResetController);

    /* jshint -W101 */
    ResetController.$inject = ['$scope', '$q', '$state', 'notificationService', '$filter', '$translate', 'authenticationService'];

    /* @ngInject */
    function ResetController($scope, $q, $state, notificationService, $filter, $translate, authenticationService) {
        var vm = this;

        vm.sending = false;
        vm.resetPassword = resetPassword;

        $scope.$watch('reset.$valid', function (newVal) {
            vm.valid = newVal;
        });

        function resetPassword() {
            if (vm.sending) return;
            if (vm.valid) {
                vm.sending = true;
                authenticationService.resetPassword(vm.email).
                    then(function (result) {
                        vm.sending = false;
                        // TODO: Use translation
                        vm.successMessage = "New password has been sent to your email";
                        notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});
                        $state.go('login');
                    }, function (error) {
                        vm.sending = false;
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    });
            } else {
                vm.warningMessage = $filter('tranlsate')('RESET_WARNING');
                notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
            }
        }
    }

})();
