/* eslint-env jest */
import jsdom from 'jsdom';

import {
    testFunc
} from '../src/testFunc';

describe('Test dummy', () => {
    it('Verify testFunc', () => {
        expect(testFunc()).toEqual(2);
    });
});

