import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { loadTextureAsync } from 'asset-loader';
import { BackgroundLODs, BackgroundFaces, isImageArrayMatchingLOD } from 'three-background';

const defaultMaxDownloadTimeMS = 4500;

class TiledSceneBackground extends Component {
    constructor(props) {
        super(props);

        this.loadBackgroundAsync = this.loadBackgroundAsync.bind(this);
        this.setBackgroundCubeFaceTextureAsync = this.setBackgroundCubeFaceTextureAsync.bind(this);
        this.processCubeBackgrounds = this.processCubeBackgrounds.bind(this);

        this.cancelled = false;

        this.controller = new AbortController();
    }

    /**
     * Attaches a transition animation callback to load higher LODS 
     */
    attachTransitionCallback() {
        const { transitionAnimation } = this.props.threeJSWorldContext;
        
        if (transitionAnimation) {
            transitionAnimation.subscribeSceneLoad(this.loadHigherLODS.bind(this));
        } else {
            this.loadHigherLODS();
        }
    }

    /**
     * Load first low resolution LOD 1
     */
    async loadLowerLODS () {
        const {
            toggleAutoRotate,
            isUserFirstInteraction,
        } = this.props;
        const lowerLODS = [BackgroundLODs.LOD1];
        
        await this.loadLODS(lowerLODS);

        this.attachTransitionCallback();
        toggleAutoRotate(isUserFirstInteraction);
    }

    /**
     * Load high resolution LODS from 2 and above
     */
    loadHigherLODS() {
        const [,, ...higherLODS] = Object.values(BackgroundLODs);

        this.loadLODS(higherLODS);
    }

    /**
     * Checks if it should skip next LOD loading
     * @param {Number} downloadTime
     * @param {Number} lod
     * @returns {Boolean}
     */
    shouldSkipLoading(downloadTime, lod) {
        const { maxDownloadTimeMSRequiredForLOD3 } = this.props;
        const maxDownloadTime = maxDownloadTimeMSRequiredForLOD3 || defaultMaxDownloadTimeMS;
        const nextLod = lod + 1;
        const isLOD2 = lod === BackgroundLODs.LOD2;
        
        console.log(`Took ${downloadTime}ms to download all images for lod ${lod}`); // eslint-disable-line no-console
     
        if (downloadTime > maxDownloadTime && isLOD2) {
            console.log(`Skipping lod ${nextLod} because download speed for lod ${lod} is slower than ${maxDownloadTime}ms`); // eslint-disable-line no-console
            return true;
        } else if (isLOD2) {
            console.log(`Loading lod ${nextLod} because download speed for lod ${lod} is faster than ${maxDownloadTime}ms`); // eslint-disable-line no-console
        }
    
        return false;
    }

    /**
     * Loads a queue array of LODS
     * @param {Array} lods
     */
    async loadLODS(lods) {
        for (let lod of lods) {
            const startTime = Date.now();

            await this.loadLOD(lod);

            const endTime = Date.now();
            const downloadTime = endTime - startTime;
            const shouldSkipNext = this.shouldSkipLoading(downloadTime, lod);
           
            if (shouldSkipNext) {
                break;
            }
        }
    }

    /**
     * Loads a single LOD
     * @param {Number} lod
     */    
    async loadLOD (lod) {
        try {
            const onLodLoad = this.props[`onLOD${lod}Loaded`];

            await this.loadBackgroundAsync(lod);

            if (this.cancelled) throw new Error('Cancelled');
            if (onLodLoad) onLodLoad();
        } catch(error) {
            console.log(error);
        }
    }

    componentDidMount() {
        // LOD: Level of Detail
        // load the lowest lods first and swap out lods to higher for each face
        this.loadLowerLODS();
    }

    componentWillUnmount() {
        // Cancel promise, so we don't overwrite the current scene's background.
        this.controller.abort();
        this.cancelled = true;
    }

    /**
     * Set background for each cube face at lod.
     * @param {BackgroundLODs} lod - The lod of this background.
     * @returns {Promise} - Are the backgrounds loaded.
     */
    async loadBackgroundAsync(lod) {
        /**
         * ImageUrls: [
         *  [BackgroundLODs.LOD0]: [ url ],                // index 0, length 1
         *  [BackgroundLODS.LOD1]: [ url, url, url, url ], // index 1, length 4
         *  [BackgroundLODS.LOD2]: [ url, .... ]           // index 2, length 16
         *  [BackgroundLODS.LOD3]: [ url, .... ]           // index 3, length 64
         * ]
         */

        const {
            leftImageUrls,
            rightImageUrls,
            topImageUrls,
            bottomImageUrls,
            backImageUrls,
            frontImageUrls,
        } = this.props;
        const promises = [
            [frontImageUrls[lod], lod, BackgroundFaces.FRONT],
            [leftImageUrls[lod], lod, BackgroundFaces.LEFT],
            [rightImageUrls[lod], lod, BackgroundFaces.RIGHT],
            [bottomImageUrls[lod], lod, BackgroundFaces.BOTTOM],
            [topImageUrls[lod], lod, BackgroundFaces.TOP],
            [backImageUrls[lod], lod, BackgroundFaces.BACK],
        ];
        await this.processCubeBackgrounds(this.setBackgroundCubeFaceTextureAsync, promises);
    }

    async processCubeBackgrounds(setCubeFace, promises) {
        const { initStoreScene } = this.props;
        for (const promise of promises) {
            const urls = promise[0];
            const LOD = promise[1];
            const face = promise[2];
            await setCubeFace(urls, LOD, face);
            if (face === BackgroundFaces.FRONT && LOD === BackgroundLODs.LOD1) {
                initStoreScene();
            }
        }
    }

    /**
     * Set the texture on a face of the background cube at lod.
     * @param {Array} urls - The urls for each for the face at lod.
     * @param {BackgroundLODs} lod - The lod of this background.
     * @param {BackgroundFaces} face - The face of the background cube to be set.
     * @returns {Promise} - Are the background cube face set.
     */
    setBackgroundCubeFaceTextureAsync(urls, lod, face) {
        return new Promise((resolve, reject) => {
            if (!isImageArrayMatchingLOD(lod, urls.length)) {
                return reject(`${urls.length} of images does not match the required image count of LOD${lod}!`);
            }
            const { threeJSWorldContext } = this.props;
            const { background } = threeJSWorldContext;
            const loadTexturePromises = urls.map((image) => loadTextureAsync(image, this.controller.signal));
            Promise.all(loadTexturePromises)
                .then((textures) => {
                    if (this.cancelled) {
                        return reject('Cancelled');
                    }
                    console.log('set background face async', lod); // eslint-disable-line no-console
                    return background.setBackgroundFaceAsync(lod, face, textures);
                })
                .then(() => {
                    console.log('set background face async succeed', lod); // eslint-disable-line no-console
                    return resolve(`Background cube face${face} successfully set to LOD${lod} with images ${urls}`);
                })
                .catch(reject);
        });
    }

    render() {
        return (
            <></>
        );
    }
}

/**
 * ImageUrls: [
 *  [BackgroundLODs.LOD0]: [ url ],                // index 0, length 1
 *  [BackgroundLODS.LOD1]: [ url, url, url, url ], // index 1, length 4
 *  [BackgroundLODS.LOD2]: [ url, .... ]           // index 2, length 16
 *  [BackgroundLODS.LOD3]: [ url, .... ]           // index 3, length 64
 * ]
 */
TiledSceneBackground.propTypes = {
    leftImageUrls: PropTypes.array.isRequired,
    rightImageUrls: PropTypes.array.isRequired,
    topImageUrls: PropTypes.array.isRequired,
    bottomImageUrls: PropTypes.array.isRequired,
    backImageUrls: PropTypes.array.isRequired,
    frontImageUrls: PropTypes.array.isRequired,
    threeJSWorldContext: PropTypes.object.isRequired,
    onLOD0Loaded: PropTypes.func,
    onLOD1Loaded: PropTypes.func,
    onLOD2Loaded: PropTypes.func,
    onLOD3Loaded: PropTypes.func,
    initStoreScene: PropTypes.func,
    maxDownloadTimeMSRequiredForLOD3: PropTypes.number,
    readyForLOD2: PropTypes.bool,
};

TiledSceneBackground.defaultProps = {
    readyForLOD2: true,
};

export default TiledSceneBackground;