module.exports = {
    // roots: [ '<rootDir>' ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    testMatch: [
        '**/*.test.[tj]s?(x)'
        // '**/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x)'
    ],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}'
    ],
    moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
}
