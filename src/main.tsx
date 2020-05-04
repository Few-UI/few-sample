import update from './update';
import ReactDOM from 'react-dom';
import React from 'react';

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

// react
const elem = document.getElementById('react-entry');


ReactDOM.render(<h4>Hello React</h4>, elem);

update();
