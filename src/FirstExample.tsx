/* eslint-env es6 */
// https://github.com/typescript-cheatsheets/react-typescript-cheatsheet

import React from 'react';
import {
    ComponentDefinition,
} from 'few/src/types';


const FirstExample: ComponentDefinition = {
    view: ({ data, actions }) => (
        <div>
            <h4>Hello {data.name}</h4>
            <div>{data.value}</div>
            <button onClick={actions.plusOne}>+</button>
            <button onClick={actions.minusOne}>-</button>
        </div>
    ),
    data: () => ({
        name: "React",
        value: 3
    }),
    actions: {
        plusOne: {
            input: {
                value: '${data.value}'
            },
            fn: val => val + 1,
            output: {
                'data.value': ''
            }
        },
        minusOne: ({ data, dispatch }) => dispatch({ value: { 'data.value': data.value - 1 } })
    }
};

export default FirstExample;
