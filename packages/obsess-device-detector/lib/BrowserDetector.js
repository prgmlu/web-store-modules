import { detect } from 'detect-browser';
const browser = detect();
 
export const detectBrowser = () => {
    switch (browser && browser.name) {
        case 'chrome':
            return 'chrome';
        case 'firefox':
            return 'firefox';
        case 'edge':
            return 'edge';
        case 'ie': 
            return 'ie';
        default:
            break;
    }
}