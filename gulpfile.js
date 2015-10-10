var fs = require('fs-extra');
var bpb = require('bpb');
var del = require('del');
var opn = require('opn');
var glob = require('glob');
var gulp = require('gulp');
var nopt = require('nopt');
var path = require('path');
var sass = require('gulp-sass');
var karma = require('karma');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var envify = require('envify');
var gulpIf = require('gulp-if');
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var through = require('through2');
var nodemon = require('gulp-nodemon');
var reactify = require('reactify');
var minifyCss = require('gulp-minify-css');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var factorBundle = require('factor-bundle');
var autoprefixer = require('gulp-autoprefixer');
var istanbulCombine = require('istanbul-combine');

var config = require('./config');
var testServer = require('./test/server');

// If this constant is `true`, minify our compiled JS and CSS.
var IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Path to `karma.conf.js`.
var KARMA_CONF_FILE = __dirname + '/karma.conf.js';

// Directory to write our compiled JS and CSS.
var DIST_DIR = 'dist';

// Path to JS files.
var JS_ALL_DIRS = [
  'lib',
  'js'
];
var JS_ALL_FILES = [
  'lib/**/*.js',
  'js/**/*.js'
];
var JS_SERVER_FILE = 'js/server.js';
var JS_CLIENT_FILE = 'js/client.js';
var JS_VIEWS_DIR = 'js/views';
var JS_VENDOR_MODULES = ['react', 'firebase'];
var JS_DIST_DIR = DIST_DIR + '/js/';
var JS_DIST_COMMON_FILENAME = 'common.js';
var JS_DIST_VENDOR_FILENAME = 'vendor.js';
var JS_DIST_CLIENT_FILE = DIST_DIR + '/' + JS_CLIENT_FILE;
var JS_DIST_VIEWS_DIR = DIST_DIR + '/' + JS_VIEWS_DIR;

// Directory to write coverage reports.
var COVERAGE_DIR = 'coverage';
var COVERAGE_FILENAME = 'coverage.json';
var COVERAGE_CLIENT_DIR = COVERAGE_DIR + '/client';
var COVERAGE_SERVER_DIR = COVERAGE_DIR + '/server';
var COVERAGE_JSON_FILES = COVERAGE_DIR + '/*/' + COVERAGE_FILENAME;

// Path to CSS files.
var CSS_MAIN_FILE = 'css/index.scss';
var CSS_ALL_FILES = 'css/**/*.scss';
var CSS_DIST_DIR = DIST_DIR + '/css';
var CSS_DIST_FILENAME = 'style.css';

// The URL we're serving our app at.
var APP_URL = 'http://localhost:' + config.expressPort;

// Parse command-line arguments.
var args = nopt({
  open: String
}, {
  // `gulp -o` becomes `gulp --open 'google chrome'`.
  o: ['--open', 'google chrome']
});

// Helper for opening the given `url` in Chrome.
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
  del(DIST_DIR, callback);
});

// Delete the `coverage` directory.
gulp.task('clean:coverage', function(callback) {
  del(COVERAGE_DIR, callback);
});

// Lint our JS.
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

// Set up and tear down our test server (for testing XHR).
var server = null;
gulp.task('test:setup', function(callback) {
  server = testServer.listen(3142, callback);
});
gulp.task('test:teardown', function(callback) {
  server.close(callback);
  server = null;
});

// Run our tests on the server-side, and write coverage reports
// to the `COVERAGE_SERVER_DIR`.
gulp.task('test:server', function(callback) {
  runSequence('test:setup', 'test:run:server', function() {
    runSequence('test:teardown', callback);
  });
});
gulp.task('test:run:server', shell.task([
  'istanbul --dir=' + COVERAGE_SERVER_DIR + ' cover -- tape test/lib/*.js'
]));

// Run our tests on the client-side, and write coverage reports
// to `COVERAGE_CLIENT_DIR`.
gulp.task('test:client', function(callback) {
  runSequence('test:setup', 'test:run:client', function() {
    runSequence('test:teardown', callback);
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
  }, function() {
    callback();
  }).start();
});

// Combine the server-side and client-side coverage reports.
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

// Generate and open the combined coverage report (server-side and
// client-side).
gulp.task('coverage', ['test'], function(callback) {
  openUrl(COVERAGE_DIR + '/lcov-report/index.html', callback);
});

// Generate and open the coverage report for the server-side tests.
gulp.task('coverage:server', ['test:server'], function(callback) {
  openUrl(COVERAGE_SERVER_DIR + '/lcov-report/index.html', callback);
});

// Generate and open the coverage report for the client-side tests.
gulp.task('coverage:client', ['test:client'], function(callback) {
  openUrl(COVERAGE_CLIENT_DIR + '/lcov-report/index.html', callback);
});

// Build our JS and CSS.
gulp.task('build', ['build:js', 'build:css']);

// Build the vendor JS and our app JS.
gulp.task('build:js', function(callback) {
  runSequence(['build:js:vendor', 'build:js:app'], 'build:js:minify', callback);
});

// Build some dependencies separately to speed up `browserify`.
gulp.task('build:js:vendor', function() {
  return browserify()
    .require(JS_VENDOR_MODULES)
    .bundle()
    .pipe(source(JS_DIST_VENDOR_FILENAME))
    .pipe(buffer())
    .pipe(gulp.dest(JS_DIST_DIR));
});

// Build our app JS.
gulp.task('build:js:app', function() {
  // Make sure the `JS_DIST_VIEWS_DIR` directory exists (the `factor-bundle`
  // plugin will error otherwise).
  fs.ensureDirSync(JS_DIST_VIEWS_DIR);
  // Each file in `JS_VIEWS_DIR` is bundled separately. Each entry file in the
  // `inputFiles` array is output to the corresponding path in the
  // `outputFiles` array.
  var inputFiles = glob.sync(JS_VIEWS_DIR + '/*.js');
  var outputFiles = inputFiles.map(function(file) {
    return JS_DIST_VIEWS_DIR + '/' + path.basename(file);
  });
  // The `JS_CLIENT_FILE` is also an entry point. Append to the `inputFiles`
  // and `outputFiles` arrays accordingly.
  inputFiles = inputFiles.concat(JS_CLIENT_FILE);
  outputFiles = outputFiles.concat(JS_DIST_CLIENT_FILE);
  return browserify({
    // Add inline sourcemaps if not production.
    debug: !IS_PRODUCTION,
    entries: inputFiles,
    transform: [
      // Compile JSX.
      reactify,
      // Replace any `process.browser` with a `true` constant.
      bpb,
      // Replace any `process.env.NODE_ENV` with a plain string.
      envify
    ],
  }).external(JS_VENDOR_MODULES)
    .on('factor.pipeline', function (file, pipeline) {
      pipeline.get('pack').unshift(through.obj(function(row, encoding, callback) {
        // Assign an `id` so that we can get a reference to each `view` module
        // eg. via `require('views/home')` when we load each view
        // bundle on demand.
        if (row.entry) {
          row.id = 'views/' + path.basename(row.sourceFile, '.js');
        }
        callback(null, row);
      }));
    })
    // Code that is specific to each file in the `entryFiles` array will be
    // bundled separately ie. written to the corresponding file in the
    // `outputFiles` array.
    .plugin(factorBundle, { output: outputFiles })
    .bundle()
    // Code common to every file in the `entryFiles` array will be written
    // to the file named `JS_DIST_COMMON_FILENAME`.
    .pipe(source(JS_DIST_COMMON_FILENAME))
    .pipe(buffer())
    .pipe(gulp.dest(JS_DIST_DIR));
});

// Minify JS.
gulp.task('build:js:minify', function() {
  return gulp.src(JS_DIST_DIR + '/**/*.js')
    .pipe(IS_PRODUCTION ? uglify() : gutil.noop())
    .pipe(gulp.dest(function(data) {
      // Override the original files.
      return data.base;
    }));
});

// Build our CSS.
gulp.task('build:css', function() {
  return gulp.src(CSS_MAIN_FILE)
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.init({
      loadMaps: true
    })))
    .pipe(sass())
    .pipe(concat(CSS_DIST_FILENAME))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpIf(IS_PRODUCTION, minifyCss({
      // Remove all comments, no exceptions.
      keepSpecialComments: 0
    })))
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.write('.')))
    .pipe(gulp.dest(CSS_DIST_DIR));
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
