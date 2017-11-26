(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('RecoverPasswordController', RecoverPasswordController);

    /* jshint -W101 */
    RecoverPasswordController.$inject = ['authenticationService', 'notificationService', '$state', '$stateParams', '$filter', '$translate', 'verify'];

    /* @ngInject */
    function RecoverPasswordController(authenticationService, notificationService, $state, $stateParams, $filter, $translate, verify) {
        var vm = this;
        var key = $stateParams.key;

        vm.sending = false;
        vm.recover = recover;

        function recover() {
            if (vm.sending) return;
            if (vm.password === vm.passwordCheck) {
                vm.sending = true;

                authenticationService.changePasswordByKey(key, vm.password).
                    then(function (result) {
                        vm.sending = false;
                        // TODO: Use translation
                        vm.successMessage = "Success";
                        notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});
                        $state.go('login');
                    }, function (error) {
                        vm.sending = false;
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    });
            } else {
                vm.warningMessage = $filter('translate')('SIGNUP_PASSWORDS_DO_NOT_MATCH');
                notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
            }

        }
    }

})();
