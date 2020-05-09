import {
    Dispatcher,
    ComponentFactory,
    Component,
    DataStore,
    ActionDefinition
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processOutputData = ( output: { [key: string]: string }, result: any ): DataStore => {
    if ( output ) {
        const res = {};
        for ( const vmPath in output ) {
            const valPath = output[vmPath];
            const valObj = valPath && valPath.length > 0 ? getValue( result, valPath ) : result;
            res[vmPath] = valObj;
        }
        return res;
    }
};

/**
 * create action callback in viewmodel based on action definition
 * @param actionDef action definition
 * @param component component instance
 * @returns fuction callback as action
 */
const createAction = ( actionDef: ActionDefinition, component: Component ) => (): void => {
    // support function in def
    if ( typeof actionDef === 'function' ) {
        return actionDef.call( null, component );
    }

    const { dispatch } = component;

    const actionFunc = actionDef.fn;

    // https://stackoverflow.com/questions/37006008/typescript-index-signature-is-missing-in-type
    // - Put component directly has the risk that people can say component.myAttr = newValue.
    // - {...component} stops it
    const input = evalDataDefinition( actionDef.input, { ...component } );

    // TODO: match name with function parameters
    // https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
    const vals = actionDef.input ? Object.values( input ) : [];

    const funcRes = actionFunc.apply( actionDef.deps, vals );

    dispatch( { value: processOutputData( actionDef.output, funcRes ) } );
};

/**
 * compose all dispatchers to one dispatch API
 * @param dispatchers dispatchers in key-callback map
 * @returns one dispatch API
 */
const composeDispatch = ( dispatchers: { [key: string]: Dispatcher } ): Dispatcher => {
    return ( action ): void => {
        action.value && dispatchers.data( action );
    };
};

/**
 * Create component based on component definition
 * @param componentDef component definition
 * @returns component in specific framework
 */
export const createComponent: ComponentFactory = componentDef => (): JSX.Element => {
    const [ data, setData ] = React.useState( () => componentDef.data() );

    const dispatch = composeDispatch( {
        data: ( action ) => {
            const patch = action.value;
            Object.entries( patch ).forEach( ( [ key, value ] ) => {
                const { path } = parseDataPath( key );
                setValue( data, path, value );
                setData( { ...data } );
            } );
        }
    } );

    const component: Component = { data, dispatch };

    // actions
    component.actions = Object.entries( componentDef.actions ).reduce( ( res, [ key, actionDef ] ) => {
        return {
            ...res,
            [key]: createAction( actionDef, component )
        };
    }, {} );

    // view
    // component.view = componentDef.view;


    return React.createElement( componentDef.view, component );
};

