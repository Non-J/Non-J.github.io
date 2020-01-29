const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    devtool: 'eval-cheap-module-source-map',
    entry: {
        'global': './src/js/global.js',
        'index': './src/js/index.js',
        'portfolio': './src/js/portfolio.js',
        'showcase': './src/js/showcase.js',
        'contact': './src/js/contact.js'
    },
    devServer: {
        port: 8080,
        contentBase: path.join(__dirname, "dist")
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
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[path][name].[ext]?hash=[hash:20]',
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
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
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
        new MiniCssExtractPlugin({
            filename: 'styles.[contenthash].css'
        }),
    ],
    optimization: {}
};
