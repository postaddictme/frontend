(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('LoginController', LoginController);

    /* jshint -W101 */
    LoginController.$inject = ['$scope', '$location', 'authenticationService', 'notificationService', '$translate', '$filter'];

    /* @ngInject */
    function LoginController($scope, $location, authenticationService, notificationService, $translate, $filter) {
        var vm = this;

        vm.userInfo = null;
        vm.sending = false;
        vm.login = login;

        /** Watch form valid status */
        $scope.$watch('loginForm.$valid', function (newVal) {
            vm.valid = newVal;
        });

        function login() {
            if (vm.sending) return;
            if (vm.valid) {
                vm.sending = true;
                authenticationService.login(vm.email, vm.password)
                    .then(function (result) {
                        vm.userInfo = result;

                        /* Send analytics data */
                        ga ('send', 'event', 'zapolnit2', 'voyti' );
                        vm.sending = false;
                        $location.path('/dashboard');
                    }, function (error) {
                        vm.sending = false;
                        vm.errorMessage = error.message;
                        notificationService.simpleNotify({ message: vm.errorMessage, classes: 'alert-danger'});
                    });
            } else {
                vm.warningMessage = $filter('tranlsate')('LOGIN_WARNING');
                notificationService.simpleNotify({ message: vm.warningMessage, classes: 'alert-warning'});
            }
        }
    }

})();
