import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defaultProps } from 'web-store-ui-library';

import StaticImage from './static-image/StaticImage.jsx';
import ZoomedImage from './zoomed-image/ZoomedImage'
import SpinnableImage from './spin-image/SpinnableImage.jsx';
import ModalVideo from './modal-video/ModalVideo.jsx';
import ThreeViewer from './three-viewer/ThreeViewer.jsx';

import { ImageTypes, ImageViewAngles } from './MediaEnums.js';

class ProductModalImage extends Component {
    static ImageTypes = ImageTypes;
    static ViewAngles = ImageViewAngles;

    render() {
        const {
            index,
            currentIndex,
            videoUrl,
            thumbnailUrl,
            sku,
            spinUrls,
            hiResSpinUrls,
            type,
            onSpinActivated,
            modalOpened,
            dragToSpinIconUrl,
            onZoom,
            onUnzoom,
            zoomLevel,
            scalingDimReady,
            xTranslation,
            isUserMoving,
            setIsUserInteracting,
            gltfModel,
            usdzModel,
            arEnabled,
            focusMode,
            exitingFocusMode,
            setFocusMode,
            onPlayVideo,
            videoIcon,
            noCssTransition,
            playsInline,
            alt
        } = this.props;

        const productImageStyle = { display: 'flex', minWidth: '100%', minHeight: '100%', objectFit: 'contain', transition: noCssTransition || isUserMoving || focusMode || exitingFocusMode ? 'all 0ms' : 'all 500ms', padding: '0 0.5em', transform: `translate(${xTranslation}px, 0px)` };

        let image = null;
        switch (type) {
            case ImageTypes.THREE:
                image = (
                    <ThreeViewer
                        thumbnailUrl={thumbnailUrl}
                        gltfModel={gltfModel}
                        usdzModel={usdzModel}
                        arEnabled={arEnabled}
                        threeStyle={productImageStyle}
                        setIsUserInteracting={setIsUserInteracting}
                    />
                );
                break;
            case ImageTypes.SPIN:
                image = (
                    <SpinnableImage
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
                        setIsUserInteracting={setIsUserInteracting}
                        xTranslation={xTranslation}
                    />
                )
                break;
            case ImageTypes.VIDEO:
                image = (
                    <ModalVideo
                        index={index}
                        currentIndex={currentIndex}
                        src={videoUrl}
                        setFocusMode={setFocusMode}
                        videoStyle={productImageStyle}
                        setIsUserInteracting={setIsUserInteracting}
                        xTranslation={xTranslation}
                        videoIcon={videoIcon}
                        onPlayVideo={onPlayVideo}
                        playsInline={playsInline}
                    />);
                break;
            case ImageTypes.ZOOM:
                image = (
                    <div style={productImageStyle}>
                        <ZoomedImage src={thumbnailUrl} alt={alt} onZoom={onZoom} onUnzoom={onUnzoom} zoomLevel={zoomLevel} scalingDimReady={scalingDimReady} setIsUserInteracting={setIsUserInteracting} xTranslation={xTranslation} />
                    </div>
                )
                break;
            default:
                image = <StaticImage src={thumbnailUrl} style={productImageStyle} xTranslation={xTranslation} />;
                break;
        }

        return image
    }
}

ProductModalImage.propTypes = {
    alt: PropTypes.string,
    type: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    videoUrl: PropTypes.string,
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
