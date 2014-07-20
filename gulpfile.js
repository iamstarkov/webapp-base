'use strict';
var gulp = require('gulp');
var shell = require('shelljs');
var pff = require('pff');
var git = require('gift');
var repo = git('./');

/**
 * LINTING
 *
 * gulp lint -> npm run lint (prepush githook via husky)
 * gulp partialLint -> npm run partialLint (precommit githook via husky)
 */

var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var csslint = require('gulp-csslint');
var csscomb = require('gulp-csscomb');

var files = {
  js: ['*.js', 'js/**/*.js'],
  css: ['css/**/*.css']
};

gulp.task('lint', function() {
  gulp.src(files.js)
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

  gulp.src(files.css)
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task('partialLint', function(done) {
  var npmBin = './node_modules/.bin';

  repo.status(function(err, status) {
    if (err) throw err;

    var stagedFiles = (function(statusFiles_) {
      var stagedFiles = Object.keys(statusFiles_).filter(function(filename) {
        return statusFiles_[filename].staged;
      });

      var isJS = function(file) { return file.slice(-3) === '.js' ; };
      var isCSS = function(file) { return file.slice(-4) === '.css' ; };

      return {
        js: stagedFiles.filter(isJS).join(' '),
        css: stagedFiles.filter(isCSS).join(' ')
      };
    })(status.files);

    [
      { name: 'jscs',    files: 'js' },
      { name: 'jshint',  files: 'js' },
      { name: 'csslint', files: 'css' },
      { name: 'csscomb', files: 'css', flags: '--lint --verbose --config ./CSScomb.json' }
    ].forEach(function(linter) {
      var files = stagedFiles[linter.files];
      var flags = linter.flags || '';

      if (files.length > 0) {
        if (shell.exec(pff('%s/%s %s %s', npmBin, linter.name, flags,  files)).code !== 0) {
          shell.exit(1);
          done();
        }
      }
    });
  });
});

gulp.task('csscomb', function() {
  return gulp.src(files.css)
    .pipe(csscomb('./CSScomb.json'))
    .pipe(gulp.dest('./css/'));
});

gulp.task('test', ['lint']);
gulp.task('partialTest', ['partialLint']);

/**
 * Versioning
 *
 * 1. Bump version with compulsory choice from major, minor and patch (default)
 * 2. NEXT TIME: Update changelog with optional manual editing
 * 3. Version update commit + tagging
 * 4. Optional push to remote repo
 */

var bump = require('gulp-bump');
var inquirer = require('inquirer');

gulp.task('version', function(done) {
  var getVersion = function() { return require('./package.json').version; };
  var questions = [
    {
      type: 'list',
      name: 'versionType',
      message: 'What version type do you need?',
      choices: [ 'Major', 'Minor', 'Patch' ],
      default: 'Patch',
      filter: function(val) { return val.toLowerCase(); }
    },
    {
      type: 'confirm',
      name: 'toBePushed',
      message: 'Is it for pushing to remote repository?',
      default: true
    }
  ];

  inquirer.prompt(questions, function(answers) {
    gulp.src('./package.json')
      .pipe(bump({ type: answers.versionType }))
      .pipe(gulp.dest('./'));

    repo.add('./package.json', function(err) {
      if (err) throw err;

      repo.commit(pff('Release version v%s', getVersion()), function(err) {
        if (err) throw err;

        /*jshint camelcase: false */
        repo.create_tag(pff('v%s', getVersion()), function(err) {
          if (err) throw err;

          if (answers.toBePushed) {
            repo.remote_push('origin', 'master', function(err) {
              if (err) throw err;

              console.log(pff('Version updated to v%s', getVersion()));
              done();
            });
          } else {
            done();
          }
        });
        /*jshint camelcase: true */
      });
    });
  });
});
