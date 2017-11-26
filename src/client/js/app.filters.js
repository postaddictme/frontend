(function () {
    'use strict';

    angular
        .module('postaddict')
        .filter('trustUrl', trustUrl)
        .filter('replaceImgWithAlt', replaceImgWithAlt);

    trustUrl.$inject = ['$sce'];
    function trustUrl($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url);
        };
    }

    function replaceImgWithAlt() {
        return function (text, limit) {
            var changedString = String(text).replace(/<img.*?alt="(.*?)"[^\>]+>/g, '$1');
            console.log(changedString);
            return changedString;
        };
    }

})();
