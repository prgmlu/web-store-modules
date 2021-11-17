import * as THREE from 'three';

/**
 * Animate sprite sheet.
 */
export default class SpriteSheetAnimator {
    /**
     *
     * @param {THREE.Texture} texture - THREE.js texture
     * @param {int} tileCountX - Horizontal tile count
     * @param {int} frameSpeed - Frames per second
     */
    constructor(texture, tileCountX, frameSpeed = 60) {
        this.update = this.update.bind(this);

        this.texture = texture;
        this.tileCountX = tileCountX;

        this.perFrameTimeMilliseconds = 1000 / frameSpeed;
        this.timeSinceLastFrameMilliseconds = 0;
        this.texture.repeat.x = 1 / this.tileCountX;
        this.texture.offset.x = 0;
        this.currentTile = 0;
    }

    update(deltaTimeMilliseconds) {
        this.timeSinceLastFrameMilliseconds += deltaTimeMilliseconds;
        if (this.timeSinceLastFrameMilliseconds >= this.perFrameTimeMilliseconds) {
            // go to next frame
            this.currentTile++;
            if (this.currentTile === this.tileCountX) {
                this.currentTile = 0;
            }
            this.texture.offset.x = this.currentTile / this.tileCountX;
            this.timeSinceLastFrameMilliseconds = 0;
        }
    }
}
