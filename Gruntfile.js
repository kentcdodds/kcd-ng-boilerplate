module.exports = function(grunt) {
  'use strict';

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);
  var _ = require('lodash-node');

  // personal stuff
  var userConfig = {
    kentcdodds: {
      projectPath: '~/Developer/parakeet-js',
      clock: 'https://docs.google.com/a/doddsfamily.us/spreadsheets/d/1YcIZTtj6C8nGNs7Z1HdmKD96eb34rlwb2ztUcyvDAzM/edit',
      gitClient: '/Applications/SourceTree.app',
      editorBin: 'wstorm'
    }
  };
  var user = process.env.USER;
  var config = userConfig[user];
  if (!config) {
    throw Error('The username ' + user + ' does not have any configuration. Edit this in the Gruntfile.js');
  }

  function echoCommand(command) {
    return 'echo "' + command.replace(/"/g, '\\"') + '" && ' + command;
  }

  function openNewTerminalTab() {
    return '-e \'tell application "Terminal" to activate\' -e \'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down\'';
  }

  function runInNewTerminal(command, inEnvironment) {
    if (inEnvironment) {
      command = 'cd ' + config.projectPath + ' && workon parakeet_env && ' + command;
    }
    return 'osascript ' + openNewTerminalTab() + ' -e \'tell application "Terminal" to do script "' + command.replace(/"/g, '\\"') + '" in front window\' && echo Running in another terminal instance!';
  }

  // Project configuration.
  var assets = require('./jade/Assets');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    aws: grunt.file.readJSON('s3.config.local.json'),
    config: {
      base: 'app',
      temp: '.tmp',
      copy: '<%= config.temp %>/copy',
      build: '<%= config.temp %>/build',
      prod: '<%= config.temp %>/prod'
    },

    // personal Stuff
    shell: {
      startHttpServer: {
        command: function(env) {
          if (config.projectPath) {
            var folder = env === 'prod' ? '/.tmp/prod' : '/app';
            return runInNewTerminal('cd ' + config.projectPath + ' && node server.js app/');
          } else {
            return 'echo ' + user + ' must setup a project path';
          }
        }
      },

      // Open programs
      openGitClient: {
        command: function() {
          if (config.hasOwnProperty('gitClient')) {
            if (config.gitClient) {
              return echoCommand('open ' + config.gitClient);
            }
          } else {
            return 'echo ' + user + ' must setup a gitClient';
          }
        }
      },
      openWebApp: {
        command: echoCommand('open http://localhost:8888')
      },
      openTrello: {
        command: echoCommand('open https://trello.com/b/t5bzG46H/parakeet-lock-portal')
      },
      openClock: {
        command: function(user) {
          if (config.clock) {
            return echoCommand('open ' + config.clock);
          } else {
            return 'echo ' + user + ' must setup their clock';
          }
        }
      },
      openEditor: {
        command: function(user) {
          if (config.editorBin && config.projectPath) {
            return echoCommand(config.editorBin + ' ' + config.projectPath);
          } else {
            return 'echo ' + user + ' must setup an editor and project path';
          }
        }
      }
    },

    // deploy
    clean: {
      prod: ['<%= config.temp %>/**/*']
    },
    copy: {
      prod: {
        files: [
          // copy some assets over
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: '<%= config.base %>/**/fonts/**',
            dest: '<%= config.prod %>/fonts'
          },
          {
            src: '<%= config.base %>/favicon.ico',
            dest: '<%= config.prod %>/favicon.ico'
          },
          // copy vendor assets over. Custom code comes over with ngAnnotate.
          {
            expand: true,
            cwd: '<%= config.base %>/',
            src: (function() {
              return assets.getVendorAssets().scripts.map(function(script) {
                return script.location.substring('app/'.length);
              });
            })(),
            dest: '<%= config.build %>/'
          }
        ]
      }
    },
    ngAnnotate: {
      prod: {
        expand: true,
        cwd: '<%= config.base %>/',
        src: ['**/*.js', '!**/bower_components/**', '!**/non_bower_components/**'],
        dest: '<%= config.build %>/'
      }
    },
    ngtemplates: {
      prod: {
        options: {
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          },
          module: 'pk.common',
          prefix: '/'
        },
        files: [{
          cwd: '<%= config.base %>/',
          src: ['**/*.html', '!**/bower_components/**', '!**/non_bower_components/**', '!index.html'],
          dest: '<%= config.build %>/templates.js'
        }]
      }
    },
    uglify: {
      prod: {
        files: {
          '<%= config.prod %>/js/scripts.min.js': _.union((function() {
            // switch the assets location to the build location
            return assets.getAssets().getScriptLocations().map(function(script) {
              return script.replace(/^app\//, '.tmp/build/');
            });
          })(), ['<%= config.build %>/templates.js'])
        }
      }
    },
    cssmin: {
      prod: {
        files: {
          '<%= config.prod %>/css/styles.min.css': assets.getAssets().getStyleLocations()
        }
      },
      bootstrapTheme: {
        files: {
          '<%= config.base %>/non_bower_components/bootstrap-theme/compressed/bootstrap-theme-compressed.css': [
            '!<%= config.base %>/non_bower_components/bootstrap-theme/css/bootstrap/bootstrap.css',
            '<%= config.base %>/non_bower_components/bootstrap-theme/css/bootstrap/bootstrap-overrides.css',
            '<%= config.base %>/non_bower_components/bootstrap-theme/css/compiled/**/*.css',
            '<%= config.base %>/non_bower_components/bootstrap-theme/css/lib/**/*.css'
          ]
        }
      }
    },
    imagemin: {
      prod: {
        files: [
          {
            expand: true,
            cwd: '<%= config.base %>/',
            src: ['**/*.{png,jpg,gif}', '!**/bootstrap-theme/**'],
            dest: '<%= config.prod %>/'
          },
          {
            expand: true,
            cwd: '<%= config.base %>/non_bower_components/bootstrap-theme/',
            src: ['img/**/*.{png,jpg,gif}'],
            dest: '<%= config.prod %>/'
          }
        ]
      }
    },
    jade: {
      local: {
        options: {
          data: function() {
            return require('./jade/getIndexData')('local');
          },
          pretty: true
        },
        files: {
          '<%= config.base %>/index.html': ['./jade/index.jade']
        }
      },
      prod: {
        options: {
          data: function() {
            return require('./jade/getIndexData')('prod');
          },
          pretty: false
        },
        files: {
          '<%= config.prod %>/index.html': ['./jade/index.jade']
        }
      }
    },

    s3: {
      options: {
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>',
        bucket: '<%= aws.bucket %>',
        access: 'public-read',
        region: '<%= aws.region %>',
        headers: {
          // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
          "Cache-Control": "max-age=630720000, public",
          "Expires": new Date(Date.now() + 63072000000).toUTCString()
        }
      },
      deploy: {
        // Files to be uploaded.
        options: {
          verify: true,
          gzip: true,
          'Content-Encoding': 'gzip'
        },
        sync: [
          {
            rel: '<%= config.prod %>',
            src: '<%= config.prod %>/**/*.*',
            dest: '/'
          }
        ]
      }

    },



    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: {
        src: [ '<%= config.base %>/components/**/*.js' ]
      }
    },
    stylus: {
      compile: {
        options: {
          linenos: true,
          import: [ 'nib' ]
        },
        files: {
          '<%= config.base %>/styles/styles.css': [
            '<%= config.base %>/components/pk.common/stylus/add-first.styl',
            '<%= config.base %>/components/pk.common/**/*.styl',
            '<%= config.base %>/components/pk.web/**/*.styl',
            'static/ngtemplates/**/*.styl'
          ]
        }
      }
    },
    watch: {
      stylus: {
        files: [ 'stylus/**/*', '<%= config.base %>/**/*.styl', 'Gruntfile.js' ],
        tasks: 'stylus'
      },
      jade: {
        files: [ 'Gruntfile.js', 'static/jade/**.*', 'static/ngtemplates/**/*' ],
        tasks: 'jade'
      }
    }
  });

  grunt.registerTask('start', [
    'shell:startHttpServer', 'shell:openGitClient',
    'shell:openWebApp', 'shell:openTrello',
    'shell:openClock', 'shell:openEditor'
  ]);

  grunt.registerTask('startServer:prod', ['shell:startHttpServer:prod']);

  grunt.registerTask('buildBootstrapTheme', ['cssmin:bootstrapTheme']);
  grunt.registerTask('nohint', ['buildBootstrapTheme', 'stylus', 'jade:local']);
  grunt.registerTask('build', ['jshint', 'nohint']);

  grunt.registerTask('build:prod', [
    'build',
    'clean:prod',
    'copy:prod',
    'ngAnnotate:prod',
    'ngtemplates:prod',
    'uglify:prod',
    'cssmin:prod',
    'jade:prod',
    'imagemin:prod'
  ]);

  grunt.registerTask('deploy', [
    'build:prod',
    's3:deploy'
  ]);

  // Default task(s).
  grunt.registerTask('default', 'build');

};