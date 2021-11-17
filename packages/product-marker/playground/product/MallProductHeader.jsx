import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProductModal } from 'product-modal';
import { TextWithBackground } from 'web-store-ui-library';

import './MallProductHeader.css';


class MallProductHeader extends Component {
    constructor(props) {
        super(props);

        this.renderProductText = this.renderProductText.bind(this);
    }

    renderProductText() {
        const { productInfo } = this.props;

        if (productInfo) {
            const fields = ProductModal.ContentTypes;

            const brand = productInfo[fields.BRAND];
            const title = productInfo[fields.TITLE];
            const color = productInfo[fields.COLOR];
            const description = productInfo[fields.DESCRIPTION];
            const price = productInfo[fields.PRICE].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            return [brand, title, color, description, price].map((field, index) => {
                if (!field) {
                    return null;
                }

                const fontClass = field === brand ? 'obsessvr-boldFont' : 'obsessvr-regularFont';

                return (
                    <React.Fragment key={index}>
                        <TextWithBackground className={fontClass} text={field} />
                        <br />
                    </React.Fragment>
                );
            });
        }
    }

    render() {
        return (
            <div id="mallProductHeader">
                {this.renderProductText()}
            </div>
        );
    }
}

MallProductHeader.propTypes = {
    productInfo: PropTypes.object,
};

export default MallProductHeader;
