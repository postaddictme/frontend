(function() {

    'use strict';

    angular
        .module('postaddict')
        .config(config);

    /* jshint -W101 */
    /* @ngInject */
    function config($stateProvider, $urlRouterProvider, cfpLoadingBarProvider, $translateProvider, ngClipProvider, $httpProvider) {

        // Default HTTP Header for all GET requests
        $httpProvider.defaults.headers.get = { 'Content-Type' : 'application/json' };

        $translateProvider.useStaticFilesLoader({
            prefix: 'languages/',
            suffix: '.json'
        });

        cfpLoadingBarProvider.includeSpinner = false;

        ngClipProvider.setPath('bower_components/zeroclipboard/dist/ZeroClipboard.swf');

        $urlRouterProvider.otherwise('/dashboard');
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                abstract: true,
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardController',
                controllerAs: 'vm'
            })
            .state('dashboard.accounts', {
                url: '',
                templateUrl: 'views/accounts.html',
                controller: 'AccountsController',
                controllerAs: 'vm',
                resolve: {
                    accounts: prepareAccounts,
                    pinterestAccounts: preparePinterestAccounts,
                    breadcrumbSteps: function () {
                        return [{ name: 'NAV_ACCOUNTS' }];
                    }
                }
            })
            .state('dashboard.managers', {
                url: '/managers',
                templateUrl: 'views/managers.html',
                controller: 'ManagersController',
                controllerAs: 'vm',
                resolve: {
                    managers: prepareManagers,
                    breadcrumbSteps: function () {
                        return [{ name: 'NAV_MANAGERS' }];
                    }
                }
            })
            .state('dashboard.add-manager', {
                url: '/add-manager',
                templateUrl: 'views/add-manager.html',
                controller: 'AddManagerController',
                controllerAs: 'vm'
            })
            .state('dashboard.add-account', {
                url: '/add-account',
                templateUrl: 'views/add-account.html',
                controller: 'AddAccountController',
                controllerAs: 'vm'
            })
            .state('dashboard.add-account-fail', {
                url: '/add-account-fail',
                templateUrl: 'views/add-account-fail.html'
            })
            .state('dashboard.account', {
                url: '/account/:accountId',
                abstract: true,
                templateUrl: 'views/account.html',
                controller: 'AccountController',
                controllerAs: 'vm',
                resolve: {
                    account: prepareAccount,
                    accounts: prepareAccounts,
                    breadcrumbSteps: function () {
                        return [
                            { name: 'NAV_ACCOUNTS', sref: 'dashboard.accounts' },
                            { name: 'INSTAGRAM_ACCOUNT' }
                        ];
                    }
                }
            })
            .state('dashboard.account.wall', {
                url: '',
                templateUrl: 'views/account/wall.html'
            })
            .state('dashboard.instagram-stories', {
                url: '/instagram-stories/:accountId',
                templateUrl: 'views/instagram-stories.html',
                controller: 'InstagramStoriesController',
                controllerAs: 'vm',
                resolve: {
                    account: prepareAccount,
                    accounts: prepareAccounts,
                    breadcrumbSteps: ['$stateParams', function ($stateParams) {
                        return [
                            { name: 'NAV_ACCOUNTS', sref: 'dashboard.accounts' },
                            { name: 'INSTAGRAM_ACCOUNT', href: '/app/#/dashboard/account/' + $stateParams.accountId },
                            { name: 'STORIES' }
                        ];
                    }]
                }
            })
            .state('dashboard.pinterest-account', {
                url: '/pinterest-account/:accountId',
                abstract: true,
                templateUrl: 'views/pinterest-account.html',
                controller: 'PinterestAccountController',
                controllerAs: 'vm',
                resolve: {
                    account: preparePinterestAccount,
                    boards: preparePinterestBoards,
                    breadcrumbSteps: function () {
                        return [
                            { name: 'NAV_ACCOUNTS', sref: 'dashboard.accounts' },
                            { name: 'PINTEREST_ACCOUNT' }
                        ];
                    }
                }
            })
            .state('dashboard.pinterest-account.boards', {
                url: '',
                templateUrl: 'views/pinterest-boards.html'
            })
            .state('dashboard.pinterest-board', {
                url: '/pinterest-board/:accountId?boardId',
                templateUrl: 'views/pinterest-board.html',
                controller: 'PinterestBoardController',
                controllerAs: 'vm',
                resolve: {
                    account: preparePinterestAccount,
                    // boardMedia: preparePinterestBoardElements,
                    board: preparePinterestBoard,
                    breadcrumbSteps: ['$stateParams', function ($stateParams) {
                        return [
                            { name: 'NAV_ACCOUNTS', sref: 'dashboard.accounts' },
                            { name: 'PINTEREST_ACCOUNT', href: '/app/#/dashboard/pinterest-account/' + $stateParams.accountId },
                            { name: 'PINTEREST_BOARD' }
                        ];
                    }]
                }
            })
            .state('dashboard.account-settings', {
                url: '/account-settings/:accountId',
                templateUrl: 'views/account-settings.html',
                controller: 'AccountSettingsController',
                controllerAs: 'vm',
                resolve: {
                    account: prepareAccount,
                    breadcrumbSteps: ['$stateParams', function ($stateParams) {
                        return [
                            { name: 'NAV_ACCOUNTS', sref: 'dashboard.accounts' },
                            { name: 'INSTAGRAM_ACCOUNT', href: '/app/#/dashboard/account/' + $stateParams.accountId },
                            { name: 'ACCOUNT_SETTINGS' }
                        ];
                    }]
                }
            })
            .state('dashboard.account-statistics', {
                url: '/account-statistics/:accountId',
                templateUrl: 'views/account-statistics.html',
                controller: 'AccountStatisticsController',
                controllerAs: 'vm',
                resolve: {
                    account: prepareAccount,
                    accounts: prepareAccounts
                }
            })
            .state('dashboard.post-media', {
                url: '/post-media',
                templateUrl: 'views/post-media.html',
                controller: 'PostController',
                params: { account: null, media: null, edit: null, repeat: null, isFirstPost: null, mediaType: null, pinterestBoard: null },
                controllerAs: 'vm'
            })
            .state('dashboard.suggested-posts', {
                url: '/suggested-posts/:accountId',
                templateUrl: 'views/suggested-posts.html',
                controller: 'SuggestedPostsController',
                controllerAs: 'vm',
                resolve: {
                    account: prepareAccount,
                    accounts: prepareAccounts,
                    breadcrumbSteps: ['$stateParams', function ($stateParams) {
                        return [
                            { name: 'NAV_ACCOUNTS', sref: 'dashboard.accounts' },
                            { name: 'INSTAGRAM_ACCOUNT', href: '/app/#/dashboard/account/' + $stateParams.accountId },
                            { name: 'SUGGESTED_POSTS' }
                        ];
                    }]
                }
            })
            .state('dashboard.access-denied', {
                url: '/access-denied',
                templateUrl: 'views/access-denied-page.html'
            })
            .state('dashboard.pay', {
                url: '/pay/:accountId',
                templateUrl: 'views/pay.html',
                controller: 'PayController',
                controllerAs: 'vm',
                resolve: {
                    account: prepareAccount,
                    breadcrumbSteps: ['$stateParams', function ($stateParams) {
                        return [
                            { name: 'NAV_ACCOUNTS', sref: 'dashboard.accounts' },
                            { name: 'INSTAGRAM_ACCOUNT', href: '/app/#/dashboard/account/' + $stateParams.accountId },
                            { name: 'PAYMENT_PAGE' }
                        ];
                    }]
                },
                onEnter: shouldAccountPay
            })
            .state('dashboard.settings', {
                url: '/settings',
                templateUrl: 'views/settings.html',
                controller: 'SettingsController',
                controllerAs: 'vm',
                resolve: {
                    subscriptions: prepareSubscriptions,
                    telegramUsername: prepareTelegramUsername,
                    breadcrumbSteps: function () {
                        return [{ name: 'NAV_SETTINGS' }];
                    }
                }
            })
            .state('dashboard.payment-success', {
                url: '/payment-success',
                templateUrl: 'views/payment-success.html',
                controller: 'PaymentSuccessController',
                resolve: {
                    accounts: prepareAccounts
                }
            })
            .state('dashboard.payment-fail', {
                url: '/payment-fail',
                templateUrl: 'views/payment-fail.html'
            })
            .state('dashboard.support', {
                url: '/support',
                templateUrl: 'views/support.html',
                controller: 'SupportController',
                resolve: {
                    breadcrumbSteps: function () {
                        return [{ name: 'NAV_SUPPORT' }];
                    }
                }
            })
            .state('dashboard.admin', {
                url: '/adminhiddenpageraymyela',
                abstract: true,
                templateUrl: 'views/admin.html',
                controller: 'AdminController',
                controllerAs: 'vm',
                resolve: {
                    data: isAdmin
                }
            })
            .state('dashboard.admin.accounts', {
                url: '',
                templateUrl: 'views/admin/accounts.html'
            })
            .state('dashboard.admin.media', {
                url: '/media',
                templateUrl: 'views/admin/media.html'
            })
            .state('dashboard.promo-code', {
                url: '/promo-code',
                templateUrl: 'views/promo-code.html',
                controller: 'PromoCodeController',
                controllerAs: 'vm',
                resolve: {
                    currentPromoCode: getCurrentPromoCode,
                    breadcrumbSteps: function () {
                        return [{ name: 'PROMO_CODES' }];
                    }
                }
            })
            .state('dashboard.partner-program', {
                url: '/partner-program',
                templateUrl: 'views/partner-program.html',
                controller: 'PartnerProgramController',
                controllerAs: 'vm',
                resolve: {
                    partnerPrograms: preparePartnerPrograms,
                    breadcrumbSteps: function () {
                        return [{ name: 'PARTNER_PROGRAM' }];
                    }
                }
            })
            .state('dashboard.news', {
                url: '/news',
                templateUrl: 'views/news.html',
                controller: 'NewsController',
                controllerAs: 'vm',
                resolve: {
                    breadcrumbSteps: function () {
                        return [{ name: 'NEWS' }];
                    }
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'LoginController',
                controllerAs: 'vm'
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'views/signup.html',
                controller: 'SignupController',
                controllerAs: 'vm'
            })
            .state('recover-password', {
                url: '/recover-password/:key',
                templateUrl: 'views/recover-password.html',
                controller: 'RecoverPasswordController',
                controllerAs: 'vm',
                resolve: {
                    verify: verifyPasswordRecoveryKey
                }
            })
            .state('suggest', {
                url: '/suggest/:username',
                templateUrl: 'views/suggest.html',
                controller: 'SuggestController',
                controllerAs: 'vm',
                resolve: {
                    data: isAllowedToBeSuggested
                }
            })
            .state('reset', {
                url: '/reset',
                templateUrl: 'views/reset.html',
                controller: 'ResetController',
                controllerAs: 'vm'
            })
            .state('error', {
                url: '/error/:status',
                templateUrl: 'views/error.html',
                controller: 'ErrorController',
                controllerAs: 'vm'
            });
    }

    prepareManagers.$inject = ['authenticationService', 'userService'];
    function prepareManagers(authenticationService, userService) {
        var userInfo = authenticationService.getUserInfo();
        return userService.getManagers(userInfo.accessToken, userInfo.companyId).
        then(function (result) {
            return result;
        }, function (error) {
            if (error.error === 100) {
                authenticationService.logout();
            }
        });
    }

    prepareAccounts.$inject = ['authenticationService', 'userService'];
    function prepareAccounts(authenticationService, userService) {
        var userInfo = authenticationService.getUserInfo();

        return userService.getAccounts(userInfo.companyId, userInfo.accessToken).
            then(function (result) {
                console.log(result);
                result.forEach(function(entry) {
                    entry.activeUntilWord = moment(entry.activeUntil).format('D MMMM YYYY');
                });
                return result;
            }, function (error) {
                console.log(error);
                if (error.error === 100) {
                    authenticationService.logout();
                }
            });
    }

    preparePinterestAccounts.$inject = ['authenticationService', 'userService'];
    function preparePinterestAccounts(authenticationService, userService) {
        var userInfo = authenticationService.getUserInfo();

        return userService.getPinterestAccounts(userInfo.accessToken)
            .then(function (result) {
                console.log(result);
                result.forEach(function(entry) {
                    entry.activeUntilWord = moment(entry.activeUntil).format('D MMMM YYYY');
                });
                return result;
            }, function (error) {
                console.log(error);
                if (error.error === 100) {
                    authenticationService.logout();
                }
            });
    }

    prepareAccount.$inject = ['authenticationService', 'userService', '$stateParams'];
    function prepareAccount(authenticationService, userService, $stateParams) {
        var userInfo = authenticationService.getUserInfo();
        return userService.getAccountById($stateParams.accountId, userInfo.accessToken);
    }

    preparePinterestAccount.$inject = ['authenticationService', 'userService', '$stateParams'];
    function preparePinterestAccount(authenticationService, userService, $stateParams) {
        console.log($stateParams);
        var userInfo = authenticationService.getUserInfo();
        return userService.getPinterestAccountById($stateParams.accountId, userInfo.accessToken);
    }

    preparePinterestBoards.$inject = ['authenticationService', 'userService', '$stateParams'];
    function preparePinterestBoards(authenticationService, userService, $stateParams) {
        var userInfo = authenticationService.getUserInfo();
        return userService.getPinterestBoards($stateParams.accountId, userInfo.accessToken);
    }

    preparePinterestBoard.$inject = ['authenticationService', 'userService', '$stateParams'];
    function preparePinterestBoard(authenticationService, userService, $stateParams) {
        var userInfo = authenticationService.getUserInfo();
        return userService.getPinterestBoard($stateParams.boardId, userInfo.accessToken);
    }

    // preparePinterestBoardElements.$inject = ['authenticationService', 'userService', '$stateParams'];
    // function preparePinterestBoardElements(authenticationService, userService, $stateParams) {
    //     console.log($stateParams);
    //     var userInfo = authenticationService.getUserInfo();
    //     return userService.getPinterestBoardMediaByPage($stateParams.boardId, userInfo.accessToken);
    // }

    prepareTelegramUsername.$inject = ['authenticationService', 'telegramService'];
    function prepareTelegramUsername(authenticationService, telegramService) {
        var userInfo = authenticationService.getUserInfo();
        return telegramService.getUsername(userInfo.accessToken).
        then(function(result) {
            return result.data.username;
        }, function(error) {
            if (error.error === 100) {
                authenticationService.logout();
            }
        });
    }

    prepareSubscriptions.$inject = ['authenticationService'];
    function prepareSubscriptions(authenticationService) {
        var userInfo = authenticationService.getUserInfo();
        var subscriptions = [
            {type: 2, name: 'DASH_SETTINGS_H_EMAIL_SUBSCRIPTION_2', isActive: false},
            {type: 3, name: 'DASH_SETTINGS_H_EMAIL_SUBSCRIPTION_3', isActive: false},
            {type: 4, name: 'DASH_SETTINGS_H_EMAIL_SUBSCRIPTION_4', isActive: false},
            {type: 5, name: 'DASH_SETTINGS_H_EMAIL_SUBSCRIPTION_5', isActive: false}
        ];

        userInfo.subscriptions.forEach(function(entry) {
            subscriptions.forEach(function(subscription) {
                if (subscription.type === entry.type && entry.isActive === 1) {
                    subscription.isActive = true;
                }
            });
        });

        return subscriptions;
    }

    isAllowedToBeSuggested.$inject = ['$stateParams', 'userService'];
    function isAllowedToBeSuggested($stateParams, userService) {
        return userService.isAllowedToBeSuggested($stateParams.username)
            .then(function(result) {
                return result;
            }, function(error) {
                return error;
            });
    }

    isAdmin.$inject = ['authenticationService', 'adminService'];
    function isAdmin(authenticationService, adminService) {
        var userInfo = authenticationService.getUserInfo();
        return adminService.adminLogin(userInfo.accessToken);
    }

    shouldAccountPay.$inject = ['$state', 'account'];
    function shouldAccountPay($state, account) {
        if (account.shouldPay === 0 || account.isVerified !== 1) {
            $state.go('dashboard.access-denied');
        }
    }

    verifyPasswordRecoveryKey.$inject = ['$stateParams', 'authenticationService'];
    function verifyPasswordRecoveryKey($stateParams, authenticationService) {
        return authenticationService.verifyPasswordRecoveryKey($stateParams.key);
    }

    getCurrentPromoCode.$inject = ['authenticationService', 'userService'];
    function getCurrentPromoCode(authenticationService, userService) {
        var userInfo = authenticationService.getUserInfo();

        return userService.getCurrentPromoCode(userInfo.accessToken).
        then(function (result) {
            return result.data;
        }, function (error) {
            if (error.error === 100) {
                authenticationService.logout();
            }
        });
    }

    preparePartnerPrograms.$inject = ['authenticationService', 'userService'];
    function preparePartnerPrograms(authenticationService, userService) {
        var userInfo = authenticationService.getUserInfo();

        return userService.getPartnerPrograms(userInfo.accessToken)
            .then(function (result) {
                result.forEach(function(entry) {
                    entry.expiredAtText = moment(entry.expiredAt).format('D MMMM YYYY');
                });

            return result;
        }, function (error) {
            if (error.error === 100) {
                authenticationService.logout();
            }
        });
    }

})();
