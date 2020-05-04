
import React from 'react';

export interface ObjectLiteral {
    [key: string]: ObjectLiteral | string | number | boolean | Array<any>;
}

export interface ComponentDefinition {
    view: { ({ data, setData }: { data: ObjectLiteral, setData: Function }): JSX.Element },
    data: { (): ObjectLiteral },
    actions: {
        [key: string]: Function
    }
}

export interface ComponentFactory {
    (componentDef: ComponentDefinition): { (props: React.PropsWithChildren<{}>): JSX.Element };
}


export const createComponent: ComponentFactory = componentDef => props => {
    const [data, setData] = React.useState(() => componentDef.data());
    return React.createElement(componentDef.view, { data, setData });
}
