import nx from '@nx/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    ...nx.configs['flat/react'],
    {
        ignores: [
            '**/dist',
            '**/vite.config.*.timestamp*',
            '**/vitest.config.*.timestamp*',
        ],
    },
    {
        plugins: {
            'unused-imports': unusedImports,
        },
    },
    {
        files: [
            '**/*.ts',
            '**/*.tsx',
            '**/*.cts',
            '**/*.mts',
            '**/*.js',
            '**/*.jsx',
            '**/*.cjs',
            '**/*.mjs',
        ],
        rules: {
            // Ensure JSX component identifiers are considered "used"
            'react/jsx-uses-vars': 'error',

            // Turn off the default unused-vars checks
            // (Nx will be using @typescript-eslint/no-unused-vars under the hood)
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',

            // Delegate to eslint-plugin-unused-imports
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',  // allow `_ignored` vars
                    args: 'after-used',
                    argsIgnorePattern: '^_',  // allow `_ignored` args
                },
            ],
        },
    },
];
