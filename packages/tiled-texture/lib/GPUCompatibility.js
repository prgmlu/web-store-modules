import { getGPUVendor, getGPURenderer } from './GPUInfo';

const VENDOR_INTEL = 'Intel';
const linearMipMapLinearFilterIncompatibleKeywords = [
    'HD Graphics',
    'UHD Graphics',
    'Iris OpenGL Engine',
];

export function getLinearMipMapLinearFilterCompatibility() {
    const vendor = getGPUVendor();
    console.log(vendor); // eslint-disable-line no-console
    if (!vendor.includes(VENDOR_INTEL)) {
        return true;
    }

    const gpuRenderer = getGPURenderer();
    console.log(gpuRenderer); // eslint-disable-line no-console
    for (let i = 0; i < linearMipMapLinearFilterIncompatibleKeywords.length; ++i) {
        if (gpuRenderer.includes(linearMipMapLinearFilterIncompatibleKeywords[i])) {
            console.log('gpu incompatible'); // eslint-disable-line no-console
            return false;
        }
    }

    return true;
}
