import { useEffect, useRef } from 'react';
import { loadTextureAsync } from 'asset-loader';

import Star from './vfx/star/Star';
import { getRandom } from './utils/MathHelper';

const SPIRE_TEXTURE_URL = 'https://cdn.obsess-vr.com/Flash_spire.png';
const FLASH_CENTER_TEXTURE_URL = 'https://cdn.obsess-vr.com/Flash_center.png';

function getRandomPosition(xRange, yRange, zRange) {
    return { x: getRandom(...xRange), y: getRandom(...yRange), z: getRandom(...zRange)};
}

/**
 * @param {Array} scaleRange - Determines the range of random scales the animation will apply to
 *          example - [0.09, 0.2]
 * @param {Object} positionRange - Determines position in 3D space stars will be populated in, can use multiple StarEffect components to fine tune positioning
 *          example - {
 *                      x: [-3, -3],
 *                      y: [-0.3, 0.4],
 *                      z: [-1.2, -3.4],
 *                     }
 * @param {Object} color - Determines color of effect, RGB values from 0 - 1
 *          example - {
 *                      r: 0.5,
 *                      g: 1,
 *                      b: 0.8,
 *                      }
 * @param {Boolean} randomizeColor - Boolean that controls whether stars have randomized colors on them.
 */
export default function StarEffect(props) {
    useEffect(() => {
        const { scaleRange, positionRange, scene, starCount, addToRenderLoop, removeFromRenderLoop, color = { r: 1, g: 1, b: 1 }, randomizeColor } = props;
        useRef
        const stars = [];

        (async () => {
            const spireTexture = await loadTextureAsync(SPIRE_TEXTURE_URL);
            const centerTexture = await loadTextureAsync(FLASH_CENTER_TEXTURE_URL);
            for (let i = 0; i < starCount; i++) {
                const star = new Star(spireTexture, centerTexture, addToRenderLoop, color, randomizeColor);

                const pos = getRandomPosition(positionRange.x, positionRange.y, positionRange.z);
                star.setPosition(pos.x, pos.y, pos.z);

                star.lookAt(0, 0, 0);

                const scale = getRandom(...scaleRange);
                star.setScale(scale, scale);

                star.animationUUID = addToRenderLoop()
                stars.push(star);
                star.addToScene(scene);
            }
        })();

        return () => {
            stars.forEach(star => {
                star.removeFromScene();
                removeFromRenderLoop(star.animationUUID);
            });
        }
    }, []);

    return null;
}
