'use strict';

/**
 * LINTING
 *
 * gulp lint -> npm run lint (prepush githook via husky)
 * gulp partialLint -> npm run partialLint (precommit githook via husky)
 */

var gulp = require('gulp');
var git = require('vinyl-git');
var filter = require('gulp-filter');
var args = require('yargs').boolean('p').alias('p', 'partial').argv;

var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var csslint = require('gulp-csslint');
var csscomb = require('gulp-csscomb');

var paths = {
  scripts: ['*.js', 'tasks/*.js', 'js/**/*.js'],
  styles: ['css/**/*.css']
};

gulp.task('lint', function() {
  var sources = function(src) {
    return !args.partial ? gulp.src(src) : git.staged().pipe(filter(src));
  };

  sources(paths.scripts)
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));

  sources(paths.styles)
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task('csscomb', function() {
  return gulp.src(paths.styles)
    .pipe(csscomb('.csscomb.json'))
    .pipe(gulp.dest('./css/'));
});
