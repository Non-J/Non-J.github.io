const path = require('path');

const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const buildPath = path.resolve(__dirname, 'dist');

module.exports = {
    entry: {
        'global': './src/js/global.js',
        'index': './src/js/index.js',
        'portfolio': './src/js/portfolio.js',
        'showcase': './src/js/showcase.js',
        'contact': './src/js/contact.js'
    },
    output: {
        filename: '[name].[hash:20].js',
        path: buildPath
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            },
            {
                test: /\.(scss|css|sass)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[hash:20].[ext]',
                            limit: 8192
                        }
                    }
                ]
            },
            {
                test: /\.(eot|woff|woff2|svg|ttf)([\?]?.*)$/,
                use: [
                    {
                        loader: 'file-loader',
                    }
                ]
            }
        ]
    },
    plugins: [
        new z({
            filename: 'index.html',
            template: './src/index.html',
            inject: 'body',
            chunks: ['global', 'index']
        }),
        new HtmlWebpackPlugin({
            filename: 'portfolio.html',
            template: './src/portfolio.html',
            inject: 'body',
            chunks: ['global', 'portfolio']
        }),
        new HtmlWebpackPlugin({
            filename: 'showcase.html',
            template: './src/showcase.html',
            inject: 'body',
            chunks: ['global', 'showcase']
        }),
        new HtmlWebpackPlugin({
            filename: 'contact.html',
            template: './src/contact.html',
            inject: 'body',
            chunks: ['global', 'contact']
        }),
        new CleanWebpackPlugin.CleanWebpackPlugin(),
        new FaviconsWebpackPlugin({
            logo: './src/assets/icon.png',
            prefix: 'icons-[hash]/',
            persistentCache: true,
            inject: true,
            background: '#121212',
            title: 'Non-J.github.io',
            favicons: {
                appName: 'Non-J Github Page',
                appDescription: 'Non-J Personal Github Page',
                developerName: 'Non-J',
                developerURL: 'https://Non-J.github.io',
                background: '#121212',
                theme_color: '#FFCA28',
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.[contenthash].css'
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin({
                parallel: true,
            }),
            new OptimizeCssAssetsPlugin({
                cssProcessor: require('cssnano'),
                cssProcessorOptions: {
                    discardComments: {
                        removeAll: true
                    },
                    discardUnused: false
                },
                canPrint: true
            }),
        ],
    }
};
