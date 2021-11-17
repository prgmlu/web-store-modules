import { InteractableObject } from 'three-interactable-object';
import { SVGSpriteComponent, fetchSVGStringAsync } from 'three-svg';
import { HoverCursorComponent } from 'three-cursor-style';
import { PopUpComponent } from 'pop-up-component';

export default class VideoMarker extends InteractableObject {
    constructor(componentToRender, renderProps) {
        super();

        // Set the color of the marker
        this.setPrimaryColor = this.setPrimaryColor.bind(this);
        this.setSecondaryColor = this.setSecondaryColor.bind(this);

        const hoverCursorComponent = new HoverCursorComponent('pointer', 'all-scroll');
        this.attachComponent(hoverCursorComponent);

        // this.rotationX = 0;

        // this.isSVGLoaded = false;
        this.svgSpriteComponent = new SVGSpriteComponent();
        this.attachComponent(this.svgSpriteComponent);
        const svgUrl = 'https://cdn.obsess-vr.com/play-icon.svg';
        fetchSVGStringAsync(svgUrl)
            .then((svgString) => {
                this.svgSpriteComponent.setSVGString(svgString);
                if (this.rotationX) {
                    this.svgSpriteComponent.setRotationX(this.rotationX);
                }
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console

        const popUpComponent = new PopUpComponent(componentToRender, renderProps);
        this.attachComponent(popUpComponent);
    }

    setPrimaryColor(color) {
        this.svgSpriteComponent.setPrimaryColor(color);
    }

    setSecondaryColor(color) {
        this.svgSpriteComponent.setSecondaryColor(color);
    }
}
