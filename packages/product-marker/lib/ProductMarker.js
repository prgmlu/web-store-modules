import { InteractableObject } from 'three-interactable-object';
import { SVGSpriteComponent, fetchSVGStringAsync } from 'three-svg';
import { HoverCursorComponent } from 'three-cursor-style';
import { PopUpComponent } from 'pop-up-component';
import { ScaleAnimator, ScaleAnimationController } from 'scale-animation-component';

export default class ProductMarker extends InteractableObject {
    constructor(componentToRender, renderProps, animationAnalytics, animationInteractionAnalytics) {
        super();
        this.setPrimaryColor = this.setPrimaryColor.bind(this);
        this.setSecondaryColor = this.setSecondaryColor.bind(this);

        const popUpComponent = new PopUpComponent(componentToRender, renderProps);
        console.log(renderProps);
        this.attachComponent(popUpComponent);

        const svgUrl = 'https://cdn.obsess-vr.com/product-hotspot-icon-circle.svg';
        fetchSVGStringAsync(svgUrl)
            .then((svgString) => {
                this.svgSpriteComponent.setSVGString(svgString);
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console

        const hoverCursorComponent = new HoverCursorComponent('pointer', 'all-scroll');
        this.attachComponent(hoverCursorComponent);

        this.svgSpriteComponent = new SVGSpriteComponent();
        this.attachComponent(this.svgSpriteComponent);

        this.scaleAnimator = new ScaleAnimator();
        this.attachComponent(this.scaleAnimator);

        this.scaleAnimationController = new ScaleAnimationController(this.scaleAnimator, animationAnalytics, animationInteractionAnalytics);
        this.attachComponent(this.scaleAnimationController);
    }

    setPrimaryColor(color) {
        this.svgSpriteComponent.setPrimaryColor(color);
    }

    setSecondaryColor(color) {
        this.svgSpriteComponent.setSecondaryColor(color);
    }
}
