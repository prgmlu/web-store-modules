import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ZoomedImage.css';
import { isMobileDevice } from 'obsess-device-detector';
import MobileZoomedImage from './MobileZoomedImage';
import DesktopZoomedImage from './DesktopZoomedImage';


const isMobile = isMobileDevice();

class ZoomedImage extends Component {
    constructor(props) {
        super(props);

        this.onImageLoad = this.onImageLoad.bind(this);
        this.getScalingDim = this.getScalingDim.bind(this);

        this.state = {
            scalingDimension: 'width',
            imageLoaded: false,
            imageHeight: 0,
            imageWidth: 0,
        };

        // Used to get access to container element to calculate image sizing
        this.container = React.createRef();
        this.setScaling = null;
    }

    componentDidUpdate(prevProps) {
        const { scalingDimReady } = this.props;
        if (scalingDimReady && !prevProps.scalingDimReady && this.setScaling) {
            this.setScaling(scalingDimReady);
        }
    }

    onImageLoad(img) {
        /**
         * Need to potentially call this functionality
         * (that sets true scalingDimension) twice - once when the zoomed
         * image loads to set initial scaling dimension,
         * and again if the zoomed image wrapper changes dimension after
         * the initial scaling dimension set,
         * e.g. if the color selector renders after initial set
         */
        this.setScaling = (newScalingDimReady) => {
            const scalingDimension = this.getScalingDim(img, this.container.current);
            this.setState({
                scalingDimension,
                imageLoaded: true,
                imageHeight: img.naturalHeight,
                imageWidth: img.naturalWidth,
            });

            if (newScalingDimReady) {
                this.setScaling = null;
            }
        };

        const {scalingDimReady } = this.props;
        this.setScaling(scalingDimReady);
    }

    // Get the scaling dimension (the dimension to render at 100%) based on whether or not rendering with a scaling
    // dimension will break the image out of the container or not. Default scaling dim is height
    getScalingDim(img, container) {
        const { naturalHeight, naturalWidth } = img;

        const { clientHeight, clientWidth } = container;

        const scalingFactor = clientHeight / naturalHeight;
        
        return (naturalWidth * scalingFactor > clientWidth) ? 'width' : 'height';
    }

    render() {
        const {
            zoomLevel, onZoom, alt, oneFingerDrag, ...imageProps
        } = this.props;
        const {
            scalingDimension, imageHeight, imageWidth, imageLoaded,
        } = this.state;

        return (
            <div className="zoomedImageWrapper" ref={this.container}>
                {isMobile
                    ? (
                        <MobileZoomedImage
                            maxZoom={zoomLevel}
                            onZoom={onZoom}
                            scalingDimension={scalingDimension}
                            imageHeight={imageHeight}
                            imageWidth={imageWidth}
                            container={this.container.current}
                            oneFingerDrag={oneFingerDrag}
                            onImageLoaded={this.onImageLoad}
                            imageLoaded={imageLoaded}
                            {...imageProps}
                            alt={alt}
                        />
                    )
                    : (
                        <DesktopZoomedImage
                            zoomLevel={zoomLevel}
                            onZoom={onZoom}
                            scalingDimension={scalingDimension}
                            onImageLoaded={this.onImageLoad}
                            imageLoaded={imageLoaded}
                            container={this.container.current}
                            {...imageProps}
                            alt={alt}
                        />
                    )}
            </div>
        );
    }
}

ZoomedImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    zoomLevel: PropTypes.number,
    onZoom: PropTypes.func,
    onUnzoom: PropTypes.func,
    oneFingerDrag: PropTypes.bool,
    scalingDimReady: PropTypes.bool,
};

ZoomedImage.defaultProps = {
    zoomLevel: 2, // Desktop zoom level and mobile max zoom level
    oneFingerDrag: true,
    scalingDimReady: true,
};

export default ZoomedImage;
