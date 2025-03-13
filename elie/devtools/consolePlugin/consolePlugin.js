// src/plugins/enhancedConsole.js

const EnhancedConsole = {
    install() {
        // Store the original console methods
        const originalConsoleLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        const originalInfo = console.info;
        const originalDebug = console.debug;

        // Define your custom prefix styles
        const prefixStyles = {
            info: {
                text: 'INFO',
                color: 'dodgerblue'
            },
            warn: {
                text: 'WARN',
                color: 'orange'
            },
            error: {
                text: 'ERROR',
                color: 'crimson'
            },
            success: {
                text: 'SUCCESS',
                color: 'mediumseagreen'
            },
            debug: {
                text: 'DEBUG',
                color: 'purple'
            },
            elie: {
                text: 'ELIE',
                color: 'rgb(25, 111, 249)'
            }
        };

        // Define the enhanced log function
        const enhancedLog = function(...args) {
            // Default to 'info' style if not specified
            let prefixType = 'info';

            // Check if a prefix type was specified as the first argument
            if (typeof args[0] === 'string' && args[0] in prefixStyles) {
                prefixType = args[0];
                args = args.slice(1); // Remove the prefix type from arguments
            }

            const prefix = prefixStyles[prefixType];

            // Create the styled prefix
            const styledPrefix = `%c[${prefix.text}]%c`;

            // Call the original console.log with our modified arguments
            originalConsoleLog(
                styledPrefix,
                `color: ${prefix.color}; font-weight: bold;`,
                '', // Reset styles
                ...args
            );
        };

        // Add success method to Console.prototype to help IDE recognition
        if (typeof Console !== 'undefined') {
            try {
                Console.prototype.success = function(...args) {
                    return enhancedLog.call(this, 'success', ...args);
                };

                Console.prototype.elie = function(...args) {
                    return enhancedLog.call(this, 'elie', ...args);
                };
            } catch (e) {
                // Fallback if Console prototype is not accessible
                console.success = function(...args) {
                    return enhancedLog('success', ...args);
                };
            }
        } else {
            // Direct assignment if Console constructor is not available
            console.success = function(...args) {
                return enhancedLog('success', ...args);
            };
        }

        // Override the console.log method
        console.log = enhancedLog;

        // Override other console methods
        console.info = function(...args) {
            return enhancedLog('info', ...args);
        };

        console.warn = function(...args) {
            return enhancedLog('warn', ...args);
        };

        console.error = function(...args) {
            return enhancedLog('error', ...args);
        };

        console.debug = function(...args) {
            return enhancedLog('debug', ...args);
        };

        console.elie = function(...args) {
            return enhancedLog('elie', ...args);
        };
    }
};

export default EnhancedConsole;
