const path = require('path');

module.exports = {
  //mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
	publicPath: '/dist/'
  },
  devServer: {
	  overlay: true
  },
  module: {
    rules: [ 
      {
        test: /\.(js|jsx)$/,
        exclude: '/node_modules/',
        use: ['babel-loader'],
      }
    ]
  }
};