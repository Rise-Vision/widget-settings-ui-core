/* jshint node: true */

(function () {
  'use strict';

  var gulp = require('gulp');
  var gutil = require('gulp-util');
  var connect = require('gulp-connect');
  var rename = require('gulp-rename');
  var concat = require('gulp-concat');
  var karma = require('gulp-karma');
  var bump = require('gulp-bump');
  var watch = require('gulp-watch');
  var path = require('path');
  var protractor = require('gulp-protractor').protractor;
  var webdriver_update = require('gulp-protractor').webdriver_update;
  var httpServer;
  var testFiles = [
      'components/jquery/dist/jquery.js',
      'components/q/q.js',
      'components/angular/angular.js',
      'components/angular-mocks/angular-mocks.js',
      'src/js/*.js',
      'src/js/*/*.js',
      'src/js/**/*.js',
      'src/js/**/**/*.js',
      'test/unit/fixtures/*.js',
      'test/unit/**/*spec.js'
    ];

  gulp.task('config', function() {
    var env = process.env.NODE_ENV || 'dev';
    gutil.log('Environment is', env);

    return gulp.src(['./src/js/config/' + env + '.js'])
      .pipe(rename('config.js'))
      .pipe(gulp.dest('./src/js/config'));
  });

  // Defined method of updating:
  // Semantic
  gulp.task('bump', function(){
    return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({type:'patch'}))
    .pipe(gulp.dest('./'));
  });

  gulp.task('unit:test-watch', function () {
      // Be sure to return the stream
      return gulp.src(testFiles).pipe(
        watch(function(files) {
          return files.pipe(karma({
            configFile: 'test/karma.conf.js',
            action: 'start'
          }))
          .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
          });
        }));
  });

  gulp.task('unit:test', function() {
  // Be sure to return the stream
    return gulp.src(testFiles)
      .pipe(karma({
        configFile: 'test/karma-jenkins.conf.js',
        action: 'run'
      }))
      .on('error', function(err) {
        // Make sure failed tests cause gulp to exit non-zero
        throw err;
      });
});

  gulp.task('e2e:server', ['build'], function() {
    httpServer = connect.server({
      root: './',
      port: 8098,
      livereload: false
    });
    return httpServer;
  });

  gulp.task('webdriver_update', webdriver_update);

  gulp.task('e2e:test', ['webdriver_update', 'e2e:server'], function () {
    return gulp.src(['./test/e2e/*.js'])
      .pipe(protractor({
          configFile: './test/protractor.conf.js',
          args: ['--baseUrl', 'http://127.0.0.1:8098/test/e2e/test-ng.html']
      }))
      .on('error', function (e) {
        console.log('Error:', e); throw e;
      })
      .on('end', function () {
        console.log('Test ending');
        connect.serverClose();
      });
  });

  gulp.task('concat', ['config'], function () {
    gulp.src(['./src/js/config/config.js', './src/js/*.js'])
    .pipe(concat(require(path.join(__dirname, 'package.json')).name + '.js'))
    .pipe(gulp.dest('./dist/'));
  });

  gulp.task('build', ['concat']);

  gulp.task('test', ['unit:test', 'e2e:test']);

  gulp.task('default', ['build']);

})();
