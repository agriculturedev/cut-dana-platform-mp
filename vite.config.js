// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'fs-extra';
import https from 'https';

const rootPath = path.resolve(__dirname, "./");
const addonBasePath = path.resolve(rootPath, "addons");
const addonConfigPath = path.resolve(addonBasePath, "addonsConf.json");

// Load addons configuration
let addonEntryPoints = {};
if (!fs.existsSync(addonConfigPath)) {
    console.warn("NOTICE: " + addonConfigPath + " not found. Skipping all addons.");
} else {
    addonEntryPoints = JSON.parse(fs.readFileSync(addonConfigPath, 'utf8'));
}

// Process addons
function processAddons() {
    const addonsRelPaths = {};
    const vueAddonsRelPaths = {};

    for (const addonName in addonEntryPoints) {
        let isVueAddon = false;
        let addonPath = addonName;
        let entryPointFileName = "";

        if (typeof addonEntryPoints[addonName] === "string") {
            entryPointFileName = addonEntryPoints[addonName];
        }

        // Vue addon check
        if (typeof addonEntryPoints[addonName] === "object" && addonEntryPoints[addonName].type !== undefined) {
            isVueAddon = true;

            if (typeof addonEntryPoints[addonName].entryPoint === "string") {
                entryPointFileName = addonEntryPoints[addonName].entryPoint;
            } else {
                entryPointFileName = "index.js";
            }

            if (typeof addonEntryPoints[addonName].path === "string") {
                addonPath = addonEntryPoints[addonName].path;
            }
        }

        const addonCombinedRelpath = [addonPath, entryPointFileName].join("/");

        // Check if file exists
        if (!fs.existsSync(path.resolve(addonBasePath, addonCombinedRelpath))) {
            console.error("############\n------------");
            throw new Error("ERROR: FILE DOES NOT EXIST \"" + path.resolve(addonBasePath, addonCombinedRelpath) + "\"\nABORTED...");
        }

        if (isVueAddon) {
            vueAddonsRelPaths[addonName] = Object.assign({
                "entry": addonCombinedRelpath
            }, addonEntryPoints[addonName]);
        } else {
            addonsRelPaths[addonName] = addonCombinedRelpath;
        }
    }

    return { addonsRelPaths, vueAddonsRelPaths };
}

// Load proxy configuration
let proxies = {};
if (fs.existsSync("./devtools/proxyconf.json")) {
    proxies = JSON.parse(fs.readFileSync("./devtools/proxyconf.json", 'utf8'));
} else {
    proxies = JSON.parse(fs.readFileSync("./devtools/proxyconf_example.json", 'utf8'));
}

// Handle secured services
if (fs.existsSync("./devtools/securedServices.js")) {
    const { addHeader, pathRewrite } = require("./devtools/securedServices.js");
    let securedProxy = proxies["/secure_"];
    securedProxy = addHeader(securedProxy);
    proxies["/secure_"] = pathRewrite(securedProxy);
}

// Convert webpack proxy format to Vite proxy format
function convertProxies(proxyConfig) {
    const result = {};

    for (const [context, options] of Object.entries(proxyConfig)) {
        result[context] = {
            target: options.target,
            changeOrigin: true,
            secure: options.secure !== false,
            ws: !!options.ws,
            rewrite: options.pathRewrite ?
                (path) => {
                    for (const [pattern, replacement] of Object.entries(options.pathRewrite)) {
                        const regex = new RegExp(pattern);
                        if (regex.test(path)) {
                            return path.replace(regex, replacement);
                        }
                    }
                    return path;
                } : undefined
        };

        // Apply custom headers if they exist
        if (options.headers) {
            result[context].configure = (proxy, _options) => {
                proxy.on('proxyReq', (proxyReq) => {
                    for (const [header, value] of Object.entries(options.headers)) {
                        proxyReq.setHeader(header, value);
                    }
                });
            };
        }
    }

    return result;
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const { addonsRelPaths, vueAddonsRelPaths } = processAddons();

    // Check for proxy environment variables
    const proxyUrl = env.HTTPS_PROXY || env.HTTP_PROXY;
    let agent;

    if (proxyUrl) {
        agent = new https.Agent({
            rejectUnauthorized: false,
            // You'll need to implement your own HTTPS proxy agent or use a library
            // This is a simplified equivalent to HttpsProxyAgent
        });
    }

    // Apply proxy agent if configured
    if (agent) {
        for (const proxy of Object.values(proxies)) {
            if (proxy.agent !== undefined) {
                proxy.agent = agent;
            }
        }
    }

    return {
        root: rootPath,
        base: '/build/',
        publicDir: 'public',

        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                'mixins': path.resolve(__dirname, 'src/assets/css/mixins.scss'),
                'variables': path.resolve(__dirname, 'src/assets/css/variables.scss')
            },
            extensions: ['.tsx', '.ts', '.js', '.mjs', '.scss', '.vue']
        },

        build: {
            outDir: 'build',
            assetsDir: '',
            rollupOptions: {
                input: {
                    masterportal: path.resolve(rootPath, 'src/main.js')
                },
                output: {
                    entryFileNames: 'js/[name].js',
                    chunkFileNames: 'js/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        const info = assetInfo.name.split('.');
                        const ext = info[info.length - 1];
                        if (/\.(css)$/.test(assetInfo.name)) {
                            return 'css/[name][extname]';
                        }
                        return `assets/${ext}/[name][extname]`;
                    }
                }
            },
            sourcemap: mode === 'development' ? 'inline' : false
        },

        plugins: [
            vue(),

            // Global constants - equivalent to webpack.DefinePlugin
            {
                name: 'define-globals',
                transform(code, id) {
                    if (id.endsWith('.js') || id.endsWith('.vue')) {
                        const defineReplacements = {
                            'ADDONS': JSON.stringify(addonsRelPaths),
                            '__VUE_OPTIONS_API__': 'true',
                            '__VUE_PROD_DEVTOOLS__': 'false',
                            'VUE_ADDONS': JSON.stringify(vueAddonsRelPaths)
                        };

                        let transformedCode = code;
                        for (const [key, value] of Object.entries(defineReplacements)) {
                            transformedCode = transformedCode.replace(
                                new RegExp(`\\b${key}\\b(?!\\s*:)`, 'g'),
                                value
                            );
                        }

                        return transformedCode;
                    }
                }
            }
        ],

        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
            @import "mixins";
            @import "variables";
          `
                }
            }
        },

        server: {
            port: 9001,
            https: true,
            open: '/portal/master',
            proxy: convertProxies(proxies),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        },

        optimizeDeps: {
            exclude: ['@swc/helpers'],
            esbuildOptions: {
                target: 'es2015',
                define: {
                    global: 'globalThis'
                }
            }
        },

        // Skip test files during build and in dev mode
        // Vite uses rollup under the hood, so we need to configure this differently
        test: {
            exclude: ['**/*.{test,spec}.js']
        }
    };
});
