import {
    Dispatcher,
    ComponentFactory,
    Component,
    DataStore
} from 'few/src/types';

import React from 'react';

import {
    setValue,
    getValue,
    evalDataDefinition,
    parseDataPath
} from 'few/src/utils';

/**
 * process output data
 * @param output output data definition
 * @param result function return value
 * @returns patch object that patch to scope
 */
const processOutputData = (output: { [key: string]: string }, result: any): DataStore => {
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
const createAction = (actionDef: any, component: Component) => (): void => {

    const { dispatch } = component;

    let actionFunc = actionDef.fn;

    // https://stackoverflow.com/questions/37006008/typescript-index-signature-is-missing-in-type
    // - Put component directly has the risk that people can say component.myAttr = newValue.
    // - {...component} stops it
    let input = evalDataDefinition(actionDef.input, { ...component });

    // TODO: match name with function parameters
    // https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
    let vals = actionDef.input ? Object.values(input) : [];

    let funcRes = actionFunc.apply(actionDef.deps, vals);

    dispatch({ value: processOutputData(actionDef.output, funcRes) });
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

    const vm: Component = { data, dispatch, actions: {} };

    // actions
    vm.actions = Object.entries(componentDef.actions).reduce((res, [key, actionDef]) => {
        return {
            ...res,
            [key]: (typeof actionDef === 'function') ? actionDef.bind(null, vm) : createAction(actionDef, vm)
        }
    }, {});


    return React.createElement(componentDef.view, vm);
}

