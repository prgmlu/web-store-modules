let maxTextureImageUnits = -1;
let maxCombinedTextureImageUnits = -1;

export function getMaxTextureImageUnits() {
    if (maxTextureImageUnits !== -1) {
        return maxTextureImageUnits;
    }
    const canvas = document.getElementsByTagName('canvas')[0];
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    console.log('Max texture image units', maxTextureImageUnits); // eslint-disable-line no-console
    return maxTextureImageUnits;
}

export function getMaxCombinedTextureImageUnits() {
    if (maxCombinedTextureImageUnits !== -1) {
        return maxCombinedTextureImageUnits;
    }
    const canvas = document.getElementsByTagName('canvas')[0];
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    maxCombinedTextureImageUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    console.log('Max combined texture image units', maxCombinedTextureImageUnits); // eslint-disable-line no-console
    return maxCombinedTextureImageUnits;
}
