require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');

var isProduction = process.env.NODE_ENV === 'production';
var template = process.env.TEMPLATE;

var productionPluginDefine =
    [
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) })
    ];
var clientLoaders = isProduction
    ? productionPluginDefine.concat([
        // new webpack.optimize.OccurrenceOrderPlugin(),
        new Dotenv()
    ])
    : productionPluginDefine.concat([
        new webpack.optimize.OccurrenceOrderPlugin(),
        new Dotenv(),
        new webpack.SourceMapDevToolPlugin({ filename: '[file].map' }),
        new webpack.HotModuleReplacementPlugin()
    ]);
var commonLoaders = [
    {
        test: /\.json$/,
        loader: 'json-loader'
    }
];

var commonRules = [
    {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader'
        }
    },
    {
        test: /\.html$/,
        use: [
            {
                loader: 'html-loader'
            }
        ]
    }
];

var optimization =
{
    minimize: true,
    minimizer: [
        new TerserPlugin({
            terserOptions: {
                output: {
                    comments: false
                }
            },
            extractComments: false
        })
    ]
};

var bundleAllJs = [
    './src/scripts/shared/unauthorized-access.js',
    './src/scripts/shared/header.js',
    './src/scripts/shared/sidebar.js',
    './src/scripts/shared/footer.js',
    './src/views/error.jsx',
    './src/scripts/home/index.js',
    './src/scripts/login/landing.js',
    './src/scripts/item/index.js',
    './src/scripts/purchase/index.js',
    './src/scripts/checkout/delivery.js',
    './src/scripts/delivery/settings.js',
    './src/scripts/delivery/add-edit.js',
    './src/scripts/user/settings.js',
    './src/scripts/merchant/dashboard.js',
    './src/scripts/merchant/settings.js',
    './src/scripts/merchant/order.js',
    './src/scripts/storefront/index.js',
    './src/scripts/inbox/index.js',
    './src/scripts/checkout/review.js',
    './src/scripts/search/index.js',
    './src/scripts/checkout/checkout-complete.js',
    './src/scripts/merchant/upload-edit.js',
    './src/scripts/comparison/list.js',
    './src/scripts/comparison/detail.js',
    './src/scripts/merchant/item-list.js',
    './src/scripts/policy/index.js',
    './src/scripts/chat/index.js',
    './src/scripts/cart/index.js',
    './src/scripts/approval/index.js',
    './src/scripts/checkout/payment.js',
    './src/scripts/sub-account/index.js',
    './src/scripts/checkout/one-page-checkout.js',
    './src/scripts/quotation/index.js',
    './src/scripts/requisition/index.js',
    './src/scripts/activity-log/index.js',
    './src/scripts/receiving-note/index.js',
    './src/scripts/invoice/index.js',
    './src/scripts/payment-gateway/index.js',
    './src/scripts/user-group/index.jsx',
    './src/scripts/account-permission/index.jsx'
];


module.exports = [
    {
        entry: [
            './src/public/static.js'
        ],
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'static.js',
            publicPath: '/'
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            port: 9000
        },
        plugins: productionPluginDefine.concat([
            new CopyPlugin([
                { from: '.env', to: '' },
                { from: 'src/views/error.html', to: 'views/error.html' },
                { from: 'src/public/favicon.ico', to: 'public/favicon.ico' },
                { from: 'src/public/css', to: 'public/css' },
                { from: 'src/public/js', to: 'public/js' },
                { from: 'src/public/fonts', to: 'public/fonts' },
                { from: 'src/public/images', to: 'public/images' }
            ], { logLevel: 'silent' })
        ]),
        module: {
            rules: commonLoaders
        },
        resolve: {
            extensions: ['.js', '.jsx']
        }
    },
    {
        entry: [
            './src/server.js'
        ],
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'server.js',
            libraryTarget: 'commonjs2',
            publicPath: '/'
        },
        target: 'node',
        node: {
            console: false,
            global: false,
            process: false,
            Buffer: false,
            cryto: true,
            __filename: false,
            __dirname: false
        },
        externals: nodeExternals(),
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            port: 9000
        },
        plugins: productionPluginDefine,
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                }
            ].concat(commonLoaders)
        },
        resolve: {
            extensions: ['.js', '.jsx']
        }
    },
    {
        entry: bundleAllJs,
        output: {
            path: path.join(__dirname, '/dist/scripts/'),
            publicPath: '/',
            filename: 'bundle.js'
        },
        optimization: optimization,
        externals: {
            jquery: 'jQuery',
            jQuery: 'jQuery',
            $: 'jQuery',
            'window.jQuery': 'jQuery',
            'window.$': 'jQuery'
        },
        plugins: clientLoaders.concat([
        ]),
        module: {
            rules: commonRules
        },
        resolve: {
            extensions: ['.js', '.jsx']
        }
    }
];
