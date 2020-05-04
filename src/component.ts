import React from 'react';

import {
    ComponentFactory
} from './types';


export const createComponent: ComponentFactory = componentDef => props => {
    const [data, setData] = React.useState(() => componentDef.data());
    return React.createElement(componentDef.view, { data, setData });
}
