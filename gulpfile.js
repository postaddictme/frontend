var gulp = require('gulp');
var $ = require('gulp-load-plugins')({lazy: true});
var args = require('yargs').argv;
var _ = require('lodash');
var del = require('del');
var path = require('path');
var config = require('./gulp.config.js')();
var browserSync = require('browser-sync');

var port = process.env.PORT || config.defaultPort;
var colors = $.util.colors;

/* NEW GULP TASKS AFTER REFACTORING */

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * Check js code quality and styles
 * @return {Stream}
 */
gulp.task('vet', function () {
    log('Analyzing source with JSHint and JSCS');
    var src = [].concat(config.js, '!' + config.jsVendor);
    return gulp
        .src(src)
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}));
});

/**
 * Copy styles to temp folder
 * @return {Stream}
 */
gulp.task('styles', ['clean-styles'], function () {
    log('Copying styles');

    return gulp
        .src(config.css)
        .pipe($.plumber()) // exit gracefully if something fails after this
        .pipe(gulp.dest(config.temp + 'css'));
});

gulp.task('clean-styles', function (done) {
    var files = config.temp + 'css/**/*.*';
    clean(files, done);
});

/**
 * Copy fonts
 * @return {Stream}
 */
gulp.task('fonts', ['clean-fonts'], function () {
    log('Copying fonts');

    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'));
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-fonts', function(done) {
    var files = config.build + 'fonts/**/*.*';
    clean(files, done);
});

/**
 * Compress and copy images to build folder
 * @return {Stream}
 */
gulp.task('images', ['clean-images'], function () {
    log('Compressing and copying images');

    return gulp
        .src(config.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.build + 'images'));
});

/**
 * Copy images of some css files to styles folder
 * Particularly jquery-ui plugin's images
 */
gulp.task('images-all', ['images'], function () {
    log('Copying styles assets to styles folder');

    return gulp
        .src(config.imagesFromPlugins)
        .pipe(gulp.dest(config.build + 'styles/images'));
});

gulp.task('clean-images', function (done) {
    var files = config.build + 'images/**/*.*';
    clean(files, done);
});

/**
 * Copy languages to build folder
 * @return {Stream}
 */
gulp.task('languages', ['clean-languages'], function () {
    log('Copying languages to build folder');

    return gulp
        .src(config.client + 'languages/**/*.json')
        .pipe(gulp.dest(config.build + 'languages'));
});

gulp.task('clean-languages', function () {
    var files = config.build + 'languages/**/*.*';
    clean(files);
});

/**
 * Create $templateCache from the html templates
 * @return {Stream}
 */
gulp.task('templatecache', ['clean-code'], function () {
    log('Creating an AngularJS $templateCache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
});

/**
 * Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function (done) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + 'js/**/*.js',
        config.build + '**/*.html'
    );
    clean(files, done);
});

/**
 * Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function (done) {
    var delconfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + colors.blue(delconfig));
    del(delconfig).then(function () {
        done();
    });
});

/**
 * Wire-up the bower dependencies
 * @return {Stream}
 */
gulp.task('wiredep', function () {
    log('Wiring the bower dependencies into the html');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepOptions();

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe(inject(config.js, '', config.jsOrder))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
    log('Wire up css into the html, after files are ready');

    return gulp
        .src(config.index)
        .pipe(inject(config.tempCss))
        .pipe(gulp.dest(config.client));
});


/**
 * Optimize all files, move to a build folder,
 * and inject them into the new index.html
 * @return {Stream}
 */
gulp.task('optimize', ['inject'], function () {
    log('Optimizing the js, css, and html');

    // Filters are named for the gulp-useref path
    var templateCache = config.temp + config.templateCache.file,
        cssFilter = $.filter('**/*.css', {restore: true}),
        jsLibFilter = $.filter('**/' + config.optimized.lib, {restore: true}),
        jsAppFilter = $.filter('**/' + config.optimized.app, {restore: true}),
        notIndexFilter = $.filter(['**/*', '!**/index.html'], {restore: true});

    return gulp
        .src(config.index)
        .pipe($.plumber())
        // .pipe(inject(templateCache, 'templates'))
        .pipe($.inject(
            gulp.src(templateCache, { read: false }),
            { starttag: '<!-- inject:templates:js -->' }
        ))
        .pipe($.useref({searchPath: './'}))
        // Get the css
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore)
        // Get the custom javascript
        .pipe(jsAppFilter)
        .pipe($.ngAnnotate({add: true}))
        .pipe($.uglify())
        .pipe(jsAppFilter.restore)
        // Get the vendor javascript
        .pipe(jsLibFilter)
        .pipe($.uglify())
        .pipe(jsLibFilter.restore)
        // Take inventory of the file names for future rev numbers
        .pipe(notIndexFilter)
        .pipe($.rev())
        .pipe(notIndexFilter.restore)
        // Replace the file names in the html with rev numbers
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build));
});


/**
 * Build everything
 * This is separate so we can run tests on
 * optimize before handling image or fonts
 */
gulp.task('build', ['optimize', 'images-all', 'fonts', 'languages'], function () {
    log('Building everything');

    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Running `gulp serve-build`'
    };

    del(config.temp);
    log(msg);
    notify(msg);
});

/**
 * Serve the dev environment
 */
gulp.task('serve-dev', ['inject'], function () {
    serve(true /* isDev */);
});

/**
 * Serve the build environment
 */
gulp.task('serve-build', ['build'], function () {
    serve(false /* isDev */);
});

/////////

function serve(isDev) {
    var options = getNodeOptions(isDev);

    return $.nodemon(options)
        .on('restart', function (ev) {
            log('*** nodemon restarted');
            log('files changed:\n' + ev);
            setTimeout(function () {
                browserSync.notify('reloading now ...');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay)
        })
        .on('start', function () {
            log('*** nodemon started');
            startBrowserSync(isDev);
        })
        .on('crash', function () {
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function () {
            log('*** nodemon exited cleanly');
        })
}

function getNodeOptions(isDev) {
    return {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        }
    }
}

function startBrowserSync(isDev) {
    log('Starting BrowserSync on port: ' + port);

    // If build: watches the files, builds, and restarts browser-sync.
    // If dev: watches less, compiles it to css, browser-sync handles reload
    if (isDev) {
        gulp.watch(config.css, ['styles'])
            .on('change', changeEvent);
    } else {
        gulp.watch([config.css, config.js, config.html], ['browserSyncReload'])
            .on('change', changeEvent);
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.css,
            config.temp + '**/*.css'
        ] : [],
        browser: 'google-chrome',
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0 //1000
    };

    browserSync(options);
}

/**
 * Optimize the code and re-load browserSync
 */
gulp.task('browserSyncReload', ['optimize'], browserSync.reload);

/**
 * When files change, log it
 * @param  {Object} event - event that fired
 */
function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function clean(path, done) {
    log('Cleaning: ' + colors.blue(path));

    del(path).then(function () {
        done();
    });
}

function inject(src, label, order) {
    var options = {read: false};

    if (label) {
        options.name = 'inject:' + label;
    }

    return $.inject(orderSrc(src, options, order));
}

function orderSrc(src, options, order) {
    return gulp
        .src(src, options)
        .pipe($.if(order, $.order(order)));
}

function log(msg) {
    if(typeof(msg) === 'object') {
        for(var item in msg) {
            if(msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

/**
 * Show OS level notification using node-notifier
 */
function notify(options) {
    var notifier = require('node-notifier');
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: path.join(__dirname, 'gulp.png'),
        icon: path.join(__dirname, 'gulp.png')
    };
    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}
