
const merge = require("webpack-merge"),
    Common = require("./webpack.common.js"),
    fse = require("fs-extra"),
    HttpsProxyAgent = require("https-proxy-agent"),
    // comment in to create a graphical representation of the bundle as html
    // BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin,
    /* eslint-disable n/no-process-env */
    proxyServer = process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
    proxyAgent = proxyServer !== undefined ? new HttpsProxyAgent(proxyServer) : "";


let proxies;

if (fse.existsSync("./devtools/proxyconf.json")) {
    proxies = require("./proxyconf.json");
}
else {
    proxies = require("./proxyconf_example.json");
}
if (fse.existsSync("./devtools/securedServices.js")) {
    const securedServices = require("./securedServices.js");

    let securedProxy = proxies["/secure_"];

    securedProxy = securedServices.addHeader(securedProxy);
    proxies["/secure_"] = securedServices.pathRewrite(securedProxy);
}

Object.keys(proxies).forEach(proxy => {
    if (proxies[proxy].agent !== undefined) {
        proxies[proxy].agent = proxyAgent;
    }
});

module.exports = function () {
    return merge.smart({
        mode: "development",
        devtool: "cheap-module-eval-source-map",
        devServer: {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            https: true,
            open: false,
            openPage: "portal/master",
            overlay: true,
            port: 9001,
            proxy: proxies,
            publicPath: "/build/"
        },
        module: {
            rules: [
                // Bootstrap Icons are read by bootstrap
                {
                    test: /bootstrap-icons\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        publicPath: "../../node_modules/bootstrap-icons/font/fonts"
                    }
                },
                // all other fonts
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        publicPath: "../../src/assets/css/fonts"
                    }
                }
            ]
        }
        // comment in to create a graphical representation of the bundle as html that is automatically displayed in the browser at 'npm run start'
        // ,plugins: [
        //     new BundleAnalyzerPlugin()
        // ]
    }, new Common());
};
