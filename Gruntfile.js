var _ = require('underscore')._,
    path = require('path'),

    DEFAULT_CONFIG = {
      COPY: {
        expand: true,
        cwd: 'src/html/',
        src: ['**/*.html'],
        dest: 'build/html/'
      },
      REPLACE: {
        options: {
          patterns: [{
            match: /\{% extends '/g,
            replacement: function (match) {
              return match + __dirname + '/build/html/';
            }
          },{
            match: /\{% include '/g,
            replacement: function (match) {
              return match + __dirname + '/build/html/';
            }
          }]
        },
        expand: true,
        cwd: 'build/html/',
        src: ['**/*.html'],
        dest: 'build/html/'
      },
      JSHINT: {
        options: {
          jshintrc: './.jshintrc'
        },
        expand: true,
        cwd: 'src/js/',
        // Lint everything but third party code.
        src: ['**/*.js', '!third-party/**/*.js']
      },
      CONCAT_IN_ORDER: {
        options: {
          extractRequired: function (filepath, filecontent) {
            var deps = this.getMatches(/\*\s*@depend\s\/(.*\.js)/g, filecontent);
            return deps.map(function (dep, i) {
              return path.join.apply(null, [__dirname, 'src', 'js', dep]);
            });
          },
          extractDeclared: function (filepath) {
            return [filepath];
          },
          onlyConcatRequiredFiles: true
        },
        expand: true,
        cwd: 'src/js/',
        src: [
          // Start with all .js files.
          '**/*.js',
          // Filter out lib and third-party files, which are meant to be
          // included via @depend.
          '!lib/**/*.js',
          '!third-party/**/*.js'
        ],
        dest: 'build/js/',
        ext: '.js'
      },
      UGLIFY: {
        expand: true,
        cwd: 'build/js/',
        src: ['**/*.js'],
        dest: 'build/js/',
        ext: '.js'
      },
      LESS: {
        options: {
          paths: ['src/css'],
          ieCompat: false
        },
        expand: true,
        cwd: 'src/css/',
        src: [
          // Start with all .less files.
          '**/*.less',
          // Filter out lib and third-party files, which are meant to be
          // included via @import.
          '!lib/**/*.less',
          '!third-party/**/*.less'
        ],
        dest: 'build/css/',
        ext: '.css'
      }
    },
    HEROKU_CONFIG = {
      REPLACE: {
        options: {
          patterns: [{
            match: /\{% extends '/g,
            replacement: function (match) {
              return match + '/app/build/html';
            }
          },{
            match: /\{% include '/g,
            replacement: function (match) {
              return match + '/app/build/html';
            }
          }]
        },
        expand: true,
        cwd: 'build/html/',
        src: ['**/*.html'],
        dest: 'build/html/'
      }
    },

    DEV_CONFIG = {
      COPY: DEFAULT_CONFIG.COPY,
      REPLACE: DEFAULT_CONFIG.REPLACE,
      JSHINT: DEFAULT_CONFIG.JSHINT,
      CONCAT_IN_ORDER: DEFAULT_CONFIG.CONCAT_IN_ORDER,
      LESS: DEFAULT_CONFIG.LESS
    },

    PROD_CONFIG = {
      COPY: DEFAULT_CONFIG.COPY,
      REPLACE: DEFAULT_CONFIG.REPLACE,
      JSHINT: DEFAULT_CONFIG.JSHINT,
      CONCAT_IN_ORDER: DEFAULT_CONFIG.CONCAT_IN_ORDER,
      LESS: (function () {
            var config = _.clone(DEFAULT_CONFIG.LESS);
            config.options = _.defaults({ yuicompress: true }, config.options);
            return config;
          })(),
      UGLIFY: DEFAULT_CONFIG.UGLIFY
    },

    DEFAULT_TASKS = {
      dev: ['copy', 'replace', 'jshint', 'concat_in_order', 'less'],
      prod: ['copy', 'replace', 'jshint', 'concat_in_order', 'uglify', 'less'],
      heroku: ['copy', 'replace', 'jshint', 'concat_in_order', 'uglify', 'less']
    };

function getTaskList (env, tasks) {
  return tasks.map(function (task) { return task + ':' + env; });
}

module.exports = function (grunt) {
  var env = grunt.option('env') || 'dev',
      defaultTasks = 
      (env ==='heroku' ? getTaskList(env, DEFAULT_TASKS[env]) :getTaskList(env, DEFAULT_TASKS[env]).concat('watch'));

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      dev: DEV_CONFIG.COPY,
      prod: PROD_CONFIG.COPY,
      heroku: PROD_CONFIG.COPY
    },

    replace: {
      dev: DEV_CONFIG.REPLACE,
      prod: PROD_CONFIG.REPLACE,
      heroku: HEROKU_CONFIG.REPLACE
    },

    jshint: {
      dev: DEV_CONFIG.JSHINT,
      prod: PROD_CONFIG.JSHINT,
      heroku: PROD_CONFIG.JSHINT
    },

    concat_in_order: {
      dev: DEV_CONFIG.CONCAT_IN_ORDER,
      prod: PROD_CONFIG.CONCAT_IN_ORDER,
      heroku: PROD_CONFIG.CONCAT_IN_ORDER
    },

    uglify: {
      prod: PROD_CONFIG.UGLIFY,
      heroku: PROD_CONFIG.UGLIFY
    },

    less: {
      dev: DEV_CONFIG.LESS,
      prod: PROD_CONFIG.LESS,
      heroku: PROD_CONFIG.LESS
    },

    // TODO: Use watch event to update `files` array on the fly, so we only
    // recompile files in the affected dependency subtrees. Hopefully less and
    // concat_in_order expose their dependency graphs for this purpose.
    watch: {
      html: {
        files: 'src/html/**/*.html',
        tasks: getTaskList(env, ['copy', 'replace'])
      },
      css: {
        files: 'src/css/**/*.less',
        tasks: getTaskList(env, ['less'])
      },
      js: {
        files: 'src/js/**/*.js',
        tasks: getTaskList(env, (function () {
              switch (env) {
                case 'dev':
                  return ['jshint', 'concat_in_order'];
                case 'prod':
                  return ['jshint', 'concat_in_order', 'uglify'];
                case 'heroku':
                  return ['jshint', 'concat_in_order', 'uglify'];
              }
            })())
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-concat-in-order');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', defaultTasks);
};
