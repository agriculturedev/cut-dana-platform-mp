import {isRule} from "./isRule";
/**
 * Checks if there are rules with fixed=false in the set of rules.
 * @param {Object[]} rules an array of rules
 * @returns {Boolean} true if there are unfixed rules, false if no rules or only fixed rules are left
 */
export function hasUnfixedRules (rules) {
    if (!Array.isArray(rules)) {
        return false;
    }
    const len = rules.length;

    for (let i = 0; i < len; i++) {
        if (!rules[i] || isRule(rules[i]) && rules[i].fixed) {
            continue;
        }
        return true;
    }
    return false;
}
