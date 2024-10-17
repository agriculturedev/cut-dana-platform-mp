const js = require("@eslint/js"),
    pluginVuejsAccessibility = require("eslint-plugin-vuejs-accessibility"),
    pluginVue = require("eslint-plugin-vue"),
    pluginJsdoc = require("eslint-plugin-jsdoc"),
    pluginMocha = require("eslint-plugin-mocha"),
    globals = require("globals"),
    stylisticJs = require("@stylistic/eslint-plugin-js"),
    nodePlugin = require("eslint-plugin-n");

module.exports = [
    js.configs.recommended,
    ...pluginVue.configs["flat/recommended"],
    ...pluginVuejsAccessibility.configs["flat/recommended"],
    pluginMocha.configs.flat.recommended,
    pluginJsdoc.configs["flat/recommended"],
    nodePlugin.configs["flat/recommended-script"],
    {
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.mocha,
                ...globals.node,
                ...globals.amd,
                Config: true,
                Cesium: true,
                i18next: true,
                mapCollection: true,
                moduleCollection: true,
                StreetSmartApi: true
            }
        },
        plugins: {
            "vuejs-accessibility": pluginVuejsAccessibility,
            "@stylistic/js": stylisticJs
        },
        rules: {
            // Possible Problems - These rules relate to possible logic errors in code:
            "array-callback-return": "error",
            "no-constructor-return": "off", // Is deliberately ignored in some places
            "no-control-regex": "off",
            "no-duplicate-imports": "error",
            "no-cond-assign": ["error", "always"],
            "no-self-compare": "error",
            "no-template-curly-in-string": "off", // Is uses in some strings
            "no-unmodified-loop-condition": "error",
            "no-unreachable-loop": "error",
            "no-unused-private-class-members": "error",
            "no-use-before-define": "off", // Here it is done the other way around
            "require-atomic-updates": "error",
            // Suggestions - These rules suggest alternate ways of doing things:
            "accessor-pairs": "error",
            "block-scoped-var": "error",
            "consistent-return": "error",
            "consistent-this": "error",
            "curly": "error",
            "default-case": "error",
            "default-case-last": "error",
            "default-param-last": "error",
            "dot-notation": "error",
            "eqeqeq": "error",
            "func-style": ["error", "declaration"],
            "max-depth": "error",
            "max-nested-callbacks": ["error", 10],
            "max-params": ["warn", 9],
            "no-alert": "error",
            "no-array-constructor": "error",
            "no-caller": "error",
            "no-console": ["error", {"allow": ["warn", "error"]}],
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
            "no-unused-expressions": "off",
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
            "radix": "error",
            "spaced-comment": "error",
            "vars-on-top": "error",
            "yoda": "error",
            // changes for eslint v9
            "no-undef": "error",
            "no-unused-vars": ["error",
                {"caughtErrors": "none"}
            ],
            "global-require": "off",
            // new rules in recommended
            "no-empty-static-block": "off",
            "no-new-native-nonconstructor": "off",
            "no-constant-binary-expression": "off",
            // rules which were removed from recommended
            "no-extra-semi": "error",
            "no-inner-declarations": "error",
            "no-mixed-spaces-and-tabs": "error",
            "no-new-symbol": "error",
            // end of changes for eslint v9
            // Layout & Formatting - These rules care about how the code looks rather than how it executes:
            // Deprecated - The old rules have been deprecated (in ESLint v8.53.0) in accordance with the deprecation policy, and replaced by those newer rules:
            "@stylistic/js/array-bracket-spacing": "error",
            "@stylistic/js/block-spacing": "error",
            "@stylistic/js/brace-style": ["error", "stroustrup"],
            "@stylistic/js/comma-dangle": "error",
            "@stylistic/js/comma-spacing": "error",
            "@stylistic/js/comma-style": "error",
            "@stylistic/js/computed-property-spacing": "error",
            "@stylistic/js/eol-last": ["error", "always"],
            "@stylistic/js/func-call-spacing": ["error", "never"],
            "@stylistic/js/implicit-arrow-linebreak": "error",
            "@stylistic/js/indent": ["error", 4, {"SwitchCase": 1}],
            "@stylistic/js/jsx-quotes": "error",
            "@stylistic/js/key-spacing": "error",
            "@stylistic/js/keyword-spacing": "error",
            "@stylistic/js/max-statements-per-line": "error",
            "@stylistic/js/new-parens": "error",
            "@stylistic/js/no-multi-spaces": "error",
            "@stylistic/js/no-extra-parens": [
                "error",
                "all",
                {"nestedBinaryExpressions": false}
            ],
            "@stylistic/js/no-multiple-empty-lines": ["error", {"max": 2, "maxBOF": 1}],
            "@stylistic/js/no-tabs": "error",
            "@stylistic/js/no-trailing-spaces": "error",
            "@stylistic/js/no-whitespace-before-property": "error",
            "@stylistic/js/object-curly-spacing": "error",
            "@stylistic/js/object-property-newline": "off",
            "@stylistic/js/padding-line-between-statements": [
                "error",
                {
                    "blankLine": "always",
                    "prev": ["const", "let", "var"],
                    "next": "*"
                },
                {
                    "blankLine": "any",
                    "prev": ["const", "let", "var"],
                    "next": ["const", "let", "var"]
                }
            ],
            "@stylistic/js/quotes": "error",
            "@stylistic/js/semi": "error",
            "@stylistic/js/semi-spacing": "error",
            "@stylistic/js/semi-style": "error",
            "@stylistic/js/space-before-blocks": "error",
            "@stylistic/js/space-before-function-paren": "error",
            "@stylistic/js/space-in-parens": "error",
            "@stylistic/js/space-infix-ops": "error",
            "@stylistic/js/space-unary-ops": "error",
            "@stylistic/js/switch-colon-spacing": "error",
            "@stylistic/js/wrap-regex": "error",
            // Deprecated - The old rules have been deprecated (in ESLint v7.0.0) in accordance with the deprecation policy, and replaced by those newer rules:
            "n/callback-return": "error",
            "n/handle-callback-err": "error",
            "n/prefer-global/buffer": "error",
            "n/no-path-concat": "error",
            "n/no-process-env": "error",
            "n/no-unpublished-import": "off",
            "n/no-missing-import": "off",
            "n/no-extraneous-import": "off",
            "n/no-unsupported-features/node-builtins": "off",
            "n/no-unpublished-require": "off",
            "n/no-extraneous-require": "off",
            "n/no-missing-require": "off",
            "n/no-unsupported-features/es-syntax": "off",
            "n/no-unsupported-features/es-builtins": "off",
            // eslint-plugin-jsdoc
            "jsdoc/check-types": "off",
            "jsdoc/require-returns": "off",
            "jsdoc/check-tag-names": "off",
            "jsdoc/no-undefined-types": "off",
            "jsdoc/no-defaults": "off",
            "jsdoc/check-alignment": "off",
            "jsdoc/tag-lines": "off",
            "jsdoc/valid-types": "off",
            "jsdoc/require-returns-check": "off",
            "jsdoc/check-param-names": "off",
            "jsdoc/no-multi-asterisks": "off",
            "jsdoc/require-param": "off",
            "jsdoc/require-property-description": "off",
            "jsdoc/require-property": "off",
            "jsdoc/require-property-name": "off",
            "jsdoc/check-property-names": "off",
            "jsdoc/multiline-blocks": "off",
            "jsdoc/empty-tags": "off",
            "jsdoc/implements-on-classes": "off",
            "jsdoc/require-param-name": "off",
            "jsdoc/require-param-description": "off",
            "jsdoc/require-jsdoc": [
                "error",
                {
                    "require": {
                        "FunctionDeclaration": true,
                        "MethodDefinition": true,
                        "ClassDeclaration": true,
                        "ArrowFunctionExpression": false,
                        "FunctionExpression": false
                    }
                }
            ],
            // vue plugin Base Rules
            "vue/comment-directive": [
                "error",
                {
                    "reportUnusedDisableDirectives": false
                }
            ],
            "vue/jsx-uses-vars": ["off"],
            "vue/require-explicit-emits": ["off"],
            "vue/no-deprecated-destroyed-lifecycle": ["off"],
            "vue/no-deprecated-events-api": ["off"],
            "vue/v-on-event-hyphenation": ["off"],
            "vue/no-deprecated-slot-attribute": ["off"],
            "vue/no-deprecated-slot-scope-attribute": ["off"],
            "vue/no-deprecated-v-on-native-modifier": ["off"],
            "vue/no-v-for-template-key-on-child": ["off"],
            "vue/no-deprecated-v-bind-sync": ["off"],
            "vue/html-indent": ["error", 4],
            "vue/no-v-html": ["off"],
            "vue/match-component-file-name": [
                "error",
                {
                    "extensions": ["vue"],
                    "shouldMatchCase": true
                }
            ],
            // eslint-plugin-vuejs-accessibility
            "vuejs-accessibility/label-has-for": [
                "error",
                {
                    "required": {
                        "some": ["nesting", "id"]
                    }
                }
            ],
            /*
             * rule turned off since it's e.g. deprecated here:
             * https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/398
             * It does not work too well for the Masterportal where changes in
             * e.g. select elements are supposed to immediately trigger changes
             * in the map interactions
             */
            "vuejs-accessibility/no-onchange": "off",
            "vuejs-accessibility/form-control-has-label": "off",
            // eslint-plugin-mocha
            "mocha/consistent-spacing-between-blocks": "off",
            "mocha/no-mocha-arrows": "off",
            "mocha/no-setup-in-describe": "off",
            "mocha/no-identical-title": "off",
            "mocha/no-top-level-hooks": "off",
            "mocha/no-exports": "off",
            "mocha/no-skipped-tests": "off",
            "mocha/no-async-describe": "off",
            "mocha/max-top-level-suites": "off",
            "mocha/no-sibling-hooks": "off",
            "mocha/no-nested-tests": "off",
            "mocha/handle-done-callback": "off"
        }
    },
    {
        ignores: [
            "**/node_modules/",
            "**/dist/",
            "**/portalconfigs/",
            "**/jsdoc/",
            "**/docHtml/",
            "**/.git/",
            "portal/*",
            "!portal/basic",
            "!portal/master",
            "!portal/auto",
            "site/",
            ".venv/"
        ]
    }
];
