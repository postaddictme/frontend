(function () {

    'user strict';

    angular
        .module('postaddict')
        .controller('SupportController', SupportController);

    SupportController.$inject = ['$translate', '$scope', 'breadcrumbSteps'];
    function SupportController($translate, $scope, breadcrumbSteps) {

        $scope.language = $translate.use();
        $scope.breadcrumbSteps = breadcrumbSteps;
    }

})();
