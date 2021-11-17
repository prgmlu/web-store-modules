import React, { Component } from 'react';
import PropType from 'prop-types';

import BaseImage from '../BaseImage/BaseImage';
import defaultProps from '../ComponentEnums';


class LoadingIcon extends Component {
    render() {
        const { id, className, src } = this.props;
        const loadingIconClassName = className ? `flex-center ${className}` : 'flex-center';

        return (
            <BaseImage id={id} className={loadingIconClassName} src={src} />
        );
    }
}

LoadingIcon.propTypes = {
    src: PropType.string,
    ...defaultProps,
};

LoadingIcon.defaultProps = {
    src: 'https://s3.amazonaws.com/web-store-ui-library/default-assets/dot-spinner.svg',
};

export default LoadingIcon;
