(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('SignupController', SignupController);

    /* jshint -W101 */
    SignupController.$inject = ['authenticationService', 'userService', 'notificationService', '$state', '$filter', '$translate'];

    /* @ngInject */
    function SignupController(authenticationService, userService, notificationService, $state, $filter, $translate) {
        var vm = this;

        vm.sending = false;
        vm.getCountry = getCountry;
        vm.signup = signup;

        /** request countries */
        //vm.getCountry();

        function getCountry() {
            userService.getCountry(vm.language).
                then(function (result) {
                    vm.countries = result;
                }, function (error) {
                    vm.errorMessage = error.message;
                    notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                });
        }

        function signup() {
            if (vm.sending) return;
            if (vm.password === vm.passwordCheck) {
                vm.sending = true;

                /** define language set by browser */
                var language = $translate.use().replace('_', '-');
                //authenticationService.signup(vm.email, vm.password, language).
                authenticationService.signup(vm.email, language).
                    then(function (result) {
                        vm.sending = false;
                        // TODO: Use translation
                        vm.successMessage = "Success";
                        notificationService.simpleNotify({ message: vm.successMessage, classes: 'alert-success'});

                        /* Send analytics data */
                        ga ('send', 'event', 'zapolnit', 'zaregestrirovat' );

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
