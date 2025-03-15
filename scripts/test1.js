const { Builder, By } = require('selenium-webdriver');
const tf = require('@tensorflow/tfjs');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { Image, createCanvas } = require('canvas');

(async () => {
  // Set the backend to CPU
  await tf.setBackend('cpu');
  
  const url = 'https://atid.store/contact-us/'; 

  const driver = new Builder().forBrowser('chrome').build();

  try {
    await driver.manage().setTimeouts({ implicit: 2000 });
    
    console.log('Reading model and metadata files...');
    // Read the model and metadata files from the file system
    const modelPath = path.resolve('./model/model.json');
    const metadataPath = path.resolve('./model/metadata.json');

    const modelJSON = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    const metadataJSON = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    console.log('Loading the model...');
    // Load the model directly from the JSON file
    const model = await tf.loadLayersModel(tf.io.fromMemory(modelJSON));
    console.log('Model loaded successfully.');

    await driver.get(url);
    console.log('Navigated to the website.');

    // Locate the UI element you want to test
    const element = await driver.findElement(By.id('wpforms-15-field_0')); //wpforms-submit-15
    console.log('Element found.');

    console.log('Taking screenshot...');
    // Take a screenshot of the element
    const screenshot = await element.takeScreenshot(true);
    console.log('Screenshot taken.');

    const base64Data = screenshot.replace(/^data:image\/png;base64,/, "");

    // Convert the base64 image to an HTMLImageElement
    console.log('Converting screenshot to image...');
    const image = new Image();
    
    // Convert the onload callback to use Promise
    await new Promise((resolve, reject) => {
      image.onload = async () => {
        console.log('Image loaded.');
        try {
          // Make a prediction
          console.log('Making prediction...');
          const prediction = await predict(image, model, metadataJSON);
          console.log('Prediction made:', prediction);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      image.onerror = (error) => {
        console.error('Error loading image:', error);
        reject(error);
      };

      image.src = `data:image/png;base64,${base64Data}`;
    });

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await driver.quit();
  }
})();

async function predict(imageElement, model, metadata) {
  // Use imageSize from metadata for input resolution
  const inputResolution = { width: metadata.imageSize, height: metadata.imageSize };
  console.log('Creating canvas...');
  const canvas = createCanvas(inputResolution.width, inputResolution.height);
  const context = canvas.getContext('2d');
  console.log('Drawing image on canvas...');
  context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  console.log('Creating image tensor...');
  // Normalize the pixel values to [0, 1]
  const imageTensor = tf.browser.fromPixels(canvas)
    .toFloat()
    .div(tf.scalar(255))
    .expandDims();
  console.log('Image tensor:', imageTensor);

  console.log('Running model prediction...');
  const predictionTensor = await model.predict(imageTensor);
  console.log('Prediction tensor:', predictionTensor);

  // Get data from tensor
  const predictions = await predictionTensor.array();
  console.log('Raw predictions:', predictions);

  // Clean up tensors
  imageTensor.dispose();
  predictionTensor.dispose();

  // Ensure predictions are valid numbers
  return predictions[0].map((prediction, index) => ({
    className: metadata.labels[index],
    probability: prediction.toFixed(2)
  }));
}