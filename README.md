[![Build Status](https://img.shields.io/travis/yuanqing/isomorphic.svg?branch=master&style=flat)](https://travis-ci.org/yuanqing/isomorphic) ![Stability Experimental](http://img.shields.io/badge/stability-experimental-red.svg?style=flat)

## Todo

- [X] Code splitting and on-demand loading
- [X] i18n
- [X] Allow views to set their own title and `meta`
- [X] Asset versioning
- [ ] Clean up existing tests
- [ ] More tests
- [ ] [Firebase](lib/firebase.js): patching/updates
- [ ] Authentication / sessions
- [ ] Documentation + explain design decisions
- [ ] Deployment + AWS integration

## Ideas

1. [**Redux**](http://rackt.github.io/redux/docs/introduction/ThreePrinciples.html) &mdash; *Single source of truth.* App state is represented as a single JSON object. This allows app state from the server to be serialised and transmitted to the client.
2. [**Flux**](https://facebook.github.io/flux/docs/overview.html) &mdash; *Unidirectional data flow.* Without exception, data always flows in a single direction through the app. This makes the app a bit easier to reason about.
3. [**React**](https://facebook.github.io/react/docs/why-react.html#declarative) &mdash; *The view layer as a black box.* Whenever there is a change in the app state, our mental model can be that we will always re-render the entire view; in practice, only the minimal set of DOM mutations are performed.

## Tooling

- Build system: [**Gulp**](https://github.com/gulpjs/gulp)
- Bundling: [**Browserify**](http://browserify.org/)
- Linter: [**ESLint**](http://eslint.org/)
- Tests: [**Tape**](https://github.com/substack/tape), [**Karma**](http://karma-runner.github.io/)
- Test coverage: [**Istanbul**](https://github.com/gotwarlost/istanbul)
- CSS: [**Sass**](http://sass-lang.com/)

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

Run all the JavaScript tests on both the server-side and client-side.

## Directory structure

Directory | Description
:--|:--
`assets` | Static assets.
`config` | Configuration files. The configuration file that is used is determined by `NODE_ENV`.
`css`, `js`, `images` | The app Sass, JavaScript and image files.
`lib` | The code for the core framework, consumed by code in the `js` directory. (Code in this directory can eventually be abstracted into a standalone npm module.)
`test` | Tests for the code in `js` and `lib`.

Some directories only exist locally (and should not be checked into source control):

Directory | Description
:--|:--
`coverage` | Test coverage reports.
`build` | Our compiled CSS and JS.
`node_modules` | Dependencies.
