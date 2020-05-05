import {
    Dispatcher,
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
 * @param {JSON} output output data definition
 * @param {object} result function result
 * @param {object} vm view model object
 */
const processOutputData = (output, result) => {
    if (output) {
        const res = {};
        for (let vmPath in output) {
            let valPath = output[vmPath];
            const valObj = valPath && valPath.length > 0 ? getValue(result, valPath) : result;
            res[vmPath] = valObj;
        }
        return res;
    }
}

/**
 * create action callback in viewmodel based on action definition
 * @param actionDef action definition
 * @param component component instance
 * @returns fuction callback as action
 */
const createAction = (actionDef, component) => () => {

    const { dispatch } = component;

    let actionFunc = actionDef.fn;

    let input = evalDataDefinition(actionDef.in, component);

    // TODO: match name with function parameters
    // https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
    let vals = actionDef.in ? Object.values(input) : [];

    let funcRes = actionFunc.apply(actionDef.deps, vals);

    dispatch({ value: processOutputData(actionDef.out, funcRes) });
}

/**
 * compose all dispatchers to one dispatch API
 * @param dispatchers dispatchers in key-callback map
 * @returns one dispatch API
 */
const composeDispatch = (dispatchers: { [key: string]: Dispatcher }): Dispatcher => {
    return (action) => {
        action.value && dispatchers.data(action.value);
    }
};

/**
 * Create component based on component definition
 * @param componentDef component definition
 * @returns component in specific framework
 */
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
