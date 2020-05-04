import React from 'react';
import ReactDOM from 'react-dom';

import TestComponent from './TestComponent';

// react
ReactDOM.render(React.createElement(TestComponent.view, TestComponent.viewmodel), document.getElementById('entry-dom-element'));
