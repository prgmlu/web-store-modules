#!/usr/bin/env node
const helper = require('commander');
const { spawn } = require('child_process');

helper
    .version('1.0.0', '-v, --version')
    .description('web-store-modules helper');

helper
    .command('setup')
    .description('Setup internal dependencies for web-store-modules')
    .action(() => {
        console.log('Setting up web-store-modules'); // eslint-disable-line no-console
        spawn(
            process.platform === 'win32' ? 'npm.cmd' : 'npm',
            [
                'install',
                '--production',
            ],
            {
                stdio: 'inherit',
                cwd: 'node_modules/web-store-modules',
            },
        ).on('exit', (code) => {
            if (code !== 0) {
                return;
            }
            spawn(
                process.platform === 'win32' ? 'lerna.cmd' : 'lerna',
                [
                    'bootstrap',
                    '--hoist',
                    '--',
                    '--production',
                ],
                {
                    stdio: 'inherit',
                    cwd: 'node_modules/web-store-modules',
                },
            );
        });
    });

helper
    .command('update')
    .description('Update web-store-modules')
    .action(() => {
        console.log('Updating web-store-modules'); // eslint-disable-line no-console
        spawn(
            process.platform === 'win32' ? 'npm.cmd' : 'npm',
            ['update', 'web-store-modules'],
            { stdio: 'inherit' },
        ).on('exit', (code) => {
            if (code !== 0) {
                return;
            }
            spawn(
                process.platform === 'win32' ? 'npx.cmd' : 'npx',
                ['wsm', 'setup'],
                { stdio: 'inherit' },
            );
        });
    });

helper.parse(process.argv);