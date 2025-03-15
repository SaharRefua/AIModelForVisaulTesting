const { Builder, By } = require('selenium-webdriver');
const tf = require('@tensorflow/tfjs-node');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { Image, createCanvas } = require('canvas');

// --------------------- Config Data --------------------------- //
const url = 'https://atid.store/contact-us/';
const byElement = By.name('wpforms[submit]');                    //wpforms[fields][2]
// ------------------------------------------------------------- //

(async () => {
  const driver = new Builder().forBrowser('chrome').build();
  try {
    await driver.manage().setTimeouts({ implicit: 2000 });

    console.log('Reading model and metadata files...');
    // Read the model and metadata files from the file system
    const modelPath = path.resolve(__dirname, '../model/model.json');
    const metadataPath = path.resolve(__dirname, '../model/metadata.json');
    const weightsPath = path.resolve(__dirname, '../model/weights.bin');

    const modelJSON = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    const metadataJSON = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const weightsData = new Uint8Array(fs.readFileSync(weightsPath));

    console.log('Combining model artifacts...');
    // Combine model JSON and weights data into a single ModelArtifacts object
    const modelArtifacts = {
      modelTopology: modelJSON.modelTopology,
      weightSpecs: modelJSON.weightsManifest[0].weights,
      weightData: weightsData
    };

    console.log('Loading the model...');
    // Load the model using the ModelArtifacts object
    const model = await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
    console.log('Model loaded successfully.');

    await driver.get(url);
    console.log('Navigated to the website.');

    // Locate the UI element you want to test
    const element = await driver.findElement(byElement);
    console.log('Element found.');

    console.log('Taking screenshot...');
    // Take a screenshot of the element
    const screenshot = await element.takeScreenshot(true);
    console.log('Screenshot taken.');

    const base64Data = screenshot.replace(/^data:image\/png;base64,/, "");

    // Convert the base64 image to an HTMLImageElement
    console.log('Converting screenshot to image...');
    const image = new Image();
    image.onload = async () => {
      try {
        console.log('Image loaded.');

        // Make a prediction
        console.log('Making prediction...');
        const prediction = await predict(image, model, metadataJSON);
        console.log('Prediction made:', prediction);

        // Use the generic assertion function
        assertClassProbability(prediction, 'Clickables', 0.90);
      } catch (error) {
        console.error('An error occurred during prediction or assertion:', error);
      } finally {
        await driver.quit();
      }
    };

    image.onerror = async (error) => {
      console.error('Error loading image:', error);
      await driver.quit();
    };

    image.src = `data:image/png;base64,${base64Data}`;
  } catch (error) {
    console.error('An error occurred:', error);
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
  const imageTensor = tf.browser.fromPixels(canvas).toFloat().expandDims();
  console.log('Image tensor:', imageTensor);

  console.log('Running model prediction...');
  const predictionTensor = await model.predict(imageTensor);
  console.log('Prediction tensor:', predictionTensor);

  // Get data from tensor
  const predictions = await predictionTensor.array();
  console.log('Raw predictions:', predictions);

  // Ensure predictions are valid numbers
  return predictions[0].map((prediction, index) => ({
    className: metadata.labels[index],
    probability: parseFloat(prediction.toFixed(2))
  }));
}

function assertClassProbability(predictions, className, threshold) {
  const classPrediction = predictions.find(p => p.className === className);
  assert(classPrediction.probability >= threshold, 
    `Expected "${className}" probability to be above ${threshold}, but got ${classPrediction.probability}`);
  console.log(`Assertion passed: "${className}" probability is above ${threshold}`);
}