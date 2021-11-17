const DeviceEnum = Object.freeze({
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
});

function getDevice() {
    const validExp = new RegExp('Android|webOS|iPhone|iPad|'
        + 'BlackBerry|Windows Phone|'
        + 'Opera Mini|IEMobile|Mobile',
    'i');
    console.log(navigator.userAgent)

    if (validExp.test(navigator.userAgent)) {
        return DeviceEnum.MOBILE;
    }
    
    // Additional check to see if device is an iPad pro
    if (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document) {
        return DeviceEnum.MOBILE;
    }
    
    return DeviceEnum.DESKTOP;
}

function checkMobileOS() {
    const mobileUserAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (mobileUserAgent.match(/iPad/i) || mobileUserAgent.match(/iPhone/i) || mobileUserAgent.match(/iPod/i)) {
        return 'iOS';
    } if (mobileUserAgent.match(/Android/i)) {
        return 'Android';
    }
    return 'unknown';
}

const isMobile = getDevice() === DeviceEnum.MOBILE;
const mobileOS = checkMobileOS();

export function isMobileDevice() {
    return isMobile;
}

export function getMobileOS() {
    return mobileOS;
}

export function isIpadDevice() {
    const mobileUserAgent = navigator.userAgent || navigator.vendor || window.opera;
    return mobileUserAgent.match(/iPad/i);
}
