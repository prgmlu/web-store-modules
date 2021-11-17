import React, { Component } from 'react';
import PropTypes from 'prop-types';

import StaticImage from './StaticImage.jsx';
import SpinnableImage from './SpinnableImage.jsx';
import {defaultProps, ZoomedImage} from 'web-store-ui-library';
import { ImageTypes, ImageViewAngles } from '../ProductModalEnums';

class ProductModalImage extends Component {
    static ImageTypes = ImageTypes;
    static ViewAngles = ImageViewAngles;

    render() {
        const { thumbnailUrl, sku, spinUrls, hiResSpinUrls, type, onSpinActivated, modalOpened, dragToSpinIconUrl, onZoom, onUnzoom, zoomLevel, scalingDimReady, xTranslation, isUserMoving, setIsUserZooming } = this.props;
        const productImageStyle = { minWidth: '100%', minHeight: '100%', objectFit: 'contain', transition: isUserMoving ? 'all 0ms' : 'all 500ms', padding: '0 0.5em' };

        let image = null;
        switch (type) {
            case ImageTypes.SPIN:
                image =  <SpinnableImage
                    spinUrls={spinUrls}
                    hiResSpinUrls={hiResSpinUrls}
                    imageStyle={productImageStyle}
                    sku={sku}
                    onSpinActivated={onSpinActivated}
                    modalOpened={modalOpened}
                    dragToSpinIconUrl={dragToSpinIconUrl}
                    onZoom={onZoom}
                    onUnzoom={onUnzoom}
                    zoomLevel={zoomLevel}
                    scalingDimReady={scalingDimReady}
                    xTranslation={xTranslation}
                />;
                break;
            case ImageTypes.ZOOM:
                const zoomImageStyle = {
                    ...productImageStyle,
                    transform: `translate(${xTranslation}px, 0px)`
                }
                image = (
                    <div style={zoomImageStyle}>
                        <ZoomedImage src={thumbnailUrl} onZoom={onZoom} onUnzoom={onUnzoom} zoomLevel={zoomLevel} scalingDimReady={scalingDimReady} setIsUserZooming={setIsUserZooming} xTranslation={xTranslation}/>
                    </div>
                )
                break;
            case ImageTypes.STATIC:
                image = <StaticImage src={thumbnailUrl} style={productImageStyle} xTranslation={xTranslation}/>;
                break;
            default:
                image = <StaticImage src={thumbnailUrl} style={productImageStyle} xTranslation={xTranslation}/>;
                break;
        }

        return image
    }
}

ProductModalImage.propTypes = {
    type: PropTypes.string,
    thumbnailUrl: PropTypes.string.isRequired,
    sku: PropTypes.string.isRequired,
    spinUrls: PropTypes.object,
    hiResSpinUrls: PropTypes.object,
    onSpinActivated: PropTypes.func,
    modalOpened: PropTypes.bool,
    dragToSpinIconUrl: PropTypes.string,
    onZoom: PropTypes.func,
    onUnzoom: PropTypes.func,
    zoomLevel: PropTypes.number,
    scalingDimReady: PropTypes.bool,
    ...defaultProps
};

ProductModalImage.defaultTypes = {
    type: ImageTypes.STATIC,
};

export default ProductModalImage
