import * as THREE from 'three';
import { ThreeCacheManager } from 'three-cache-manager';

export function loadTextureAsync(url, signal, roomId = null) {
    return new Promise((resolve, reject) => {
        const cachedTexture = ThreeCacheManager.get(url);
        if (cachedTexture) {
            resolve(cachedTexture);
        } else {
            fetch(url, { method: 'GET', signal }).then((response) => {
                if (response.ok) {
                    return response.blob();
                }
                throw new Error(response);
            }).then((blob) => {
                const newImage = new Image();
                newImage.onload = () => {
                    const texture = new THREE.Texture(newImage);
                    texture.needsUpdate = true;
                    ThreeCacheManager.add(url, texture, roomId);
                    return resolve(texture);
                };
                newImage.src = window.URL.createObjectURL(blob);
            }).catch((e) => {
                console.error(e.message); // eslint-disable-line no-console
                return reject(e);
            });
        }
    });
}

export function loadUIImageAsync(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.onerror = () => {
            reject(new Error(`Failed to load image at src ${url}`));
        };
        image.src = url;
    });
}
