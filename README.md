## Ideas

1. [**Redux**](http://rackt.github.io/redux/docs/introduction/ThreePrinciples.html) &mdash; App state is a single JSON object, which can be serialised.
2. [**Flux**](https://facebook.github.io/flux/docs/overview.html) &mdash; Data *always* flows in a single direction through the app.
3. [**React**](https://facebook.github.io/react/docs/why-react.html#declarative) &mdash; The view layer is a black box; whenever there is a change in the app state, our mental model can be that we will *re-render the entire app*. (But in practice, only the minimal set of DOM mutations are performed.)

## Tooling

- Linter: [**ESLint**](http://eslint.org/)
- Tests: [**Tape**](https://github.com/substack/tape), [**Karma**](http://karma-runner.github.io/)
- Test coverage: [**Istanbul**](https://github.com/gotwarlost/istanbul)
- Bundling: [**Browserify**](http://browserify.org/)
- CSS: [**Sass**](http://sass-lang.com/)
- Build system: [**Gulp**](https://github.com/gulpjs/gulp)

## Usage

### Setup

Requires Node.js and npm.

Install all dependencies, and the `gulp` CLI:

```sh
$ npm install
$ npm install --global gulp
```

### Gulp commands

#### `$ gulp`

Run the app, rebuilding our JS or CSS on every file change. Pass in an `-o` flag to open the app in Chrome.

#### `$ gulp serve`

Run the app, *without* watching for changes. Pass in an `-o` flag to open the app in Chrome.

#### `$ gulp lint`

Lint all the JavaScript in `lib` and `js`.

#### `$ gulp test`

Run all the JavaScript tests (on both server-side and client-side). Pass in an `-o` flag to open the test coverage reports in Chrome.

## Directory structure

Directory | Description
:--|:--
`assets` | Static assets served on the base URL `/assets`, eg. `/assets/favicon.ico`.
`config` | Configuration files.
`css` | Our app Sass files.
`js` | Our app JavaScript files.
`lib` | The code for the core Flux/Redux-inspired framework, consumed by code in the `js` directory. (Ideally, code in this directory can eventually be abstracted into a standalone npm module.)
`test` | Tests for the code in `js` and `lib`.

Some directories are generated locally (and not to be checked into this repository):

Directory | Description
:--|:--
`coverage` | Test coverage reports.
`dist` | Our compiled CSS and JS.
`node_modules` | Dependencies installed via npm.
