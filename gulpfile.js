// var debug = require('gulp-debug');

var fs = require('fs-extra');
var bpb = require('bpb');
var del = require('del');
var opn = require('opn');
var tsu = require('tsu');
var gulp = require('gulp');
var nopt = require('nopt');
var path = require('path');
var sass = require('gulp-sass');
var karma = require('karma');
var savoy = require('savoy');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var envify = require('envify');
var globby = require('globby');
var Revver = require('revver');
var gulpIf = require('gulp-if');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var bulkify = require('bulkify');
var nodemon = require('nodemon');
var through = require('through2');
var htmlmin = require('gulp-htmlmin');
var babelify = require('babelify');
var watchify = require('watchify');
var imagemin = require('gulp-imagemin');
var minifyCss = require('gulp-minify-css');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var concatStream = require('concat-stream');
var factorBundle = require('factor-bundle');
var autoprefixer = require('gulp-autoprefixer');
var combineStreams = require('stream-combiner2');
var istanbulCombine = require('istanbul-combine');

var revver = new Revver({
  interpolateCallback: function(revvedPath) {
    return '/' + revvedPath;
  }
});

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var IS_PRODUCTION = process.env.NODE_ENV === 'production';

var config = require('./config');
var testServer = require('./test/server');

var APP_URL = 'http://localhost:' + config.expressPort;

var ARGS = nopt({
  open: String
}, {
  // `gulp -o` is short shorthand for `gulp --open 'google chrome'`.
  o: ['--open', 'google chrome']
});

var BUILD_DIR = 'build';

var openInBrowser = function(url, callback) {
  gutil.log('Opened', gutil.colors.green(url));
  opn(url, {
    app: ARGS.open,
    wait: false
  }, callback);
};

//
// LINT
//

gulp.task('lint', function() {
  var files = ['lib/**/*.js', 'js/**/*.js', __filename];
  return gulp.src(files)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

//
// TEST
//

gulp.task('test', function(callback) {
  runSequence('test:clean', 'test:server', 'test:client',
    'test:combine-coverage', callback);
});

gulp.task('test:clean', function(callback) {
  del('coverage').then(function() {
    callback();
  });
});

var server = null;

gulp.task('test:setup', function(callback) {
  server = testServer.listen(config.testPort, callback);
});

gulp.task('test:teardown', function(callback) {
  server.close(callback);
  server = null;
});

gulp.task('test:server', function(callback) {
  runSequence('test:setup', 'test:server:run', function(err) {
    runSequence('test:teardown', function() {
      if (err) {
        throw err;
      }
      callback(err);
    });
  });
});

gulp.task('test:server:run', shell.task([
  'istanbul --dir=coverage/server -x=**/config/** cover -- tape test/lib/*.js'
]));

gulp.task('test:client', function(callback) {
  runSequence('test:setup', 'test:client:run', function(err) {
    runSequence('test:teardown', function() {
      if (err) {
        throw err;
      }
      callback(err);
    });
  });
});

gulp.task('test:client:run', function(callback) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    coverageReporter: {
      dir: 'coverage/client',
      subdir: '.',
      reporters: [
        { type: 'json', file: 'coverage.json' },
        { type: 'lcov' },
        { type: 'text' }
      ]
    }
  }, callback).start();
});

gulp.task('test:combine-coverage', function(callback) {
  istanbulCombine({
    dir: 'coverage',
    pattern: 'coverage/*/coverage.json',
    reporters: {
      json: { file: 'coverage.json' },
      lcov: {},
      text: {}
    }
  }, callback);
});

var openCoverage = function(taskName, coverageDir) {
  var coverageFile = coverageDir + '/lcov-report/index.html';
  return function(callback) {
    var openCoverageFile = function() {
      openInBrowser(coverageFile, callback);
    };
    if (fs.existsSync(coverageFile)) {
      return openCoverageFile();
    }
    runSequence(taskName, openCoverageFile);
  };
};

gulp.task('coverage', openCoverage('test', 'coverage'));

gulp.task('coverage:server', openCoverage('test:server', 'coverage/server'));

gulp.task('coverage:client', openCoverage('test:client', 'coverage/client'));

//
// BUILD, WATCH, SERVE
//

var JS_VENDOR_MODULES = [
  'firebase',
  'react',
  'react-dom'
];

var logBuild = function() {
  return through.obj(function(file, encoding, callback) {
    gutil.log('Built', gutil.colors.yellow(path.relative(process.cwd() + '/' + BUILD_DIR, file.path)));
    callback(null, file);
  });
};

var build = function(callback) {
  return combineStreams.obj(
    revver.rev(),
    gulp.dest(BUILD_DIR),
    logBuild(),
    tsu.flush(callback || function() {})
  );
};

var browserifyApp = function(options, callback) {
  options = options || {};
  var isWatch = options.watch;
  var entries = globby.sync([
    'js/views/*.js',
    'js/client.js'
  ]);
  fs.ensureDirSync(BUILD_DIR + '/js/views');
  var routeActionCreatorModule = 'js/action-creators/route-action-creator';
  var b = browserify({
    entries: entries,
    basedir: '.',
    debug: !IS_PRODUCTION
  }).external(JS_VENDOR_MODULES)
    .require('./' + routeActionCreatorModule + '.js', {
      expose: routeActionCreatorModule
    })
    // Compile JSX.
    .transform(babelify)
    // Allow requiring by a glob.
    .transform(bulkify)
    // Replace `process.browser` with `true`.
    .transform(bpb)
    // Replace `process.env.NODE_ENV` with the corresponding string.
    .transform(envify)
    .on('factor.pipeline', function(file, pipeline) {
      pipeline.get('pack').unshift(through.obj(function(row, encoding, callback) {
        // Assign an `id` so that we can require each `view` module when we
        // load it on demand eg. via `require('js/views/home')`.
        if (row.entry) {
          var basename = path.basename(row.file, '.js');
          if (basename !== 'client') {
            row.id = 'js/views/' + basename;
          }
        }
        callback(null, row);
      }));
    });
  var bundle = function() {
    // Factor out common modules in each files in `entries` into a common file.
    // .plugin(factorBundle, factorOpts);
    b.plugin(factorBundle, {
      outputs: savoy.map(entries, function(entry) {
        return concatStream(function(contents) {
          tsu.source(new gutil.File({
            path: entry,
            contents: contents
          }))
          .pipe(gulpIf(IS_PRODUCTION, uglify()))
          .pipe(build());
        });
      })
    }).bundle()
      .pipe(source('js/common.js'))
      .pipe(buffer())
      .pipe(through.obj(function(file, encoding, callback) {
        var viewHashes = revver.getHashes({ prefix: 'js/views/' });
        file.contents = new Buffer(file.contents.toString().replace(/window.__MANIFEST__/g, JSON.stringify(viewHashes)));
        callback(null, file);
      }))
      .pipe(gulpIf(IS_PRODUCTION, uglify()))
      .pipe(build(callback));
  };
  if (isWatch) {
    b = watchify(b);
    b.on('update', bundle);
  }
  bundle();
};

var serve = function(options) {
  options = options || {};
  var serverScript = 'server.js';
  options.script = serverScript;
  if (options.watch) {
    options.watch = [serverScript, BUILD_DIR + '/index.html'];
  }
  return function(callback) {
    var isInitial = true;
    nodemon(options)
      .on('start', function() {
        if (isInitial) {
          gutil.log('Started', gutil.colors.red(serverScript));
          isInitial = false;
          if (ARGS.open) {
            setTimeout(function() {
              openInBrowser(APP_URL, callback);
            }, 1000);
          }
        }
      })
      .on('restart', function() {
        gutil.log('Restarted', gutil.colors.red(serverScript));
      });
  };
};

gulp.task('build', function(callback) {
  gutil.log('Building to', gutil.colors.yellow(BUILD_DIR));
  runSequence(
    'build:clean',
    'build:images',
    'build:js:vendor',
    'build:js:app',
    'build:css',
    'build:locales',
    'build:manifest',
    'build:html',
    callback
  );
});

gulp.task('watch', function(callback) {
  runSequence(
    'build',
    'watch:images',
    'watch:js:app',
    'watch:css',
    'watch:locales',
    'watch:html',
    'watch:serve',
    callback
  );
});

gulp.task('build:clean', function(callback) {
  del(BUILD_DIR).then(function() {
    callback();
  });
});

gulp.task('build:images', function () {
  return gulp.src('images/*', { base: '.' })
    .pipe(gulpIf(IS_PRODUCTION, imagemin()))
    .pipe(build());
});

gulp.task('watch:images', function() {
  gulp.watch('images/*', function() {
    runSequence('build:images', 'build:css', 'build:locales', 'build:manifest', 'build:html');
  });
});

gulp.task('build:js:vendor', function() {
  return browserify()
    .transform(envify)
    .require(JS_VENDOR_MODULES)
    .bundle()
    .pipe(source('js/vendor.js'))
    .pipe(buffer())
    .pipe(gulpIf(IS_PRODUCTION, uglify()))
    .pipe(build());
});

gulp.task('build:js:app', function(callback) {
  browserifyApp({ watch: false }, callback);
});

gulp.task('watch:js:app', function() {
  browserifyApp({ watch: true }, function() {
    runSequence('build:manifest', 'build:html');
  });
});

gulp.task('build:css', function() {
  return gulp.src('css/index.scss', { base: '.' })
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.init({
      loadMaps: true
    })))
    .pipe(sass())
    .pipe(revver.interpolate())
    .pipe(concat('css/style.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpIf(IS_PRODUCTION, minifyCss({
      // Remove all comments, no exceptions.
      keepSpecialComments: 0
    })))
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.write()))
    .pipe(build());
});

gulp.task('watch:css', function() {
  gulp.watch('css/**/*.scss', function() {
    runSequence('build:css', 'build:locales', 'build:manifest', 'build:html');
  });
});

gulp.task('build:locales', function(callback) {
  var localeFiles = globby.sync('locales/*.json');
  savoy.each(localeFiles, function(callback, file) {
    var moduleName = 'locales/' + path.basename(file, '.json');
    browserify()
      .require(file, {
        expose: moduleName
      })
      .bundle()
      .on('end', callback)
      .pipe(source(moduleName + '.js'))
      .pipe(buffer())
      .pipe(revver.interpolate())
      .pipe(gulpIf(IS_PRODUCTION, uglify()))
      .pipe(build(callback));
  }, callback);
});

gulp.task('watch:locales', function() {
  gulp.watch('locales/*.json', function() {
    runSequence('build:locales', 'build:manifest', 'build:html');
  });
});

gulp.task('build:html', function() {
  return gulp.src('index.html')
    .pipe(revver.interpolate())
    .pipe(gulpIf(IS_PRODUCTION, htmlmin({
      collapseWhitespace: true
    })))
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(logBuild());
});

gulp.task('build:manifest', function() {
  var stream = revver.manifest();
  process.nextTick(function() {
    stream.end();
  });
  return stream
    .pipe(gulp.dest(BUILD_DIR))
    .pipe(logBuild());
});

gulp.task('watch:html', function() {
  gulp.watch('index.html', ['build:html']);
});

gulp.task('watch:serve', serve({ watch: true }));

gulp.task('serve', ['build'], serve({ watch: false }));

//
// CLEAN
//

gulp.task('clean', ['build:clean', 'test:clean']);

//
// DEFAULT
//

gulp.task('default', ['watch']);
