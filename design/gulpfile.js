var gulp = require('gulp');
var inject = require('gulp-inject');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var concatCss = require('gulp-concat-css');
var sh = require('shelljs');

var paths = {
    sass: ['./scss/**/*.scss']
};
var paths = {
    sass: ['./scss/**/*.scss'],
    javascript: [
        './bower_components/ionic/js/ionic.bundle.min.js',
        './bower_components/moment/moment.js',
        './bower_components/angular-messages/angular-messages.js',
        './bower_components/angular-resource/angular-resource.js',
        './bower_components/jquery/dist/jquery.js',
        './www/lib/socket.io.js',
        './bower_components/lodash/dist/lodash.min.js',
        './www/app/chatt.route.js',
        './www/app/chatt.run.js',
        './www/app/chatt.config.js',
        './www/app/chatt.constant.js',
        './www/app/**/*.*.js'
    ],
    css: [
        './bower_components/ionic/css/ionic.css',
        './bower_components/angular-material/angular-material.css',
        './www/lib/material-design-icons.css',
        './www/lib/app.min.css',
        './www/css/*.css',
        './bower_components/bootstrap/dist/css/bootstrap.min.css',
        './bower_components/font-awesome/css/font-awesome.css',
        './www/lib/style.css'
    ]
};

gulp.task('default', ['scripts', 'sass', 'css']);

//gulp.task('index', function() {
//    return gulp.src('./www/index.html')
//            .pipe(inject(
//                    gulp.src(paths.javascript,
//                            {read: false}), {relative: true}))
//            .pipe(gulp.dest('./www'))
//            .pipe(inject(
//                    gulp.src(paths.css,
//                            {read: false}), {relative: true}))
//            .pipe(gulp.dest('./www'));
//});
gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
            .pipe(sass())
            .on('error', sass.logError)
            .pipe(gulp.dest('./www/css/'))
            .pipe(minifyCss({
                keepSpecialComments: 0
            }))
            .pipe(rename({extname: '.min.css'}))
            .pipe(gulp.dest('./www/css/'))
            .on('end', done);
});
gulp.task('css', function() {
    return gulp.src(paths.css)
            .pipe(concatCss("chat.bundle.css"))
            .pipe(gulp.dest('./www'));
});
gulp.task('scripts', function() {
    return gulp.src(paths.javascript)
            .pipe(concat('chat.bundle.js'))
            .pipe(gulp.dest('./www'));
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.javascript, ['css']);
    gulp.watch(paths.javascript, ['scripts']);
//    gulp.watch([
//     paths.javascript,
//     paths.css
//     ], ['index']);

});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
            .on('log', function(data) {
                gutil.log('bower', gutil.colors.cyan(data.id), data.message);
            });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
                '  ' + gutil.colors.red('Git is not installed.'),
                '\n  Git, the version control system, is required to download Ionic.',
                '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
                '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
                );
        process.exit(1);
    }
    done();
});
