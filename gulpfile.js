var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

/*
 * available flags:
 * prod
 */
var argv = require('yargs').argv;

var config = require('./build/user-config.local.json');
var terminalHelper = require('./build/terminalHelper');

var getIndexData = require('./build/get-index-data');

var appFolder = argv.prod ? '.tmp/prod/' : 'app/';

var myJS = ['./app/**/*.js', '!bower_components/**', '!non_bower_components/**'];

gulp.task('start', plugins.shell.task([
  terminalHelper.runInNewTerminal('cd ' + config.projectPath + ' && node server.js ' + appFolder),
  terminalHelper.echoCommand('open ' + config.gitClient),
  terminalHelper.echoCommand('open http://localhost:8888'),
  terminalHelper.echoCommand(config.editorBin + ' ' + config.projectPath)
]));

gulp.task('lint', function() {
  return gulp.src(myJS)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('stylus', function() {
  return gulp.src('./app/**/*.styl')
    .pipe(plugins.stylus({
      use: [ require('nib')() ],
      import: [ 'nib' ],
      linenos: true
    }))
    .pipe(plugins.concat('style.css'))
    .pipe(gulp.dest('./app/styles/'));
});

gulp.task('jade', function() {
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
});
