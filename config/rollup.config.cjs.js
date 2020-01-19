import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

export default {
	input: './src/index.ts',
  output: {
    file: './build/cjs/index.js',
    format: 'cjs'
  },
	plugins: [
    typescript({
      tsconfig: "./config/tsconfig.cjs.json",
      module: 'CommonJS'
    }),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      extensions: [ '.js', '.ts' ],
    }),
    uglify()
	]
}