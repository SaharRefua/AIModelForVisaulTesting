// src/webdriver/driver.js
const { Builder, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config/config');

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('ignore-certificate-errors');  // Add this line to ignore certificate errors

  const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: config.implicitTimeout });
  return driver;
}

async function quitDriver(driver) {
  await driver.quit();
}

module.exports = {
  createDriver,
  quitDriver,
};