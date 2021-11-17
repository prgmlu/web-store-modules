import * as THREE from 'three';
import { isMobileDevice } from 'obsess-device-detector';
import { getMaxTextureImageUnits, getMaxCombinedTextureImageUnits } from './TextureUnitDetector';
import { getLinearMipMapLinearFilterCompatibility } from './GPUCompatibility';
import TiledPlaneVert from './shaders/TiledPlane.vert';
import TiledPlaneFrag2x2 from './shaders/TiledPlane2x2.frag';
import TiledPlaneFrag2x4 from './shaders/TiledPlane2x4.frag';
import TiledPlaneFrag4x4 from './shaders/TiledPlane4x4.frag';
import TiledPlaneFrag1x8 from './shaders/TiledPlane1x8.frag';
import { getGPURenderer } from './GPUInfo';

const isMobile = isMobileDevice();

let maxTextureImageUnits = -1;
let maxCombinedTextureImageUnits = -1;

let linearMipMapLinearFilterCompatible = null;

function getTiledPlaneMaterial(tileCountX, tileCountY, textures) {
    if (!validateTileCount(tileCountX, tileCountY)) {
        throw new Error('Invalid tileCountX and tileCountY combination!');
    }
    if (tileCountX * tileCountY !== textures.length) {
        throw new Error(`The length of textures must be the same as tileCountX * tileCountY! Image lenght: ${textures.length} tileCountX: ${tileCountX} tileCountY: ${tileCountY}`);
    }

    let fragmentShader = null;
    if (tileCountX === 2 && tileCountY === 2) {
        fragmentShader = TiledPlaneFrag2x2;
    } else if (tileCountX === 2 && tileCountY === 4) {
        fragmentShader = TiledPlaneFrag2x4;
    } else if (tileCountX === 4 && tileCountY === 4) {
        fragmentShader = TiledPlaneFrag4x4;
    } else if (tileCountX === 1 && tileCountY === 8) {
        fragmentShader = TiledPlaneFrag1x8;
    } else {
        throw new Error(`Invalid tileCountX ${tileCountX} and tileCountY ${tileCountY} combination! Please use one of the following valid tileCountX and tileCountY combinations: 2x2, 2x4, 4x4, 1x8`);
    }

    let material = null;
    if (!fragmentShader) {
        throw new Error(`No fragment shader available for tile combination ${tileCountX}x${tileCountY}`);
    } else {
        if (linearMipMapLinearFilterCompatible === null && !isMobile) {
            // we currently only test for intel chips
            linearMipMapLinearFilterCompatible = getLinearMipMapLinearFilterCompatibility();
        }

        const gpuRenderer = getGPURenderer();

        textures.forEach((texture) => {
            texture.generateMipmaps = true;
            if (!isMobile) {
                if (gpuRenderer.includes('SwiftShader') || gpuRenderer.includes('AMD Radeon Pro') || gpuRenderer.includes('Apple')) {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.minFilter = THREE.NearestFilter;
                } else if (linearMipMapLinearFilterCompatible) {
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.minFilter = THREE.LinearMipMapLinearFilter;
                } else {
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.minFilter = THREE.LinearFilter;
                }
            } else {
                texture.minFilter = THREE.NearestFilter;
            }
            texture.magFilter = THREE.NearestFilter;
        });
        material = new THREE.ShaderMaterial({
            uniforms: {
                textures: { type: 'tv', value: textures },
            },
            vertexShader: TiledPlaneVert,
            fragmentShader,
        });
        material.disposeTextures = function disposeTextures() {
            this.uniforms.textures.value.forEach((texture) => {
                texture.dispose();
            });
        };
        material.disposeTextures = material.disposeTextures.bind(material);
    }
    return material;
}

function validateTileCount(tileCountX, tileCountY) {
    if (maxTextureImageUnits === -1 || maxCombinedTextureImageUnits === -1) {
        checkMaxTextureUnits();
    }

    const textureUnitImageNeeded = tileCountX * tileCountY;
    if (tileCountX * tileCountY > maxTextureImageUnits) {
        console.error(`${textureUnitImageNeeded} is over the Max Texture Image Units limit of ${maxTextureImageUnits}`); // eslint-disable-line no-console
        return false;
    }
    return true;
}

function checkMaxTextureUnits() {
    maxTextureImageUnits = getMaxTextureImageUnits();
    maxCombinedTextureImageUnits = getMaxCombinedTextureImageUnits();
}

export default getTiledPlaneMaterial;
