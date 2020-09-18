const uiTitle = require('cliui')();
const uiList = require('cliui')();
const { info } = require('./loggers');

function listTitleUI() { 
    uiTitle.div({
        text: 'Alias',
        width: 20,
        padding: [0, 4, 1, 4],
    },
    {
        text: 'Format', 
        width: 20,
    },
    {
        text: 'Description',
        width: 20,
    },
    )
    return uiTitle.toString();
}

function listUI(alias, description, fileFormat) {
    uiList.div(
        {
            text: info.aliasNameColor(alias),
            width: 20,
            padding: [0, 4, 0, 4],
        },
        { 
            text: info.fileFormatColor(fileFormat), 
            width: 20,
            padding: [0, 4, 0, 0],
        },
        {
            text: info.descripColor(description),
            width: 40,
        },
    );
    return uiList.toString();
}

module.exports = {
    listUI,
    listTitleUI
};
