import typescript from 'rollup-plugin-typescript2';
import resolve    from 'rollup-plugin-node-resolve';

export default {
    plugins: [
        typescript({
            typescript: require('typescript'),
            tsconfig: "./tsconfig.build.json"
        }),
        resolve(),
    ]
}