import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, BaseImage } from 'web-store-ui-library';

import Share from '../../../../assets/share.svg';
import ArrowRight from '../../../../assets/arrow-right.svg';
import './MallProductBuy.css';


class MallProductBuy extends Component {
    render() {
        const {
            url, urlName, buyFont, buyFontSize, buyFontColor,
        } = this.props;

        const buyText = urlName ? `BUY on ${urlName}` : 'BUY NOW';

        return (
            <Grid id="mall-buy" backgroundColor="#000000" columns={5}>
                <Grid.Column id="share-button-container" className="buy-column" columns={1} centered>
                    <BaseImage id="share-button" src={Share} />
                </Grid.Column>
                <Grid.Column className="buy-column" columns={4} centered>
                    <a id="buy-text" href={url} target="_blank" style={{ fontFamily: buyFont, fontSize: buyFontSize, color: buyFontColor }}>
                        {buyText}
                        <BaseImage id="buy-arrow" src={ArrowRight} />
                    </a>
                </Grid.Column>
            </Grid>
        );
    }
}

MallProductBuy.propTypes = {
    url: PropTypes.string,
    urlName: PropTypes.string,
    buyFont: PropTypes.string,
    buyFontSize: PropTypes.number,
    buyFontColor: PropTypes.string,
};

MallProductBuy.defaultProps = {
    buyFont: 'Helvetica, sans-serif',
    buyFontSize: '16px',
    buyFontColor: '#F5F5F5',
};

export default MallProductBuy;
