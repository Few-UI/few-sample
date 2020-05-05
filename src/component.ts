import {
    ComponentFactory
} from './types';

import {
    setValue
} from './utils';


import React from 'react';
import {
    getValue,
    evalDataDefinition,
    parseDataPath
} from './utils';

/**
 * process output data
 * @param {JSON} outputData output data definition
 * @param {object} result function result
 * @param {object} vm view model object
 */
function processOutputData(outputData, result) {
    if (outputData) {
        const res = {};
        for (let vmPath in outputData) {
            let valPath = outputData[vmPath];
            const valObj = valPath && valPath.length > 0 ? getValue(result, valPath) : result;
            res[vmPath] = valObj;
        }
        return res;
    }
}

const createAction = (actionDef, vm) => () => {

    const { dispatch } = vm;

    let actionFunc = actionDef.fn;

    let input = evalDataDefinition(actionDef.in, vm);

    let vals = actionDef.in ? Object.values(input) : [];
    let funcRes = actionFunc.apply(actionDef.deps, vals);

    dispatch({ value: processOutputData(actionDef.out, funcRes) });
}

const composeDispatch = dispatchers => {
    return (action) => {
        action.value && dispatchers.data(action.value);
    }
};

export const createComponent: ComponentFactory = componentDef => props => {
    const [data, setData] = React.useState(() => componentDef.data());

    const dispatch = composeDispatch({
        data: (patch) => {
            Object.entries(patch).forEach(([key, value]) => {
                const { scope, path } = parseDataPath(key);
                setValue(data, path, value);
                setData({ ...data });
            });
        }
    });

    const vm = { data, dispatch, actions: {} };

    // actions
    vm.actions = Object.entries(componentDef.actions).reduce((res, [key, value]) => {
        return {
            ...res,
            [key]: createAction(value, vm)
        }
    }, {});


    return React.createElement(componentDef.view, vm);
}
