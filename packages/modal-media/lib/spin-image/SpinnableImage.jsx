import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isMobileDevice } from 'obsess-device-detector'
import { ImageViewAngles } from "../MediaEnums.js";
import { loadUIImageAsync } from 'asset-loader';
import { LoadingIcon2 } from "web-store-ui-library";
import ZoomedImage from '../zoomed-image/ZoomedImage';

import './SpinnableImage.css'

import './SpinnableImage.css'

const isMobile = isMobileDevice();
const minSpinDelta = 10;
const minSwitchDelta = 20;

class SpinnableImage extends Component {
    static showCalled = false;

    constructor(props) {
        super(props);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.loadNewSpinImages = this.loadNewSpinImages.bind(this);
        this.renderDragToSpin = this.renderDragToSpin.bind(this);
        this.spin = this.spin.bind(this);
        this.delayedAutoSpin = this.delayedAutoSpin.bind(this);
        this.autoSpin = this.autoSpin.bind(this);
        this.switchView = this.switchView.bind(this);

        this.state = {
            currentViewAngle: ImageViewAngles.MID,
            currentImageIndex: 0,
            allImagesLoaded: false,
            allHiResImagesLoaded: false,
            didSpin: false
        };
        this.spinOnModalOpen = false;

        this.lastSpinX = 0;
        this.lastSpinY = 0;
        this.canSpin = false;
        this.autoSpinner = null;

        // Keeps track if any first image is loaded, persists across color selector switches. This is to avoid loading
        // icon appearing between each product switch
        // TODO: Refactor so that this component never shows loading icon, and defer loading icon rendering to callee
        this.firstImageLoaded = false;
    }

    // Need to move image loading logic to ComponentDidUpdate() to integrate with color selector
    componentDidMount() {
        if (isMobile) {
            window.addEventListener('touchmove', this.onTouchMove);
        } else {
            window.addEventListener('mousemove', this.onMouseMove);
        }
        this.loadNewSpinImages();
    }

    loadNewSpinImages(hiRes=false) {
        const { spinUrls, hiResSpinUrls } = this.props;
        const promises = [];

        const spinUrlsToLoad = hiRes ? hiResSpinUrls : spinUrls;

        Object.entries(spinUrlsToLoad).forEach(([pov, urls]) => {
            if (urls) {
                urls.forEach(url => {
                    promises.push(loadUIImageAsync(url));
                });
            }
        });

        Promise.all(promises)
        .then(values => {
            this.setState({ allImagesLoaded: true, allHiResImagesLoaded: hiRes });
            this.firstImageLoaded = true;
            
            if (!hiRes) {
                if (this.props.modalOpened) {
                    this.delayedAutoSpin(spinUrls.mid.length);
                } else {
                    this.spinOnModalOpen = true;
                }

                // If hi res spin images exist
                if (hiResSpinUrls && Object.entries(hiResSpinUrls).length !== 0 && Object.values(hiResSpinUrls).some((pov) => pov)) {
                    this.loadNewSpinImages(true);
                }
            }

        }).catch((error) => {
            console.error('Spin image load image src failed with error:', error);
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.sku !== prevProps.sku) {
            this.setState({ allImagesLoaded: false, allHiResImagesLoaded: false })
            this.loadNewSpinImages();
        }
    }

    componentWillUnmount() {
        if (isMobile) {
            window.removeEventListener('touchmove', this.onTouchMove);
        } else {
            window.removeEventListener('mousemove', this.onMouseMove);
        }
    }

    onMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.setIsUserInteracting(true);
        this.lastSpinX = event.clientX;
        this.lastSpinY = event.clientY;
        this.canSpin = true;
        window.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseUp(event) {
        event.preventDefault();
        this.props.setIsUserInteracting(false);
        this.canSpin = false;
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    onMouseMove(event) {
        event.preventDefault();
        if (!this.canSpin || !this.state.allImagesLoaded) {
            return;
        }
        this.spin(event.clientX);
        this.switchView(event.clientY);
    }

    onTouchStart(event) {
        event.preventDefault();
        event.stopPropagation();
        this.props.setIsUserInteracting(true);
        this.lastSpinX = event.touches[0].clientX;
        this.lastSpinY = event.touches[0].clientY;
        this.canSpin = true;
    }

    onTouchMove(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            if (!this.canSpin || !this.state.allImagesLoaded) {
                return;
            }
            this.spin(event.touches[0].clientX);
            this.switchView(event.touches[0].clientY);
        } else {
            this.canSpin = false;
        }
    }

    // Can start autospin after a short delay
    delayedAutoSpin(i) {
        setTimeout(() => this.autoSpin(i), 1000);
        // this.autoSpin(i);
    }

    autoSpin(i) {
        const srcs = this.props.spinUrls[this.state.currentViewAngle];

        this.autoSpinner = setTimeout(() => {
            const nextIndex = this.state.currentImageIndex + 1;
            const newIndex = nextIndex >= srcs.length ? 0 : nextIndex;

            this.setState({ currentImageIndex: newIndex});

            if (--i) {
                this.autoSpin(i);
            } else {
                this.setState({showDragMessage: true});
                setTimeout(() => {
                    SpinnableImage.showCalled = true;
                    this.setState({showDragMessage: false});
                }, 5000)
            }
        }, 100);
    }

    renderDragToSpin() {
        const dragToSpinClasses = this.state.allImagesLoaded ? 'dragToSpinIcon' :  'dragToSpinIcon fadeInOut';

        return(
            <img
                src={this.props.dragToSpinIconUrl}
                className={dragToSpinClasses}
            />
        );
    }

    spin(currentX) {
        const { spinUrls, onSpinActivated } = this.props;
        const { currentViewAngle, currentImageIndex, didSpin } = this.state;

        const deltaX = currentX - this.lastSpinX;
        const srcs = spinUrls[currentViewAngle];
        const length = srcs.length;

        if (Math.abs(deltaX) > minSpinDelta) {
            this.lastSpinX = currentX;
            let indexDelta = deltaX > 0 ? -1 : 1;

            let newIndex = currentImageIndex + indexDelta;
            if (newIndex >= length) {
                newIndex = 0;
            }
            if (newIndex < 0) {
                newIndex = length - 1;
            }

            let updateDidSpin = didSpin
            if (!updateDidSpin) {
                if (onSpinActivated) { onSpinActivated(); }
                updateDidSpin = true;
            }

            this.setState({
                currentImageIndex: newIndex,
                showDragMessage: false,
                didSpin: updateDidSpin
            });
            SpinnableImage.showCalled = true;
        }
    }

    switchView(currentY) {
        const { spinUrls } = this.props;
        const { currentViewAngle } = this.state;

        let deltaY = currentY - this.lastSpinY;
        if (deltaY > minSwitchDelta && currentViewAngle !== ImageViewAngles.HIGH) {
            SpinnableImage.showCalled = true;
            const nextAngle = currentViewAngle === ImageViewAngles.MID ? ImageViewAngles.HIGH : ImageViewAngles.MID;
            if (spinUrls[nextAngle].length > 0) {

                this.setState({ currentViewAngle: nextAngle, showDragMessage: false });
            }
        } else if (deltaY < -minSwitchDelta && currentViewAngle !== ImageViewAngles.LOW) {
            SpinnableImage.showCalled = true;

            const nextAngle = currentViewAngle === ImageViewAngles.MID ? ImageViewAngles.LOW : ImageViewAngles.MID;
            if (spinUrls[nextAngle].length > 0) {
                this.setState({ currentViewAngle: nextAngle, showDragMessage: false });
            }
        }
    }

    render() {
        const { spinUrls, hiResSpinUrls, imageStyle, onZoom, onUnzoom, zoomLevel, setIsUserInteracting } = this.props;
        const { currentViewAngle, currentImageIndex, allImagesLoaded, allHiResImagesLoaded } = this.state;

        const srcs = allHiResImagesLoaded ? hiResSpinUrls[currentViewAngle] : spinUrls[currentViewAngle];
        let imageSrc = srcs[currentImageIndex];

        // If all the images have loaded but the modal hasn't finished opening yet
        if (this.spinOnModalOpen && this.props.modalOpened) {
            this.spinOnModalOpen = false;
            this.delayedAutoSpin(spinUrls.mid.length);
        }
        return (
            <React.Fragment>
                <div style={imageStyle} onMouseDown={this.onMouseDown} onTouchStart={this.onTouchStart} onTouchEnd={() => {setIsUserInteracting(false)}}>
                    {this.renderDragToSpin()}
                    {this.firstImageLoaded
                        ? <ZoomedImage oneFingerDrag={false} imageStyle={imageStyle} src={imageSrc} onZoom={onZoom} onUnzoom={onUnzoom} zoomLevel={zoomLevel} setIsUserInteracting={setIsUserInteracting} />
                        : <LoadingIcon2 />
                    }
                </div>
            </React.Fragment>
        );
    }
}

SpinnableImage.propTypes = {
    sku: PropTypes.string.isRequired,
    onSpinActivated: PropTypes.func,
    imageStyle: PropTypes.object,
    modalOpened: PropTypes.bool,
    spinUrls: PropTypes.object,
    hiResSpinUrls: PropTypes.object,
    dragToSpinUrl: PropTypes.string,
    dragToSpinIconUrl: PropTypes.string
};

export default SpinnableImage