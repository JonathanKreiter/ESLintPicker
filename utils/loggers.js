const chalk = require('chalk');

const info = { 
    log (input) { 
        console.log(input);
    },
    aliasNameColor (alias)  {
        return chalk.cyanBright(alias); 
    },
    descripColor (description) { 
        return chalk.blueBright(description);
    },
    fileFormatColor (fileFormat) { 
        return chalk.yellowBright(fileFormat);
    }
}

const err = { 
    logRed (input) { 
        console.error(chalk.redBright(input));
    }, 
    catchExceptionOutput(input) { 
        switch (input) { 
            case 'EEXIST':
                this.logRed('Alias already exists. Please use another alias or \'eslp update -a <alias>\' to update current file.') 
                break;
            case 'DOES_NOT_EXIST': 
                this.logRed('Alias does not exist. Please use \'--list\' or \'-l\' to look up current saved aliases.');
                break;
            case 'ESLF_DOES_NOT_EXIST':
                this.logRed('Cannot locate ESLint file in current working directory. Are you sure there is one to save?')
                break;
            case 'ENOENT': 
                this.logRed('Dir error: cannot located ESLint file...');
                break;
            default: 
                if (input === undefined) { 
                    this.logRed('Error occured, please try again')
                    return;
                }
                this.logRed(input);
        }

    }
}


module.exports = { 
    info,
    err
}