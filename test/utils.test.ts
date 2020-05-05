/* eslint-env jest */
import jsdom from 'jsdom';

import {
    hyphenToCamelCase,
    printDomNode
} from '../src/utils';

const parseView = str => {
    const dom = new jsdom.JSDOM(`<div>${str}</div>`);
    return dom.window.document.body.firstChild;
}


describe('Test compile specific core/utils', () => {
    it('Verify hyphenToCamelCase works fine for "aa-bb"', () => {
        expect(hyphenToCamelCase('aa-bb')).toEqual('AaBb');
    });

    it('Verify hyphenToCamelCase works fine for "aa-bb-cc"', () => {
        expect(hyphenToCamelCase('aa-bb-cc')).toEqual('AaBbCc');
    });

    it('Verify printDomNode works as expected for pure element node case', () => {
        expect(printDomNode(parseView('<div><code></code></div><pre></pre>'))).toEqual([
            '<div>',
            '  <div>',
            '    <code></code>',
            '  </div>',
            '  <pre></pre>',
            '</div>'
        ].join('\n'));
    });

    it('Verify printDomNode works as expected', () => {
        expect(printDomNode(parseView('<div>text1<div>test11</div>text2</div>'))).toEqual([
            '<div>',
            '  <div>',
            '    text1',
            '    <div>',
            '      test11',
            '    </div>',
            '    text2',
            '  </div>',
            '</div>'
        ].join('\n'));
    });
});

