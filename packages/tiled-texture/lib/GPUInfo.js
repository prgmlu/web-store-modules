let deviceDebugInfo = null;
let glContext = null;
let gpuVendor = null;
let gpuRenderer = null;

function getGL() {
    if (!glContext) {
        const canvas = document.getElementsByTagName('canvas')[0];
        
        glContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    }
    return glContext;
}

function getDebugInfo() {
    if (!deviceDebugInfo) {
        const gl = getGL();
        deviceDebugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    }
    return deviceDebugInfo;
}

export function getGPUVendor() {
    if (!gpuVendor) {
        const debugInfo = getDebugInfo();
        const gl = getGL();
        gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    }
    return gpuVendor;
}

export function getGPURenderer() {
    if (!gpuRenderer) {
        const debugInfo = getDebugInfo();
        const gl = getGL();
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    return gpuRenderer;
}
