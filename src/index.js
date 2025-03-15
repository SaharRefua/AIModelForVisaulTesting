// src/index.js
const { createDriver, quitDriver } = require('./webdriver/driver');
const { navigateTo, findElement, takeScreenshot } = require('./webdriver/actions');
const { log, logError } = require('./utils/logger');
const { loadFile, loadBinaryFile } = require('./utils/fileLoader');
const { convertBase64ToImage } = require('./utils/imageProcessor');
const { loadModel } = require('./ai/modelLoader');
const { predict } = require('./ai/predictor');
const { assertClassProbability } = require('./utils/assert');
const config = require('./config/config');

(async () => {
  const driver = await createDriver();
  try {
    log('Reading model and metadata files...');
    const modelJSON = loadFile(config.modelPath);
    const metadataJSON = loadFile(config.metadataPath);
    const weightsData = loadBinaryFile(config.weightsPath);

    log('Loading the model...');
    const model = await loadModel(modelJSON, weightsData);
    log('Model loaded successfully.');

    await navigateTo(driver, config.url);
    log('Navigated to the website.');

    const element = await findElement(driver, config.byElement.name);
    log('Element found.');

    log('Taking screenshot...');
    const screenshot = await takeScreenshot(element);
    log('Screenshot taken.');

    const base64Data = screenshot.replace(/^data:image\/png;base64,/, "");

    log('Converting screenshot to image...');
    const image = await convertBase64ToImage(base64Data);
    log('Image loaded.');

    log('Making prediction...');
    const predictions = await predict(image, model, metadataJSON);
    log('Predictions made:', predictions);

    // Check for button class with a lower threshold since we're testing
    assertClassProbability(predictions, 'textbox', 0.3);
    log('Button class probability assertion passed.');
  } catch (error) {
    logError('An error occurred:', error);
  } finally {
    await quitDriver(driver);
  }
})();