import { useEffect } from 'react';
import * as THREE from 'three';

const FlatSceneBackground = ({ backgroundURL, onLoaded, threeJSWorldContext }) => {
    const { flatBackground } = threeJSWorldContext;

    useEffect(() => {
        const loader = new THREE.TextureLoader();

        loader.load(backgroundURL, (texture) => {
            flatBackground.setBackgroundAsync(texture)
                .then(() => {
                    onLoaded && onLoaded();
                });
        });


    }, []);

    return null;
}

export default FlatSceneBackground;
