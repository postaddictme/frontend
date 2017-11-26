(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('BodyController', BodyController);

    BodyController.$inject = ['$scope', '$location', '$window'];

    function BodyController($scope, $location, $window) {

        /** Send Google analytics data */
        $scope.$on('$viewContentLoaded', function (event) {
            $window.ga('send', 'pageview', { page: $location.url() });
        });
    }

})();
