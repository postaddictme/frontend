(function () {
    'use strict';

    angular
        .module('postaddict')
        .controller('ErrorController', ErrorController);

    ErrorController.$inject = ['$scope', '$stateParams'];

    function ErrorController($scope, $stateParams) {
        var vm = this;

        bootstrap();

        function bootstrap() {
            vm.code = $stateParams.status;

            if (vm.code == 500) {
                vm.description = "Page Not Found";
                vm.message = "The server encountered something unexpected that didn't allow it to complete the request. We apologize.";
            } else if (vm.code == 404) {
                vm.description = "Internal Server Error";
                vm.message = "Sorry, but the page you are looking for has note been found. Try checking the URL for error, then hit the refresh button on your browser or try found something else in our app.";
            } else {
                vm.description = "Oooops!";
                vm.message = "Something went wrong. We are really sorry.";
            }
        }
    }

})();
