import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LoadingIcon2 } from 'web-store-ui-library';
import { detectBrowser } from 'obsess-device-detector';

const isChrome = detectBrowser() === 'chrome';

class MobileZoomedImage extends Component {
    constructor(props) {
        super(props);

        this.onTouchMove = this.onTouchMove.bind(this);
        this.updateZoomLevel = this.updateZoomLevel.bind(this);
        this.updateFingerDrag = this.updateFingerDrag.bind(this);
        this.updateImagePosition = this.updateImagePosition.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onImageLoad = this.onImageLoad.bind(this);

        // left, top, height, and width are all percentage values whose states are stored as floats. The
        // They are converted to strings along with % literals during rendering
        this.state = {
            left: 0,
            top: 0,
            height: props.scalingDimension === 'height' ? 100 : null,
            width: props.scalingDimension === 'width' ? 100 : null,
            containerHeight: null,
            zooming: false,
        };

        // Values used to keep track of previous touch points for zoom/pan calculations
        this.oldDistance = null;
        this.oldOne = null;
        this.oldTwo = null;
        this.oneFingerPos = { x: 0, y: 0 };
    }

    componentDidMount() {
        this.preventDefault = (e) => e.preventDefault();
    }

    componentWillUnmount() {
        if (this.props.container !== null) {
            ['touchstart', 'touchmove'].forEach((e) => this.props.container.removeEventListener(e, this.preventDefault));
        }
    }

    /*
        Get the distance (in px) between two points
     */
    getTwoFingerDistance(one, two) {
        return Math.hypot(one.pageX - two.pageX, one.pageY - two.pageY);
    }

    /*
        Handle touch actions on zoomed image. Two fingers pinched opposite directions should handle zoom/unzoom, while
        two fingers dragged in the same direction should handle pan

        If oneFingerDrag, in addition to previous logic, one finger dragged will also handle pan
     */
    onTouchMove(e) {
        e.preventDefault();
        const { onZoom, oneFingerDrag } = this.props;

        if (e.touches.length === 2) {
            // We stop propagation here to prevent x-translation from superceing zoom events
            e.stopPropagation();
            const one = e.touches[0]; const
                two = e.touches[1];
            const distance = this.getTwoFingerDistance(one, two);

            // The minimum distance fingers have to move to register as a touch for zoom/pan. Prevents accidental motion
            const distanceThreshold = 0.2;

            if (this.oldDistance && Math.abs(distance - this.oldDistance) > distanceThreshold) {
                // Calculate the difference in angle between the two finger motions, and if they are above a certain
                // boundary, register a zoom. Otherwise, register a pan.
                // NOTE: this works, but I don't know if the math on this is actually correct. What do I know, I'm just
                // an engineer
                const aOne = Math.atan2(one.pageY - this.oldOne.pageY, one.pageX - this.oldOne.pageX);
                const aTwo = Math.atan2(two.pageY - this.oldTwo.pageY, two.pageX - this.oldTwo.pageX);

                if (Math.abs(aOne - aTwo) > 2) {
                    this.updateZoomLevel(distance);
                    onZoom && onZoom();
                } else {
                    this.updateFingerDrag(one.pageX, one.pageY);
                }
            }

            this.oldDistance = distance;
            this.oldOne = one;
            this.oldTwo = two;
        } else if (oneFingerDrag && e.touches.length === 1) {
            this.updateFingerDrag(e.touches[0].pageX, e.touches[0].pageY);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.scalingDimension && prevProps.scalingDimension !== this.props.scalingDimension) {
            this.setState({
                height: this.props.scalingDimension === 'height' ? 100 : null,
                width: this.props.scalingDimension === 'width' ? 100 : null,
            });
        }

        if (this.props.container && !prevProps.container) {
            this.setState({ containerHeight: this.props.container.clientHeight - 3 });
            // Need to add these event listeners to stop default safari & chrome behavior on ios (doesn't work with react style handlers)
            ['touchstart', 'touchmove'].forEach((e) => this.props.container.addEventListener(e, this.preventDefault));
        }

        if (this.state.zooming !== prevState.zooming) {
            this.props.setIsUserInteracting(this.state.zooming);
        }
    }

    /*
        Update how much the image size increases/decreases (up to a boundary) based on whether or not they're pinching
        in or pinching out
     */
    updateZoomLevel(newDistance) {
        if (this.oldDistance) {
            const { scalingDimension, maxZoom, container, setIsUserInteracting } = this.props;

            // newScalingDimVal is the new percentage value of height or width (depending on the scalingDimension).
            // It is calculated by finding the difference in this event's two finger pinch distance and dividing that
            // by the length of the container scaling dimension. The difference is multiplied by a factor (here 3) to
            // speed up zoom in/zoom out
            const scalingDimRef = scalingDimension === 'height' ? container.clientHeight : container.clientWidth;
            let newScalingDimVal = this.state[scalingDimension] + ((((newDistance - this.oldDistance) * 3) / scalingDimRef) * 100);

            if (newScalingDimVal > maxZoom * 100) {
                newScalingDimVal = maxZoom * 100;
            } else if (newScalingDimVal < 100) {
                newScalingDimVal = 100;
            }

            this.updateImagePosition(this.state.left, this.state.top);
            this.setState({ [scalingDimension]: newScalingDimVal });
        } else {
            this.oldDistance = newDistance;
        }
    }

    /*
        Determine new left and top offsets of image based on the drag of one finger (even though this can also be
        triggered by a two finger action)
     */
    updateFingerDrag(newX, newY) {
        if (this.oneFingerPos.x && this.oneFingerPos.y) {
            const { container } = this.props;
            const { left, top } = this.state;

            // This converts px values that represent drag distance into percent values that represent drag distance.
            // newLeft and newTop are the tentative new offset values for the image
            const newLeft = left + ((newX - this.oneFingerPos.x) / container.clientWidth) * 100;
            const newTop = top + ((newY - this.oneFingerPos.y) / container.clientHeight) * 100;

            this.updateImagePosition(newLeft, newTop);
        }

        this.oneFingerPos = { x: newX, y: newY };
    }

    /*
        Change position of image up to a boundary. Changes beyond boundaries are reset to boundaries
     */
    updateImagePosition(newLeft, newTop) {
        const { scalingDimension } = this.props;

        // percent representation of how much more space the image takes once zoomed
        const difference = this.state[scalingDimension] - 100;

        const leftTopBoundary = difference / 2;
        if (newLeft > leftTopBoundary) {
            newLeft = leftTopBoundary;
        } else if (newLeft < -leftTopBoundary) {
            newLeft = -leftTopBoundary;
        }

        if (newTop > leftTopBoundary) {
            newTop = leftTopBoundary;
        } else if (newTop < -leftTopBoundary) {
            newTop = -leftTopBoundary;
        }

        this.setState({ left: newLeft, top: newTop });
    }

    onTouchEnd(e) {
        this.setState({ zooming: true });
        if (this.state.width === 100 || this.state.height === 100) {
            this.setState({ zooming: false });
        }

        this.oneFingerPos = { x: 0, y: 0 };
        this.oldDistance = null;
        this.oldOne = null;
        this.oldTwo = null;
    }

    onImageLoad(e) {
        const { onImageLoaded } = this.props;

        onImageLoaded(e.target);
    }

    render() {
        const { src, imageLoaded,alt } = this.props;
        const {
            left, top, height, width, containerHeight
        } = this.state;

        const scalingFactor = height ? height / 100 : width ? width / 100 : 1;

        const imgStyle = {
            left: `${left}%`,
            top: `${top}%`,
            height: height ? `100%` : 'auto',
            width: width ? `100%` : 'auto',
            flex: '1 1 auto',
            objectFit: 'contain',
            transform: `scale(${scalingFactor})`
        };

        if (!imageLoaded) {
            imgStyle.visibility = 'hidden';
        }

        return (
            <div className="zoomedImageContainer flex-center" style={{ height: containerHeight && isChrome ? containerHeight - (containerHeight * 0.3) : '100%' }} onTouchStart={this.onTouchEnd} onTouchMove={this.onTouchMove} onTouchEnd={this.onTouchEnd}>
                {!imageLoaded && <LoadingIcon2 />}
                <img
                    src={src}
                    style={imgStyle}
                    onLoad={this.onImageLoad}
                    alt={alt || ''}
                />
            </div>
        );
    }
}

MobileZoomedImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    maxZoom: PropTypes.number,
    scalingDimension: PropTypes.string,
    imageHeight: PropTypes.number,
    imageWidth: PropTypes.number,
    container: PropTypes.object,
    oneFingerDrag: PropTypes.bool,
    onImageLoaded: PropTypes.func,
    imageLoaded: PropTypes.bool,
    setIsUserInteracting: PropTypes.func
};

MobileZoomedImage.defaultProps = {
    setIsUserInteracting: () => { },
}

export default MobileZoomedImage;
