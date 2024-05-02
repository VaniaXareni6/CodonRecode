const fs = require('fs');

function readFile(fileToRead) {
    try {
        return fs.readFileSync(fileToRead, 'utf8');
    } catch (err) {
        console.error(`Error reading file ${fileToRead}: ${err}`);
    }
};

function writeFile(fileData) {
    try {
        return fs.writeFileSync('recodificatedGenea.txt', fileData, { encoding: 'utf8', flag: 'a' });
    } catch (err) {
        console.error(`Error reading file ${fileToRead}: ${err}`);
    }
};

function getFileLines(fileToSplit) {
    return fileToSplit.split(/\n/);
};

function getObjectLength(obj) {
    return Object.entries(obj).length
};

function isObjectEmpty(obj) {
    return getObjectLength(obj) === 0;
};

function getGroupOfThreeChars(str) {
    return str.toUpperCase().match(/.{3}/g);
};

module.exports = {
    readFile,
    getFileLines,
    isObjectEmpty,
    getGroupOfThreeChars,
    getObjectLength,
    writeFile
};
