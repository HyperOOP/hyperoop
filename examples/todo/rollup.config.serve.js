import serve  from 'rollup-plugin-serve';
import config from './rollup.config';

config.plugins.push(serve('dist'));

export default config;