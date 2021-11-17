import { InteractableObjectComponent } from 'three-interactable-object';

const VALID_CURSOR_STYLES = [
    'alias',
    'all-scroll',
    'auto',
    'cell',
    'context-menu',
    'col-resize',
    'copy',
    'crosshair',
    'default',
    'e-resize',
    'ew-resize',
    'grab',
    'grabbing',
    'help',
    'move',
    'n-resize',
    'ne-resize',
    'nesw-resize',
    'ns-resize',
    'ns-resize',
    'nwse-resize',
    'no-drop',
    'none',
    'not-allowed',
    'pointer',
    'progress',
    'row-resize',
    's-resize',
    'se-resize',
    'sw-resize',
    'text',
    'w-resize',
    'wait',
    'zoom-in',
    'zoom-out',
];

export default class HoverCursorComponent extends InteractableObjectComponent {
    constructor(hoverStyle, unhoverStyle) {
        super();
        this.hoverStyle = hoverStyle;
        this.unhoverStyle = unhoverStyle;
        if (!VALID_CURSOR_STYLES.includes(hoverStyle)) {
            console.error(`Cursor hover style: ${hoverStyle} is not a valid style`); // eslint-disable-line no-console
            this.hoverStyle = 'default';
        }
        if (!VALID_CURSOR_STYLES.includes(unhoverStyle)) {
            console.error(`Cursor unhover style: ${unhoverStyle} is not a valid style`); // eslint-disable-line no-console
            this.unhoverStyle = 'default';
        }
    }

    onHover() {
        document.body.style.cursor = this.hoverStyle;
    }

    onUnhover() {
        if (document.body.style.cursor !== this.hoverStyle) {
            return;
        }
        document.body.style.cursor = this.unhoverStyle;
    }
}
