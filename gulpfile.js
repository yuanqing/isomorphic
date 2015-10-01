var del = require('del');
var opn = require('opn');
var gulp = require('gulp');
var nopt = require('nopt');
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
var nodemon = require('gulp-nodemon');
var reactify = require('reactify');
var minifyCss = require('gulp-minify-css');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var istanbulCombine = require('istanbul-combine');
var config = require('./config');

// If this constant is `true`, minify our compiled JS and CSS.
var IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Path to `karma.conf.js`.
var KARMA_CONF_FILE = __dirname + '/karma.conf.js';

// Directory to write our compiled JS and CSS.
var DIST_DIR = 'dist';

// Path to JS files.
var JS_CLIENT_FILE = 'js/client.js';
var JS_SERVER_FILE = 'js/server.js';
var JS_ALL_DIRS = [
  'lib',
  'js'
];
var JS_ALL_FILES = [
  'lib/**/*.js',
  'js/**/*.js'
];
var JS_TEST_FILES = 'test/**/*.js';
var JS_DIST_DIR = DIST_DIR + '/js';
var JS_DIST_VENDOR_FILENAME = 'vendor.js';
var JS_DIST_APP_FILENAME = 'app.js';

// List of modules to bundle separately from our app's JS.
var JS_VENDOR_MODULES = ['firebase', 'react'];

// Directory to write coverage reports.
var COVERAGE_DIR = 'coverage';
var COVERAGE_FILENAME = 'coverage.json';
var COVERAGE_HTML_FILE = COVERAGE_DIR + '/lcov-report/index.html';
var COVERAGE_CLIENT_DIR = COVERAGE_DIR + '/client';
var COVERAGE_SERVER_DIR = COVERAGE_DIR + '/server';
var COVERAGE_JSON_FILES = COVERAGE_DIR + '/*/' + COVERAGE_FILENAME;

// Path to CSS files.
var CSS_MAIN_FILE = 'css/index.scss';
var CSS_ALL_FILES = 'css/**/*.scss';
var CSS_DIST_DIR = DIST_DIR + '/css';

// The URL we're serving our app at.
var APP_URL = 'http://localhost:' + config.port;

// Parse command-line arguments.
var opts = nopt({
  open: String
}, {
  // `gulp -o` becomes `gulp --open 'google chrome'`
  o: ['--open', 'google chrome']
});

// Helper for launching Chrome if the `--open` (or `-o`) flag is specified.
var openUrl = function(url) {
  if (opts.open) {
    gutil.log('Opening', gutil.colors.yellow(url));
    setTimeout(function() {
      opn(url, {
        app: opts.open
      });
    }, 2000);
  }
};

// JS
gulp.task('js', ['js:lint', 'js:test', 'js:build']);

// Lint our JS.
gulp.task('js:lint', function() {
  // Also lint this `gulpfile.js`.
  return gulp.src(JS_ALL_FILES.concat(__filename))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// Run all our JavaScript tests (on both the server-side and client-side). Pass
// in an `-o` flag to open test coverage reports in Chrome.
gulp.task('js:test', function(cb) {
  runSequence('js:test:server', 'js:test:client', 'js:coverage', function() {
    openUrl(COVERAGE_HTML_FILE);
    cb();
  });
});

// Run our tests on the server-side, and write coverage reports
// to the `COVERAGE_SERVER_DIR`.
gulp.task('js:test:server', shell.task([
  'istanbul --dir=' + COVERAGE_SERVER_DIR + ' cover -- tape ' + JS_TEST_FILES,
]));

// Run our tests on the client-side, and write coverage reports
// to `COVERAGE_CLIENT_DIR`.
gulp.task('js:test:client', function(cb) {
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
  }, cb).start();
});

// Combine the server-side and client-side coverage reports.
gulp.task('js:coverage', function(cb) {
  istanbulCombine({
    dir: COVERAGE_DIR,
    pattern: COVERAGE_JSON_FILES,
    reporters: {
      json: { file: COVERAGE_FILENAME },
      lcov: {},
      text: {}
    }
  }, cb);
});

// Build the vendor JS and our app JS.
gulp.task('js:build', ['js:build:vendor', 'js:build:app']);

// Build vendor JS.
gulp.task('js:build:vendor', function() {
  var b = browserify();
  return b.require(JS_VENDOR_MODULES)
    .bundle()
    .pipe(source(JS_DIST_VENDOR_FILENAME))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(JS_DIST_DIR));
});

// Build our app JS.
gulp.task('js:build:app', function() {
  var b = browserify({
    entries: JS_CLIENT_FILE,
    transform: [reactify, envify]
  });
  return b.external(JS_VENDOR_MODULES)
    .bundle()
    .pipe(source(JS_DIST_APP_FILENAME))
    .pipe(buffer())
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.init({
      loadMaps: true
    })))
    .pipe(gulpIf(IS_PRODUCTION, uglify()))
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.write('.')))
    .pipe(gulp.dest(JS_DIST_DIR));
});

// Rebuild our JS and restart the app on every file change.
gulp.task('js:watch', function() {
  nodemon({
    watch: JS_ALL_DIRS,
    script: JS_SERVER_FILE,
    tasks: ['js:build:app']
  });
});

// CSS
gulp.task('css', ['css:build']);

// Build our CSS.
gulp.task('css:build', function() {
  return gulp.src(CSS_MAIN_FILE)
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.init({
      loadMaps: true
    })))
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulpIf(IS_PRODUCTION, minifyCss({
      keepSpecialComments: 0
    })))
    .pipe(gulpIf(!IS_PRODUCTION, sourcemaps.write('.')))
    .pipe(gulp.dest(CSS_DIST_DIR));
});

// Rebuild our CSS on every file change.
gulp.task('css:watch', ['css:build'], function() {
  gulp.watch(CSS_ALL_FILES, ['css:build']);
});

// CLEAN
gulp.task('clean', ['clean:dist', 'clean:coverage']);

// Delete the `dist` directory.
gulp.task('clean:dist', function(cb) {
  del(DIST_DIR, cb);
});

// Delete the `coverage` directory.
gulp.task('clean:coverage', function(cb) {
  del(COVERAGE_DIR, cb);
});

// LINT
gulp.task('lint', ['js:lint']);

// TEST
gulp.task('test', ['js:test']);

// BUILD
gulp.task('build', ['js:build', 'css:build']);

// SERVE
// Run the app, without watching for changes. Pass in an `-o` flag to open
// the app in Chrome.
gulp.task('serve', function(cb) {
  runSequence('clean', 'lint', 'build', function() {
    require(JS_SERVER_FILE);
    openUrl(APP_URL);
    cb();
  });
});

// WATCH
// Run the app, rebuilding our JS or CSS on every file change. Pass in an
// `-o` flag to open the app in Chrome.
gulp.task('watch', function(cb) {
  runSequence('build', ['js:watch', 'css:watch'], function() {
    openUrl(APP_URL);
    cb();
  });
});

// DEFAULT
gulp.task('default', ['watch']);
