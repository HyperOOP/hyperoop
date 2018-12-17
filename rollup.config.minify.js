import config     from './rollup.config'
import { uglify } from 'rollup-plugin-uglify';
import gzip       from 'rollup-plugin-gzip';

config.plugins.push(uglify(), gzip());

export default config