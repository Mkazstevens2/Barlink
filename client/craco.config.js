const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    configure: (config) => {
      // provide fallbacks for Node core modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve('process/browser'),
        http: require.resolve('stream-http'),
        url: require.resolve('url'),
      };
      // alias http imports to your local shim
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        http: path.resolve(__dirname, 'src/shims/http.js'),
      };
      // inject process globally
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );
      return config;
    },
  },
};
