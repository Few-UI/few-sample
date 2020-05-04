/* eslint-env es6 */

import React from 'react';

// https://github.com/typescript-cheatsheets/react-typescript-cheatsheet
const TestComponent = ({ value }: { value: string }): JSX.Element => <h4>Hello {value}</h4>;
export default TestComponent;
