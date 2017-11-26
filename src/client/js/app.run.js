(function () {

    'use strict';

    angular
        .module('postaddict')
        .run(run);

    /* jshint -W101 */
    /* @ngInject */
    function run($rootScope, $state, authenticationService, userService, $window, $translate, editableOptions, notificationService) {
        editableOptions.theme = 'bs3';
        $rootScope.$state = $state;
        $rootScope.$on('$stateChangeStart', function (event, toState  , toParams, fromState, fromParams) {

            /** Get user info from service */
            var userInfo = authenticationService.getUserInfo();

            /** Check if state is login */
            var isLogin = toState.name === 'login';

            /** States outside dashboard */
            var specialStates = ['reset', 'signup', 'recover-password'];

            /** If user goes to login page */
            if (isLogin) {
                $translate.use(userService.detectLanguage());
                return;
            }

            /** If user goes to suggest page */
            if (toState.name === 'suggest'){

                if ($window.localStorage['userInfo'] == undefined) {
                    $translate.use(userService.detectLanguage());
                } else {
                    $translate.use(userInfo.language.replace('-', '_'));
                }

                return;
            }

            /** Check user authentication */
            if ($window.localStorage['userInfo'] == undefined) {
                $translate.use(userService.detectLanguage());
                if (specialStates.indexOf(toState.name) == -1) {
                    event.preventDefault();
                    $state.go('login');
                }
            } else {
                /** Set app language */
                $translate.use(userInfo.language.replace('-', '_'));
                moment.locale(userInfo.language.replace('-', '_'));

                if (specialStates.indexOf(toState.name) != -1) {
                    event.preventDefault();
                    $state.go('dashboard.accounts');
                } else if (toState.name === 'dashboard.add-manager' && userInfo.role !== 1) {
                    event.preventDefault();
                    $state.go('dashboard.access-denied');
                } else if (toState.name === 'dashboard.add-account') {
                    $.ajax({
                        type: 'POST',
                        url: 'https://instagram.com/accounts/logout',
                        dataType: 'jsonp',
                        success: function (result){
                        },
                        error: function (error){
                        }
                    });
                } else if (toState.name === 'dashboard.media' && toParams.count === 0) {
                    event.preventDefault();
                } else if (toState.name === 'dashboard.account.wall' && fromState.name === 'dashboard.account.post-media') {
                    $state.fromState = fromState;
                } else if (toState.name === 'dashboard.account-settings' && userInfo.role !== 1) {
                    event.preventDefault();
                    $state.go('dashboard.access-denied');
                }
            }
        });

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            event.preventDefault();
            console.log(error);
            return $state.go('error', {status: error.status});
        });
    }

})();
