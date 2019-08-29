const TerserPlugin = require('terser-webpack-plugin');
const webpackMerge = require('webpack-merge');

const helpers = require('./helpers');
const commonConfig = require('./webpack.common.js');

module.exports = webpackMerge(commonConfig, {

    mode: 'production',

    output: {
        filename: '[name].min.js',
    },

    optimization: {
        noEmitOnErrors: true,
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
                cache: true,
                parallel: true,
                terserOptions: {
                    output: {
                        comments: false
                    },
                    compress: {
                        pure_getters: true,
                        passes: 3,
                        inline: 3
                    }
                }
            })
        ]
    }

});