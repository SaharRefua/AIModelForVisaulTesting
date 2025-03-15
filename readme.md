# Creating an exmaple of visual testing via ai modle

## The modle created in

url: https://teachablemachine.withgoogle.com/train/image

# use node 18

install the dependncy
npm install

## Running command :

node scripts/test.js

## Project Structure

```
├── src/                    # Source code directory
│   ├── ai/                # AI model integration
│   ├── config/            # Configuration files
│   ├── utils/             # Utility functions
│   ├── webdriver/         # Selenium WebDriver code
│   └── index.js          # Main application entry point
│
├── scripts/               # Test execution scripts
│   ├── test1.js          # Test script 1
│   ├── test2.js          # Test script 2
│   └── test3.js          # Test script 3
│
├── model/                 # AI model files
├── testingData/          # Data used for testing
├── trainingData/         # Data used for model training
├── node_modules/         # Node.js dependencies
├── package.json          # Project dependencies and scripts
└── package-lock.json     # Locked versions of dependencies
```

This project is structured to separate concerns between AI model integration, test execution, and data management. The `src` directory contains the core functionality, while `scripts` holds various test implementations. Training and testing data are kept in separate directories for better organization.
