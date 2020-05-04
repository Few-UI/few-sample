
import React from 'react';

interface HighOrderFunc {
    (componentDef: any): JSX.Element;
}

export const createComponent = (componentDef: any): HighOrderFunc =>
    (props: React.PropsWithChildren<{}>): JSX.Element => {
        const [data, setData] = React.useState(() => componentDef.data());
        return React.createElement(componentDef.view, { data, setData });
    }
