import React from 'react';

export interface ObjectLiteral {
    [key: string]: ObjectLiteral | string | number | boolean | Function | Array<any>;
}

export interface ViewTemplate {
    ({ data, actions, dispatch }: { data: ObjectLiteral, actions: ObjectLiteral, dispatch: Function }): JSX.Element
}

export interface ComponentDefinition {
    view: ViewTemplate,
    data: { (): ObjectLiteral },
    actions: {
        [key: string]: any
    },
    actions2?: any
}

export interface ComponentFactory {
    (componentDef: ComponentDefinition): { (props: React.PropsWithChildren<{}>): JSX.Element };
}

