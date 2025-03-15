const { Builder, By } = require('selenium-webdriver');
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-cpu');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { Image, createCanvas, loadImage } = require('canvas');

// --------------------- Config Data --------------------------- //
const url = 'https://atid.store/contact-us/';
const byElement = By.name('wpforms[submit]');                    //wpforms[fields][2]
// ------------------------------------------------------------- //

async function loadModel() {
  console.log('Loading model files...');
  const modelPath = path.resolve('./model/model.json');
  const weightsPath = path.resolve('./model/weights.bin');
  
  const modelJSON = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  const weightsData = fs.readFileSync(weightsPath);
  
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
}

async function preprocessImage(imagePath) {
  console.log('Loading and preprocessing image...');
  const img = await loadImage(imagePath);
  
  // Create a canvas with the target dimensions
  const canvas = createCanvas(224, 224);
  const ctx = canvas.getContext('2d');
  
  // Draw and resize the image
  ctx.drawImage(img, 0, 0, 224, 224);
  
  // Get image data and normalize
  const imageData = ctx.getImageData(0, 0, 224, 224);
  const data = new Float32Array(224 * 224 * 3);
  
  // Convert to RGB and normalize to [0,1]
  for (let i = 0; i < imageData.data.length / 4; i++) {
    data[i * 3] = imageData.data[i * 4] / 255;
    data[i * 3 + 1] = imageData.data[i * 4 + 1] / 255;
    data[i * 3 + 2] = imageData.data[i * 4 + 2] / 255;
  }
  
  // Create tensor with correct shape [1, 224, 224, 3]
  const tensor = tf.tensor(data, [224, 224, 3]);
  return tf.expandDims(tensor, 0);
}

async function predict(model, imagePath, metadata) {
  try {
    // Load and preprocess image outside of tidy
    const input = await preprocessImage(imagePath);
    
    return tf.tidy(() => {
      console.log('Starting prediction...');
      console.log('Input tensor shape:', input.shape);
      const output = model.predict(input);
      const probabilities = output.dataSync();
      console.log('Prediction complete');
      
      // Format predictions with labels
      return metadata.labels.map((label, i) => ({
        label,
        probability: probabilities[i]
      })).sort((a, b) => b.probability - a.probability);
    });
  } catch (error) {
    console.error('Error during prediction:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Loading model and metadata...');
    const metadata = JSON.parse(fs.readFileSync('./model/metadata.json', 'utf8'));
    console.log('Metadata loaded:', metadata);
    
    const model = await loadModel();
    console.log('Model loaded successfully');
    
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get(url);
    
    const element = await driver.findElement(byElement);
    const screenshot = await element.takeScreenshot();
    
    // Save screenshot
    const screenshotPath = 'element.png';
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    
    // Make prediction
    const predictions = await predict(model, screenshotPath, metadata);
    console.log('\nPredictions:');
    predictions.forEach(({ label, probability }) => {
      console.log(`${label}: ${(probability * 100).toFixed(2)}%`);
    });
    
    // Verify the prediction meets the threshold
    const topPrediction = predictions[0];
    assertClassProbability(predictions, topPrediction.label, 0.33);
    
    await driver.quit();
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

function assertClassProbability(predictions, className, threshold) {
  const prediction = predictions.find(p => p.label === className);
  assert(prediction.probability >= threshold, 
    `Expected "${className}" probability to be above ${threshold}, but got ${prediction.probability}`);
  console.log(`Assertion passed: "${className}" probability is above ${threshold}`);
}

main();