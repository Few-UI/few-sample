/* eslint-env es6 */

import lodashSet from 'lodash/set';

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
 * @param {string} string origin string
 * @returns {string} escaped string
 */
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * convert 'AwButton' to 'aw-button'
 * @param {string} name name like 'AwButton'
 * @returns {string} name like 'aw-button'
 */
export function camelCaseToHyphen(name) {
    return name.replace(/^./, name[0].toLowerCase()).replace(/([A-Z])/g, (fullMatch, firstMatch) => `-${firstMatch.toLowerCase()}`);
}

/**
 * convert 'aw-button' to 'AwButton'
 * @param {string} name  name like 'AwButton'
 * @returns {string} name like 'aw-button'
 */
export function hyphenToCamelCase(name) {
    return name.replace(/^./, name[0].toUpperCase()).replace(/-(.)/g, (fullMatch, firstMatch) => firstMatch.toUpperCase());
}


/**
 * evaluate string as Javascript expression
 * @param {string} input string as expression
 * @param {Object} params parameters as name value pair
 * @param {boolean} ignoreError if true the error is not thrown
 * @param {boolean} applyObject object will apply to the expr as this
 * @return {*} evaluation result
 *
 * TODO: match name with function parameters
 * https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
 */
export function evalExpression(input, params, ignoreError = false, applyObject = null) {
    const names = params ? Object.keys(params) : [];
    const vals = params ? Object.values(params) : [];
    try {
        let func = new Function(...names, `return ${input};`);
        return func.apply(applyObject, vals);
    } catch (e) {
        if (!ignoreError) {
            throw new Error(`evalExpression('${input}') => ${e.message}`);
        } else {
            return undefined;
        }
    }
}

/**
 * fastest way to copy a pure JSON object, use on your own risk
 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
 *
 * @param {Object} obj Current DOM Element
 * @returns {Object} new cloned object
 */
export function cloneDeepJsonObject(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

/**
 * Parse view string as DOM without interpret it. Browser version
 * TODO no for now and needs to be enahanced
 * @param {string} str view template as string
 * @returns {Element} DOM Element with all changes
 */
export function parseView(str) {
    let parser = new DOMParser();
    let fragement = document.createDocumentFragment();
    fragement.appendChild(parser.parseFromString(`<div>${str}</div>`, 'text/html').body.firstChild);
    return fragement.firstChild;
}


/**
 * Bind arguments starting after however many are passed in.
 * https://stackoverflow.com/questions/27699493/javascript-partially-applied-function-how-to-bind-only-the-2nd-parameter
 * @param {function} fn function needs to be bound
 * @param  {...any} bound_args binding args
 * @returns {function} function with partial args
 */
export function bindTrailingArgs(fn, ...bound_args) {
    return function (...args) {
        return fn(...args, ...bound_args);
    };
}

//////////////////////////////////////////////////////////////
// module loader
//////////////////////////////////////////////////////////////
/**
 * default loadModule function
 * @param {string} dep Dependency as string
 */
let _loadModuleCallback = function (dep) {
    throw Error('Module Loader is not defined!');
};

/**
 * Import dependencies
 * @param {string} dep Dependency as string
 * @returns {Promise} promise with dependencies
 */
export function loadModule(dep) {
    return _loadModuleCallback(dep);
}

/**
 * Set loader function for few
 * @param {Function} callback loader function as callback
 */
export function setLoadModuleFn(callback) {
    _loadModuleCallback = callback;
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
    let obj = level > 0 ? input : cloneDeepJsonObject(input);

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
