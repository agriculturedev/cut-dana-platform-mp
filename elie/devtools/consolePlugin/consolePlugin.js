// src/plugins/enhancedConsole.js

const EnhancedConsole = {
    install() {
        // Store the original console methods
        const originalConsoleLog = console.log;

        // Define your custom prefix styles
        const prefixStyles = {
            elie: {
                text: 'ELIE',
                styles: "background: hsl(217 95% 54%); color: hsl(217 95% 90%); font-weight: bold; padding: .2rem .3rem; border-radius: .2rem;",
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
                prefix.styles,
                '', // Reset styles
                ...args
            );
        };

        // Add success method to Console.prototype to help IDE recognition
        if (typeof Console !== 'undefined') {
            try {
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


        console.elie = function(...args) {
            return enhancedLog('elie', ...args);
        };
    }
};

export default EnhancedConsole;
