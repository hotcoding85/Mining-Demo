const path = require('path');

module.exports = {
  entry: './src/index.tsx', // Adjust based on your entry point
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // Resolve both .tsx and .ts
    fallback: {
      path: require.resolve('path-browserify'),
      stream: require.resolve("stream-browserify")
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // Apply rule for .ts and .tsx files
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
};
