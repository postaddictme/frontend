(function () {

    'use strict';

    angular
        .module('postaddict')
        .directive('pageTitle', pageTitle)
        .directive('sideNavigation', sideNavigation)
        .directive('iboxTools', iboxTools)
        .directive('minimalizaSidebar', minimalizaSidebar)
        .directive('pageHeading', pageHeading)

        /** Cards */
        .directive('accountCard', accountCard)
        .directive('pinterestAccountCard', pinterestAccountCard)
        .directive('managerCard', managerCard)
        .directive('postCard', postCard)
        .directive('storyCard', storyCard)
        .directive('pinterestPostCard', pinterestPostCard)
        .directive('pinterestBoardCard', pinterestBoardCard)
        .directive('suggestedPostCard', suggestedPostCard)
        .directive('paginationCard', paginationCard)
        .directive('suggestsCard', suggestsCard)
        .directive('addPostCard', addPostCard)

        /** Other directives */
        .directive('passwordStrengthEstimator', passwordStrengthEstimator)
        .directive('paStatisticsTable', paStatisticsTable)
        .directive('paHtmlTooltip', paHtmlTooltip)
        .directive('icheck', icheck)
        .directive('fallbackSrc', fallbackSrc)
        .directive('breadcrumb', breadcrumb);

    /* jshint -W101 */
    function pageTitle($rootScope, $timeout) {
        return {
            link: link
        };

        function link(scope, element) {
            var listener = function (event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'Postaddict.me';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) {
                    title = 'Postaddict | ' + toState.data.pageTitle;
                }
                $timeout(function () {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }

    /**
     * sideNavigation - Directive for run metsiMenu on sidebar navigation
     */
    function sideNavigation() {
        return {
            restrict: 'A',
            link: link
        };

        function link(scope, element) {
            // Call the metsiMenu plugin and plug it to sidebar navigation
            element.metisMenu();
        }
    }

    /**
     * iboxTools - Directive for iBox tools elements in right corner of ibox
     */
    function iboxTools($timeout) {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'views/common/ibox_tools.html',
            controller: IboxToolsController
        };
    }

    IboxToolsController.$inject = ['$scope', '$element', '$timeout'];
    function IboxToolsController($scope, $element, $timeout) {
        // Function for collapse ibox
        $scope.showhide = function () {
            var ibox = $element.closest('div.ibox');
            var icon = $element.find('i:first');
            var content = ibox.find('div.ibox-content');
            content.slideToggle(200);
            // Toggle icon from up to down
            icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
            ibox.toggleClass('').toggleClass('border-bottom');
            $timeout(function () {
                ibox.resize();
                ibox.find('[id^=map-]').resize();
            }, 50);
        };
        // Function for close ibox
        $scope.closebox = function () {
            var ibox = $element.closest('div.ibox');
            ibox.remove();
        };
    }

    /**
     * minimalizaSidebar - Directive for minimalize sidebar
     */
    function minimalizaSidebar($timeout) {
        return {
            restrict: 'A',
            template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary" href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
            controller: MinimalizaSidebar
        };
    }

    function pageHeading() {
        return {
            restrict: 'E',
            templateUrl: 'views/common/page-heading.html',
            scope: {
                title: '@',
                steps: '='
            }
        }
    }

    MinimalizaSidebar.$inject = ['$scope', '$element', '$timeout'];

    function MinimalizaSidebar($scope, $element, $timeout) {
        $scope.minimalize = function () {
            $('body').toggleClass('mini-navbar');
            if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                // Hide menu in order to smoothly turn on when maximize menu
                $('#side-menu').hide();
                // For smoothly turn on menu
                $timeout(function () {
                    $('#side-menu').fadeIn(500);
                }, 100);
            } else {
                // Remove all inline style from jquery fadeIn function to reset menu state
                $('#side-menu').removeAttr('style');
            }
        };
    }

    function accountCard() {
        return {
            restrict: 'E',
            scope: {
                account: '=',
                userInfo: '=',
                confirmDeleteAccount: '=',
                deleteAccount: '=',
                state: '='
            },
            templateUrl: 'views/cards/account-card.html'
        };
    }

    function pinterestAccountCard() {
        return {
            restrict: 'E',
            scope: {
                account: '=',
                userInfo: '=',
                confirmDeleteAccount: '=',
                deleteAccount: '=',
                state: '='
            },
            templateUrl: 'views/cards/pinterest-account-card.html'
        };
    }

    function managerCard() {
        return {
            restrict: 'E',
            scope: {
                manager: '=',
                userInfo: '=',
                confirmDeleteManager: '=',
                deleteManager: '='
            },
            templateUrl: 'views/cards/manager-card.html'
        };
    }

    function postCard($state) {
        return {
            restrict: 'E',
            scope: {
                futureMedia: '=',
                //futurePostDate: '=',
                editPost: '=',
                repeatPost: '=',
                confirmCancelPost: '=',
                cancelPost: '=',
                confirmDeletePost: '=',
                deletePost: '='
            },
            controller: postCardController,
            templateUrl: 'views/cards/post-card.html'
        };
    }

    function storyCard() {
        return {
            restrict: 'E',
            scope: {
                media: '=',
                editStory: '=',
                confirmCancelStory: '=',
                cancelStory: "="
            },
            controller: storyCardController,
            templateUrl: 'views/cards/story-card.html'
        }
    }

    function pinterestBoardCard() {
        return {
            restrict: 'E',
            scope: {
                account: '=',
                board: '='
            },
            // controller: pinterestBoardCardController,
            templateUrl: 'views/cards/pinterest-board-card.html'
        };
    }

    function pinterestPostCard() {
        return {
            restrict: 'E',
            scope: {
                media: '=',
                //postDate: '=',
                editPost: '=',
                confirmCancelPost: '=',
                cancelPost: '=',
                confirmDeletePost: '=',
                deletePost: '='
            },
            controller: pinterestPostCardController,
            templateUrl: 'views/cards/pinterest-post-card.html'
        };
    }

    function suggestedPostCard($state) {
        return {
            restrict: 'E',
            scope: {
                media: '=',
                postDate: '=',
                editPost: '=',
                confirmRejectPost: '=',
                rejectPost: '='
            },
            templateUrl: 'views/cards/suggested-post-card.html'
        };
    }

    function paginationCard($state) {
        return {
            restrict: 'E',
            scope: {
                showPagination: '=',
                pages: '=',
                currentRange: '=',
                currentPage: '=',
                getByPage: '='
            },
            templateUrl: 'views/common/pagination.html'
        };
    }

    function suggestsCard() {
        return {
            restrict: 'E',
            scope: {
                account: '=',
                state: '='
            },
            templateUrl: 'views/cards/suggests-card.html'
        };
    }

    function addPostCard($state) {
        return {
            restrict: 'E',
            scope: {
                title: '=',
                addNewPost: '=',
                showChooseMethods: '=',
                uploadByUrl: '=',
                upload: '=',
                uploadingFromUrl: '=',
                uploadingFromStorage: '=',
                uploadFromUrlButtonText: '=',
                uploadFromStorageButtonText: '=',
                uploading: '=',
                obj: '=',
                hideUploadByUrl: '=',
                acceptFormats: '@',
                patternFormats: '@'
            },
            templateUrl: 'views/cards/add-post-card.html'
        };
    }

    function passwordStrengthEstimator() {
        return {
            restrict: 'E',
            scope: {
                password: '@'
            },
            controller: passwordStrengthEstimatorController,
            templateUrl: 'views/common/password-strength-estimator.html'
        };
    }

    function paStatisticsTable() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                posts: '=',
                index: '=',
                loadData: '=',
                loadDataIsDisabled: '='
            },
            controller: paStatisticsTableController,
            templateUrl: 'views/common/statistics-table.html'
        }
    }

    function paHtmlTooltip() {
        return {
            restrict: 'A',
            scope: {
                htmlTooltipContent: '@'
            },
            link: function (scope, element, attrs) {
                console.log(scope.htmlTooltipContent);
                $(element).tooltip({content: scope.htmlTooltipContent});
            }
        };
    }

    /**
     * icheck - Directive for custom checkbox icheck
     */
    function icheck($timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function ($scope, element, $attrs, ngModel) {
                return $timeout(function () {
                    var value;
                    value = $attrs['value'];

                    $scope.$watch($attrs['ngModel'], function (newValue) {
                        $(element).iCheck('update');
                    });

                    return $(element).iCheck({
                        checkboxClass: 'icheckbox_square-green',
                        radioClass: 'iradio_square-green'

                    }).on('ifChanged', function (event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function () {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function () {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
                });
            }
        };
    }

    /**
     * Show fallback image if ng-src return 404
     */
    function fallbackSrc() {
        return {
            link: function (scope, element, attrs) {
                element.bind('error', function () {
                    if (attrs.src !== attrs.fallbackSrc) {
                        attrs.$set('src', attrs.fallbackSrc);
                    }
                });
            }
        }
    }

    function breadcrumb() {
        return {
            restrict: 'E',
            templateUrl: 'views/common/breadcrumb.html',
            scope: {
                steps: '='
            },
            controller: breadcrumbController
        }
    }

    /**
     * ===========
     * Controllers
     * ===========
     */

    // pinterestBoardCardController.$inject = ['$scope', '$filter'];
    // function pinterestBoardCardController($scope, $filter) {
    //     $scope.boardHasNoDescriptionText = $filter('translate')('BOARD_HAS_NO_DESCRIPTION');
    //     $scope.boardHasNoNameText = $filter('translate')('BOARD_HAS_NO_NAME');
    // }

    postCardController.$inject = ['$scope', 'INSTAGRAM_POST_STATUS'];
    function postCardController($scope, INSTAGRAM_POST_STATUS) {
        $scope.INSTAGRAM_POST_STATUS = INSTAGRAM_POST_STATUS;
        $scope.futureMedia.formattedPublishDate = postDate($scope.futureMedia.publishDate);

        function postDate(dateTime) {
            console.log(dateTime);
            var formattedDateTime = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').add(moment().utcOffset(), 'minutes');
            return formattedDateTime.format('D MMMM ') + formattedDateTime.format('HH:mm');
        }
    }

    storyCardController.$inject = ['$scope', 'INSTAGRAM_POST_STATUS'];
    function storyCardController($scope, INSTAGRAM_POST_STATUS) {
        $scope.INSTAGRAM_POST_STATUS = INSTAGRAM_POST_STATUS;
        $scope.media.formattedPublishDate = postDate($scope.media.publishDate);

        function postDate(dateTime) {
            console.log(dateTime);
            var formattedDateTime = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').add(moment().utcOffset(), 'minutes');
            return formattedDateTime.format('D MMMM ') + formattedDateTime.format('HH:mm');
        }
    }

    pinterestPostCardController.$inject = ['$scope', 'PINTEREST_POST_STATUS'];
    function pinterestPostCardController($scope, PINTEREST_POST_STATUS) {
        $scope.PINTEREST_POST_STATUS = PINTEREST_POST_STATUS;
        $scope.media.formattedPublishDate = postDate($scope.media.publishDate);

        function postDate(dateTime) {
            var formattedDateTime = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').add(moment().utcOffset(), 'minutes');
            return formattedDateTime.format('D MMMM ') + formattedDateTime.format('HH:mm');
        }
    }

    passwordStrengthEstimatorController.$inject = ['$scope'];
    function passwordStrengthEstimatorController($scope) {
        $scope.$watch('password', function (p) {
            $scope.passwordScore = getScore(p);
        });

        function getScore() {
            if ($scope.password) {
                return zxcvbn($scope.password).score;
            }
        }
    }

    paStatisticsTableController.$inject = ['$scope', 'INSTAGRAM_POST_STATUS'];
    function paStatisticsTableController($scope, INSTAGRAM_POST_STATUS) {
        $scope.INSTAGRAM_POST_STATUS = INSTAGRAM_POST_STATUS;
        $scope.$watch('posts', function (newPosts) {
            console.log(newPosts);
            if (newPosts) {
                newPosts.forEach(function (post) {
                    post.formattedPublishDate = formatPublishDate(post.publishDate);
                });
            }
        }, true);



        function formatPublishDate(dateTime) {
            console.log(dateTime);
            var formattedDateTime = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').add(moment().utcOffset(), 'minutes');
            return formattedDateTime.format('MMM D, ') + formattedDateTime.format('HH:mm');
        }
    }

    breadcrumbController.$inject = ['$scope', '$filter'];
    function breadcrumbController($scope, $filter) {
        $scope.steps.forEach(function (el) {
            el.name = $filter('translate')(el.name);
        });
    }

})();
