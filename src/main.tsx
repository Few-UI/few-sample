import React from 'react';
import ReactDOM from 'react-dom';
import { createComponent } from './componet';

import TestComponent from './TestComponent';


const TestComponentInstance = createComponent(TestComponent);

// react
ReactDOM.render(<TestComponentInstance />, document.getElementById('entry-dom-element'));
