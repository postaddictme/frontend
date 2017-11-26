/** TBD */
(function () {

    'use strict';

    angular
        .module('postaddict')
        .constant('INSTAGRAM_POST_STATUS', getInstagramPostStatuses())
        .constant('PINTEREST_POST_STATUS', getPinterestPostStatuses())
        .constant('API', getAPIData())
        .constant('NETWORK_TYPE', getNetworkTypes())
        .constant('MEDIA_TYPE', getMediaTypes())
        .constant('INSTAGRAM_HASHTAGS_LIMIT', 30)
        .constant('CARD_MEDIA_MAX_WIDTH', 236);

    function getInstagramPostStatuses() {
        return {
            SCHEDULED: 0,
            PUBLISHING: 1,
            PUBLISHED: 2,
            FAILED: 3,
            UNKNOWN: 4,
            DELETED: 5,
            DELETED_FROM_INSTAGRAM: 6,
            DELETING_FROM_INSTAGRAM: 7,
            SCHEDULED_TO_DELETE_FROM_INSTAGRAM: 8,
            FAILED_TO_DELETE_FROM_INSTAGRAM: 9,
            UNKNOWN_TO_DELETE_FROM_INSTAGRAM: 10
        };
    }

    function getPinterestPostStatuses() {
        return {
            SCHEDULED: 0,
            PUBLISHED: 2,
            FAILED: 3,
            UNKNOWN: 4,
            DELETED: 5,
            DELETED_FROM_PINTEREST: 6,
            SCHEDULED_TO_DELETE_FROM_PINTEREST: 8,
            FAILED_TO_DELETE_FROM_PINTEREST: 9
        };
    }

    function getAPIData() {

        var HOST = 'https://postaddict.me/InstagramPosting/web/index.php?r=';

        return {
            'HOST': HOST
        }
    }

    function getNetworkTypes() {
        return {
            Instagram: 0,
            Pinterest: 1
        };
    }

    function getMediaTypes() {
        return {
            instagramPost: 0,
            instagramStory: 1,
            pinterestPost: 2

        }
    }

})();
