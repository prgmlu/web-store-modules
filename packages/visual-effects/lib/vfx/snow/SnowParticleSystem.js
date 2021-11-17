import * as THREE from 'three';
import paticleTexture from './particle2.png';

const VALID_RANGE_MIN = 3;
const VALID_RANGE_MAX = 12;

const VECTOR3ZERO = new THREE.Vector3(0, 0, 0);
const SPEED = 0.2;
const SIZE = 0.2;

export default class SnowParticleSystem {
    constructor(particleCount = 5, lifeTimeSeconds = 2, color, side='all') {
        this.getValidPosition = this.getValidPosition.bind(this);

        this.setScene = this.setScene.bind(this);
        this.turnOn = this.turnOn.bind(this);
        this.turnOff = this.turnOff.bind(this);
        this.update = this.update.bind(this);

        this.side = side;
        this.particleCount = particleCount;
        this.lifeTimeSeconds = lifeTimeSeconds;
        this.scene = null;
        const particles = new THREE.Geometry();

        for (let i = 0; i < this.particleCount; i ++) {
            const particle = this.getValidPosition();
            particle.velocity = new THREE.Vector3(THREE.Math.randFloat(1, -1) * SPEED, THREE.Math.randFloat(-1, -1) * SPEED, THREE.Math.randFloat(1, -1) * SPEED);
            particles.vertices.push( particle );
        }
        const textureLoader = new THREE.TextureLoader();
        const material = new THREE.PointsMaterial( { color: color, map: textureLoader.load(paticleTexture), blending: THREE.AdditiveBlending, transparent: true, size: 0.5, depthTest: false } );
        this.points = new THREE.Points( particles, material );
        this.points.frustumCulled = false;

        this.points.position.x = 0;
        this.points.material.size = SIZE;
    }

    getValidPosition() {
        const randomizeSign = (val) => {
            return val *= Math.round(Math.random()) ? 1 : -1;
        }

        const x = this.side === 'all' ? randomizeSign(THREE.Math.randFloat(0, 5)) : this.side === 'front' ? -(THREE.Math.randFloat(0, 5)) : THREE.Math.randFloat(0, 5);
        const y = THREE.Math.randFloat(0, 3);
        const z = randomizeSign(THREE.Math.randFloat(0, 5));

        const dir = new THREE.Vector3(x, y, z);
        dir.normalize();
        const distance = THREE.Math.randFloat(VALID_RANGE_MIN, VALID_RANGE_MAX);
        dir.multiplyScalar(distance);   // this gives the position
        return dir;
    }

    setScene(scene) {
        this.scene = scene;
    }

    turnOn() {
        this.scene.add(this.points);
    }

    turnOff() {
        this.scene.remove(this.points);
    }

    update(deltaTime) {
        const particles = this.points.geometry.vertices;
        
        for (let i = 0; i < particles.length; ++i) {
            const particle = particles[i];
            const velocity = particle.velocity;
            particle.add(new THREE.Vector3(velocity.x * deltaTime, velocity.y * deltaTime, velocity.z * deltaTime));
            const distance = particle.distanceTo(VECTOR3ZERO);
            if (distance > VALID_RANGE_MAX || distance < VALID_RANGE_MIN) {
                const pos = this.getValidPosition();

                particle.x = pos.x;
                particle.y = pos.y;
                particle.z = pos.z;
            }
        }
        this.points.geometry.verticesNeedUpdate  = true;
    }
}
 