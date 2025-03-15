# AI-Powered Visual Testing Framework

This project demonstrates an innovative approach to visual testing of web applications using machine learning. It uses a trained TensorFlow.js model to identify and validate UI elements through image recognition, providing a more robust alternative to traditional selector-based testing.

## Project Overview

The framework combines several technologies:

- TensorFlow.js for running ML models in Node.js
- Selenium WebDriver for browser automation
- Custom image processing for element recognition
- Machine learning model trained on Teachable Machine

### Key Features

- Automated UI element detection
- Visual validation of web components
- Browser automation with Selenium
- Support for multiple UI element types (buttons, dropdowns, textboxes)

## Prerequisites

- Node.js 18.x or higher
- Chrome browser installed
- Git (for cloning the repository)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd AIModelForVisaulTesting
```

2. Install dependencies:

```bash
npm install
```

3. Required NPM packages:

- @tensorflow/tfjs
- @tensorflow/tfjs-node
- selenium-webdriver
- canvas
- chromedriver

## Project Structure

```
├── model/                  # Contains trained ML model files
│   ├── model.json         # Model architecture
│   ├── weights.bin        # Model weights
│   └── metadata.json      # Model metadata
├── src/
│   ├── ai/               # AI-related functionality
│   ├── utils/            # Utility functions
│   └── webdriver/        # Selenium WebDriver setup
└── scripts/              # Test scripts
```

## Usage

1. Running the test:

```bash
node scripts/test.js
```

2. Running with specific configuration:

```bash
node src/index.js
```

## Model Training

The ML model was trained using Google's Teachable Machine platform:
https://teachablemachine.withgoogle.com/train/image

To train your own model:

1. Visit the Teachable Machine website
2. Create a new Image Project
3. Add images for each UI element type (buttons, dropdowns, textboxes)
4. Train the model
5. Export as a TensorFlow.js model
6. Place the exported files in the `model/` directory

## Configuration

The project uses a configuration file (`src/config/config.js`) where you can specify:

- Target URLs for testing
- Element selectors
- Model parameters
- Assertion thresholds

## Troubleshooting

Common issues and solutions:

1. **TensorFlow.js Node backend error**: Install the required backend

   ```bash
   npm install @tensorflow/tfjs-node
   ```

2. **Canvas installation issues**: Install system dependencies

   ```bash
   # Ubuntu/Debian
   sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
   ```

3. **Chrome WebDriver version mismatch**: Update chromedriver
   ```bash
   npm install chromedriver@latest
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google's Teachable Machine for model training
- TensorFlow.js team for the excellent ML framework
- Selenium team for the WebDriver implementation
