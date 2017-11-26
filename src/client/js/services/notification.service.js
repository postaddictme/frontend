/**
 * Created by yelnar on 13/07/15.
 */

(function () {

    'use strict';

    angular
        .module('postaddict')
        .factory('notificationService', notificationService);

    notificationService.$inject = ['notify'];

    /* @ngInject */
    function notificationService(notify) {

        return {
            simpleNotify: simpleNotify
        };

        function simpleNotify(n) {
            return notify({
                message: n.message,
                classes: n.classes,
                templateUrl: 'views/common/notify.html',
                position: 'right',
                duration: n.duration || 3000
            });
        }
    }
})();
