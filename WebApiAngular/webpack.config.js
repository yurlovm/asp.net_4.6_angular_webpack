const path = require(`path`);
const webpack = require(`webpack`);
const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const CopyWebpackPlugin = require(`copy-webpack-plugin`);

const NODE_ENV = process.env.NODE_ENV || `development`;
const entryPoints = [`manifest`, `polyfills`, `sw-register`, `materialtheme`, `styles`, `vendor`, `app`];

module.exports = {
  entry: {
    app: `./main.ts`,
    polyfills: `./polyfills.ts`,
    vendor: `./vendor.ts`,
    styles: `./css/styles.css`,
    materialtheme: `./css/my-material-theme.scss`
  },
  context: path.join(__dirname, `src`), // make ./src folder as root for building process
  resolve: {
    modules: [`./node_modules`],
    extensions: [`.ts`, `.js`, `.css`, `scss`, `.html`]
  },
  resolveLoader: {
    modules: [`./node_modules`]
  },
  output: {
    path: path.join(__dirname, `client`),
    publicPath: `/`,
    filename: `[name]-[chunkhash].js`,
    library: `[name]`,
    chunkFilename: `[name]-[chunkhash].chunk.js`,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [`awesome-typescript-loader`, `angular2-template-loader`, `angular-router-loader?loader='system'`],
        exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.html$/,
        use: `raw-loader`
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/,
        use: `file-loader?name=images/[name]-[hash].[ext]`
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        use: `file-loader?name=fonts/[name]-[hash].[ext]`
      },
      {
        // css - The pattern matches application-wide styles, not Angular ones
        test: /\.css$/,
        include: path.join(__dirname, `src`, `css`),
        use: ExtractTextPlugin.extract({fallback: `style-loader`, use: [`css-loader?{"sourceMap":false,"importLoaders":1}`, `postcss-loader`]})
      },
      {
        // css - The pattern matches application-wide styles, not Angular ones
        test: /\.scss$|\.sass$/,
        include: path.join(__dirname, `src`, `css`),
        use: ExtractTextPlugin.extract({
          fallback: `style-loader`,
          use: [`css-loader?{"sourceMap":false,"importLoaders":2}`, `postcss-loader`, `sass-loader?{"sourceMap": false,"precision": 8,"includePaths": []}`]
        })
      },
      {
        // the second handles component-scoped styles (the ones specified in a component`s styleUrls metadata property)
        test: /\.css$/,
        include: [path.join(__dirname, `src`, `app`), path.join(__dirname, `node_modules`)],
        use: [`exports-loader?module.exports.toString()`, `css-loader?{"sourceMap":false,"importLoaders":1}`, `postcss-loader`]
      },
      {
        // the second handles component-scoped styles (the ones specified in a component`s styleUrls metadata property)
        test: /\.scss$|\.sass$/,
        include: [path.join(__dirname, `src`, `app`), path.join(__dirname, `node_modules`)],
        use: [
          `exports-loader?module.exports.toString()`,
          `css-loader?{"sourceMap":false,"importLoaders":2}`,
          `postcss-loader`,
          `sass-loader?{"sourceMap": false,"precision": 8,"includePaths": []}`
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.NoEmitOnErrorsPlugin(), // stops the build if there is any error, and no files in output
    new webpack.ContextReplacementPlugin( // Workaround for angular/angular#11580
        /angular(\\|\/)core(\\|\/)@angular/,
        path.join(__dirname, `src`)
    ),
    // use to define environment variables that we can reference within our application.
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(NODE_ENV)
      }
    }),
    new HtmlWebpackPlugin({
      template: `index.html`, // Webpack inject scripts and links into index.html
      chunks: `all`,
      excludeChunks: [],
      chunksSortMode: function sort(left, right) {
        let leftIndex = entryPoints.indexOf(left.names[0]);
        let rightindex = entryPoints.indexOf(right.names[0]);
        if (leftIndex > rightindex) {
          return 1;
        } else if (leftIndex < rightindex) {
          return -1;
        } else {
          return 0;
        }
      }
    }),
    // extract the webpack runtime, which contains references to all bundles and chunks anywhere in the build, into a separate bundle
    new webpack.optimize.CommonsChunkPlugin({name: `manifest`, minChunks: Infinity}),
    new webpack.optimize.CommonsChunkPlugin({
      name: `vendor`,
      minChunks(module, count) {
        return module.context && module.context.indexOf(`node_modules`) !== -1;
      },
      chunks: [`app`]
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: `node-async`,
      names: [`app`],
      async: true,
      children: true,
      minChunks: 2,
    }),
    new ExtractTextPlugin(
        {filename: `css/[name].[hash].css`, allChunks: true} // extracts embedded css as external files, adding cache-busting hash to the filename.
    ),
    new CopyWebpackPlugin([ // Copy files and directories in webpack.
      {from: `./images`, to: `images`}
    ]),
  ],
  devtool: `source-map`,
  node: {
    fs: `empty`,
    global: true,
    crypto: `empty`,
    tls: `empty`,
    net: `empty`,
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
