// src/webdriver/actions.js
const { By } = require('selenium-webdriver');

async function navigateTo(driver, url) {
  await driver.get(url);
}

async function findElement(driver, selector) {
  return await driver.findElement(By.name(selector));
}

async function takeScreenshot(element) {
  return await element.takeScreenshot(true);
}

module.exports = {
  navigateTo,
  findElement,
  takeScreenshot,
};