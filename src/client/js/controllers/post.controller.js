(function () {

    'use strict';

    angular
        .module('postaddict')
        .controller('PostController', PostController);

    /* jshint -W101 */
    /* jshint -W072 */
    PostController.$inject = ['$scope', 'authenticationService', 'userService', '$state', '$stateParams', 'notificationService', '$filter', 'MEDIA_TYPE', 'INSTAGRAM_HASHTAGS_LIMIT'];

    /* @ngInject */
    function PostController($scope, authenticationService, userService, $state, $stateParams, notificationService, $filter, MEDIA_TYPE, INSTAGRAM_HASHTAGS_LIMIT) {
        var vm = this;
        vm.userInfo = authenticationService.getUserInfo();
        // Initialize caption editor
        var tit = new TwemojiInput(document.querySelector('textarea'));
        var textarea = document.querySelector('textarea');

        //// Tag params
        //var taggd = null;
        //var taggdData = [];
        //var taggdOptions = {
        //    align: { y: 'bottom' },
        //    offset: { top: -35 },
        //
        //    handlers: {
        //        //click: 'toggle',
        //        mouseenter: 'show',
        //        mouseleave: 'hide'
        //    }
        //};

        vm.postScheduleVisible = false;
        vm.deleteScheduleVisible = false;
        vm.deleteAfter = '24:00';
        vm.postNowButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_NOW_BUTTON');
        vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');
        vm.close = close;
        vm.cancel = cancel;
        vm.showPostSchedule = showPostSchedule;
        vm.sendPost = sendPost;
        vm.updatePost = updatePost;
        vm.send = send;
        //vm.tag = tag;
        vm.activate = activate;

        //// Current tag data
        //$scope.person = {};
        //// Account's saved tags
        //// TODO: extract this data from account's object
        //$scope.people = [
        //    //{ username: 'adam', full_name: 'Adam', profile_picture: 'https://...'}
        //];
        //$scope.refreshPeople = refreshPeople;

        /** Kick off */
        vm.activate();

        function activate() {
            // If there is no media then redirect to accounts page
            if ($stateParams.media) {
                vm.account = $stateParams.account;
                vm.pinterestBoard = $stateParams.pinterestBoard;

                // Init media of post
                $scope.media = $stateParams.media;
                $scope.localMediaUrl = $stateParams.media.localMediaUrl;
                $scope.thumbnailUrl = $stateParams.media.thumbnailUrl;
                console.log($scope.media);
                $scope.fileType = $stateParams.media.type;

                //// Run Tag functionality with its params
                //taggd = $('.new-post-media').taggd( taggdOptions, taggdData );
                //
                //$('.new-post-media').taggd( taggdOptions, taggdData );

                // Init type of post
                $scope.editingPost = $stateParams.edit;
                $scope.repeatingPost = $stateParams.repeat;
                $scope.isFirstPost = $stateParams.isFirstPost;
                $scope.mediaType = $stateParams.mediaType;
                $scope.showCaption = true;
                if ($scope.mediaType === MEDIA_TYPE.instagramStory) {
                    $scope.showCaption = false;
                    $scope.enqueueButtonTooltip = $filter('translate')('ENQUEUE_STORY_TO') + " @" + vm.account.username;
                    $scope.postNowButtonTooltip = $filter('translate')('SEND_STORY_TO') + " @" + vm.account.username;
                } else if ($scope.mediaType === MEDIA_TYPE.instagramPost) {
                    $scope.enqueueButtonTooltip = $filter('translate')('ENQUEUE_POST_TO') + " @" + vm.account.username;
                    $scope.postNowButtonTooltip = $filter('translate')('SEND_POST_TO') + " @" + vm.account.username;
                } else if ($scope.mediaType === MEDIA_TYPE.pinterestPost) {
                    $scope.enqueueButtonTooltip = $filter('translate')('ENQUEUE_PIN_TO') + " " + vm.pinterestBoard.name;
                    $scope.postNowButtonTooltip = $filter('translate')('SEND_PIN_TO') + " " + vm.pinterestBoard.name;
                }

                $scope.post = {};

                if ($scope.editingPost === true) {
                    var postTime = moment($scope.media.publishDate).add(moment().utcOffset(), 'minutes');
                    console.log($scope.media.publishDate);
                    console.log(postTime);
                    $scope.post.publishDate = postTime.format('DD/MM/YYYY');
                    $scope.post.hour = postTime.format('HH');
                    $scope.post.minute = postTime.format('mm');
                    $scope.post.hourminute = postTime.format('HH:mm');

                    var delTime = $scope.media.deleteDate === null ? null : moment($scope.media.deleteDate).add(moment().utcOffset(), 'minutes');
                    console.log($scope.media.deleteDate);
                    console.log(delTime);
                    $scope.delHourMinuteDif = $scope.media.deleteDate === null ? null : delTime.diff(postTime);
                    $scope.delHourMinuteDuration = moment.duration($scope.delHourMinuteDif);
                    $scope.delHourMinute = $scope.media.deleteDate === null ? null : ('0' + Math.floor($scope.delHourMinuteDuration.asHours())).slice(-2) + moment.utc($scope.delHourMinuteDif).format(':mm');

                    vm.postScheduleVisible = true;
                    vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');

                    vm.deleteScheduleVisible = $scope.delHourMinute === null ? false : true;
                    vm.deleteAfter = $scope.delHourMinute === null ? '24:00' : $scope.delHourMinute;

                    // Insert editing media caption to the textarea
                    $('._twemoji_textarea').append($scope.media.caption);
                    $('._twemoji_textarea').keyup();
                } else {
                    var now = moment();
                    now.add(1, 'm');
                    $scope.post.publishDate = now.format('DD/MM/YYYY');
                    $scope.post.hour = now.format('HH');
                    $scope.post.minute = now.format('mm');
                    $scope.post.hourminute = now.format('HH:mm');

                    if ($scope.repeatingPost === true) {
                        $('._twemoji_textarea').append($scope.media.caption);
                        $('._twemoji_textarea').keyup();
                    }
                }

                // Watch changes of timepicker's value
                $scope.$watch('input.hourminute', function () {
                    var now = moment();
                    var datetime = moment(String($scope.post.publishDate) + ' ' + $scope.post.hourminute, 'DD/MM/YYYY HH:mm');
                    var isValid = now.isBefore(datetime) &&
                        /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test($scope.post.hourminute);
                    if (isValid) {
                        $('#hourminute').css('border', '1px solid rgb(229, 230, 231)');
                    } else {
                        $('#hourminute').css('border', '1px solid rgb(255, 0, 0)');
                    }
                });

            } else {
                $state.go('dashboard.accounts');
            }

        }

        function close(newMedia) {
            vm.postScheduleVisible = false;
            vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');

            if ($scope.mediaType === MEDIA_TYPE.instagramPost) {
                $state.go('dashboard.account.wall', {accountId: vm.account.id});
            } else if ($scope.mediaType === MEDIA_TYPE.instagramStory) {
                $state.go('dashboard.instagram-stories', {accountId: vm.account.id});
            } else if ($scope.mediaType === MEDIA_TYPE.pinterestPost) {
                $state.go('dashboard.pinterest-board', {accountId: vm.account.id, boardId: vm.pinterestBoard.id});
            }
        }

        function cancel() {
            vm.sending = false;
            vm.postScheduleVisible = false;
            vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');

            if ($scope.mediaType === MEDIA_TYPE.instagramPost) {
                $state.go('dashboard.account.wall', {accountId: vm.account.id});
            } else if ($scope.mediaType === MEDIA_TYPE.instagramStory) {
                $state.go('dashboard.instagram-stories', {accountId: vm.account.id});
            } else if ($scope.mediaType === MEDIA_TYPE.pinterestPost) {
                $state.go('dashboard.pinterest-board', {accountId: vm.account.id, boardId: vm.pinterestBoard.id});
            }
        }

        function showPostSchedule() {
            vm.postScheduleVisible = true;
            vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');
        }

        function sendPost(immediately) {
            if (vm.sending) return;
            console.log('sendPost');
            var datetime2,
                isValid2,
                deleteTimeUnix;

            if (immediately) {
                datetime2 = moment();
                isValid2 = true;
            } else {
                var now = moment();
                datetime2 = moment(String($scope.post.publishDate) + ' ' + $scope.post.hourminute, 'D/M/YYYY HH:mm');
                isValid2 = now.isBefore(datetime2) &&
                    /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test($scope.post.hourminute);
            }

            if (isValid2) {
                $scope.post.caption = textarea.value;
                console.log(textarea.value);

                if ($scope.post.caption.length > 2000) {
                    vm.postScheduleVisible = false;
                    vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');
                    vm.errorMessage = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_OVER_LIMIT_ERROR');
                    notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                } else if ($scope.post.caption.indexOf('#') > -1 && $scope.post.caption.match(/#[\S]/g).length > INSTAGRAM_HASHTAGS_LIMIT) {
                    vm.postScheduleVisible = false;
                    vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');
                    vm.errorMessage = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_OVER_LIMIT_ERROR');
                    notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                } else {
                    vm.sending = true;
                    vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_SENDING');

                    // Init delete time
                    if (vm.deleteScheduleVisible === true) {
                        var deleteTime = datetime2.clone();
                        deleteTime.add(String(vm.deleteAfter).substr(0, 2), 'hours');
                        deleteTime.add(String(vm.deleteAfter).substr(3, 2), 'minutes');
                        deleteTimeUnix = deleteTime.unix();
                    } else {
                        deleteTimeUnix = null;
                    }

                    console.log($scope.mediaType);
                    console.log(MEDIA_TYPE);

                    if ($scope.mediaType === MEDIA_TYPE.pinterestPost) {
                        console.log('Pinterest post');
                        userService.postPinterestMedia(datetime2.unix(), deleteTimeUnix, $scope.post.caption, vm.pinterestBoard.id, $scope.fileType, $scope.localMediaUrl, $scope.thumbnailUrl, vm.userInfo.accessToken).then(function (result) {
                            vm.close(result);
                        }, function (error) {
                            if (error.error === 100) {
                                authenticationService.logout();
                            } else {
                                vm.sending = false;
                                vm.errorMessage = error.message;
                                notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                                vm.cancel();
                            }
                        });
                    } else if ($scope.mediaType != undefined) {
                        console.log('Instagram post or story');
                        userService.postMedia(datetime2.unix(), deleteTimeUnix, $scope.post.caption, vm.account.id, $scope.fileType, $scope.mediaType, $scope.localMediaUrl, $scope.thumbnailUrl, vm.userInfo.accessToken, $scope.media.id).then(function (result) {
                            vm.close(result);
                        }, function (error) {
                            if (error.error === 100) {
                                authenticationService.logout();
                            } else {
                                vm.sending = false;
                                vm.errorMessage = error.message;
                                notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                                vm.cancel();
                            }
                        });
                    }
                }
            } else {
                vm.warningMessage = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_DATETIME_WARNING');
                notificationService.simpleNotify({message: vm.warningMessage, classes: 'alert-danger'});
            }
        }

        function updatePost(immediately) {
            if (vm.sending) return;
            var dateTime,
                isValid,
                deleteTimeUnix;

            if (immediately) {
                dateTime = moment();
                isValid = true;
            } else {
                var now = moment();
                dateTime = moment(String($scope.post.publishDate) + ' ' + $scope.post.hourminute, 'D/M/YYYY HH:mm');
                isValid = now.isBefore(dateTime) &&
                    /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test($scope.post.hourminute);
            }

            if (isValid) {
                $scope.post.caption = textarea.value;
                if ($scope.post.caption.length > 2000) {
                    vm.postScheduleVisible = false;
                    vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');
                    vm.errorMessage = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_OVER_LIMIT_ERROR');
                    notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                } else if ($scope.post.caption.indexOf('#') > -1 && $scope.post.caption.match(/#[\S]/g).length > INSTAGRAM_HASHTAGS_LIMIT) {
                    vm.postScheduleVisible = false;
                    vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_ENQUEUE_BUTTON');
                    vm.errorMessage = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_OVER_LIMIT_ERROR');
                    notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                } else {
                    vm.sending = true;
                    vm.enqueueButtonText = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_SENDING');

                    // Configure delete time
                    if (vm.deleteScheduleVisible === true) {
                        var deleteTime = dateTime.clone();
                        deleteTime.add(String(vm.deleteAfter).substr(0, 2), 'hours');
                        deleteTime.add(String(vm.deleteAfter).substr(3, 2), 'minutes');
                        deleteTimeUnix = deleteTime.unix();
                    } else {
                        deleteTimeUnix = null;
                    }

                    if ($scope.mediaType === MEDIA_TYPE.instagramPost) {
                        console.log('Update Instagram post');
                        userService.updatePost(dateTime.unix(), deleteTimeUnix, $scope.post.caption, $scope.media.id, vm.account.id, vm.userInfo.accessToken)
                            .then(function (result) {
                                vm.close(result);
                            }, function (error) {
                                if (error.error === 100) {
                                    authenticationService.logout();
                                } else {
                                    vm.sending = false;
                                    vm.errorMessage = error.message;
                                    notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                                    vm.cancel();
                                }
                            });
                    } else if ($scope.mediaType === MEDIA_TYPE.pinterestPost) {
                        console.log('Update Pinterest post');
                        userService.updatePostPinterest(dateTime.unix(), deleteTimeUnix, $scope.post.caption, $scope.media.id, vm.pinterestBoard.id, vm.account.id, vm.userInfo.accessToken)
                            .then(function (result) {
                                vm.close(result);
                            }, function (error) {
                                if (error.error === 100) {
                                    authenticationService.logout();
                                } else {
                                    vm.sending = false;
                                    vm.errorMessage = error.message;
                                    notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
                                    vm.cancel();
                                }
                            });
                    }
                }
            } else {
                vm.warningMessage = $filter('translate')('DASH_ACCOUNT_POST_MEDIA_DATETIME_WARNING');
                notificationService.simpleNotify({message: vm.warningMessage, classes: 'alert-danger'});
            }
        }

        function send(immediately) {
            if ($scope.editingPost === true) {
                updatePost(immediately);
            } else if ($scope.editingPost === false) {
                sendPost(immediately);
            }
        }

        //function tag(e) {
        //    var offset = $('.new-post-media').offset(),
        //        width = Math.round($('.new-post-media').width()),
        //        height = Math.round($('.new-post-media').height()),
        //        x = (e.pageX - Math.floor(offset.left)) / width,
        //        y_height = (e.pageY - offset.top) / height,
        //        y_width = (e.pageY - offset.top) / width;
        //
        //    ngDialog.openConfirm({
        //        template: 'views/common/tag-new.html',
        //        className: 'ngdialog-theme-plain',
        //        showClose: false,
        //        closeByDocument: true,
        //        closeByEscape: true,
        //        scope: $scope
        //    }).then(function (value) {
        //        if (value !== '#remove') {
        //            taggdData.push({ x: x,  y: y_height,  text: value, attributes: { y: y_width } });
        //            taggd.setData(taggdData);
        //        } else {
        //            taggdData = [];
        //            taggd.clear();
        //        }
        //
        //    }, function (reason) {
        //
        //    });
        //}

        //function refreshPeople(q) {
        //    if (!q) return;
        //    instagramService.getUsers(q)
        //        .then(function (result) {
        //            $scope.people = result.data;
        //        }, function (error) {
        //            console.log(error);
        //            //vm.errorMessage = error.message;
        //            //notificationService.simpleNotify({message: vm.errorMessage, classes: 'alert-danger'});
        //        });
        //};
    }

})();
