//src/utils/logger.js

function log(...messages) {
    console.log(...messages);
}
function logError(...errors) {
    console.error(...errors);
}
module.exports = {log, logError};