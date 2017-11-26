(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('NewsController', NewsController);

    /* jshint -W101 */
    NewsController.$inject = ['$scope', 'breadcrumbSteps'];

    /* ngInject */
    function NewsController($scope, breadcrumbSteps) {
        $scope.breadcrumbSteps = breadcrumbSteps;
    }

})();
