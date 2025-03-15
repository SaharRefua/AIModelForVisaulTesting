//src/utils/imageProcessor.js
const { Image, createCanvas } = require('canvas');
const tf = require('@tensorflow/tfjs');

async function convertBase64ToImage(base64Data) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (error) => reject(new Error('Failed to load image: ' + error));
        img.src = `data:image/png;base64,${base64Data}`;
    });
}

async function createImageTensor(image, width, height) {
    try {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');
        
        // Clear the canvas and draw the image
        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        
        // Create tensor directly from canvas
        const tensor = tf.browser.fromPixels(canvas)  // Use canvas directly
            .toFloat()
            .div(255.0)  // Normalize to [0,1]
            .expandDims(0);  // Add batch dimension
            
        return tensor;
    } catch (error) {
        throw new Error(`Failed to create image tensor: ${error.message}`);
    }
}

module.exports = { convertBase64ToImage, createImageTensor };