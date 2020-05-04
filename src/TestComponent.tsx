/* eslint-env es6 */
// https://github.com/typescript-cheatsheets/react-typescript-cheatsheet

import React from 'react';

interface ObjectLiteral {
    [key: string]: ObjectLiteral;
}

const TestComponent: any = {
    view: ({ data }: { data: ObjectLiteral }): JSX.Element => <h4>Hello {data.name}</h4>,
    viewmodel: {
        data: {
            name: "React"
        }
    }
};

export default TestComponent;
