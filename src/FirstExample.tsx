/* eslint-env es6 */
// https://github.com/typescript-cheatsheets/react-typescript-cheatsheet

import React from 'react';
import {
    Component,
    ComponentDefinition,
    ViewTemplate
} from 'few/src/types';

// react/prop-types doesn't allow approach below:
// const FirstExampleRenderFn : ViewTemplate = ( { data, actions } ) =>
const FirstExampleRenderFn = ( { data, actions } : Component ) : JSX.Element =>
    <div>
        <h4>Hello {data.name}</h4>
        <div>{data.value}</div>
        <button onClick={actions.plusOne}>+</button>
        <button onClick={actions.minusOne}>-</button>
    </div>;

const FirstExample: ComponentDefinition = {
    // workaround for rule react/display-nam
    view: FirstExampleRenderFn,
    data: () => ( {
        name: 'React',
        value: 3
    } ),
    actions: {
        plusOne: {
            input: {
                // eslint-disable-next-line no-template-curly-in-string
                value: '${data.value}'
            },
            // For some quick arrow function
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            fn: val => val + 1,
            output: {
                'data.value': ''
            }
        },
        minusOne: ( { data, dispatch } ) : void => dispatch( { value: { 'data.value': data.value - 1 } } )
    }
};

export default FirstExample;
