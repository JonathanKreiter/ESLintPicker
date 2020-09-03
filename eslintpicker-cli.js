#!/usr/bin/env node

const fs = require('fs'); 
const chalk = require('chalk'); 
const { COPYFILE_EXCL } = fs.constants;
const destinationFolder = 'C:\\Users\\jonat\\Documents\\Projects\\eslintpicker\\testFolder'

const args = process.argv
const pwd = __dirname; 



const commands = ['save', 'import', 'delete', 'update', 'help']

const errorLog = (error) => { 
    const elog = chalk.red(error); 
    console.log(elog); 
}

const infoLog = (info) => { 
    const ilog = chalk.blueBright(info); 
    console.log(ilog); 
}

if (args.length > 4) { 
    errorLog(`
    only 2 argument at most accepted (command, optional file)
    Please type "eslp help" to see usage details 
    `);
}
if (args.length === 2) { 
    usage(); 
}

// if (commands.indexOf(args[1] === -1)) { 
//     errorLog(`invalid number of arguments entered`)
// }

switch (args[2]) { 
    case 'help': 
        usage(); 
        break;
    case 'save':
        saveFile();
        break;
    case 'import': 
        console.log('ESLint file imported. (not really!)'); 
        break;
    case 'delete':
        console.log('ESLint file deleted from saved files (not really)'); 
        break;
    case 'update': 
        console.log('ESLint file updated');
        break;
    default: 
        errorLog('invalid command: missing or invalid.'); 
}

function usage() { 
    const usage = `
    
    ESLintPicker saves, imports, deletes, and updates 
    .eslintrc files all in one place with simple commands in your CLI. 
    
    Usage: 
    eslp <command>

    eslp save               saves .eslintrc from current directory
    eslp list               list of saved ESLint files 
    eslp import <filename>  imports file to current directory 
    eslp delete <filename>  deletes file from saved .eslintrc files
    eslp update <filename>  replaces .eslintrc file with same name
    eslp help               brings up usage details 
    `

    console.log(usage); 
}

function saveFile() { 
    fs.readdirSync(pwd, (err, files) => { 
        if (err) errorLog(err); 
        const esLintFile = files.find(item => item.includes('.eslintrc'));
        if (esLintFile) { 
            infoLog('Found .eslintrc file...')
            fs.copyFileSync(esLintFile, destinationFolder,)
        } else {
            errorLog('cannot find .eslintrc file');
            return;
        }

    })


    // infoLog(`
    // Found ${esLintFile}
    // `)



}