import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import uglify from 'rollup-plugin-uglify';
// import { minify } from 'uglify-js';

export default {
  entry: 'src/index.js',
  format: 'cjs',
  dest: 'dist/bundle.js',
  plugins: [
    resolve(),
    commonjs({
      include: [
        'node_modules/axios/index.js',
        'node_modules/dataloader/index.js',
        'node_modules/normalizr/dist/src/index.js',
        'node_modules/lodash/uniq.js',
        'node_modules/deprecated-decorator/bld/index.js'
      ],
      namedExports: {
    // left-hand side can be an absolute path, a path
    // relative to the current directory, or the name
    // of a module in node_modules
        // 'node_modules/graphql-tools/dist/index.js': [ 'makeExecutableSchema' ]
  }
    }),
    babel({
      include: [
        'src/**',
        'node_modules/**',
      ]
      // exclude: 'node_modules/**'
    }),
    // uglify({
    //   output: {
    //     beautify: false,
    //     comments: false
    //   },
    //   compress: true,
    //   mangle: true
    // }, minify)
  ],
  external: ['graphql']
};
