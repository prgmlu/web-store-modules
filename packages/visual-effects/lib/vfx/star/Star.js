import * as THREE from 'three';
import StarVert from './Star.vert';
import StarFrag from './Star.frag';
import { getRandom } from '../../utils/MathHelper';

const FLASH_CENTER_SCALE_FACTOR = 0.4;

export default class Star {
    constructor(spireTexture, centerTexture, request3DSceneRender, color = { r: 1, g: 1, b: 1 }, randomizeColor) {
        this.addToScene = this.addToScene.bind(this);
        this.removeFromScene = this.removeFromScene.bind(this);
        this.setPosition = this.setPosition.bind(this);
        this.setRotation = this.setRotation.bind(this);
        this.setScale = this.setScale.bind(this);
        this.twinkle = this.twinkle.bind(this);

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                'alpha': { type: 'f', value: 2.0 },
                'texture': { type: 't', value: spireTexture },
                'colorVariance': { type: 'c', value: color }
            },
            vertexShader: StarVert,
            fragmentShader: StarFrag,
            transparent: true,
            depthTest: false,
        });
        this.star = new THREE.Mesh(geometry, material);

        const centerMaterial = new THREE.SpriteMaterial({ map: centerTexture, color: new THREE.Color(color.r, color.g, color.b) });
        centerMaterial.polygonOffset = true;
        centerMaterial.polygonOffsetUnits = -0.5;
        this.center = new THREE.Sprite(centerMaterial);

        this.scene = null;

        this.twinkleInterval = null;

        this.request3DSceneRender = request3DSceneRender;
        this.clock = new THREE.Clock();

        this.clock.start();
    }

    addToScene = scene => {
        scene.add(this.center);
        scene.add(this.star);
        this.scene = scene;

        this.twinkle();
    }

    removeFromScene = () => {
        this.scene.remove(this.center);
        this.scene.remove(this.star);
        this.scene = null;

        if (this.twinkleInterval) {
            clearInterval(this.twinkleInterval);
            this.twinkleInterval = null;
        }
    }

    setPosition = (x, y, z) => {
        this.star.position.set(x, y, z);

        this.center.position.set(x, y, z);

    }

    setRotation = (x, y, z) => {
        this.star.rotation.x = x;
        this.star.rotation.y = y;
        this.star.rotation.z = z;

        this.center.rotation.x = x;
        this.center.rotation.y = y;
        this.center.rotation.z = z;
    }

    setScale = (x, y) => {
        this.star.scale.x = x;
        this.star.scale.y = y;

        this.center.scale.x = x * FLASH_CENTER_SCALE_FACTOR;
        this.center.scale.y = y * FLASH_CENTER_SCALE_FACTOR;
    }

    lookAt(x, y, z) {
        this.star.lookAt(x, y, z);

        this.center.lookAt(x, y, z);
    }

    twinkle = () => {
        this.center.visible = true;

        const FREQUENCY = getRandom(4, 7);
        const AMPLITUDE = getRandom(3, 1);
        const VERTICAL_SHIFT = getRandom(1.5, 3);
        this.twinkleInterval = setInterval(() => {
            this.center.material.opacity = (AMPLITUDE * 0.8) * Math.sin(FREQUENCY * this.clock.getElapsedTime()) + VERTICAL_SHIFT;
            this.star.material.uniforms.alpha.value = AMPLITUDE * Math.sin(FREQUENCY * this.clock.getElapsedTime()) + VERTICAL_SHIFT;
        }, 1000 / 15);
    }
}
