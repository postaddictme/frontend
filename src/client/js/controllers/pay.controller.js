(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('PayController', PayController);

    /* jshint -W101 */
    PayController.$inject = ['$scope', '$state', 'userService', 'authenticationService', 'notificationService', 'account', 'breadcrumbSteps', '$translate', '$filter', '$window'];

    /* @ngInject */
    function PayController($scope, $state, userService, authenticationService, notificationService, account, breadcrumbSteps, $translate, $filter, $window) {
        var vm = this;

        $scope.breadcrumbSteps = breadcrumbSteps;

        vm.userInfo = authenticationService.getUserInfo();
        vm.account = account;
        vm.language = $translate.use();
        vm.methods = false;
        vm.redirectingText = $filter('translate')('REDIRECTING') + '...';
        vm.showMethods = showMethods;
        vm.pay = pay;
        vm.prolongForFree = prolongForFree;
        vm.prices = (vm.language === 'en_US') ? vm.account.price.USD : vm.account.price.RUB;

        vm.paymentOptions = [
            {
                duration: { text: $filter('translate')('DASH_PURCHASE_FOR_ONE_MONTH'), value: 1 },
                price: vm.prices[0],
                description: $filter('translate')('DASH_PURCHASE_ONE_MONTH_TEXT'),
                color: '#ed5565'
            },
            {
                duration: { text: $filter('translate')('DASH_PURCHASE_FOR_THREE_MONTHS'), value: 3 },
                price: vm.prices[1],
                description: $filter('translate')('DASH_PURCHASE_THREE_MONTHS_TEXT', { price: Math.round(3*vm.prices[0] - vm.prices[1]) }),
                color: '#337ab7'
            },
            {
                duration: { text: $filter('translate')('DASH_PURCHASE_FOR_SIX_MONTHS'), value: 6 },
                price: vm.prices[2],
                description: $filter('translate')('DASH_PURCHASE_SIX_MONTHS_TEXT', { price: Math.round(6*vm.prices[0] - vm.prices[2]) }),
                color: '#1ab394'
            }
        ];

        function showMethods() {
            vm.methods = true;
        }

        function pay(method, duration) {
            // notificationService.simpleNotify({ message: vm.redirectingText, classes: 'alert-info', duration: '10000'});
            userService.pay(method, duration, vm.account.id, vm.userInfo.accessToken);

            // userService.pay(method, duration, vm.account.id, vm.userInfo.accessToken)
            //     .then(function (result) {
            //         $window.location.replace(result);
            //     }, function (error) {
            //         if (error.error === 100) {
            //             authenticationService.logout();
            //         } else {
            //             notificationService.simpleNotify({ message: error.message, classes: 'alert-danger'});
            //         }
            //     });
        }

        /**
         * Temporal solution
         * To be removed
         */
        function prolongForFree() {
            console.log("prolongForFree");

            userService.prolongForFree(vm.userInfo.accessToken, vm.account.id)
                .then(function (result) {
                    console.log("SUCCESS");
                    console.log(result);
                    var message = result.message;
                    notificationService.simpleNotify({ message: message, classes: 'alert-success'});
                    $state.go('dashboard.accounts');
                }, function (error) {
                    console.log(error);
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        var message = error.message;
                        notificationService.simpleNotify({ message: message, classes: 'alert-danger'});
                    }
                });
        }

    }

})();
