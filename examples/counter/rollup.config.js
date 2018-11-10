import typescript from 'rollup-plugin-typescript2';
import resolve    from 'rollup-plugin-node-resolve';
import commonjs   from 'rollup-plugin-commonjs';
import copy       from 'rollup-plugin-copy';
 
export default {
    plugins: [
        typescript({
            typescript: require('typescript'),
        }),
        resolve(),
        commonjs({
            namedExports: {
                '../../dist/hyperoop.js': [ 'h', 'init', 'actions', 'view' ]
            }
        }),
        copy({
            "src/index.html": "dist/index.html",
            "src/index.css": "dist/index.css"
        })
    ]
}