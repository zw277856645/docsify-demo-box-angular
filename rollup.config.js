import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import uglify from 'rollup-plugin-uglify';

export default {

    input: './src/docsify-demo-box-angular.ts',

    external: [ 'jquery' ],

    globals: {
        jquery: '$'
    },

    output: {
        file: './dist/docsify-demo-box-angular.bundle.js',
        format: 'iife',
        name: 'DemoBoxAngular',
        sourcemap: true
    },

    plugins: [
        typescript(),
        resolve(),
        commonjs(),
        uglify()
    ]
}