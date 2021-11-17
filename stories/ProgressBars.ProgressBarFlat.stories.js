import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number } from '@storybook/addon-knobs';

import ProgressBarFlat from '../packages/progress-bar/lib/ProgressBarFlat';

storiesOf('Progress Bars - Progress Bar Flat', module)
    .addDecorator(withKnobs)
    .add('with width', () => {
        const label = 'Width';
        const defaultValue = 10;
        const options = {
            range: true,
            min: 0,
            max: 100,
            step: 1,
        };
        const groupId = 'GROUP-ID1';
        const width = number(label, defaultValue, options, groupId);
        return (
          <ProgressBarFlat
              width={`${width}%`}
              fillWrapperBackground="linear-gradient(to bottom, #A3E2EF 35%, #4F9CC0)"
              fillBackground='url("https://obsess-test-image.s3.amazonaws.com/bubbles-mask.gif")'
            />
        );
    });
