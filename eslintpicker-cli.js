#!/usr/bin/env node

const fs = require('fs'); 
const chalk = require('chalk'); 

const args = process.argv
const pwd = __dirname; 



const commands = ['save', 'import', 'delete', 'update', 'help']

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

const errorlog = (error) => { 
    const elog = chalk.red(error); 
    console.log(elog); 
}

if (args.length > 4) { 
    errorlog(`
    only 2 argument at most accepted (command, optional file)
    Please type "eslp help" to see usage details 
    `);
}

if (commands.indexOf(args[2] === -1)) { 
    errorlog(`invalid number of arguments entered`)
}

switch (args[2]) { 
    case 'help': 
        usage(); 
        break;
    case 'save':
        console.log('ESLint file Saved! (not really)'); 
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
        errorlog('invalid command: missing or invalid.'); 
        usage(); 
}

