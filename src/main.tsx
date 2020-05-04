import React from 'react';
import ReactDOM from 'react-dom';
import { createComponent } from './component';

import FirstView from './FirstView';


const FirstViewInstance = createComponent(FirstView);

// react
ReactDOM.render(<FirstViewInstance />, document.getElementById('entry-dom-element'));
