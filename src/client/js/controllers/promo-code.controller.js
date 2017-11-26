(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('PromoCodeController', PromoCodeController);

    /* jshint -W101 */
    PromoCodeController.$inject = ['$scope', 'userService', 'authenticationService', 'notificationService', '$translate', 'currentPromoCode', 'breadcrumbSteps'];

    /* @ngInject */
    function PromoCodeController($scope, userService, authenticationService, notificationService, $translate, currentPromoCode, breadcrumbSteps) {
        var vm = this;

        vm.userInfo = authenticationService.getUserInfo();
        vm.language = $translate.use();
        vm.currentPromoCode = currentPromoCode || null;
        vm.sending = false;
        vm.usePromoCode = usePromoCode;

        $scope.breadcrumbSteps = breadcrumbSteps;

        function usePromoCode() {
            userService.usePromoCode(vm.promoCode, vm.userInfo.accessToken)
                .then(function (result) {
                    vm.currentPromoCode = result.data;
                    notificationService.simpleNotify({ message: result.message, classes: 'alert-success' });
                }, function (error) {
                    if (error.error === 100) {
                        authenticationService.logout();
                    } else {
                        notificationService.simpleNotify({ message: error.message, classes: 'alert-danger' });
                    }
                });
        }

    }

})();
