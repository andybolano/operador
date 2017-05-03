var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglify = require('gulp-uglify');

var paths = {
  sass: ['./scss/**/*.scss'],
  controllers: ['./www/js/controllers/*.js'],
  directives: ['./www/js/directives/*.js'],
  services: ['./www/js/services/*.js'],
  config:['./www/js/config/*.js'],
  css: ['./www/css/*.css']
  
};

gulp.task('default', ['sass', 'controllers', 'directives', 'services']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('services', function() {
    return gulp.src(paths.services)
        .pipe(concat("services.js"))
        .pipe(gulp.dest("./www/js/"))
        .pipe(rename('services.min.js'))
        .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
        .pipe(gulp.dest("./www/js/"));
});

gulp.task('css', function() {
    return gulp.src(paths.css)
        .pipe(concat("css.css"))
        .pipe(gulp.dest("./www/css/"))
        .pipe(rename('css.min.css'))
        .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
        .pipe(gulp.dest("./www/css/"));
});

gulp.task('config', function() {
    return gulp.src(paths.config)
        .pipe(concat("config.js"))
        .pipe(gulp.dest("./www/js/"))
        .pipe(rename('config.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("./www/js/"));
});

gulp.task('controllers', function() {
    return gulp.src(paths.controllers)
        .pipe(concat("controllers.js"))
        .pipe(gulp.dest("./www/js/"))
        .pipe(rename('controllers.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("./www/js/"));
});

gulp.task('directives', function() {
    return gulp.src(paths.directives)
        .pipe(concat("directives.js"))
        .pipe(gulp.dest("./www/js/"))
        .pipe(rename('directives.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest("./www/js/"));
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.controllers, ['controllers']);
  gulp.watch(paths.directives, ['directives']);
  gulp.watch(paths.services, ['services']);
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