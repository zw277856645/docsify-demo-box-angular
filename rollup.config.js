import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import uglify from 'rollup-plugin-uglify';

export default {

    input: './src/docsify-demo-box-angular.ts',

    output: {
        file: './dist/docsify-demo-box-angular.umd.js',
        format: 'umd',
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