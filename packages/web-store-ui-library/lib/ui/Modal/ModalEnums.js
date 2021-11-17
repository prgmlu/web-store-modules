import PropTypes from 'prop-types';
import defaultProps from '../ComponentEnums';

export const modalPropTypes = {
    animationType: PropTypes.string,
    onClose: PropTypes.func,
    onOpened: PropTypes.func,
    closeIconNormal: PropTypes.string,
    closeIconHover: PropTypes.string,
    closeContainerStyle: PropTypes.object,
    closeIconStyle: PropTypes.object,
    backgroundColor: PropTypes.string,
    reactRootId: PropTypes.string,
    clickToOpen: PropTypes.bool,
    translate: PropTypes.bool,
    darkenOverlay: PropTypes.bool,
    ...defaultProps,
};

export const modalAnimationTypes = Object.freeze({
    FLYUP: 'flyup',
    BLUR: 'blur',
});
