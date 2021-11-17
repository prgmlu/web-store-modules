import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal } from 'web-store-ui-library';


class VideoModal extends Component {
    constructor(props) {
        super(props);
        this.onPlay = this.onPlay.bind(this);
        this.onPause = this.onPause.bind(this);
        this.pauseVideo = this.pauseVideo.bind(this);
        this.state = {
            isPlaying: false,
        };
    }

    onPlay() {
        this.setState({ isPlaying: true });
    }

    onPause() {
        this.setState({ isPlaying: false });
    }

    pauseVideo(event) {
        if (this.state.isPlaying) {
            event.target.pause();
        } else {
            event.target.play();
        }
    }

    render() {
        const {
            src, videoStyle, onClose, reactRootId,
        } = this.props;

        return (
            <Modal onClose={onClose} darkenOverlay reactRootId={reactRootId}>
                <div>
                    <video
                        controls
                        autoPlay
                        preload="auto"
                        style={videoStyle}
                        onPlay={this.onPlay}
                        onPause={this.onPause}
                        onClick={this.pauseVideo}
                    >
                        <source src={src} />
                    </video>
                </div>
            </Modal>
        );
    }
}

VideoModal.propTypes = {
    src: PropTypes.string.isRequired,
    reactRootId: PropTypes.string.isRequired,
    videoStyle: PropTypes.object,
    onClose: PropTypes.func,
};

export default VideoModal;
