import React from 'react';

export interface ObjectLiteral {
    [key: string]: ObjectLiteral | string | number | boolean | Array<any>;
}

export interface Action {
    [key: string]: Function
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

