/* eslint-env es6 */
// https://github.com/typescript-cheatsheets/react-typescript-cheatsheet

import React from 'react';

interface ObjectLiteral {
    [key: string]: ObjectLiteral | string | number | boolean | Array<any>;
}

const TestComponent: any = {
    view: ({ data, setData }: { data: ObjectLiteral, setData: Function }): JSX.Element => (
        <div>
            <h4>Hello {data.name}</h4>
            <div>{data.value}</div>
            <button onClick={() => TestComponent.actions.plusOne(data.value, 'value', data, setData)}>+1</button>
        </div>
    ),
    data: (): ObjectLiteral => ({
        name: "React",
        value: 3
    }),
    actions: {
        plusOne: (val: number, path: string, data: any, setData: Function) => {
            const newVal = val + 1;
            setData({
                ...data,
                [path]: newVal
            });
        }
    }
};

export default TestComponent;
