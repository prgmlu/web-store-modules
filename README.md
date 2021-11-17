# web-store-modules

A collection of all web store modules.


## Quick Start

* Install the npm pacakge
  ```console
  npm install --save git+ssh://git@gitlab.com:ObsessVR/360Experiences/web-store-modules.git#release
  ```

* Setup the package
  ```console
  npx wsm setup
  ```

* Update the package
  ```console
  npx wsm update
  ```

* Import module
  ```javascript
  import { loadTextureAsync } from 'web-store-modules/packages/asset-loader';
  ```

* This package is only meant to be used in an ES6 environment for the purpose of minimizing the build size.

## Development
* After pull the repo, run the following commands in the root folder
    * Install Dependencies
    ```console
    npm install
    ```
    * Bootstrap packages and hoist shared dependencies
    ```console
    lerna bootstrap --hoist
    ```
    (If you don't have lerna installed globally, run ```npx lerna bootstrap --hoist```)

## Develop New Modules
* Create new module

    * Bootstrap dependencies
        ```console
        lerna bootstrap --hoist
        ```

    * IN THE ROOT FOLDER, Generate a new module folder in the ./packages directory with basic babel, webpack and playground setup
        ```console
        npm run generate-new-module
        ```

    * CD into the module folder and start the dev server
        ```console
        cd packages/new-module-name
        npm start
        ```

    * Module cross dependencies
        * If a module needs to depend on another module, add the dependency to the "dependencies" field in the module's package.json file as such
            ```json
            "asset-loader": "^1.0.0"
            ```
        * And then run the following command to bootstrap the dependencies
            ```console
            lerna bootstrap --hoist
            ```
        * Update the webpack.js file, under module -> rules -> babel-loader -> exclude, add the dependcy's name to the regex, so babel loader will transpile it
            ```javascript
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules\/(?!(asset-loader|three-background|three-controller|three-interactable-object|three-physics)\/).*/
            }
            ```

    * Each module by default only contains the lib folder and the module's entry.js file when pulled with npm isntall, if the package needs to include other files when it's pulled with npm install, modify the "files" field in the package.json file.
    * If a universal dependency is needed (used by mall/template as well as the module), make sure to set them as peerDependencies both in the root package.json and the module package.json, and install them with --save-dev.

## Documentation
* We use documentation.js for documenting our code.
* Visit https://github.com/documentationjs/documentation to leran more about it.
* Generate documentation for all modules, run the following command in the root folder
    ```console
    npm run all-docs
    ```
    This will generate a Documentation.md file in each package's directory containing their own documentation.
* Generate documentation for an individual module, run the following command in the module's folder
    ```console
    npm run doc
    ```

## Test
[tdd]: #TDD
* This project is set up with Jest with ES6 support.
* Tests should be in a folder called 'tests' in the root folder of each subpackage.
* Tests should be organized in to subfolders such as 'unit' and 'regression', to easily distinguish and update them.
* Once a new test is create, update the 'test' command in the 'scripts' filed of package.json to include the new tests.
* Run the following command in each subpackage to run tests.
    ```console
    npm test
    ```
* We don't require 100% code coverage (or any percentage for that matter), so write unit tests as needed.
* Integration tests are important, however it does not really apply to this particular web-store-modules repo as each module exist independently in a lot of places. This will change once we have a proper monorepo for all of our web-store related code.
* Regression tests are important. With each bug fix, there should be a corresponding regression test.
* Due to personal beliefs, time constraints and the 3D nature of our apps, TDD is discouraged. [Click for details.][tdd]
* See packages/url-constructor for test example.

## TDD
* Due to personal beliefs, time constraints and the 3D nature of our apps, TDD is discouraged but not prohibited. You can practice TDD if you'd like.
* [Jonathan Blow on unit testing and TDD](https://www.youtube.com/watch?v=21JlBOxgGwY)


## Important


## Issues

* documentation.js is currently broken because it doesn't support dynamic import with babel 7. We can either use a different package like JSDoc/ESDoc to generate our code documentation, or we can update documentation.js once it includes support for dynamic import with babel 7
    * related github issues:
        * https://github.com/documentationjs/documentation/issues/1149
        * https://github.com/documentationjs/documentation/pull/1114