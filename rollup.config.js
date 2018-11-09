import typescript from 'rollup-plugin-typescript2';
import resolve    from 'rollup-plugin-node-resolve';
import gzip       from 'rollup-plugin-gzip';
import commonjs   from 'rollup-plugin-commonjs';
 
export default {
    plugins: [
        typescript({
            typescript: require('typescript'),
        }),
        commonjs({
            namedExports: {
                '../history/dist/undoredo.js': [ 'Hist', 'Record' ]
            }
        }),
        resolve(),
        gzip()
    ]
}