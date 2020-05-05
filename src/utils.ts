/* eslint-env es6 */

import lodashSet from 'lodash/set';
import {
    DataDef,
    DataStore,
    DataStoreCompound,
    PathContext,
} from './types';

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
    scope: DataStore,
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

/**
 * Polyfill to match dynamic import result back to ES5 supported module
 *
 * @param obj - function to evaluate after loading the dependencies.
 * @returns ES5 module object
 */
export const interopES6Default = (obj: any): any => {
    return obj && obj.__esModule && obj.default ? obj.default : obj;
}

/**
 * print dom node to string for display purpose
 * TODO:
 * - it may break <pre> tag for now, we can tune it later
 * - For text node with \n it is not handled correctly
 *
 * @param node DOM Node
 * @returns HTML as String
 */
export const printDomNode = (node: Node): string => {
    return (<Element>formatNode(node)).outerHTML;
}

/**
 * format dom node with indentoin
 * https://stackoverflow.com/questions/26360414/javascript-how-to-correct-indentation-in-html-string
 *
 * @param node DOM Node
 * @param level indention level
 * @returns element has been beautified
 */
const formatNode = (node: Node, level: number = 0): Node => {
    /*
    var indentBefore = new Array( level++ + 1 ).join( '  ' );
        var indentAfter  = new Array( level - 1 ).join( '  ' );
        var textNode;
    */
    const tmpNode = (level ? node.parentNode : node).cloneNode() as Element;
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
 * simple http get.
 *
 * @param theUrl url as string
 * @returns promise with response text
 */
export const httpGet = (theUrl: string): Promise<string> => {
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
 *
 * Returns Base URL for the current application
 *
 * @returns Base URL for the current application's root 'document' without any query or location attributes
 *          and (if otherwise valid) with a trailing '/' assured.
 */
export const getBaseURL: { (): string, _baseURL?: string } = () => {
    if (!getBaseURL._baseURL) {
        // strip 'index.html' from end of pathname if present
        const location = window.location;

        const pathname = location.pathname;

        // IE11 on Windows 10 doesn't have 'location.origin' object
        const origin = location.origin || location.protocol + '//' + location.hostname +
            (location.port ? ':' + location.port : '')

        getBaseURL._baseURL = origin + pathname.substring(0, pathname.lastIndexOf('/') + 1);
    }

    return getBaseURL._baseURL;
};

/**
 * parse data path to scope + subPatoh
 * @param pathStr path string like 'data.a.b'
 * @returns path structure like:
 * {
 *     scope: 'data'
 *     path: 'a.b'
 * }
 */
export const parseDataPath = (pathStr: string): PathContext => {
    const match = pathStr.match(/[.[]/);
    if (match) {
        return {
            scope: pathStr.substr(0, match.index),
            path: pathStr.substr(match[0] === '[' ? match.index : match.index + 1)
        };
    }
    return {
        scope: pathStr,
        path: undefined
    };
}

/**
 * Check value type is primitive or not
 * @param val input value
 * @returns true if input is number or string
 */
export const isPrimitive = (val: any): boolean => {
    const type = typeof val;
    return type === 'number' || type === 'string' || type === 'boolean';
}

export const isArray = Array.isArray;

export const isObject = val => val && !isPrimitive(val) && !isArray(val)

//////////////////////////////////////////////////////////////
// data getter / setter
//////////////////////////////////////////////////////////////

/**
 * get value from scope
 *
 * @param scope scope for evaluation
 * @param path path to fetch faom scope
 * @returns value from specific path
 */
export const getValue = (scope: DataStore, path: string): DataStore => {
    // return _.get( scope, expr );
    // TODO: when the scope has .xxx, evalFunction will fail but _.get still success
    return evalExpression(path, scope, true);
}

/**
 * set value to scope
 *
 * @param scope scope for evaluation
 * @param path path to set to scope
 * @param value value to specific path
 * @returns true if value is different with orignal (and successfully set).
 */
export const setValue = (data: DataStore, path: string, value: any): boolean => {
    // do immutable comparison only
    if (getValue(data, path) !== value) {
        lodashSet(data, path, value);
        return true;
    }
    return false;
}

/**
 * parse expr ${aa.bb}} to get aa.bb
 * @param str input string
 * @returns the expression inside ${}
 */
const parseExpr = (str: string): string => {
    let match = str.match(/^\${(.*)}$/);
    return match ? match[1] : undefined;
}

/**
 * fastest way to copy a pure JSON object, use on your own risk
 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
 *
 * @param input JSON object as input
 * @returns JSON object
 */
export const cloneJson = (input: DataDef): DataDef => {
    return input ? JSON.parse(JSON.stringify(input)) : input;
}

/**
 * Evaluate data definition to store in mutable way
 * @param input data definition as input
 * @param scope store object
 * @param level current level in the recursive evaluation
 */
const evalDataDefinitionInternal = (input: DataStoreCompound, scope: DataStore, level: number): void => {
    for (let key in input) {
        let value = input[key];
        if (typeof value === 'string') {
            let template = parseExpr(value);
            if (template) {
                input[key] = getValue(scope, template);
            }
        } else {
            evalDataDefinitionInternal(input, scope, level + 1);
        }
    }
}

/**
 * Evaluate from data definition like:
 * {
 *   attr1: ${data.curVal}
 * }
 * to actual value in scope like:
 * {
 *   attr1: 3
 * }
 *
 * @param input data definition
 * @param scope scope for evaluation
 * @param level used for recursive call internally
 * @returns evaluated input object
 */
export const evalDataDefinition = (input: DataDef, scope: DataStore): DataStore => {
    // Make the method to be immutable at top level
    const store = cloneJson(input);

    evalDataDefinitionInternal(store, scope, 0);

    return store;
}


