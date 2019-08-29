const helpers = require('./helpers');

module.exports = {

    node: false,

    mode: "development",

    devtool: 'source-map',

    entry: {
        'docsify-demo-box-angular': './src/docsify-demo-box-angular.ts'
    },

    resolve: {
        extensions: [ '.ts', '.js' ]
    },

    output: {
        path: helpers.root('dist'),
        filename: '[name].js',
        library: 'DemoBoxAngular',
        libraryTarget: 'umd'
    },

    performance: {
        hints: false
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    }
};