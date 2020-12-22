const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, './src/index.js'),
    },
    output: {
        chunkFilename: '[id].js'
    },
    module: {
        rules: [
            {
                test: /\.png$/,
                use: 'arraybuffer-loader'
            },
            {
                test: /\.js$/,
                use: 'babel-loader'
            }
        ]
    }
}