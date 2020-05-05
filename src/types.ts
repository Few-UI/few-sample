import React from 'react';

/**
 * https://github.com/SunshowerC/blog/issues/7
 * https://github.com/microsoft/TypeScript/issues/1897
 * https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md#type
 *
 * we only allow name-value pair for now
 */

/**
 * primitive type in store
 */
type Primitive = undefined | null | boolean | number | string;

/**
 * abstract type to present compound
 */
type Compound<T> = Map<T> | Map<T>[] | T[]

/**
 * abstract type to present key-value pair
 */
interface Map<T> {
    [key: string]: T | Compound<T>
}

/**
 * object that can be stringnify and parse back
 */
export type DataDef = Map<Primitive>;

/**
 * data store
 */
export type DataStore = Map<Primitive | Function>;

/**
 * compound object for store
 */
export type DataStoreCompound = Compound<Primitive | Function>;

/////////////////////////////////

export interface PathContext {
    scope: string,
    path: string
}


/**
 * action as function call back. No return value as dispatch
 */
export interface Action {
    [key: string]: { (): void }
}

/**
 * take action as input and execute the dispatch
 */
export interface Dispatcher {
    (action: any): void
}

/**
 * component instance
 */
export interface Component {
    data: DataStore,
    actions: Action,
    dispatch: Function
}

/**
 * view template as fn(component)
 */
export interface ViewTemplate {
    (component: Component): JSX.Element
}


/**
 * comonent definition with 'view', 'data' and 'action'
 */
export interface ComponentDefinition {
    view: ViewTemplate,
    data: { (): DataStore },
    actions: {
        [key: string]: any
    }
}

/**
 * function that compile component definition to component
 */
export interface ComponentFactory {
    (componentDef: ComponentDefinition): React.FunctionComponent;
}

