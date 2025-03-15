// src/ai/modelLoader.js
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');

async function loadModel(modelJSON, weightsData) {
    try {
        // Create model artifacts with the raw weights buffer
        const modelArtifacts = {
            modelTopology: modelJSON.modelTopology,
            format: 'layers-model',
            generatedBy: 'TensorFlow.js v1.7.4',
            convertedBy: null,
            weightsManifest: [{
                paths: ['weights.bin'],
                weights: modelJSON.weightsManifest[0].weights
            }],
            weightSpecs: modelJSON.weightsManifest[0].weights,
            weightData: weightsData.buffer.slice(weightsData.byteOffset, weightsData.byteOffset + weightsData.byteLength)
        };

        console.log('Creating model from artifacts...');
        return await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
    } catch (error) {
        throw new Error(`Failed to load model: ${error.message}`);
    }
}

module.exports = {
    loadModel,
};