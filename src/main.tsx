/* eslint-env  */
import React from 'react';
import ReactDOM from 'react-dom';
import { createComponent } from './component';

import FirstExample from './FirstExample';


const FirstViewInstance = createComponent( FirstExample );

// react
ReactDOM.render( <FirstViewInstance />, document.getElementById( 'entry-dom-element' ) );
