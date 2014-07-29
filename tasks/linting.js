'use strict';

/**
 * LINTING
 *
 * gulp lint -> npm run lint (prepush githook via husky)
 * gulp partialLint -> npm run partialLint (precommit githook via husky)
 */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var csslint = require('gulp-csslint');
var csscomb = require('gulp-csscomb');

var git = require('vinyl-git');
var filter = require('gulp-filter');
var lazypipe = require('lazypipe');

var paths = {
  js: ['*.js', 'tasks/*.js', 'js/**/*.js'],
  css: ['css/**/*.css']
};

var lintJs = lazypipe()
  .pipe(jscs)
  .pipe(jshint)
  .pipe(jshint.reporter, 'jshint-stylish');

var lintCss = lazypipe()
  .pipe(csslint)
  .pipe(csslint.reporter);

gulp.task('lint', function() {
  gulp.src(paths.js)
    .pipe(lintJs());
  gulp.src(paths.css)
    .pipe(lintCss());
});

gulp.task('partialLint', function() {
  git.staged().pipe(filter(paths.js))
    .pipe(lintJs());
  git.staged().pipe(filter(paths.css))
    .pipe(lintCss());
});

gulp.task('csscomb', function() {
  return gulp.src(paths.css)
    .pipe(csscomb('./CSScomb.json'))
    .pipe(gulp.dest('./css/'));
});
