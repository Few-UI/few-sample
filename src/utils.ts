/* eslint-env es6 */

import lodashSet from 'lodash/set';
import { ObjectLiteral } from './types';

export const BaseIndent = '  ';

// DOM Node type in browser
export const Node = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11
};

/**
 * escape string as regex input
 * https://stackoverflow.com/questions/6828637/escape-regexp-strings
 *
 * @param str input string
 * @returns output string with regular expression escaped
 */
export const escapeRegExp = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * convert string like 'MyButton' to 'my-button'
 *
 * @param str input string as 'MyButton'
 * @returns output string as 'my-button'
 */
export const camelCaseToHyphen = (str: string): string => {
    return str.replace(/^./, str[0].toLowerCase()).replace(/([A-Z])/g, (fullMatch, firstMatch) => `-${firstMatch.toLowerCase()}`);
}

/**
 * convert sting like 'my-button' to 'MyButton'
 *
 * @param str input string as 'my-button'
 * @returns output string as 'MyButton'
 */
export const hyphenToCamelCase = (str: string): string => {
    return str.replace(/^./, str[0].toUpperCase()).replace(/-(.)/g, (fullMatch, firstMatch) => firstMatch.toUpperCase());
}

/**
 * evaluate expression string as Javascript expression
 *
 * @param expr expression string
 * @param scope evaluation scope as name-value pair
 * @param ignoreError if true the error is not thrown
 * @param applyObject object will apply to the expr as this
 * @returns evaluation result
 */
export const evalExpression = (
    expr: string,
    scope: ObjectLiteral,
    ignoreError: boolean = false,
    applyObject: Object = null
): any => {
    const names = scope ? Object.keys(scope) : [];
    const vals = scope ? Object.values(scope) : [];
    try {
        let func = new Function(...names, `return ${expr};`);
        return func.apply(applyObject, vals);
    } catch (e) {
        if (!ignoreError) {
            throw new Error(`evalExpression('${expr}') => ${e.message}`);
        } else {
            return undefined;
        }
    }
}

/**
 * fastest way to copy a pure JSON object, use on your own risk
 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
 *
 * @param input JSON object as input
 * @returns JSON object
 */
export const cloneJson = (input: JSON): JSON => {
    return input ? JSON.parse(JSON.stringify(input)) : input;
}

/**
 * Parse view string as DOM without interpret it. Browser version
 *
 * @param input view template as string
 * @returns DOM Node as result
 */
export const parseView = (input: string): Node => {
    let parser = new DOMParser();
    let fragement = document.createDocumentFragment();
    fragement.appendChild(parser.parseFromString(`<div>${input}</div>`, 'text/html').body.firstChild);
    return fragement.firstChild;
}

/**
 * Bind arguments starting after however many are passed in.
 * https://stackoverflow.com/questions/27699493/javascript-partially-applied-function-how-to-bind-only-the-2nd-parameter
 *
 * @param fn function needs to bind with arguments
 * @param bound_args arguments will be bound at then end of the function interface
 * @returns new function with bindings
 */
export const bindTrailingArgs = (fn: Function, ...bound_args: any): Function => {
    return function (...args) {
        return fn(...args, ...bound_args);
    };
}

//////////////////////////////////////////////////////////////
// data getter / setter
//////////////////////////////////////////////////////////////
/**
 * get value from scope
 * @param {object} data scope for evaluation
 * @param {string} path string as path/expression
 * @returns {*} result
 */
export function getValue(data, path) {
    // return _.get( scope, expr );
    return evalExpression(path, data, true);
}

/**
 * Update data by specific path
 * @param {object} data scope for evaluation
 * @param {string} path path on data
 * @param {*} value value needs to update
 * @returns {boolean} true if
 */
export function setValue(data, path, value) {
    // do immutable comparison only
    if (getValue(data, path) !== value) {
        lodashSet(data, path, value);
        return true;
    }
    return false;
}


/**
 * Set a set of path value pair to data
 * @param {object} data scope for evaluation
 * @param {object} input data Input like { 'data.myVal': 3 }
 * @returns {boolean} true if model has been updated
 */
export function set(data, input) {
    let updated = false;
    for (var key in input) {
        updated = setValue(data, key, input[key]) || updated;
    }
    return updated;
}

/**
 * parse expr {{aa.bb}} to get aa.bb
 * @param {string} str input string
 * @returns {string} the expression inside {{}}
 */
function parseExpr(str) {
    let match = str.match(/^\${(.*)}$/);
    return match ? match[1] : undefined;
}

/**
 * Evaluate from data definition like:
 * {
 *    attr1: {{data.curVal}}
 * }
 * @param {JSON} input data definition
 * @param {JSON} scope scope for evaluation
 * @param {number} level used for recursive call internally
 * @returns {JSON} evaluated input object
 */
export function evalDataDefinition(input, scope, level = 0) {
    // Make the method to be immutable at top level
    let obj = level > 0 ? input : cloneJson(input);

    for (let key in obj) {
        let value = obj[key];
        if (typeof value === 'string') {
            let template = parseExpr(value);
            if (template) {
                obj[key] = getValue(scope, template);
            }
        } else {
            evalDataDefinition(obj[key], scope, level + 1);
        }
    }
    return obj;
}

/**
 * Evaluate vm data definition like:
 * {
 *    attr1: {{data.curVal}}
 * }
 * @param {JSON} input data definition
 * @param {object} vm view model object
 * @returns {JSON} evaluated input object
 */
export function evalVmDataDefinition(input, vm) {
    return evalDataDefinition(input, {
        ...vm.props,
        ...vm,
        vm
    });
}

/**
 * Polyfill to match dynamic import result back to ES5 supported module
 *
 * @param {Object} obj - function to evaluate after loading the dependencies.
 * @returns {Object} ES5 module object
 */
export function interopES6Default(obj) {
    return obj && obj.__esModule && obj.default ? obj.default : obj;
}


/**
 * print dom node to string for display purpose
 * TODO:
 * - it may break <pre> tag for now, we can tune it later
 * - For text node with \n it is not handled correctly
 * @param {Node} node DOM Node
 * @param {number} level indention level
 * @returns {string} HTML as String
 */
export function printDomNode(node) {
    return formatNode(node).outerHTML;
}

/**
 * format dom node with indentoin
 * https://stackoverflow.com/questions/26360414/javascript-how-to-correct-indentation-in-html-string
 * @param {Node} node DOM Node
 * @param {number} level indention level
 * @returns {string} HTML as String
 */
function formatNode(node, level = 0) {
    /*
    var indentBefore = new Array( level++ + 1 ).join( '  ' );
        var indentAfter  = new Array( level - 1 ).join( '  ' );
        var textNode;
    */
    const tmpNode = (level ? node.parentNode : node).cloneNode();
    tmpNode.innerHTML = `\n${BaseIndent.repeat(level + 1)}<div></div>\n${BaseIndent.repeat(level)}`;
    const indentBefore = tmpNode.firstChild;
    const indentAfter = tmpNode.lastChild;

    let childCount = node.childNodes.length;
    if (childCount > 0) {
        let idx = 0;
        while (idx < childCount) {
            const currNode = node.childNodes[idx];
            if (currNode.nodeType === Node.ELEMENT_NODE) {
                node.insertBefore(indentBefore.cloneNode(), currNode);
                formatNode(currNode, level + 1);
                if (node.lastChild === currNode) {
                    node.appendChild(indentAfter.cloneNode());
                    idx = childCount;
                } else {
                    idx += 2;
                    childCount++;
                }
            } else if (currNode.nodeType === Node.TEXT_NODE) {
                const textContent = currNode.nodeValue.trim();
                if (textContent) {
                    node.insertBefore(indentBefore.cloneNode(), currNode);
                    currNode.nodeValue = textContent;
                    if (node.lastChild === currNode) {
                        node.appendChild(indentAfter.cloneNode());
                        idx = childCount;
                    } else {
                        idx += 2;
                        childCount++;
                    }
                } else {
                    currNode.nodeValue = textContent;
                    if (node.lastChild === currNode) {
                        node.appendChild(indentAfter.cloneNode());
                    }
                    idx++;
                }
            } else {
                idx++;
            }
        }
    }
    return node;
}

/**
 * simple http get. PLEASE DON'T use it as promise chain - it will cause issue in angularJS mode
 * @param {string} theUrl url as string
 * @returns {Promise} promise
 */
export function httpGet(theUrl) {
    return new Promise((resolve, reject) => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                resolve(xmlHttp.responseText);
            }
        };

        xmlHttp.onerror = function (e) {
            reject(e);
        };

        xmlHttp.open('GET', theUrl, true); // true for asynchronous
        xmlHttp.send(null);
    });
}

/**
 * simple http get for JSON specific and fake response data structure.
 * PLEASE DON'T use it as promise chain - it will cause issue in angularJS mode
 * @param {string} theUrl url as string
 * @returns {Promise} promise
 */
export function httpGetJsonObject(theUrl) {
    return httpGet(theUrl).then((txt: string) => {
        return {
            data: JSON.parse(txt)
        };
    });
}

/**
 *
 * Returns Base URL for the current application
 *
 * @returns {String} Base URL for the current application's root 'document' without any query or location attributes
 *          and (if otherwise valid) with a trailing '/' assured (e.g. 'http://100.100.100.100:8888/awc/').
 */
export let getBaseURL = function () {
    if (!_cachedBaseURL) {
        // strip 'index.html' from end of pathname if present
        var location = window.location;

        var pathname = location.pathname;

        // IE11 on Windows 10 doesn't have 'location.origin' object
        const origin = location.origin || location.protocol + '//' + location.hostname +
            (location.port ? ':' + location.port : '')

        _cachedBaseURL = origin + pathname.substring(0, pathname.lastIndexOf('/') + 1);
    }

    return _cachedBaseURL;
};
var _cachedBaseURL;

/**
 * parse data path to scope + subPatoh
 * @param {string} pathStr path string like 'ctx.a.b'
 * @returns {object} path structure like:
 * {
 *     scope: 'ctx'
 *     path: 'a.b'
 * }
 */
export function parseDataPath(pathStr) {
    const match = pathStr.match(/[.[]/);
    if (match) {
        return {
            scope: pathStr.substr(0, match.index),
            path: pathStr.substr(match[0] === '[' ? match.index : match.index + 1)
        };
    }
    return { scope: pathStr };
}
