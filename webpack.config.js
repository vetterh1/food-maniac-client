const logger = require('winston');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const devMode = process.env.NODE_ENV !== 'production'

//
// Configure winston logger (only console)
//

logger.addColors({
  debug: 'green',
  info: 'cyan',
  warn: 'yellow',
  error: 'red',
});

const customConsoleFormat = logger.format.printf((info) => {
  return `${info.timestamp} - ${info.level} - ${info.message}`;
});

const formatConsole = logger.format.combine(
  logger.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logger.format.colorize(),
  customConsoleFormat
);
logger.add(new logger.transports.Console({ format: formatConsole }));



// Get environment dependant values, to be passed to JS client through process.env:
const config = require('config');
const gateway = config.get('server.gateway');
const serverPort = config.get('server.server_port');
logger.info(`[FoServer] Gateway: ${gateway}`);
logger.info(`[FoServer] Server port: ${serverPort}`);


const childProcess = require('child_process');

logger.info('[FoServer] Start webpack (using webpack.config.js)');

const distPath = path.join(__dirname, '/distFoServer');
logger.info(`distPath: ${distPath}`);

const gitBranch = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString();
const gitLastCommitComment = childProcess.execSync('git log -1 --pretty=%B ').toString();
const gitLastCommitDate = childProcess.execSync('git log -1 --format=%cd').toString();
logger.info(`Branch: ${gitBranch}`);
logger.info(`Last commit comment: ${gitLastCommitComment}`);
logger.info(`Last commit date: ${gitLastCommitDate}`);

//
// Plug-ins (prod & dev)
//
// In prod mode: call minifiers plugins
// (in addition to the inject bundle plugin)
//

const plugins = [];

// Provide variables to JS client code (see Version component):
plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        NPM_VERSION: JSON.stringify(process.env.npm_package_version),
        GIT_BRANCH: JSON.stringify(gitBranch),
        GIT_LAST_COMMIT_COMMENT: JSON.stringify(gitLastCommitComment),
        GIT_LAST_COMMIT_DATE: JSON.stringify(gitLastCommitDate),
        GATEWAY: JSON.stringify(gateway),
      },
    })
);

plugins.push(
  new BundleAnalyzerPlugin({ analyzerMode: 'static', reportFilename: 'analyser.html', openAnalyzer: false })
);


logger.info('[FoServer] mode: ', process.env.mode);


// PRODUCTION OPTIMIZATIONS
if (process.env.NODE_ENV === 'production') {
  logger.info('[FoServer] Production mode');
  // plugins.push(
  //   new webpack.optimize.DedupePlugin(),
  //   new webpack.optimize.OccurrenceOrderPlugin(),
  // );
} else {
  logger.info('[FoServer] NOT in Production mode');
}

// Plugin to inject bundle dist path in index.html
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.join(__dirname, '/app/index.html'),
  filename: 'index.html',
  inject: 'body',
});
plugins.push(HTMLWebpackPluginConfig);


/*
 *   Loaders:
 *   - babel: ES6 --> ES5
 *   - babel: JSX --> JS
 *
 */

const loaders = ['babel-loader'];
if (devMode) {
  loaders.push('react-hot');
}



const jsEntry = [
  './app/index.jsx',
];

const cssEntry = [
  './app/index.css',
];

module.exports = {
  entry: {
    main: jsEntry, // Notice that we do not have an explicit vendor entry here
    styles: cssEntry,
    // vendor: ['react', 'react-dom', 'react-router-dom'],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'app',
      'node_modules',
    ],
  },

  output: {
    // filename: 'bundle.js',
    filename: '[name].[chunkhash].js',
    path: distPath,
    // chunkFilename: '[name].[hash].bundle.js',
  },

  plugins,

  optimization: {
    runtimeChunk: "single", // enable "runtime" chunk
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all"
        }
      }
    }
  },

  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: 'babel-loader' },
      // css loader to import CSS ES6 style (ex: import 'bootstrap/dist/css/bootstrap.css')
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
      },
      // { test: /\.css$/, use: 'style-loader!css-loader' },
      // loader for react-icons:
      // { test: /(\.js|\.jsx)$/, use: 'babel', include: [path.resolve(__dirname, './node_modules/react-icons/fa'), path.resolve(__dirname, './node_modules/react-icons/go')], query: { presets: ['es2015', 'stage-0', 'react'] } },
    ],
  },

  devServer: {
    historyApiFallback: true,
    inline: true,
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        secure: false,
      },
      '/util': {
        target: 'http://localhost:8085',
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:8085',
        secure: false,
      },
      '/static': {
        target: 'http://localhost:8085',
        secure: false,
      },
      '/logs': {
        target: 'http://localhost:8085',
        secure: false,
      },
    },
  },

  devtool: 'source-map',
};
