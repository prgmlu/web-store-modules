import { InteractableObject } from 'three-interactable-object';
import { SVGSpriteComponent, fetchSVGStringAsync } from 'three-svg';
import { HoverCursorComponent } from 'three-cursor-style';
import NavComponent from './NavComponent';

export default class NavigationMarker extends InteractableObject {
    constructor(navIconFileName, targetLink, onClickAnalytics, hideVisual = false) {
        super();
        this.setPrimaryColor = this.setPrimaryColor.bind(this);
        this.setSecondaryColor = this.setSecondaryColor.bind(this);
        this.setRotationX = this.setRotationX.bind(this);

        const navComponent = new NavComponent(onClickAnalytics);
        navComponent.setTargetLink(targetLink);
        this.attachComponent(navComponent);

        const hoverCursorComponent = new HoverCursorComponent('pointer', 'all-scroll');
        this.attachComponent(hoverCursorComponent);

        this.isSVGLoaded = false;
        this.rotationX = 0;
        this.svgSpriteComponent = new SVGSpriteComponent();
        this.attachComponent(this.svgSpriteComponent);
        const svgUrl = hideVisual ? '' : `https://cdn.obsess-vr.com/${navIconFileName}`;
        fetchSVGStringAsync(svgUrl)
            .then((svgString) => {
                this.svgSpriteComponent.setSVGString(svgString);
                if (this.rotationX) {
                    this.svgSpriteComponent.setRotationX(this.rotationX);
                }
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console
    }

    setPrimaryColor(color) {
        this.svgSpriteComponent.setPrimaryColor(color);
    }

    setSecondaryColor(color) {
        this.svgSpriteComponent.setSecondaryColor(color);
    }

    setRotationX(rotX) {
        this.rotationX = rotX;
        if (!this.isSVGLoaded) {
            console.log(`SVG not loaded, svg rotation will be set to ${rotX} once svg is loaded`); // eslint-disable-line no-console
            return;
        }
        this.svgSpriteComponent.setRotationX(rotX);
    }
}
