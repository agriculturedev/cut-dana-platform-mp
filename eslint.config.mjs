import chaiFriendly from "eslint-plugin-chai-friendly";
import vuejsAccessibility from "eslint-plugin-vuejs-accessibility";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/node_modules/",
        "**/build/",
        "**/dist/",
        "**/portalconfigs/",
        "**/scripte/",
        "**/jsdoc/",
        "**/lib/",
        "**/examples/",
        "portal/*",
        "!portal/basic",
        "!portal/master",
        "!portal/masterCustom",
        "!portal/masterDefault",
    ],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:backbone/recommended",
    "plugin:vue/recommended",
    "plugin:vuejs-accessibility/recommended",
    "plugin:you-dont-need-lodash-underscore/all",
), {
    plugins: {
        "chai-friendly": chaiFriendly,
        "vuejs-accessibility": vuejsAccessibility,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.mocha,
            ...globals.node,
            ...globals.amd,
            $: true,
            _: true,
            Config: true,
            Radio: true,
            Backbone: true,
            Cesium: true,
            i18next: true,
            mapCollection: true,
        },

        ecmaVersion: 2022,
        sourceType: "module",

        parserOptions: {
            allowImportExportEverywhere: true,
        },
    },

    rules: {
        "array-callback-return": "error",
        "no-await-in-loop": "off",
        "no-constructor-return": "off",
        "no-control-regex": "off",
        "no-duplicate-imports": "error",
        "no-cond-assign": ["error", "always"],
        "no-promise-executor-return": "off",
        "no-self-compare": "error",
        "no-template-curly-in-string": "off",
        "no-unmodified-loop-condition": "error",
        "no-unreachable-loop": "error",
        "no-unused-private-class-members": "error",
        "no-use-before-define": "off",
        "require-atomic-updates": "error",
        "accessor-pairs": "error",
        "block-scoped-var": "error",
        "consistent-return": "error",
        "consistent-this": "error",
        curly: "error",
        "default-case": "error",
        "default-case-last": "error",
        "default-param-last": "error",
        "dot-notation": "error",
        eqeqeq: "error",
        "func-style": ["error", "declaration"],
        "max-depth": "error",
        "max-nested-callbacks": ["error", 10],
        "max-params": ["warn", 9],
        "new-cap": "error",
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-caller": "error",

        "no-console": ["error", {
            allow: ["warn", "error"],
        }],

        "no-empty-function": "error",
        "no-div-regex": "error",
        "no-else-return": "error",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-floating-decimal": "error",
        "no-implicit-coercion": "error",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "error",
        "no-loop-func": "error",
        "no-mixed-operators": "off",
        "no-multi-str": "error",
        "no-nested-ternary": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "error",
        "no-proto": "error",
        "no-restricted-properties": "error",
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-script-url": "error",
        "no-sequences": "error",
        "no-shadow": "error",
        "no-undef-init": "error",
        "no-throw-literal": "error",
        "no-unneeded-ternary": "error",
        "no-unused-expressions": 0,
        "no-useless-call": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-useless-rename": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "no-void": "error",
        "one-var": "error",
        "one-var-declaration-per-line": "error",
        "prefer-const": "error",
        "prefer-numeric-literals": "error",
        "prefer-rest-params": "error",
        radix: "error",
        "spaced-comment": "error",
        "vars-on-top": "error",
        yoda: "error",
        "array-bracket-spacing": "error",
        "block-spacing": "error",
        "brace-style": ["error", "stroustrup"],
        "comma-dangle": "error",
        "comma-spacing": "error",
        "comma-style": "error",
        "computed-property-spacing": "error",
        "eol-last": ["error", "always"],
        "func-call-spacing": ["error", "never"],
        "implicit-arrow-linebreak": "error",

        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        "jsx-quotes": "error",
        "key-spacing": "error",
        "keyword-spacing": "error",
        "max-statements-per-line": "error",
        "new-parens": "error",
        "no-multi-spaces": "error",

        "no-extra-parens": ["error", "all", {
            nestedBinaryExpressions: false,
        }],

        "no-multiple-empty-lines": ["error", {
            max: 2,
            maxBOF: 1,
        }],

        "no-tabs": "error",
        "no-trailing-spaces": "error",
        "no-whitespace-before-property": "error",
        "object-curly-spacing": "error",
        "object-property-newline": 0,

        "padding-line-between-statements": ["error", {
            blankLine: "always",
            prev: ["const", "let", "var"],
            next: "*",
        }, {
            blankLine: "any",
            prev: ["const", "let", "var"],
            next: ["const", "let", "var"],
        }],

        quotes: "error",
        semi: "error",
        "semi-spacing": "error",
        "semi-style": "error",
        "space-before-blocks": "error",
        "space-before-function-paren": "error",
        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "switch-colon-spacing": "error",
        "wrap-regex": "error",
        "callback-return": "error",
        "handle-callback-err": "error",
        "no-buffer-constructor": "error",
        "no-new-require": "error",
        "no-path-concat": "error",
        "no-process-env": "error",
        "no-process-exit": "error",

        "require-jsdoc": ["error", {
            require: {
                FunctionDeclaration: true,
                MethodDefinition: true,
                ClassDeclaration: true,
                ArrowFunctionExpression: true,
                FunctionExpression: false,
            },
        }],

        "valid-jsdoc": "error",

        "vue/comment-directive": ["error", {
            reportUnusedDisableDirectives: false,
        }],

        "vue/jsx-uses-vars": ["off"],
        "vue/attribute-hyphenation": ["error"],
        "vue/component-definition-name-casing": ["error"],
        "vue/first-attribute-linebreak": ["error"],
        "vue/html-closing-bracket-newline": ["error"],
        "vue/html-closing-bracket-spacing": ["error"],
        "vue/html-end-tags": ["error"],
        "vue/html-indent": ["error", 4],
        "vue/html-quotes": ["error"],
        "vue/html-self-closing": ["error"],
        "vue/max-attributes-per-line": ["error"],
        "vue/multiline-html-element-content-newline": ["error"],
        "vue/mustache-interpolation-spacing": ["error"],
        "vue/no-multi-spaces": ["error"],
        "vue/no-spaces-around-equal-signs-in-attribute": ["error"],
        "vue/no-template-shadow": ["error"],
        "vue/one-component-per-file": ["error"],
        "vue/prop-name-casing": ["error"],
        "vue/require-default-prop": ["error"],
        "vue/require-prop-types": ["error"],
        "vue/singleline-html-element-content-newline": ["error"],
        "vue/v-bind-style": ["error"],
        "vue/v-on-style": ["error"],
        "vue/v-slot-style": ["error"],
        "vue/attributes-order": ["error"],

        "vue/component-tags-order": ["error", {
            order: ["script", "template", "style"],
        }],

        "vue/no-lone-template": ["error"],
        "vue/no-multiple-slot-args": ["error"],
        "vue/no-v-html": ["off"],
        "vue/order-in-components": ["error"],
        "vue/this-in-template": ["error"],
        "vue/array-bracket-spacing": ["error"],
        "vue/component-name-in-template-casing": ["error"],
        "vue/component-options-name-casing": ["error"],
        "vue/eqeqeq": ["error"],
        "vue/key-spacing": ["error"],

        "vue/match-component-file-name": ["error", {
            extensions: ["vue"],
            shouldMatchCase: true,
        }],

        "vue/no-required-prop-with-default": ["error"],
        "vue/no-static-inline-styles": ["error"],
        "vue/padding-line-between-blocks": ["error"],
        "vue/require-direct-export": ["error"],
        "vue/require-name-property": ["error"],

        "vuejs-accessibility/label-has-for": ["error", {
            required: {
                some: ["nesting", "id"],
            },
        }],

        "vuejs-accessibility/no-onchange": "off",
        "chai-friendly/no-unused-expressions": 2,
        "backbone/no-native-jquery": [0, "selector"],
        "backbone/no-silent": 0,
    },
}];