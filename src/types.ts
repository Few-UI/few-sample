import React from 'react';

export interface ObjectLiteral {
    [key: string]: ObjectLiteral | string | number | boolean | Array<any>;
}

export interface ViewTemplate {
    ({ data, setData }: { data: ObjectLiteral, setData: Function }): JSX.Element
}

export interface ComponentDefinition {
    view: ViewTemplate,
    data: { (): ObjectLiteral },
    actions: {
        [key: string]: Function
    }
}

export interface ComponentFactory {
    (componentDef: ComponentDefinition): { (props: React.PropsWithChildren<{}>): JSX.Element };
}

