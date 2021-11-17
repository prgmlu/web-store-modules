import React, { Component } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { ColliderManager } from 'three-physics';
import ThreeJSWorldController from 'three-controller';
import {
    BackgroundSphere, Background, BackgroundLODs, BackgroundFaces,
} from 'three-background';
import { loadTextureAsync } from 'asset-loader';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';

import defaultBackground from '../../../../assets/default360.jpg';

class ThreeJSWorld extends Component {
    constructor(props) {
        super(props);
        this.animate = this.animate.bind(this);
        this.windowResizeHandler = this.windowResizeHandler.bind(this);

        THREE.Cache.enabled = true;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Setup camera
        this.scene.add(this.camera);
        this.camera.position.x = 0.1; // so that camera.target !== camera.position, and keeps the orbit control working.
        this.camera.target = new THREE.Vector3(0, 0, 0);
        this.camera.rotation.y = 90 * Math.PI / 180;
        this.animate();

        // Set up background sphere, collider manager, and collider
        this.backgroundSphere = new BackgroundSphere();
        this.backgroundSphere.addToScene(this.scene);
        this.colliderManager = new ColliderManager();
        this.controller = new ThreeJSWorldController(this.renderer, this.camera, this.colliderManager);

        // so we can pan
        this.controller.controller.enablePan = true;
        this.controller.controller.enableZoom = true;

        // load default background texture
        loadTextureAsync(defaultBackground)
            .then((texture) => {
                this.backgroundSphere.setBackgroundAsync(texture);
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console


        this.background = new Background();
        this.background.addToScene(this.scene);
        this.background.backgroundSetSubject.subscribe((lod, face) => {
            console.log(`Background cube face set to lod${lod} for face${face}`); // eslint-disable-line no-console
        });

        // const s3_bucket_base = 'https://s3.amazonaws.com/obsess-test-image';
        // // https://s3.amazonaws.com/obsess-test-image/2k/2k_back_0_0.jpg
        // function makeImageUrls(face) {
        //     const urls = [];
        //     for (let i = 0; i < 16; i++) {
        //         const row = Math.floor(i / 4);
        //         const column = i % 4;
        //         const url = `${s3_bucket_base}/2k/2k_${face}_${row}_${column}.jpg`;
        //         urls.push(url);
        //     }
        //     return urls;
        // }
        // const frontUrls = makeImageUrls('front');
        // const backUrls = makeImageUrls('back');
        // const topUrls = makeImageUrls('top');
        // const bottomUrls = makeImageUrls('bottom');
        // const leftUrls = makeImageUrls('left');
        // const rightUrls = makeImageUrls('right');

        // const frontPromises = frontUrls.map(image => {
        //     return loadTextureAsync(image);
        // });
        // const backPromises = backUrls.map(image => {
        //     return loadTextureAsync(image);
        // });
        // const topPromises = topUrls.map(image => {
        //     return loadTextureAsync(image);
        // });
        // const bottomPromises = bottomUrls.map(image => {
        //     return loadTextureAsync(image);
        // });
        // const leftPromises = leftUrls.map(image => {
        //     return loadTextureAsync(image);
        // });
        // const rightPromises = rightUrls.map(image => {
        //     return loadTextureAsync(image);
        // });

        // function setCubeFaceTexturesAsync(background, texturePromises, face) {
        //     return new Promise((resolve, reject) => {
        //         Promise.all(
        //             texturePromises
        //         )
        //         .then(textures => {
        //             return background.setBackgroundFaceAsync(BackgroundLODs.LOD2, face, textures);
        //         })
        //         .then(resolve)
        //         .catch(reject);
        //     });
        // }

        // setCubeFaceTexturesAsync(this.background, leftPromises, BackgroundFaces.LEFT)
        //     .then(console.log('LEFT set!')) // eslint-disable-line no-console
        //     .catch(console.error); // eslint-disable-line no-console
        // setCubeFaceTexturesAsync(this.background, rightPromises, BackgroundFaces.RIGHT)
        //     .then(console.log('RIGHT set!')) // eslint-disable-line no-console
        //     .catch(console.error); // eslint-disable-line no-console
        // setCubeFaceTexturesAsync(this.background, topPromises, BackgroundFaces.TOP)
        //     .then(console.log('TOP set!')) // eslint-disable-line no-console
        //     .catch(console.error); // eslint-disable-line no-console
        // setCubeFaceTexturesAsync(this.background, bottomPromises, BackgroundFaces.BOTTOM)
        //     .then(console.log('BOTTOM set!')) // eslint-disable-line no-console
        //     .catch(console.error); // eslint-disable-line no-console
        // setCubeFaceTexturesAsync(this.background, backPromises, BackgroundFaces.BACK)
        //     .then(console.log('BACK set!')) // eslint-disable-line no-console
        //     .catch(console.error); // eslint-disable-line no-console
        // setCubeFaceTexturesAsync(this.background, frontPromises, BackgroundFaces.FRONT)
        //     .then(console.log('FRONT set!')) // eslint-disable-line no-console
        //     .catch(console.error); // eslint-disable-line no-console
    }

    componentDidMount() {
        window.addEventListener('resize', this.windowResizeHandler);
        const root = document.getElementById('app');
        root.appendChild(this.renderer.domElement);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResizeHandler);
        const root = document.getElementById('app');
        root.removeChild(this.renderer.domElement);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }

    windowResizeHandler() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        const { history } = this.props;
        const contextValue = {
            history,
            scene: this.scene,
            colliderManager: this.colliderManager,
            backgroundSphere: this.backgroundSphere,
            background: this.background,
        };
        return (
            <ThreeJSWorldContext.Provider value={contextValue}>
                {this.props.children}
            </ThreeJSWorldContext.Provider>
        );
    }
}

ThreeJSWorld.propTypes = {
    history: PropTypes.object,
};

export default ThreeJSWorld;
