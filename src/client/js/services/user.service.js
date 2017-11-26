(function () {

    'use strict';

    angular
        .module('postaddict')
        .factory('userService', userService);

    /* jshint -W101 */
    userService.$inject = ['$http', '$q', '$window', '$sce', 'Upload', 'API', 'MEDIA_TYPE'];

    /* @ngInject */
    function userService($http, $q, $window, $sce, Upload, API, MEDIA_TYPE) {
        var api = API.HOST;
        var PUBLIC_KEY = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkzqwZkLw47lVWM5mRKyCxFThLRX5Zgth8YLhE1TWSJGUZ3iGjmdTRP/1BK5wjL8hr/12daWNSpX8cMDQuZ7BBIRDAbaxwWfw808yxvvWdxT5OuWXlmHmly/OqFAdSXpNAT1wlF8Fph1Lw9Kz8xPfBTn73CpoqOV/0g9rDRw4cJQIDAQAB';

        return {
            getAccounts: getAccounts,
            getPinterestAccounts: getPinterestAccounts,
            getManagers: getManagers,
            addAccount: addAccount,
            addManager: addManager,
            deleteAccount: deleteAccount,
            deleteManager: deleteManager,
            checkUserPassword: checkUserPassword,
            changeAccountPassword: changeAccountPassword,
            getAccountById: getAccountById,
            getPinterestAccountById: getPinterestAccountById,
            getPinterestBoards: getPinterestBoards,
            getPinterestBoard: getPinterestBoard,
            getPinterestBoardMediaByPage: getPinterestBoardMediaByPage,
            getInstagramStoriesByPage: getInstagramStoriesByPage,
            getUserFutureMedia: getUserFutureMedia,
            cancelPost: cancelPost,
            cancelStory: cancelStory,
            cancelPostPinterest: cancelPostPinterest,
            deletePost: deletePost,
            changePassword: changePassword,
            changeLanguage: changeLanguage,
            uploadFromStorage: uploadFromStorage,
            uploadByUrl: uploadByUrl,
            uploadByUrlPinterest: uploadByUrlPinterest,
            postMedia: postMedia,
            postPinterestMedia: postPinterestMedia,
            getPinterestMediaById: getPinterestMediaById,
            getFuturePostMedia: getFuturePostMedia,
            updateUserFutureMedia: updateUserFutureMedia,
            updateInstagramStoriesByPage: updateInstagramStoriesByPage,
            editPost: editPost,
            updatePost: updatePost,
            updatePostPinterest: updatePostPinterest,
            getCountry: getCountry,
            pay: pay,
            subscribeEmail: subscribeEmail,
            changeSuggestStatus: changeSuggestStatus,
            getSuggestedMedia: getSuggestedMedia,
            rejectSuggestedMedia: rejectSuggestedMedia,
            getSuggestedMediaByPage: getSuggestedMediaByPage,
            isAllowedToBeSuggested: isAllowedToBeSuggested,
            uploadSuggestedPost: uploadSuggestedPost,
            suggestPost: suggestPost,
            detectLanguage: detectLanguage,
            usePromoCode: usePromoCode,
            getCurrentPromoCode: getCurrentPromoCode,
            getPartnerPrograms: getPartnerPrograms,
            // Temporal solution
            prolongForFree: prolongForFree
        };

        function getAccounts(companyId, accessToken) {
            return $http.get(api + 'account/get&accessToken=' + accessToken + '&companyId=' + companyId)
                .then(parseResult());
        }

        function getPinterestAccounts(accessToken) {
            return $http.get(api + 'pinterest-account/get&accessToken=' + accessToken)
                .then(parseResult());
        }

        function getManagers(accessToken, companyId) {
            return $http.get(api + 'user/get&accessToken=' + accessToken + '&companyId=' + companyId)
                .then(parseResult());
        }

        function addAccount(accessToken, username, password) {
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(PUBLIC_KEY);
            var encrypted = encrypt.encrypt(password);

            return $http.post(api + 'account/add&accessToken=' + accessToken, {
                    username: username,
                    password: encrypted
                })
                .then(parseResult());
        }

        function addManager(accessToken, email) {
            return $http.post(api + 'user/add-manager&accessToken=' + accessToken, {
                    email: email
                })
                .then(parseResult());
        }

        function deleteAccount(accessToken, id) {
            return $http.post(api + 'account/delete&accessToken=' + accessToken, {
                    id: id
                })
                .then(parseResult());
        }

        function deleteManager(accessToken, id) {
            return $http.post(api + 'user/delete&accessToken=' + accessToken, {
                    id: id
                })
                .then(parseResult());
        }

        function checkUserPassword(userPassword, accessToken) {
            return $http.post(api + 'user/check-password&accessToken=' + accessToken, {
                    userPassword: userPassword
                })
                .then(parseResult());
        }

        function changeAccountPassword(userPassword, accountPassword, accountId, accessToken) {
            var encrypt = new JSEncrypt();
            encrypt.setPublicKey(PUBLIC_KEY);
            var encrypted = encrypt.encrypt(accountPassword);

            return $http.post(api + 'account/change-password&accessToken=' + accessToken, {
                    userPassword: userPassword,
                    accountPassword: encrypted,
                    accountId: accountId
                })
                .then(parseResult());
        }

        function getAccountById(id, accessToken) {
            return $http.get(api + 'account/get&accessToken=' + accessToken + '&id=' + id)
                .then(parseResult(function onSuccess(result) {
                    var account = result.data.data;
                    account.activeUntilWord = moment(account.activeUntil).format('D MMMM YYYY');
                    return account;
                }));
        }

        function getPinterestAccountById(id, accessToken) {
            return $http.get(api + 'pinterest-account/get&accessToken=' + accessToken + '&id=' + id)
                .then(parseResult(function onSuccess(result) {
                    var account = result.data.data;
                    account.activeUntilWord = moment(account.activeUntil).format('D MMMM YYYY');
                    return account;
                }));
        }

        function getPinterestBoards(pinterestAccountId, accessToken) {
            return $http.get(api + 'pinterest-board/get&accessToken=' + accessToken + '&pinterestAccountId=' + pinterestAccountId)
                .then(parseResult());
        }

        function getPinterestBoard(pinterestBoardId, accessToken) {
            return $http.get(api + 'pinterest-board/get&accessToken=' + accessToken + '&id=' + pinterestBoardId)
                .then(parseResult());
        }

        function getPinterestBoardMediaByPage(pinterestBoardId, accessToken, page) {
            return $http.get(api + 'pinterest-media/get&accessToken=' + accessToken + '&pinterestBoardId=' + pinterestBoardId + '&page=' + page)
                .then(parseResult(function onSuccess(result) {
                    result.data.data.medias.forEach(function (entry) {
                        if (entry.caption) {
                            entry.caption = $window.atob(entry.caption);
                            entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                            entry.caption = $sce.trustAsHtml(twemoji.parse(entry.caption));
                        }
                        entry.localMediaUrl = $sce.trustAsResourceUrl(entry.localMediaUrl);
                        entry.thumbnailUrl = $sce.trustAsResourceUrl(entry.thumbnailUrl);
                    });
                    return result.data.data;
                }));
        }

        function getInstagramStoriesByPage(page, accountId, accessToken) {
            return $http.get(api + 'media/get&accessToken=' + accessToken + '&accountId=' + accountId + '&page=' + page + '&postType=story')
                .then(parseResult(function onSuccess(result) {
                    result.data.data.medias.forEach(function (entry) {
                        if (entry.caption) {
                            entry.caption = $window.atob(entry.caption);
                            entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                            entry.caption = $sce.trustAsHtml(twemoji.parse(entry.caption));
                        }
                        entry.localMediaUrl = $sce.trustAsResourceUrl(entry.localMediaUrl);
                        entry.thumbnailUrl = $sce.trustAsResourceUrl(entry.thumbnailUrl);
                    });
                    return result.data.data;
                }));
        }

        function getUserFutureMedia(page, accountId, accessToken) {
            return $http.get(api + 'media/get&accessToken=' + accessToken + '&accountId=' + accountId + '&page=' + page)
                .then(parseResult(function onSuccess(result) {
                    result.data.data.medias.forEach(function onSuccess(entry) {
                        if (entry.caption) {
                            entry.caption = $window.atob(entry.caption);
                            entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                            entry.caption = $sce.trustAsHtml(twemoji.parse(entry.caption));
                        }
                        entry.localMediaUrl = $sce.trustAsResourceUrl(entry.localMediaUrl);
                        entry.thumbnailUrl = $sce.trustAsResourceUrl(entry.thumbnailUrl);
                    });
                    return result.data.data;
                }));
        }

        function cancelPost(id, accessToken) {
            return $http.post(api + 'media/delete&accessToken=' + accessToken, {
                    id: id
                })
                .then(parseResult());
        }

        function cancelStory(id, accessToken) {
            return $http.post(api + 'media/delete&accessToken=' + accessToken, {
                    id: id,
                    postType: 'story'
                })
                .then(parseResult());
        }

        function cancelPostPinterest(id, accessToken) {
            return $http.post(api + 'pinterest-media/delete&accessToken=' + accessToken, {
                    id: id
                })
                .then(parseResult());
        }

        function deletePost(id, accountId, accessToken) {
            return $http.post(api + 'media/schedule-to-delete&accessToken=' + accessToken, {
                    id: id,
                    accountId: accountId
                })
                .then(parseResult());
        }

        function changePassword(currPassword, newPassword, accessToken) {
            return $http.post(api + 'user/change-password&accessToken=' + accessToken, {
                    currPassword: currPassword,
                    newPassword: newPassword
                })
                .then(parseResult());
        }

        function changeLanguage(language, accessToken) {
            return $http.post(api + 'user/change-language&accessToken=' + accessToken, {
                    language: language
                })
                .then(parseResult());
        }

        function uploadFromStorage(file, accountId, accessToken, mediaType) {
            var url;

            if (mediaType == MEDIA_TYPE.instagramStory) {
                url = api + 'media/upload&accountId=' + accountId + '&accessToken=' + accessToken + '&postType=story';
            } else if (mediaType == MEDIA_TYPE.instagramPost) {
                url = api + 'media/upload&accountId=' + accountId + '&accessToken=' + accessToken;
            } else if (mediaType == MEDIA_TYPE.pinterestPost) {
                url = api + 'pinterest-media/upload-photo&accessToken=' + accessToken;
            }

            return Upload.upload({
                url: url,
                method: 'POST',
                data: {file: file}
            });
        }

        function uploadByUrl(url, accountId, accessToken) {
            return $http.post(api + 'media/upload-by-url&accessToken=' + accessToken, {
                    mediaUrl: url,
                    accountId: accountId
                })
                .then(parseResult());
        }

        function uploadByUrlPinterest(url, accountId, accessToken) {
            return $http.post(api + 'pinterest-media/upload-by-url&accessToken=' + accessToken, {
                    mediaUrl: url,
                    accountId: accountId
                })
                .then(parseResult());
        }

        function postMedia(publishDate, deleteDate, caption, accountId, fileType, mediaType, localMediaUrl, thumbnailUrl, accessToken, suggestedMediaId) {
            var url = 'media/add&accessToken=' + accessToken;
            var params = {
                publishDate: publishDate,
                deleteDate: deleteDate,
                caption: caption,
                accountId: accountId,
                type: fileType,
                localMediaUrl: localMediaUrl,
                thumbnailUrl: thumbnailUrl
            };

            console.log(mediaType);

            if (mediaType === MEDIA_TYPE.instagramPost) {
                /** Add suggested media id if exists */
                if (suggestedMediaId != undefined) {
                    params.suggestedMediaId = suggestedMediaId;
                }
            } else if (mediaType === MEDIA_TYPE.instagramStory) {
                params.postType = 'story';
            }

            return $http.post(api + url, params)
                .then(parseResult());
        }

        function postPinterestMedia(publishDate, deleteDate, caption, pinterestBoardId, fileType, localMediaUrl, thumbnailUrl, accessToken) {
            var url = 'pinterest-media/add&accessToken=';
            var params = {
                publishDate: publishDate,
                deleteDate: deleteDate,
                caption: caption,
                pinterestBoardId: pinterestBoardId,
                type: fileType,
                localMediaUrl: localMediaUrl,
                thumbnailUrl: thumbnailUrl
            };

            return $http.post(api + url + accessToken, params)
                .then(parseResult());
        }

        function getPinterestMediaById(mediaId, accessToken) {
            return $http.get(api + 'pinterest-media/get&accessToken=' + accessToken + '&id=' + mediaId)
                .then(parseResult(function onSuccess(result) {
                    var entry = result.data.data;
                    if (entry.caption) {
                        entry.caption = $window.atob(entry.caption);
                        entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                        entry.caption = entry.caption.replace(/(?:\r\n|\r|\n)/g, '<br />');
                        entry.caption = twemoji.parse(entry.caption);
                    }
                    return entry;
                }));
        }

        function getFuturePostMedia(mediaId, accessToken) {
            return $http.get(api + 'media/get&accessToken=' + accessToken + '&id=' + mediaId)
                .then(parseResult(function onSuccess(result) {
                    var entry = result.data.data;

                    if (entry.caption) {
                        entry.caption = $window.atob(entry.caption);
                        entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                        entry.caption = entry.caption.replace(/(?:\r\n|\r|\n)/g, '<br />');
                        entry.caption = twemoji.parse(entry.caption);
                    }
                    return entry;
                }));
        }

        function updateUserFutureMedia(page, accountId, accessToken) {
            return $http.get(api + 'media/get&accessToken=' + accessToken + '&accountId=' + accountId + '&page=' + page, {ignoreLoadingBar: true})
                .then(parseResult(function onSuccess(result) {
                    result.data.data.medias.forEach(function (entry) {
                        if (entry.caption) {
                            entry.caption = $window.atob(entry.caption);
                            entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                            entry.caption = $sce.trustAsHtml(twemoji.parse(entry.caption));
                        }
                        entry.localMediaUrl = $sce.trustAsResourceUrl(entry.localMediaUrl);
                        entry.thumbnailUrl = $sce.trustAsResourceUrl(entry.thumbnailUrl);
                    });
                    return result.data.data;
                }));
        }

        function updateInstagramStoriesByPage(page, accountId, accessToken) {
            return $http.get(api + 'media/get&accessToken=' + accessToken + '&accountId=' + accountId + '&page=' + page + '&postType=story', {ignoreLoadingBar: true})
                .then(parseResult(function onSuccess(result) {
                    result.data.data.medias.forEach(function onSuccess(entry) {
                        if (entry.caption) {
                            entry.caption = $window.atob(entry.caption);
                            entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                            entry.caption = $sce.trustAsHtml(twemoji.parse(entry.caption));
                        }
                        entry.localMediaUrl = $sce.trustAsResourceUrl(entry.localMediaUrl);
                        entry.thumbnailUrl = $sce.trustAsResourceUrl(entry.thumbnailUrl);
                    });
                    return result.data.data;
                }));
        }

        function editPost(mediaId, accessToken) {
            return $http.get(api + 'media/update&accessToken=' + accessToken + '&id=' + mediaId)
                .then(parseResult());
        }

        function updatePost(publishDate, deleteDate, caption, mediaId, accountId, accessToken) {
            return $http.post(api + 'media/update&accessToken=' + accessToken, {
                    caption: caption,
                    publishDate: publishDate,
                    deleteDate: deleteDate,
                    id: mediaId,
                    accountId: accountId
                })
                .then(parseResult());
        }

        function updatePostPinterest(publishDate, deleteDate, caption, mediaId, pinterestBoardId, accountId, accessToken) {
            return $http.post(api + 'pinterest-media/update&accessToken=' + accessToken, {
                    caption: caption,
                    publishDate: publishDate,
                    deleteDate: deleteDate,
                    id: mediaId,
                    pinterestBoardId: pinterestBoardId,
                    accountId: accountId
                })
                .then(parseResult());
        }

        function getCountry(language) {
            return $http.post(api + 'country/get&language=' + language)
                .then(parseResult());
        }

        function pay(method, duration, accountId, accessToken) {
            $window.location.href = api + method + '/get-payment-url&accessToken=' + accessToken +
                '&accountId=' + accountId + '&duration=' + duration;
        }

        function subscribeEmail(subscriptionType, isActive, accessToken) {
            return $http.post(api + 'email-subscription/change&accessToken=' + accessToken, {
                    type: subscriptionType,
                    isActive: isActive
                })
                .then(parseResult());


        }

        function changeSuggestStatus(suggestStatus, id, accessToken) {
            return $http.post(api + 'account/change-suggest-status&accessToken=' + accessToken, {
                    id: id,
                    suggestStatus: suggestStatus
                })
                .then(parseResult());
        }

        function getSuggestedMedia(mediaId, accessToken) {
            return $http.get(api + 'suggested-media/get&accessToken=' + accessToken + '&id=' + mediaId)
                .then(parseResult(function onSuccess(result) {
                    var entry = result.data.data;
                    if (entry.caption) {
                        entry.caption = $window.atob(entry.caption);
                        entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                        entry.caption = entry.caption.replace(/(?:\r\n|\r|\n)/g, '<br />');
                        entry.caption = twemoji.parse(entry.caption);
                    }
                    return entry;
                }));
        }

        function rejectSuggestedMedia(id, accessToken) {
            return $http.post(api + 'suggested-media/change-status&accessToken=' + accessToken, {
                    id: id,
                    status: 4
                })
                .then(parseResult());
        }

        function getSuggestedMediaByPage(page, instagramId, accessToken) {
            return $http.get(api + 'suggested-media/get&accessToken=' + accessToken + '&instagramId=' + instagramId + '&page=' + page)
                .then(parseResult(function onSuccess(result) {
                    result.data.data.medias.forEach(function (entry) {
                        if (entry.caption) {
                            entry.caption = $window.atob(entry.caption);
                            entry.caption = decodeURIComponent(entry.caption.replace(/\+/g, ' '));
                            entry.caption = $sce.trustAsHtml(twemoji.parse(entry.caption));
                        }
                        entry.localMediaUrl = $sce.trustAsResourceUrl(entry.localMediaUrl);
                        entry.thumbnailUrl = $sce.trustAsResourceUrl(entry.thumbnailUrl);
                    });
                    return result.data.data;
                }));
        }

        function isAllowedToBeSuggested(username) {
            return $http.get(api + 'suggested-media/check-account&username=' + username)
                .then(function (result) {
                    return result.data;
                });
        }

        function uploadSuggestedPost(file, instagramId) {
            return Upload.upload({
                    url: api + 'suggested-media/upload&instagramId=' + instagramId,
                    method: 'POST',
                    data: {file: file}
                });
        }

        function suggestPost(localMediaUrl, thumbnailUrl, caption, instagramId, type) {
            return $http.post(api + 'suggested-media/suggest', {
                    localMediaUrl: localMediaUrl,
                    thumbnailUrl: thumbnailUrl,
                    caption: caption,
                    instagramId: instagramId,
                    type: type
                })
                .then(parseResult());
        }

        function detectLanguage() {
            var lang = 'en_US';
            var userLang = $window.navigator.language || $window.navigator.userLanguage;

            if (userLang.substr(0, 2) == 'ru') lang = 'ru_RU';
            return lang;
        }

        function usePromoCode(code, accessToken) {
            return $http.post(api + 'promocode/apply&accessToken=' + accessToken, {
                    code: code
                })
                .then(parseResult(function onSuccess(result) {
                    var promoCode = result.data;
                    if (promoCode.data !== null) {
                        promoCode.data.expiredAtText = moment(promoCode.data.expiredAt).format('D MMMM YYYY');
                    }
                    return promoCode;
                }));
        }

        function getCurrentPromoCode(accessToken) {
            return $http.get(api + 'promocode/is-exist&accessToken=' + accessToken)
                .then(parseResult(function onSuccess(result) {
                    var currentPromoCode = result.data;
                    if (currentPromoCode.data !== null) {
                        currentPromoCode.data.expiredAtText = moment(currentPromoCode.data.expiredAt).format('D MMMM YYYY');
                    }
                    return currentPromoCode;
                }));
        }

        function getPartnerPrograms(accessToken) {
            return $http.get(api + 'promocode/affiliate&accessToken=' + accessToken)
                .then(parseResult());
        }

        function prolongForFree(accessToken,accountId) {
            return $http.post(api + 'paypal/make-free&accessToken=' + accessToken, {
                    accountId: accountId
                })
                .then(parseResult(function onSuccess(result) {
                    return result.data;
                }));
        }

        function parseResult(fn) {
            return function (result) {
                if (result.data.error === 0) {
                    if (fn) return fn(result);
                    return result.data.data;
                }
                else return $q.reject(result.data);
            };
        }
    }

})();
