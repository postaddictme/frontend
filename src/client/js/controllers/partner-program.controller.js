(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('PartnerProgramController', PartnerProgramController);

    PartnerProgramController.$inject = ['$scope', 'partnerPrograms', '$translate', 'breadcrumbSteps'];

    function PartnerProgramController($scope, partnerPrograms, $translate, breadcrumbSteps) {
        var vm = this;
        $scope.breadcrumbSteps = breadcrumbSteps;
        vm.partnerPrograms = partnerPrograms || null;
    }

})();
