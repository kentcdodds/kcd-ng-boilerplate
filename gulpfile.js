var fs = require('fs');
var Hjson = require('hjson');
var _ = require('lodash-node');
var glob = require('glob');
var async = require('async');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

/*
 * available flags:
 * prod
 */
var argv = require('yargs').argv;

var config = Hjson.parse(fs.readFileSync('./build/user-config.local.hjson', 'utf8'));
var terminalHelper = require('./build/terminal-helper');

var getIndexData = require('./build/get-index-data');

var appFolder = argv.prod ? '.tmp/prod/' : 'app/';

var paths = {
  myJS: [ './app/**/*.js', '!bower_components/**', '!non_bower_components/**' ],
  myCSS: './app/**/*.styl',
  myHtml: './app/**/*.html',
  jade: [ './build/index.jade', 'gulpfile.js', './build/get-index-data.js', 'assets.dev.config.hjson' ]
};

gulp.task('start', plugins.shell.task(_.union([
  terminalHelper.runInNewTerminal('cd ' + config.projectPath + ' && node server.js ' + appFolder)
], config.shell.start)));

gulp.task('jshint', function() {
  return gulp.src(paths.myJS)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('stylus', function() {
  return gulp.src(paths.myCSS)
    .pipe(plugins.stylus({
      use: [ require('nib')() ],
      import: [ 'nib' ],
      linenos: true
    }))
    .pipe(plugins.concat('style.css'))
    .pipe(gulp.dest('./app/styles/'));
});

function jadeTask() {
  return gulp.src('./build/index.jade')
    .pipe(plugins.data(function(file, cb) {
      return getIndexData('./build/assets.dev.config.hjson', {
        onDev: !argv.prod,
        assetPrefix: appFolder
      }, function(err, indexData) {
        if (err) throw err;
        cb(indexData);
      });
    }))
    .pipe(plugins.jade({
      pretty: !argv.prod
    }))
    .pipe(gulp.dest(appFolder));
}

gulp.task('jade', jadeTask);

gulp.task('watch', function() {
  var watcher = require('chokidar').watch('./app/components/', {
    persistent: true,
    ignoreInitial: true
  });

  watcher.on('add', function(path) {
    console.log(path + ' added. Re-running jade');
    jadeTask();
  }).on('unlink', function(path) {
    console.log(path + ' removed. Re-running jade');
    jadeTask();
  });

  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.myJS, ['lint']);
  gulp.watch(paths.myCSS, ['stylus']);
});

gulp.task('count', function(){
  gulp.src('./app/components/**/*.js')
    .pipe(plugins.sloc());
});

gulp.task('build', ['jshint', 'stylus', 'jade']);


