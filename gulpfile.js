var fs = require('fs-extra');
var bpb = require('bpb');
var del = require('del');
var opn = require('opn');
var rev = require('gulp-rev');
var globby = require('globby');
var gulp = require('gulp');
var nopt = require('nopt');
var path = require('path');
var concatStream = require('concat-stream');
var sass = require('gulp-sass');
var karma = require('karma');
var savoy = require('savoy');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var envify = require('envify');
var gulpIf = require('gulp-if');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var bulkify = require('bulkify');
var through = require('through2');
var nodemon = require('gulp-nodemon');
var htmlmin = require('gulp-htmlmin');
var babelify = require('babelify');
var minifyCss = require('gulp-minify-css');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var factorVinylify = require('factor-vinylify');
var istanbulCombine = require('istanbul-combine');

var config = require('./config');
var testServer = require('./test/server');

// `process.env.NODE_ENV` defaults to `development`.
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Path to `karma.conf.js`.
var KARMA_CONF_FILE = __dirname + '/karma.conf.js';

// Directory to write our compiled JS and CSS.
var DIST_DIR = './dist';

// Path to JS files.
var JS_ALL_DIRS = [
  './lib',
  './js'
];
var JS_ALL_FILES = [
  './lib/**/*.js',
  './js/**/*.js'
];
var JS_DIR = './js';
var JS_SERVER_FILE = './js/server.js';
var JS_VENDOR_MODULES = ['react', 'react-dom', 'firebase'];
var JS_DIST_DIR = DIST_DIR + '/js/';
var JS_DIST_VENDOR_FILENAME = 'vendor.js';

// Directory to write coverage reports.
var COVERAGE_DIR = './coverage';
var COVERAGE_FILENAME = 'coverage.json';
var COVERAGE_CLIENT_DIR = COVERAGE_DIR + '/client';
var COVERAGE_SERVER_DIR = COVERAGE_DIR + '/server';
var COVERAGE_JSON_FILES = COVERAGE_DIR + '/*/' + COVERAGE_FILENAME;

// Path to CSS files.
var CSS_MAIN_FILE = './css/index.scss';
var CSS_ALL_FILES = './css/**/*.scss';
// var CSS_DIST_DIR = DIST_DIR + '/css';
var CSS_DIST_FILE = 'css/style.css';

// Path to HTML files.
var HTML_FILE = './index.html';
var HTML_DIST_DIR = DIST_DIR;

var LOCALES_DIR = './locales';

var INTERPOLATE_REGEX = /{{\s*([^}]+?)\s*}}/g;

// Path to asset versioned files.
var REV_DIR = './rev-dist';
var MANIFEST_FILE = DIST_DIR + '/manifest.json';
var JS_VIEW_HASH_FILE = DIST_DIR + '/view-hash.json';

// The URL we're serving our app at.
var APP_URL = 'http://localhost:' + config.expressPort;

// Parse command-line arguments.
var args = nopt({
  open: String
}, {
  // `gulp -o` becomes `gulp --open 'google chrome'`.
  o: ['--open', 'google chrome']
});

// Helper for opening the given `url` in Chrome. Calls the `callback`
// on success.
var openUrl = function(url, callback) {
  gutil.log(gutil.colors.green('Opening', url));
  opn(url, {
    app: args.open,
    wait: false
  }, callback);
};

// Delete the `dist` and `coverage` directories.
gulp.task('clean', ['clean:dist', 'clean:coverage']);

// Delete the `dist` directory.
gulp.task('clean:dist', function(callback) {
  del(DIST_DIR).then(function() {
    callback();
  });
});

// Delete the `rev` directory.
gulp.task('clean:rev', function(callback) {
  del(REV_DIR).then(function() {
    callback();
  });
});

// Delete the `coverage` directory.
gulp.task('clean:coverage', function(callback) {
  del(COVERAGE_DIR).then(function() {
    callback();
  });
});

// Lint JS.
gulp.task('lint', function() {
  // Also lint this `gulpfile.js`.
  return gulp.src(JS_ALL_FILES.concat(__filename))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// Run all our JavaScript tests (on both the server-side and client-side).
gulp.task('test', function(callback) {
  runSequence('test:server', 'test:client', 'test:combine-coverage', callback);
});

// Set up and tear down our test server.
var server = null;
gulp.task('test:setup', function(callback) {
  server = testServer.listen(config.testPort, callback);
});
gulp.task('test:teardown', function(callback) {
  server.close(callback);
  server = null;
});

// Run tests on the server-side, and generate test coverage reports.
gulp.task('test:server', function(callback) {
  runSequence('test:setup', 'test:run:server', function(err) {
    runSequence('test:teardown', function() {
      if (err) {
        throw err;
      }
      callback(err);
    });
  });
});
gulp.task('test:run:server', shell.task([
  'istanbul --dir=' + COVERAGE_SERVER_DIR + ' -x=**/config/** cover -- tape test/lib/*.js'
]));

// Run tests on the client-side, and generate test coverage reports.
gulp.task('test:client', function(callback) {
  runSequence('test:setup', 'test:run:client', function(err) {
    runSequence('test:teardown', function() {
      if (err) {
        throw err;
      }
      callback(err);
    });
  });
});
gulp.task('test:run:client', function(callback) {
  new karma.Server({
    configFile: KARMA_CONF_FILE,
    coverageReporter: {
      dir: COVERAGE_CLIENT_DIR,
      subdir: '.',
      reporters: [
        { type: 'json', file: COVERAGE_FILENAME },
        { type: 'lcov' },
        { type: 'text' }
      ]
    }
  }, callback).start();
});

// Combine the server-side and client-side test coverage reports.
gulp.task('test:combine-coverage', function(callback) {
  istanbulCombine({
    dir: COVERAGE_DIR,
    pattern: COVERAGE_JSON_FILES,
    reporters: {
      json: { file: COVERAGE_FILENAME },
      lcov: {},
      text: {}
    }
  }, callback);
});

// Generate and open the combined coverage report.
gulp.task('coverage', ['test'], function(callback) {
  openUrl(COVERAGE_DIR + '/lcov-report/index.html', callback);
});

// Generate and open the server-side test coverage report.
gulp.task('coverage:server', ['test:server'], function(callback) {
  openUrl(COVERAGE_SERVER_DIR + '/lcov-report/index.html', callback);
});

// Generate and open the client-side test coverage report.
gulp.task('coverage:client', ['test:client'], function(callback) {
  openUrl(COVERAGE_CLIENT_DIR + '/lcov-report/index.html', callback);
});

// Build JS and CSS.
gulp.task('build', function(callback) {
  runSequence('build:locales', 'build:js', 'build:css', 'build:html', callback);
});

// Browserify the locale files.
gulp.task('build:locales', function(callback) {
  var localeFiles = globby.sync(LOCALES_DIR + '/*.json');
  savoy.eachSeries(localeFiles, function(callback, file) {
    var basename = path.basename(file, '.json');
    var moduleName = LOCALES_DIR + '/' + basename;
    browserify()
      .require(file, {
        expose: moduleName
      })
      .bundle()
      .on('end', callback)
      .pipe(source(moduleName + '.js'))
      .pipe(buffer())
      .pipe(gulpIf(IS_PRODUCTION, uglify()))
      .pipe(rev())
      .pipe(gulp.dest(DIST_DIR))
      .pipe(rev.manifest(MANIFEST_FILE, {
        base: DIST_DIR,
        merge: true
      }))
      .pipe(gulp.dest(DIST_DIR));
  }, callback);
});

gulp.task('build:js', function(callback) {
  runSequence('build:js:vendor', 'build:js:app', callback);
});

gulp.task('build:js:vendor', function() {
  return browserify()
    .transform(envify)
    .require(JS_VENDOR_MODULES)
    .bundle()
    .pipe(source('js/vendor.js'))
    .pipe(buffer())
    .pipe(gulpIf(IS_PRODUCTION, uglify()))
    .pipe(rev())
    .pipe(gulp.dest(DIST_DIR))
    .pipe(rev.manifest(MANIFEST_FILE, {
      base: DIST_DIR,
      merge: true
    }))
    .pipe(gulp.dest(DIST_DIR));
});

gulp.task('build:js:app', function() {
  var entries = globby.sync([JS_DIR + '/views/*.js', JS_DIR + '/client.js']);
  // var viewManifest = {};
  return browserify({
    entries: entries,
    basedir: '.',
    debug: !IS_PRODUCTION,
  }).external(JS_VENDOR_MODULES)
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
        // Assign an `id` so that we can get a reference to each `view` module
        // eg. via `require('js/views/home')` when we load the view bundle
        // on demand.
        if (row.entry) {
          row.id = JS_DIR + '/views/' + path.basename(row.file, '.js');
        }
        callback(null, row);
      }));
    })
    .plugin(factorVinylify, {
      outputs: entries,
      common: JS_DIR + '/common.js'
    })
    .bundle()
    .pipe(gulpIf(IS_PRODUCTION, uglify()))
    .pipe(rev())
    .pipe(gulp.dest(DIST_DIR))
    .pipe(rev.manifest(MANIFEST_FILE, {
      base: DIST_DIR,
      merge: true
    }))
    .pipe(gulp.dest(DIST_DIR));
});

// Build our CSS. Only minify when building for production.
gulp.task('build:css', function() {
  return gulp.src(CSS_MAIN_FILE)
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.init({
      loadMaps: true
    })))
    .pipe(sass())
    .pipe(concat(CSS_DIST_FILE))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpIf(IS_PRODUCTION, minifyCss({
      // Remove all comments, no exceptions.
      keepSpecialComments: 0
    })))
    .pipe(rev())
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.write('.')))
    .pipe(gulp.dest(DIST_DIR))
    .pipe(rev.manifest(MANIFEST_FILE, {
      base: DIST_DIR,
      merge: true
    }))
    .pipe(gulp.dest(DIST_DIR));
});

// Build our HTML.
var replace = require('gulp-replace');
gulp.task('build:html', function() {
  var manifest = require('./dist/manifest.json');
  // var viewsRevHashes = require('./dist/view-manifest.json');
  var prefix = '/';
  return gulp.src(HTML_FILE)
    // .pipe(replace(/{{\s*manifest\s*}}/g, JSON.stringify(viewsRevHashes)))
    .pipe(replace(INTERPOLATE_REGEX, function(match, originalPath) {
      var revvedPath = manifest[originalPath];
      if (!revvedPath) {
        throw new Error('Asset not found: ' + originalPath);
      }
      return prefix + revvedPath;
    }))
    .pipe(gulpIf(IS_PRODUCTION, htmlmin({ collapseWhitespace: true })))
    .pipe(gulp.dest(HTML_DIST_DIR));
});

// Rebuild our JS and restart the app on every file change.
gulp.task('watch:js', function() {
  nodemon({
    watch: JS_ALL_DIRS,
    script: JS_SERVER_FILE,
    tasks: ['build:js:app']
  });
});

// Rebuild our CSS on every file change.
gulp.task('watch:css', ['build:css'], function() {
  gulp.watch(CSS_ALL_FILES, ['build:css']);
});

// Run the app, rebuilding our JS or CSS on every file change. Pass in an `-o`
// flag to open the app in Chrome.
gulp.task('default', function(callback) {
  runSequence('build', ['watch:js', 'watch:css'], function() {
    if (args.open) {
      openUrl(APP_URL, callback);
    }
  });
});

// Run the app, without watching for changes. Pass in an `-o` flag to open
// the app in Chrome.
gulp.task('serve', function(callback) {
  runSequence('build', function() {
    require(JS_SERVER_FILE);
    if (args.open) {
      openUrl(APP_URL, callback);
    }
  });
});
