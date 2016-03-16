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
        './www/lib/ionic/js/ionic.bundle.min.js',
        './www/app/lib/*.js',
        './www/app/chatt.route.js',
        './www/app/chatt.run.js',
        './www/app/chatt.config.js',
        './www/app/chatt.constant.js',
        './www/app/**/*.*.js'
    ],
    css: [
        './www/lib/ionic/css/ionic.css',
//        './www/lib/style.css',
        './www/lib/lib/animate.css/animate.css',
        './www/lib/angular-material/angular-material.css',
        './www/lib/material-design-icons.css',
        './www/lib/app.min.css',
        './www/css/style.css',
        './www/lib/bootstrap/css/bootstrap.min.css'
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
            .pipe(concatCss("main.css"))
            .pipe(gulp.dest('./www'));
});
gulp.task('scripts', function() {
    return gulp.src(paths.javascript)
            .pipe(concat('main.js'))
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
