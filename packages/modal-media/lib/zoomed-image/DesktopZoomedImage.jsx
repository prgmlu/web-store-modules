import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LoadingIcon2 } from 'web-store-ui-library';
import { detectBrowser } from 'obsess-device-detector';

const zoomCursor = 'https://cdn.obsess-vr.com/zoomin-18.png';
const unzoomCursor = 'https://cdn.obsess-vr.com/move-18.png';

const isChrome = detectBrowser() === 'chrome';

// Adapting the code at https://codepen.io/denmch/pen/RMbVbj to react
const DesktopZoomedImage = ({ src, scalingDimension, setIsUserInteracting, zoomLevel, onImageLoaded, imageLoaded, onZoom, onUnzoom, container,alt }) => {
    const [left, setLeft] = useState(0);
    const [top, setTop] = useState(0);
    const [height, setHeight] = useState(null);
    const [width, setWidth] = useState(null);
    const [zooming, setZooming] = useState(false);
    const [containerHeight, setContainerHeight] = useState();

    // Used to prevent desktop zoom image from panning while mouse is held down (conflicts with spin image), and to
    // prevent change in zoom from releasing mouse after drag
    const mouseDownPos = useRef();
    const mouseMovePos = useRef();
    const zoomedContainer = useRef();

    // Handle someone clicking in zoomed image, holding down mouse, dragging to outside zoomed image, and releasing
    const handleMouseUpOutsideZoomedImage = (e) => {
        if (zoomedContainer.current && !e.target.contains(zoomedContainer.current)) {
            mouseDownPos.current = null;
            mouseMovePos.current = null;
        }
    }

    useEffect(() => {
        if (scalingDimension) {
            setHeight(scalingDimension === 'height' ? 100 : null);
            setWidth(scalingDimension === 'width' ? 100 : null);
        }
        document.addEventListener('mouseup', handleMouseUpOutsideZoomedImage);
        return (() => {
            document.removeEventListener('mouseup', handleMouseUpOutsideZoomedImage);
        })
    }, [])

    useEffect(() => {
        setHeight(scalingDimension === 'height' ? 100 : null);
        setWidth(scalingDimension === 'width' ? 100 : null);
    }, [scalingDimension])

    useEffect(() => {
        if (container) {
            setContainerHeight(container.clientHeight);
        }
    }, [container])

    const onMouseDown = (e) => {
        zoomedContainer.current = e.target;
        mouseDownPos.current = { x: e.pageX, y: e.pageY };
    }

    const toggleZoom = (e) => {
        e.persist(); // Allow e to be used for zoom call

        // If mouse has been dragged, reset mouse down state, and update image pan to new cursor location. Prevent zoom
        // toggle
        if (mouseMovePos.current) {
            const distance = Math.hypot(mouseDownPos.current.x - mouseMovePos.current.x, mouseDownPos.current.y - mouseMovePos.current.y);
            mouseDownPos.current = null;
            mouseMovePos.current = null;

            // Minimum distance (in px) a user has to drag mouse after holding down to register as dragging instead of clicking
            const distanceThreshold = 5;

            if (distance > distanceThreshold) {
                updateZoom(e);
                return;
            }
        }
        mouseDownPos.current = null;

        const currentZooming = !zooming;
        // Used to prevent carousel from transitioning while zoomed in an image
        if (setIsUserInteracting) {
            setIsUserInteracting(currentZooming);
        }
        
        // Calling onZoom here because it should only be called on toggle. Call onUnzoom in unzoom because unzooming
        // can happen on both click (which calls toggleZoom) and mouse leaving the image (which calls unzoom)
        if (currentZooming) {
            onZoom && onZoom();
            setZooming(currentZooming);
            updateZoom(e);
        } else {
            unzoom();
        }
    }

    const updateZoom = (e) => {
        e.preventDefault();

        // Don't pan image while mouse is held down (only used for spin images as of Sep 2019)
        if (mouseDownPos.current) {
            mouseMovePos.current = { x: e.pageX, y: e.pageY };
            return;
        }

        if (zooming) {
            const imageRect = e.target.getBoundingClientRect();

            // Get the cursor position, minus image container offset
            const x = e.pageX - imageRect.x;
            const y = e.pageY - imageRect.y;

            // Convert coordinates to % of image container width & height
            const xPercent = x / (imageRect.width / 100);
            const yPercent = y / (imageRect.height / 100);

            const difference = zoomLevel - 1; // fractional representation of how much more space the image takes once zoomed
            const padding = 0.2; // fractional representation of how much overall padding exists on the edges of the zoomed in image

            // Move image around between -(padding / 2)% to (padding / 2)% of both width and height,
            // depending on xPercent and yPercent
            setLeft((difference * (padding * 100 + 100) / 2) - (xPercent * (padding + 1) * difference));
            setTop((difference * (padding * 100 + 100) / 2) - (yPercent * (padding + 1) * difference));
        }
    }

    // forceUnzoom is needed because an unzoom can happen on a click (after state has already been reset) or on a mouse leave
    const unzoom = () => {
        if (zooming) {
            setLeft(0);
            setTop(0);
            setZooming(false);
            onUnzoom && onUnzoom();
        }
    }

    const onImageLoad = (e) => {
        onImageLoaded(e.target);
    }

    const imgStyle = {
        left: `${left}%`,
        top: `${top}%`,
        maxHeight: '100%',
        maxWidth: '100%',
        flex: '1 1 0',
        objectFit: width ? 'contain' : 'cover',
        transform: `scale(${zooming ? 2 : 1})`
    };

    if (!imageLoaded) {
        imgStyle.visibility = 'hidden';
    }

    const containerStyle = { height: "100%", cursor: `url(${zooming ? unzoomCursor : zoomCursor}), auto` };

    return (
        <div className="zoomedImageContainer flex-center" style={containerStyle} onMouseDown={onMouseDown} onClick={toggleZoom} onMouseMove={updateZoom} onMouseLeave={unzoom}>
            {!imageLoaded && <LoadingIcon2 />}
            <img
                src={src}
                style={imgStyle}
                onLoad={onImageLoad}
                alt={alt || ''}
            />
        </div>
    );
}

DesktopZoomedImage.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    zoomLevel: PropTypes.number,
    onZoom: PropTypes.func,
    onUnzoom: PropTypes.func,
    scalingDimension: PropTypes.string,
    onImageLoaded: PropTypes.func,
    imageLoaded: PropTypes.bool,
};

export default DesktopZoomedImage;
