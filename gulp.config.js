module.exports = function() {

    var build = './build/';
    var client = './src/client/';
    var temp = './.tmp/';

    var bower = {
        json: require('./bower.json'),
        directory: './bower_components/',
        ignorePath: '../..'
    };

    var config = {

        /**
         * File paths
         */
        build: build,
        client: client,
        css: [
            client + 'css/vendor/taggd/taggd.css',
            client + 'css/vendor/twemoji-awesome/twemoji-awesome.css',
            client + 'css/textarea.css',
            client + 'css/style.css',
            client + 'css/mystyle.css'
        ],
        fonts: [
            bower.directory + 'fontawesome/fonts/**/*.*'
            //client + 'fonts/*.*'
        ],
        html: client + '**/*.html',
        htmltemplates: client + 'views/**/*.html',
        imagesFromPlugins: [
            // bower.directory + 'iCheck/skins/square/green.png',
            // bower.directory + 'iCheck/skins/square/green@2x.png'
            bower.directory + 'jquery-ui/themes/base/images/*.png'
        ],
        images: client + 'images/**/*.*',
        index: client + 'index.html',
        js: [
            client + 'js/**/*.module.js',
            client + 'js/**/*.js'
        ],
        jsOrder: [
            'helper-functions.js',
            '**/app.module.js',
            '**/*.module.js',
            '**/*.js'
        ],
        jsVendor: client + 'js/vendor/**/*.js',
        temp: temp,
        tempCss: [
            temp + 'css/taggd.css',
            temp + 'css/twemoji-awesome.css',
            temp + 'css/textarea.css',
            temp + 'css/style.css',
            temp + 'css/mystyle.css'
        ],

        /**
         * optimized files
         */
        optimized: {
            app: 'app.js',
            lib: 'lib.js'
        },

        /**
         * Node settings
         */
        nodeServer: './src/server/app.js',
        defaultPort: 7203,

        getWiredepOptions: getWiredepOptions,

        /**
         * Browser sync
         */
        browserReloadDelay: 1000,

        /**
         * template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'postaddict',
                root: 'views/',
                standAlone: false
            }
        },

        /**
         * Bower and NPM files
         */
        bower: bower,
        packages: [
            './package.json',
            './bower.json'
        ]
    };

    return config;

    //////////////

    function getWiredepOptions() {
        return {
            directory: bower.directory,
            bowerJson: bower.json,
            /* In case of CDN */
            // exclude: [
            //     '/jquery/',
            //     '/jquery-ui/',
            //     '/bootstrap/',
            //     '/twemoji/',
            //     '/fontawesome/'
            // ],
            ignorePath: bower.ignorePath
        }
    }
};
