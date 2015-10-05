module.exports = function(config) {
  config.set({
    basePath: '.',
    browserNoActivityTimeout: 5000,
    singleRun: true,
    customLaunchers: {
      ChromeTravis: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    browsers: [process.env.TRAVIS ? 'ChromeTravis' : 'Chrome'],
    frameworks: [
      'browserify',
      'tap'
    ],
    plugins: [
      'browserify-istanbul',
      'karma-browserify',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-tap',
      'karma-tape-reporter'
    ],
    reporters: [
      'coverage',
      'tape'
    ],
    preprocessors: {
      'test/lib/**/*.js': ['browserify']
    },
    files: [
      'test/lib/**/*.js'
    ],
    browserify: {
      transform: [
        ['babelify'],
        [
          'browserify-istanbul',
          {
            ignore: [
              '**/node_modules/**',
              '**/test/**'
            ],
            defaultIgnore: true
          }
        ]
      ]
    }
  });
};
