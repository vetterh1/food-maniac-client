/*
 *    USAGE:
 *
 *    1 - Set Dev or Prod env:
 *
 *    - Unix: 
 *            NODE_ENV=production
 *            NODE_ENV=dev
 *        
 *    - Windows: 
 *            SET "NODE_ENV=production"
 *            SET "NODE_ENV=dev"
 *
 *    2 - Build only: add "npm run build"
 *
 *            ...env... npm run build
 *
 *    3 - Build & Run: add "npm start"
 *    
 *            ...env... npm start
 *
 *    4 - Process Manager
 *
 *          npm run pm2:restart
 * 
 *    Note on combining: 
 *    - Unix: NODE_ENV=production; npm start
 *    - Windows: SET "NODE_ENV=dev" && npm start
 *
 *    Examples:
 *
 *          NODE_ENV=production npm run build
 *          npm run pm2:restart
 *    
 */


var webpack = require('webpack')

console.log("[lve] Start webpack");

var plugins = [];
if(process.env.NODE_ENV === 'production'){
  console.log("[lve] Production mode");
  plugins.push(    
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );
}
else {  
  console.log("[lve] NOT in Production mode");
}

/* Plugin to inject bundle dist path in index.html */  
if(process.env.NODE_SERVER_RENDER != 'true'){
  console.log("[lve] NOT in Server rendering mode");
  var HtmlWebpackPlugin = require('html-webpack-plugin');
  var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: __dirname + '/app/index.html',
    filename: 'index.html',
    inject: 'body'
  });
  plugins.push( HTMLWebpackPluginConfig );
} else {
    console.log("[lve] NOT in Server rendering mode");
}



/*
 *   Loaders:
 *   - babel: ES6 --> ES5
 *   - babel: JSX --> JS
 *   
 */
var loaders = ['babel-loader?presets[]=es2015&presets[]=react'];
if(process.env.NODE_ENV != 'production'){
  // loaders.push('react-hot');
}


module.exports = {
  entry: [
    './app/index.js'
  ],
  output: {
    filename: "/bundle.js",
    path: __dirname + '/dist'
  },
  /*
   * In prod mode: call minifiers plugins
   * (in addition to the inject bundle plugin )
   */
  plugins: 
    plugins,
  module: {
    loaders: [{ 
      test: /\.js$/, 
      exclude: /node_modules/, 
      loaders: loaders
    }]
  },
  devServer: {
    inline:true,
    port: 8080
  }
}
