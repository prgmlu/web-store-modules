import { InteractableObjectComponent } from 'three-interactable-object';
import { Observer } from '../../three-observer';

// Same observer instance across all ScaleAnimationController instances.
const AnimationObserver = new Observer();

const PLAY_ANIMATION_COUNT_DOWN = 10000;

export default class ScaleAnimationController extends InteractableObjectComponent {
    constructor(scaleAnimator, animationAnalytics, animationInteractionAnalytics) {
        super();
        this.scaleAnimator = scaleAnimator;

        this.animationAnalytics = animationAnalytics.bind(this);
        this.animationInteractionAnalytics = animationInteractionAnalytics.bind(this);
        this.clearAnimationTimeout = this.clearAnimationTimeout.bind(this);
        this.playAnimation = this.playAnimation.bind(this);

        this.animationTimeout = null;
        this.unsubscribe = null;
    }

    start() {
        // The state value of AnimationObserver is a boolean, true = playing, false = not playing.
        this.animationTimeout = setTimeout(()=> {
            this.animationAnalytics();
            AnimationObserver.setState(true);
        }, PLAY_ANIMATION_COUNT_DOWN);

        this.unsubscribe = AnimationObserver.subscribe(this.playAnimation);
    }

    onClick() {
        this.clearAnimationTimeout();
        this.animationInteractionAnalytics();
        AnimationObserver.setState(false);
    }

    onDestroy() {
        this.clearAnimationTimeout();
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    playAnimation(play) {
        if (play) {
            this.scaleAnimator.play();
        } else {
            this.scaleAnimator.stop();
        }
    }

    clearAnimationTimeout() {
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }
    }
}
