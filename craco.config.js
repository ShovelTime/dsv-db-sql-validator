const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    webpack: {
      plugins: {
	add: [ new WasmPackPlugin({
            crateDirectory: './src/sql-static-analyzer/',
	    outDir: path.resolve(__dirname, './public/dist/sql-static-analyzer.rs'),
	    outName: "sql-static-analyzer",

            // Check https://rustwasm.github.io/wasm-pack/book/commands/build.html for
            // the available set of arguments.
            //
            // Optional space delimited arguments to appear before the wasm-pack
            // command. Default arguments are `--verbose`.
            args: '--log-level warn --verbose',
            // Default arguments are `--typescript --target browser --mode normal`.
            //extraArgs: '',

        })],

      },
      configure: (webpackConfig) => {
        // Needed for sql.js
        webpackConfig.resolve.fallback = {
          fs: require.resolve("browserify-fs"),
          stream: require.resolve('stream-browserify'),
          crypto: require.resolve('crypto-browserify'),
          vm: false,
        };
  
        // Add the 'module' configuration for handling .wasm fileshttps://rustwasm.github.io/wasm-pack/book/commands/build.html
        webpackConfig.module.rules.push({
          test: /\.wasm$/,
          type: 'javascript/auto',
        });
    
      return webpackConfig;
    },

  },
};
  
