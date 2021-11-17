import TWEEN from 'three/examples/jsm/libs/tween.module.min';

export const EFFECTS = {
    NO_EFFECT: 'NO_EFFECT',
    ZOOM_FADE: 'ZOOM_FADE',
    FADE: 'FADE',
}

export default class TransitionAnimation {
    constructor(threeJsContext) {
        this.threeJsContext = threeJsContext;

        this.sceneLoadObserver = [];
        this.effectCanvas = document.createElement('canvas');
        this.copyCanvas = document.createElement('canvas');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    /**
     * Creates a context and set width/height of canvas
     * @param {HTMLCanvasElement} canvas
     * @returns {CanvasRenderingContext2D}
     */
    createCanvasContext(canvas) {
        canvas.width = this.width; 
        canvas.height = this.height;
        
        return canvas.getContext('2d');
    }

    /**
     * Draws a copy frame of current renderer canvas
     */
    drawFirstFrame() {
        this.effectContext = this.createCanvasContext(this.effectCanvas);
        this.copyContext = this.createCanvasContext(this.copyCanvas);
        const { domElement } = this.threeJsContext.renderer;

        this.effectCanvas.style.zIndex = 10;
        this.threeJsContext.root.appendChild(this.effectCanvas);
        
        this.copyContext.drawImage(
            domElement, 0, 0, this.width, this.height,
        );
    }

    /**
     * Subscribes to onSceneLoad observer
     * @param {Function} func
     */
    subscribeSceneLoad(func) {
        this.sceneLoadObserver.push(func);
    }

    /**
     * Unsubscribes to onSceneLoad observer
     * @param {Function} removedFunc
     */
    unsubscribeSceneLoad(removedFunc) {
        this.sceneLoadObserver.filter((func) => func !== removedFunc);
    }

    /**
     * Executes onSceneLoad observer
     */
    onSceneLoad() {
        this.sceneLoadObserver.forEach((func) => {
            func.call();
            this.unsubscribeSceneLoad(func);
        });
    }

    /**
     * Empty transition animation
     * @returns {TWEEN.Tween}
     */
    noEffect () {
        this.threeJsContext.tweenIsPlaying = true;

        return new TWEEN.Tween()
            .to({}, 500)
            .onComplete(() => {
                this.onSceneLoad();
                this.threeJsContext.tweenIsPlaying = false;
            })
            .start();
    }

    /**
     * Zoom then fade transition animation
     * @returns {TWEEN.Tween}
     */
    zoomFade () {
        const options = { opacity: 1, scale: 1 };

        this.threeJsContext.tweenIsPlaying = true;
        this.drawFirstFrame();
    
        return new TWEEN.Tween(options)
            .to({ opacity: 0, scale: 2 }, 1500)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(()=> {
                this.effectContext.clearRect(0,0, this.width, this.height);
                this.effectContext.globalAlpha = options.opacity;
                
                const x = (this.width / 2) - (this.width / 2) * options.scale;
                const y = (this.height / 2) - (this.height / 2) * options.scale;
    
                this.effectContext.drawImage(
                    this.copyCanvas, x, y, this.width * options.scale, this.height * options.scale,
                );
            })
            .onComplete(() => {
                this.effectContext.clearRect(0,0, this.width, this.height);
                this.threeJsContext.root.removeChild(this.effectCanvas);
                this.threeJsContext.tweenIsPlaying = false;
                
                this.onSceneLoad();
            })
            .start();
    }

    /**
     * Fade transition animation
     * @returns {TWEEN.Tween}
     */
    fade () {
        const options = { opacity: 1, scale: 1 };

        this.threeJsContext.tweenIsPlaying = true;
        this.drawFirstFrame();

        return new TWEEN.Tween(options)
            .to({ opacity: 0 }, 1000)
            .onUpdate(()=> {
                this.effectContext.clearRect(0,0, this.width, this.height);
                this.effectContext.globalAlpha = options.opacity;
                
                this.effectContext.drawImage(
                    this.copyCanvas, 0, 0, this.width, this.height,
                );
            })
            .onComplete(() => {
                this.effectContext.clearRect(0,0, this.width, this.height);
                this.threeJsContext.root.removeChild(this.effectCanvas);
                this.threeJsContext.tweenIsPlaying = false;
                
                this.onSceneLoad();
            })
            .start();
    }

    /**
     * Starts animation based on effect passed
     * @param {string} effect
     * @returns {TWEEN.Tween}
     */
    startAnimation (effect) {
        switch(effect) {
            case EFFECTS.NO_EFFECT:
                return this.noEffect();
            case EFFECTS.ZOOM_FADE:
                return this.zoomFade();
            case EFFECTS.FADE:
                return this.fade();
            default:
                return this.noEffect();
        }
    }
}
