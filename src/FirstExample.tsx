/* eslint-env es6 */
// https://github.com/typescript-cheatsheets/react-typescript-cheatsheet

import React from 'react';
import {
    ComponentDefinition,
} from './types';


const FirstExample: ComponentDefinition = {
    view: ({ data, actions }) => (
        <div>
            <h4>Hello {data.name}</h4>
            <div>{data.value}</div>
            <button onClick={() => actions.plusOne()}>+1</button>
        </div>
    ),
    data: () => ({
        name: "React",
        value: 3
    }),
    actions: {
        plusOne: {
            in: {
                value: '${data.value}'
            },
            fn: val => val + 1,
            out: {
                'data.value': ''
            }
        }
    }
};

export default FirstExample;
