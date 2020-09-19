#!/usr/bin/env node
const yargs = require('yargs');
const inquirer = require('inquirer');
const fs = require('fs');
const fse = require('fs-extra');
const { COPYFILE_EXCL } = fs.constants;
const path = require('path');
const aliasDescriptions = require('./descriptions');
const { info, err } = require('./utils/loggers');
const { listUI, listTitleUI } = require('./utils/ui');

ensureESLintFilesDirExists();

const esLintPickerSourceDir = __dirname;
const esLintFilesDirName = 'esLintFiles';
const savedFilesDirArray = fs.readdirSync(
    path.join(esLintPickerSourceDir, esLintFilesDirName)
);

const options = {
    aliasRequired: {
        describe: 'Nickname for ESLint file',
        alias: 'a',
        demandOption: true,
        default: undefined,
    },
    describe: {
        describe: 'Description of Alias file',
        alias: 'd',
        demandOption: false,
    },
    list: {
        type: 'boolean',
        alias: 'l',
        describe: 'list saved ESLint files',
    },
    hidden: {
        version: { hidden: true },
        list: { hidden: true },
        help: { hidden: true },
    },
};

const argv = yargs
    .scriptName('eslp')
    .usage('eslp <command> <Alias>')
    .usage('eslp --help <command>')
    .usage('eslp [options]')
    .command(
        'save -a <alias>',
        'save .eslintrc.js in current working directory under an alias',
        {
            alias: options.aliasRequired,
            ...options.hidden,
            describe: options.describe,
        },
        function (argv) {
            try {
                const esLintFileExists = findESLintFile();
                if (esLintFileExists) {
                info.log(
                    `Attempting to Save .eslintrc${info.fileFormatColor(
                        findFileFormat(findESLintFile())
                    )} file as ${info.aliasNameColor(argv.alias)}...`
                );
                saveFile(argv, findESLintFile, findFileFormat);
                overWriteDescripJSON(
                    createNewDescriptionObject,
                    argv.alias,
                    argv.describe,
                    aliasDescriptions
                );
                info.log('File Saved!');
                return;
                } else { 
                    throw {'code': 'ESLF_DOES_NOT_EXIST'}
                }
            } catch (exception) {
                err.catchExceptionOutput(exception.code);
            }
        }
    )
    .command(
        'import -a <alias>',
        'import saved ESLint file',
        {
            alias: options.aliasRequired,
            ...options.hidden,
        },
        function (argv) {
            try {
                info.log(
                    `Attempting to import ${info.aliasNameColor(argv.alias)}...`
                );
                importFile(argv.alias);
                info.log('File has been imported!');
            } catch (exception) {
                err.catchExceptionOutput(exception.code);
            }
        }
    )
    .command(
        'update -a <alias>',
        'overwrite saved file with same alias',
        {
            alias: options.aliasRequired,
            ...options.hidden,
            describe: options.describe
        },
        argv => {
            try {
                
                const aliasObject = checkForAlias(argv.alias);
                if (aliasObject) {
                    const isFileFormatSame = compareFileFormat(aliasObject);

                    if (isFileFormatSame) {
                        info.log(
                            `updating ${info.aliasNameColor(
                                argv.alias
                            )} file...`
                        );
                        updateFile(aliasObject);
                        info.log(
                            `${info.aliasNameColor(argv.alias)} file updated!`
                        );

                        if (argv.describe && typeof(argv.describe) === 'string') { 
                            updateDescription(
                                aliasObject.name, 
                                argv.describe, 
                                aliasDescriptions
                                )
                            info.log(`${info.aliasNameColor(argv.alias)} description has been updated!`)
                        }
                    } else {
                        const originFile = findESLintFile();
                        const esLintFileFormat = findFileFormat(originFile);
                        fileFormatConfirm(esLintFileFormat, aliasObject);

                        if (argv.describe) { 

                            updateDescription(
                                aliasObject.name, 
                                argv.describe, 
                                aliasDescriptions
                                )
                            info.log(`${info.aliasNameColor(argv.alias)} description has been updated!`)
                        }
                    }
                } else {
                    throw { code: 'DOES_NOT_EXIST' };
                }
            } catch (exception) {
                err.catchExceptionOutput(exception.code);
            }
        }
    )
    .command(
        'delete -a <alias>',
        'delete saved file',
        {
            alias: options.aliasRequired,
            ...options.hidden,
        },
        argv => {
            try {
                const aliasObject = checkForAlias(argv.alias);
                if (aliasObject) {
                    info.log(
                        `Deleting ${info.aliasNameColor(argv.alias)} file...`
                    );
                    deleteFile(aliasObject);
                    info.log(
                        `${info.aliasNameColor(argv.alias)} file deleted!`
                    );

                    const descriptionExists = descripExists(aliasObject.name, aliasDescriptions); 
                    if (descriptionExists) { 
                        deleteDescription(aliasObject.name, aliasDescriptions);
                    }
                } else {
                    throw { code: 'DOES_NOT_EXIST' };
                }
            } catch (exception) {
                err.catchExceptionOutput(exception.code);
            }
        }
    )
    .command(
        'info -a <alias>',
        'alias name, file format, and description',
        {
            alias: options.aliasRequired,
            ...options.hidden,
        },
        argv => {
            const aliasObject = checkForAlias(argv.alias);
            console.log(aliasObject);
            if (aliasObject) {
                aliasInfoOutput(aliasObject, aliasDescriptions);
            }
        }
    )
    .options({
        list: options.list,
    })
    .showHelpOnFail('false', 'Use --help to see available options')
    .help()
    .alias('help', 'h')
    .alias('version', 'v').argv;


if (argv.list) {
    aliasListOutput(generateAliasList, findFileFormat, aliasDescriptions);
}


function generateAliasList(fileFormatFunc) {
    const aliasNameArray = savedFilesDirArray.map(alias => {
        const fileFormat = fileFormatFunc(alias);
        const name = alias.split(fileFormat)[0];
        return { name, fileFormat };
    });
    return aliasNameArray;
}

function aliasInfoOutput(aliasObject, aliasDescriptions) {
    if (aliasDescriptions[aliasObject.name] === undefined) {
        aliasDescriptions[aliasObject.name] = '';
    }
    info.log(listTitleUI('Alias', 'Description'));
    info.log(
        listUI(
            aliasObject.name,
            aliasDescriptions[aliasObject.name],
            aliasObject.fileFormat
        )
    );
}

function aliasListOutput(
    generateAliasListFunc,
    findFileFormatFunc,
    aliasDescriptions
) {
    const list = generateAliasListFunc(findFileFormatFunc);
    if (list.length === 0) {
        info.log('No Saved ESLint files.');
    } else {
        info.log(listTitleUI('Alias', 'Description'));
        let ui = null;
        list.forEach(alias => {
            if (aliasDescriptions[alias.name] === undefined) {
                aliasDescriptions[alias.name] = '';
            }
            ui = listUI(
                alias.name,
                aliasDescriptions[alias.name],
                alias.fileFormat
            );
        });
        info.log(ui);
    }
}


function findESLintFile() {
    const fileInPWD = fs.readdirSync(process.cwd());

    const esLintFile = fileInPWD.find(file => file.startsWith('.eslintrc'));

    if (esLintFile) return esLintFile;
    return false;
}

function findFileFormat(file) {
    const json = /(.json)/i;
    const yaml = /(.yaml)/i;
    const js = /(.js)/i;
    const fileTypes = [json, yaml, js];
    const fileType = fileTypes.find(type => type.test(file));

    switch (fileType) {
        case json:
            return '.json';
        case yaml:
            return '.yaml';
        case js:
            return '.js';
        default:
            // FIX - USE ERROR LOGGER HERE (develop error function for proper log out?)
            err.logRed(
                'Error: file type is not correct; must be .json, .yaml, or .js.'
            );
    }
}

function saveFile(argv, findESLintFunc, fileFormatFunc) {
    const originFile = findESLintFunc();
    const fileFormat = fileFormatFunc(originFile);

    const alias = `${argv.alias}${fileFormat}`;
    const destPath = path.join(__dirname, esLintFilesDirName, alias);

    const aliasExists = checkForAlias(argv.alias);

    if (aliasExists) {
        throw { code: 'EEXIST' };
    } else {
        fs.copyFileSync(originFile, destPath, COPYFILE_EXCL, err => {
            if (err) throw err;
            return;
        });
    }
}

function createNewDescriptionObject(alias, description, descriptionsObject) {
    const newDescriptionsObject = {
        [alias]: description,
        ...descriptionsObject,
    };
    return newDescriptionsObject;
}

function overWriteDescripJSON(
    createNewDescriptionObject,
    alias,
    description,
    descriptionsObject
) {

    const newJsonObj = JSON.stringify(
        createNewDescriptionObject(alias, description, descriptionsObject),
        null
    );

    const destPath = path.join(__dirname,'descriptions.json');

    fs.writeFileSync(destPath, newJsonObj, err => {
        // FIX - pass to error logger and return with proper err
        if (err) throw err;
        return;
    });
}

function updateDescription(alias, newDescription, descriptionsObject) { 
    descriptionsObject[alias] = newDescription; 
    const newJsonObject = JSON.stringify(descriptionsObject); 

    const destPath = path.join(__dirname,'descriptions.json');

    fs.writeFileSync(destPath, newJsonObject, err => {
        // FIX - pass to error logger and return with proper err
        if (err) throw err;
        return;
    });

}


function importFile(alias) {
    const aliasObject = checkForAlias(alias);

    if (aliasObject) {
        const esLintFile = `.eslintrc${aliasObject.fileFormat}`;
        const cwd = process.cwd();
        const destPath = path.join(cwd, esLintFile);

        const aliasFile = `${aliasObject.name}${aliasObject.fileFormat}`;
        const originPath = path.join(
            esLintPickerSourceDir,
            esLintFilesDirName,
            aliasFile
        );

        fs.copyFileSync(originPath, destPath, COPYFILE_EXCL, err => {
            if (err) throw err;
            return;
        });
    } else {
        throw { code: 'DOES_NOT_EXIST' };
    }
}


function updateFile(aliasObject) {
    const originFile = findESLintFile();

    const alias = `${aliasObject.name}${aliasObject.fileFormat}`;
    const destPath = path.join(__dirname, esLintFilesDirName, alias);

    fs.copyFileSync(originFile, destPath, err => {
        if (err) throw err;
    });
}


function deleteFile(aliasObject) {
    const alias = `${aliasObject.name}${aliasObject.fileFormat}`;
    const aliasPath = path.join(__dirname, esLintFilesDirName, alias);

    fs.unlinkSync(aliasPath, err => {
        throw err;
    });
}

function descripExists(alias, aliasDescriptions) { 
    if (aliasDescriptions[alias]) return true;
    return false;
}

function deleteDescription(alias, descriptionsObject) {
    const toBeDeletedDescrip = descriptionsObject[alias];
    const newDescripObject = {};
    for (const alias in descriptionsObject) { 
        descriptionsObject[alias] != toBeDeletedDescrip 
        ? newDescripObject[alias] = descriptionsObject[alias] 
        : null;
    }

    const newJsonObject = JSON.stringify(newDescripObject); 

    const destPath = path.join(__dirname,'descriptions.json');

    fs.writeFileSync(destPath, newJsonObject, err => {
        if (err) throw err;
        return;
    });

}


function checkForAlias(alias) {
    if (alias) {
        const aliasList = generateAliasList(findFileFormat);
        for (const aliasObject of aliasList) {
            if (aliasObject.name.toLowerCase() === alias.toLowerCase()) {
                return aliasObject;
            }
        }
    }
    return false;
}

function compareFileFormat(aliasObject) {
    const originFile = findESLintFile();
    const fileFormat = findFileFormat(originFile);

    if (fileFormat === aliasObject.fileFormat) {
        return true;
    }
    return false;
}

function fileFormatConfirm(esLintFileFormat, aliasObject) {
    inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'formatUpdateConfirmation',
                message: `ESLint file in current project dir has format ${info.fileFormatColor(
                    esLintFileFormat
                )}. Alias ${info.aliasNameColor(
                    aliasObject.name
                )} format is ${info.fileFormatColor(
                    aliasObject.fileFormat
                )}. Do you want to save as current alias format? (if no, please save under new alias)`,
            },
        ])
        .then(answer => {
            if (answer.formatUpdateConfirmation) {
                info.log(`updating ${info.aliasNameColor(argv.alias)} file...`);
                updateFile(aliasObject);
            } else {
                info.log(
                    `Use 'eslp save --alias ${info.aliasNameColor(
                        '<aliasName>'
                    )} --describe ${info.descripColor(
                        '"description"'
                    )} ' to save .eslintrc${findFileFormat(findESLintFile())}`
                );
                return false;
            }
        });
}

function ensureESLintFilesDirExists() {
    const esLintFilesPath = path.join(__dirname, 'esLintFiles');
    fse.ensureDirSync(esLintFilesPath);
}