import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { loadTextureAsync } from 'asset-loader';
import { ThreeCacheManager } from 'three-cache-manager';

class SceneBackground extends Component {
    constructor(props) {
        super(props);
        this.loadFullSizeImage = this.loadFullSizeImage.bind(this);
    }

    componentDidMount() {
        const {
            imageUrl, blurredImageUrl, threeJSWorldContext, onBlurredImageSetToBackground, roomId
        } = this.props;
        const { backgroundSphere } = threeJSWorldContext;
        if (!blurredImageUrl || ThreeCacheManager.get(imageUrl)) {
            this.loadFullSizeImage();
        } else {
            // 1. download blurred image
            // 2. apply blurred image to background
            // 3. download full size image
            // 4. apply full size image to background
            // 5. if blurred image can't be loaded, load full size image
            loadTextureAsync(blurredImageUrl, null, roomId)
                .then((blurredImage) => {
                    console.log('Blurred image set to background'); // eslint-disable-line no-console
                    return backgroundSphere.setBackgroundAsync(blurredImage);
                })
                .then(() => {
                    if (onBlurredImageSetToBackground) {
                        onBlurredImageSetToBackground();
                    }
                    this.loadFullSizeImage();
                })
                .catch((error) => {
                    console.error(error); // eslint-disable-line no-console
                    this.loadFullSizeImage();
                });
        }
    }

    loadFullSizeImage() {
        const {
            imageUrl, threeJSWorldContext, onFullSizeImageSetToBackground, toggleAutoRotate, isUserFirstInteraction, roomId
        } = this.props;
        const { backgroundSphere } = threeJSWorldContext;
        // 1. download full size image
        // 2. apply full size image to background
        loadTextureAsync(imageUrl, null, roomId)
            .then((image) => backgroundSphere.setBackgroundAsync(image))
            .then(() => {
                console.log('Full image set to background!'); // eslint-disable-line no-console
                if (toggleAutoRotate) {
                    toggleAutoRotate(isUserFirstInteraction);
                }

                if (onFullSizeImageSetToBackground) {
                    onFullSizeImageSetToBackground();
                }
            })
            .catch((error) => console.error(error));
    }

    render() {
        return (
            <></>
        );
    }
}

SceneBackground.propTypes = {
    roomId: PropTypes.string,
    imageUrl: PropTypes.string.isRequired,
    blurredImageUrl: PropTypes.string,
    threeJSWorldContext: PropTypes.object.isRequired,
    onBlurredImageSetToBackground: PropTypes.func,
    onFullSizeImageSetToBackground: PropTypes.func,
};

export default SceneBackground;
