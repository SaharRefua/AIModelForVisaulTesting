// src/utils/assert.js

const assert = require('assert');

function assertClassProbability(predictions, className, threshold) {
    const classPrediction = predictions.find(p => p.label === className);
    assert(classPrediction.probability >= threshold, 
      `Expected "${className}" probability to be above ${threshold}, but got ${classPrediction.probability}`);
    console.log(`Assertion passed: "${className}" probability is above ${threshold}`);
}

module.exports = {
    assertClassProbability,
};