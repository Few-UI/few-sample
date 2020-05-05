import React from 'react';

/**
 * https://github.com/SunshowerC/blog/issues/7
 * https://github.com/microsoft/TypeScript/issues/1897
 *
 * we only allow name-value pair for now
 */

export type Primitive = undefined | null | boolean | number | string;

export type Compound<T> = Map<T> | Map<T>[] | T[]
export interface Map<T> {
    [key: string]: T | Compound<T>
}

export type JsonObject = Compound<Primitive>;

export type ObjectLiteral = Map<Primitive | Function>;

export interface PathContext {
    scope: string,
    path: string
}


export interface Action {
    [key: string]: Function
}

export interface Dispatcher {
    (action: any): void
}

export interface Component {
    data: ObjectLiteral,
    actions: Action,
    dispatch: Function
}

export interface ViewTemplate {
    (component: Component): JSX.Element
}


export interface ComponentDefinition {
    view: ViewTemplate,
    data: { (): ObjectLiteral },
    actions: {
        [key: string]: any
    }
}

export interface ComponentFactory {
    (componentDef: ComponentDefinition): React.FunctionComponent;
}

