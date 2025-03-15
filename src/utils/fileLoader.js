//src/utils/fileLoader.js

const fs = require('fs');
const path = require('path');

function loadFile(filePath) {
    try {
        const fullPath = path.resolve(__dirname, filePath);
        return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch (error) {
        console.error(`Error loading file: ${filePath}`, error);
        throw error;
    }
}
function loadBinaryFile(filePath) {
    try {
        const fullPath = path.resolve(__dirname, filePath);
        return new Uint8Array(fs.readFileSync(fullPath));
    } catch (error) {
        console.error(`Error loading binary file: ${filePath}`, error);
        throw error;
    }
}

module.exports = {loadFile, loadBinaryFile};