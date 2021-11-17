import { InteractableObjectComponent } from 'three-interactable-object';

function getWavePoint(time, midPoint, amplitude, frequency) {
    // Sine wave point for breathing animation
    return amplitude * Math.cos(frequency * time) + midPoint;
}

const FRAME_RATE = 1000 / 60; // 60 frames per second for smooth animation
const WAVE_FREQUENCY = 0.002; // Affects speed of animation
const AMPLITUDE_DIVISOR = 8; // 1 - 10, 10 will keep the scaling limited to ~ 1.5x larger or smaller, reducing amplitude divisor will make the scaling more extreme

export default class ScaleAnimator extends InteractableObjectComponent {
    constructor() {
        super();
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
        this.returnToOriginalScale = this.returnToOriginalScale.bind(this);

        this.animationInterval = null;
        this.setToOriginalScale = false;
        this.originalScale = null;
        this.startTime = null;
        this.startAnimationFlag = false;
    }

    onDestroy() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    play() {
        // Checks if animation is already playing and returns so a duplicate animationInterval isn't set
        if (!this.owner || this.originalScale) {
            return;
        }
        // visualObject is a sprite from Three.JS, sprite inherits from Object3D. [https://threejs.org/docs/#api/en/core/Object3D]
        const { scale } = this.owner.visualObject;
        this.startTime = Date.now();
        this.originalScale = scale.clone();

        const upperBound = scale.x;
        // Lower Bound scales to 90% of upper bound
        const lowerBound = upperBound * 0.9;
        const midPoint = (upperBound + lowerBound) / 2;

        const animationAmplitude = midPoint / AMPLITUDE_DIVISOR;
        const animationFrequency = WAVE_FREQUENCY;
        this.animationInterval = setInterval(() => {
            const currentTime = Date.now();
            const timePassed = currentTime - this.startTime;
            const wavePoint = getWavePoint(timePassed, midPoint, animationAmplitude, animationFrequency);

            // Don't start animating until the scale is close to original scale.
            if (!this.startAnimationFlag) {
                if (wavePoint > this.originalScale.x - 0.001 && wavePoint < this.originalScale.x + 0.001) {
                    this.startAnimationFlag = true;
                }
                return;
            }

            scale.x = wavePoint;
            scale.y = wavePoint;

            if (this.setToOriginalScale) {
                this.returnToOriginalScale();
            }
        }, FRAME_RATE);
    }

    returnToOriginalScale() {
        const { scale } = this.owner.visualObject;
        if (scale.x > this.originalScale.x - 0.001 && scale.x < this.originalScale.x + 0.001) {
            scale.x = this.originalScale.x;
            scale.y = this.originalScale.y;

            clearInterval(this.animationInterval);
            this.animationInterval = null;
            this.startTime = null;
            this.originalScale = null;
        }
    }

    // clean up internal state and flag removal of animation interval
    stop() {
        if (!this.originalScale || !this.owner) {
            return;
        }
        // Set a signal to stop animation, will fulfill a condition to animate back to original position
        this.setToOriginalScale = true;
    }
}
