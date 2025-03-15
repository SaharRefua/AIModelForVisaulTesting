// src/ai/predictor.js

const { createImageTensor } = require('../utils/imageProcessor');
const { log } = require('../utils/logger');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');

async function predict(image, model, metadata) {
    let imageTensor = null;
    try {
        const inputResolution = { width: metadata.imageSize, height: metadata.imageSize };
        imageTensor = await createImageTensor(image, inputResolution.width, inputResolution.height);
        
        return tf.tidy(() => {
            const predictionTensor = model.predict(imageTensor);
            const predictions = predictionTensor.arraySync()[0];
            
            // Log raw predictions
            log('Raw predictions:', JSON.stringify(predictions, null, 2));
            
            const formattedPredictions = predictions.map((prediction, index) => ({
                label: metadata.labels[index],
                probability: parseFloat(prediction.toFixed(2)),
            }));
            
            // Log formatted predictions
            log('Prediction made:', JSON.stringify(formattedPredictions, null, 2));
            
            return formattedPredictions;
        });
    } finally {
        // Clean up any tensors that might be left
        if (imageTensor) {
            tf.dispose(imageTensor);
        }
    }
}

module.exports = {
    predict,
};