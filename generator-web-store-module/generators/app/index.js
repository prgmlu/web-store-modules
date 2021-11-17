const Generator = require('yeoman-generator');
const path = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');

class ModuleGenerator extends Generator {
    prompting() {
        return this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Your module name',
                validate(input) {
                    if (input.trim() === '') {
                        return chalk.red('Can’t be an empty string.');
                    }
                    return true;
                },
            },
            {
                type: 'input',
                name: 'version',
                message: 'Your module version',
                default: '1.0.0',
            },
            {
                type: 'input',
                name: 'description',
                message: 'Your module\'s description',
                default: 'Web store module',
            },
            {
                type: 'input',
                name: 'author',
                message: 'Author: ',
                default: 'Obsess, Inc.',
            },
            {
                type: 'input',
                name: 'license',
                message: 'license: ',
                default: 'ISC',
            },
        ]).then((answers) => {
            this.destinationRoot(path.join(this.destinationRoot(), `/packages/${answers.name}`));
            this.appname = answers.name;
            this.version = answers.version;
            this.description = answers.version;
            this.author = answers.author;
            this.license = answers.license;
        });
    }

    // saveConfig() {
    //     this.config.save();
    // }

    writePackageJsonFile() {
        const templatePackageJson = this.fs.readJSON(this.templatePath('package-template.json'));
        templatePackageJson.name = this.appname.toLowerCase();
        templatePackageJson.version = this.version;
        templatePackageJson.description = this.description;
        templatePackageJson.author = this.author;
        templatePackageJson.license = this.license;
        this.fs.writeJSON(this.destinationPath('package.json'), templatePackageJson);
    }

    copyFiles() {
        // copy playground folder
        this.fs.copy(
            this.templatePath('playground'),
            this.destinationPath('playground'),
        );
        // copy babel config
        this.fs.copy(
            this.templatePath('babel.config.js'),
            this.destinationPath('babel.config.js'),
        );
        // copy webpack config
        this.fs.copy(
            this.templatePath('webpack.js'),
            this.destinationPath('webpack.js'),
        );
        // create empty index.js
        this.fs.copy(
            this.templatePath('index.js'),
            this.destinationPath('index.js'),
        );
        // create empty lib directory
        mkdirp.sync(this.destinationPath('lib'));
    }
}

module.exports = ModuleGenerator;
