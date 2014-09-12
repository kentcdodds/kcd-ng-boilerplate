var fs = require('fs');
var Hjson = require('hjson');
var _ = require('lodash-node');
var glob = require('glob');
var async = require('async');
var rimraf = require('rimraf');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

/*
 * available flags:
 * prod
 */
var argv = require('yargs').argv;

var config;
if (fs.existsSync('./build/user-config.local.hjson')) {
  config = Hjson.parse(fs.readFileSync('./build/user-config.local.hjson', 'utf8'));
}

var terminalHelper = require('./build/terminal-helper');

var getIndexData = require('./build/get-index-data');


var paths = {
  dev: 'app/',
  prod: '.tmp/prod/',
  myJS: [ './app/components/**/*.js' ],
  myCSS: [ './app/**/*.styl' ],
  myHtml: ['./app/**/*.html', '!index.html'],
  jade: [ './build/index.jade', 'gulpfile.js', './build/get-index-data.js', 'assets.dev.config.hjson' ]
};

var appFolder = argv.prod ? paths.prod : paths.dev;

if (config) {
  gulp.task('start', plugins.shell.task(_.union([
    terminalHelper.runInNewTerminal('cd ' + config.projectPath + ' && node server.js ' + appFolder)
  ], config.shell.start)));
}

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
    .pipe(gulp.dest('./app/'));
});

function jadeTask() {
  return gulp.src('./build/index.jade')
    .pipe(plugins.data(function(file, cb) {
      return getIndexData('./build/assets.config.hjson', {
        env: argv.prod ? 'prod' : 'dev',
        assetPrefix: './app'
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
  gulp.watch(paths.myJS, ['jshint']);
  gulp.watch(paths.myCSS, ['stylus']);
});

gulp.task('count', function(){
  gulp.src('./app/components/**/*.js')
    .pipe(plugins.sloc());
});

var buildTasks = ['jshint', 'stylus', 'jade'];

if (argv.prod) {
  buildTasks = [
    'jade',
    'imagemin'
  ];
}

gulp.task('build', buildTasks);


gulp.task('clean', function(done) {
  rimraf('./.tmp', done);
});

var prodBuild = {
  jade: jadeTask,
  js: function(done) {
    getIndexData('./build/assets.config.hjson', {
      env: 'prod',
      assetPrefix: './app'
    }, function(err, vendorFiles) {
      if (err) throw err;

      var vendorScripts = vendorFiles.scripts;
      console.log(vendorScripts);
      var html = plugins.filter('**/*.html');
      var stream = gulp.src(paths.myJS)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))

        // template cache html
        .pipe(plugins.addSrc(paths.myHtml))
        .pipe(html)
          .pipe(plugins.angularTemplatecache())
        .pipe(html.restore())

        .pipe(plugins.ngAnnotate())
        .pipe(plugins.addSrc(vendorScripts))
//        .pipe(plugins.print())
        .pipe(plugins.order([
          '**/components/**/*.*',
          '**/non_bower_components/**/*.*',
          '**/bower_components/**/*.*',
          '**/bower_components/angular/**/*.*',
          '**/bower_components/jquery/**/*.*'
        ]))
        .pipe(plugins.print())
        .pipe(plugins.concat('script.js'))
        .pipe(plugins.uglify())

        .pipe(gulp.dest(paths.prod));

      done();
    });
  },
  css: function() {
    return gulp.src(paths.myCSS)
      .pipe(plugins.stylus({
        use: [ require('nib')() ],
        import: [ 'nib' ],
        compress: true
      }))
      .pipe(plugins.concat('styles.css'))
      .pipe(gulp.dest(paths.prod));
  }
};

gulp.task('build:prod:js', prodBuild.js);
gulp.task('build:prod:css', prodBuild.css);
gulp.task('build:prod:jade', prodBuild.jade);

gulp.task('build:prod', ['clean'], function() {
  prodBuild.js();
  prodBuild.css();
  // HTML

  // Images

});

gulp.task('pass', function() {
  return gulp.src(paths.myHtml)
    .pipe(plugins.minifyHtml())
    .pipe(plugins.angularTemplatecache())
    .pipe(gulp.dest('./'));
});

gulp.task('t', function() {
  console.log(paths.myJS);
  return gulp.src(paths.myJS)
    .pipe(plugins.order([
      '**/AuthInterceptor*'
    ]))
    .pipe(plugins.print());
});