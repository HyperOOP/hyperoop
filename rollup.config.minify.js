import config     from './rollup.config'
import { terser } from 'rollup-plugin-terser';
import gzip       from 'rollup-plugin-gzip';

config.plugins.push(terser(), gzip());

export default config