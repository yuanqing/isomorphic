module.exports = function(config) {
  config.set({
    basePath: '.',
    browserNoActivityTimeout: 5000,
    singleRun: true,
    browsers: [process.env.TRAVIS ? 'Chrome_travis_ci' : 'Chrome'],
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
      'test/**/*.js': ['browserify'],
      // 'test/client/*.jsx': ['browserify'],
      // 'test/client/fixture.html': ['html2js'],
    },
    files: [
      'test/**/*.js'
      // {
      //   pattern: 'test/client/fixture.html',
      //   included: false,
      //   served: true,
      //   watched: false
      // }
    ],
    browserify: {
      transform: [
        ['brfs'],
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
