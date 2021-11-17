import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProductModal } from 'product-modal';
import { BaseImage } from 'web-store-ui-library';

import SaveButton from '../../../../assets/save-button.png';
import SavedButton from '../../../../assets/saved-button.png';
import './MallProductBody.css';


class MallProductBody extends Component {
    render() {
        const {
            sku, type, thumbnailUrl, spinUrls,
        } = this.props;

        return (
            <>
                <ProductModal.Image sku={sku} type={type} thumbnailUrl={thumbnailUrl} spinUrls={spinUrls} />
                <BaseImage id="save-button" src={SaveButton} />
            </>
        );
    }
}

MallProductBody.propTypes = {
    sku: PropTypes.string,
    type: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    spinUrls: PropTypes.object,
};

export default MallProductBody;
