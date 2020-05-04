import React from 'react';
import ReactDOM from 'react-dom';

import TestComponent from './TestComponent';


const TestComponentInstance = (props: any): JSX.Element => {
    const [data, setData] = React.useState(() => TestComponent.data());

    return <TestComponent.view {...{ data, setData }} />
};

// react
ReactDOM.render(<TestComponentInstance />, document.getElementById('entry-dom-element'));
