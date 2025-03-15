//src/config/config.js

module.exports = {
    url: 'https://atid.store/contact-us/',
    byElement: {name: 'wpforms[submit]'},
    threshold: 0.33,
    
    modelPath: '../../model/model.json',
    weightsPath: '../../model/weights.bin',
    metadataPath: '../../model/metadata.json',
    implicitTimeout: 2000,
}
