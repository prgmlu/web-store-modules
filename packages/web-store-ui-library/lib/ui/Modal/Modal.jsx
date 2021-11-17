import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';

import { isMobileDevice } from 'obsess-device-detector';
import { modalPropTypes, modalAnimationTypes } from "./ModalEnums.js";
import './Modal.css';
import ReactDOM from "react-dom";
import { Overlay, BaseImage } from '../../../index';
import { ModalContext } from './ModalContext.jsx';


const isMobile = isMobileDevice();
const modalOverlayId = 'obsess-modal-overlay';

class Modal extends Component {
    static modalPropTypes = modalPropTypes;

    constructor(props) {
        super(props);

        this.state = {
            transitionIn: true
        };

        this.closeModal = this.closeModal.bind(this);
        this.renderOverlay = this.renderOverlay.bind(this);

        // Blur all other react content aside from modal
        if (props.animationType === modalAnimationTypes.BLUR) {
            this.oldFilter = document.getElementById(props.reactRootId).style.filter;
            this.oldTransition = document.getElementById(props.reactRootId).style.transition;
            this.oldTransform = document.getElementById(props.reactRootId).style.transform;
            document.getElementById(props.reactRootId).style.filter = 'blur(9px)';
            document.getElementById(props.reactRootId).style.transition = `all ${props.transitionTime}ms ease`;
            document.getElementById(props.reactRootId).style.transform = 'scale(1.1)';
        }
    }

    componentDidMount() {
        if (this.props.setModalOpened) {
            if (!this.props.onOpened) {
                this.props.setModalOpened(true);
            }
        }
    }

    componentWillUnmount() {
        if (this.props.setModalOpened) {
            if (!this.props.onOpened) {
                this.props.setModalOpened(false);
            }
        }
    }

    closeModal() {
        const { reactRootId, transitionTime } = this.props;
        if (this.props.animationType === modalAnimationTypes.BLUR) {
            document.getElementById(reactRootId).style.filter = this.oldFilter;  // Reset the blur
            document.getElementById(reactRootId).style.transform = this.oldTransform;
            setTimeout(() => { document.getElementById(reactRootId).style.transition = this.oldTransition; }, transitionTime)  // Reset the transition
        }
        // This will cause the Transition component to move to an exited state, which will then call this.props.onClose()
        this.setState({ transitionIn: false });
    }

    // Render an the overlay that, when clicked on, closes the modal. Also determine whether or not the overlay should be darkened
    renderOverlay() {
        const { darkenOverlay, transitionTime } = this.props;

        const overlay = (
            <Overlay
                style={{ cursor: 'default', WebkitTapHighlightColor: 'rgba(0,0,0,0)', transition: darkenOverlay && `all ${transitionTime}ms ease` }}
                onClick={this.closeModal}
                zIndex={200}
                id={modalOverlayId}
            />
        );
        return darkenOverlay
            ? (
                <CSSTransition appear={true} in={this.state.transitionIn} classNames="overlay-darken" timeout={transitionTime}>
                    {overlay}
                </CSSTransition>
            )
            : overlay;
    }

    render() {
        const { animationType, transitionTime, children, id, className, closeContainerStyle, closeIconStyle, closeIconNormal, onOpened, onClose, translate, darkenOverlay, wrapperStyle } = this.props;
        let transitionClassName = (animationType === modalAnimationTypes.FLYUP || (animationType === modalAnimationTypes.BLUR && !isMobile)) ? 'flyup' : 'blur'
        // transitionClassName = darkenOverlay ? `${transitionClassName}-darken` : transitionClassName;  // Add overlay darken suffix to CSS transition classname
        let modalClassName = className ? `obsess-modal-wrapper ${className}` : 'obsess-modal-wrapper';

        const modalContextValue = {
            closeModal: this.closeModal
        }

        if (animationType === modalAnimationTypes.FLYUP) {
            // Add a base opacity & transform css setting for flyup so that the modal starts off with these values before
            // first transition. Without this, the video modal would start at the middle without any transition
            modalClassName = `${modalClassName} flyup`
        }

        // Modal classname will flip between transitionClassName classnames based on transition state, as explained by react-transition-group
        const modal = (
            <ModalContext.Provider value={modalContextValue}>
                <div className="position-wrapper">
                    <CSSTransition appear={true} in={this.state.transitionIn} classNames={transitionClassName} timeout={transitionTime} onEntered={onOpened} onExited={onClose}>
                        <div id={id || ''} className={modalClassName} style={{ backgroundColor: 'rgba(255, 255, 255, 1)', transition: `all ${transitionTime}ms ease`, WebkitTransition: `all ${transitionTime}ms ease`, ...wrapperStyle }}>
                            <div className="modalContent">
                                <div className="hoverable pointer" onClick={this.closeModal} onTouchEnd={this.closeModal} style={closeContainerStyle}>
                                    <BaseImage style={closeIconStyle} src={closeIconNormal} />
                                </div>
                                {children}
                            </div>
                        </div>
                    </CSSTransition>
                </div>
                {this.renderOverlay()}
            </ModalContext.Provider>
        );

        return ReactDOM.createPortal(modal, document.body);
    }
}

Modal.propTypes = modalPropTypes;

const defaultCloseContainerStyle = {
    width: '2.8em',
    height: '2.8em',
    position: 'absolute',
    top: '-1.4em',
    right: '-1.4em',
    float: 'right',
    zIndex: 210
};

const defaultCloseIconStyle = { width: '2.8em', float: 'right', backgroundColor: '#171717', borderRadius: '50%' };

Modal.defaultProps = {
    animationType: modalAnimationTypes.FLYUP,
    closeIconNormal: "https://cdn.obsess-vr.com/modal-close-icon-normal.png",  // Outsource to shared js library
    closeIconHover: "https://cdn.obsess-vr.com/modal-close-icon-hover.png",
    closeContainerStyle: defaultCloseContainerStyle,
    closeIconStyle: defaultCloseIconStyle,
    backgroundColor: '#D9D9D9',
    reactRootId: 'obsessvr-webstore-react-embed-root',
    clickToOpen: true,
    translate: true,
    transitionTime: 500,
    darkenOverlay: false
};

export default Modal;
