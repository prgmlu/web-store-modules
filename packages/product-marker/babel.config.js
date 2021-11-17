module.exports = {
    presets: [
        '@babel/preset-env',
        '@babel/preset-react',
    ],
    plugins: [
        [
            'transform-react-remove-prop-types',
            {
                mode: 'remove',
                removeImport: 'true',
                ignoreFilenames: [
                    'node_modules',
                ],
            },
        ],
        [
            '@babel/plugin-proposal-class-properties',
            {
                loose: true,
            },
        ],
        '@babel/plugin-transform-runtime',
    ],
};
