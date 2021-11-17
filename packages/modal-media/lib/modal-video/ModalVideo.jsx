import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { isMobileDevice, getMobileOS } from 'obsess-device-detector';

const isIOS = (() => {
    if (getMobileOS() === 'iOS') {
        return true;
    } else {
        return false;
    }
})();

import './ModalVideo.css';

const videoImg = 'https://cdn.obsessvr.com/video-circle-icon.png';
const expandIcon = 'https://cdn.obsessvr.com/desigual/expand_.svg';
const playIcon = 'https://cdn.obsessvr.com/video/play-18.svg';
const pauseIcon = 'https://cdn.obsessvr.com/video/pause-18.svg';
const muteIcon = 'https://cdn.obsessvr.com/video/volume-off-18.svg';
const volumeIcon = 'https://cdn.obsessvr.com/video/volume-on-18.svg';

const ModalVideo = ({ src, videoStyle, setIsUserInteracting, xTranslation, index, currentIndex, onPlayVideo, setFocusMode, videoIcon, playsInline }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [trackPercent, setTrackPercent] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0);
    const [showVideoControls, setShowVideoControls] = useState(false);

    const videoRef = useRef();

    useEffect(() => {
        return (() => {
            setFocusMode && setFocusMode(false);
        })
    }, []);

    useEffect(() => {
        setIsPlaying(false);
        setTrackPercent(0);
    }, [src])

    /* 
    * Acts as a react-controlled substitute for autoPlay property on video.
    * Can assume that modal video will be the first media option to show
    * Pauses when the modal video is out of viewport
    */
    useEffect(() => {
        const isVideoFocused = (index === currentIndex);

        if (isVideoFocused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    }, [index, currentIndex]);

    const onPlay = () => {
        setIsUserInteracting && setIsUserInteracting(true);
        onPlayVideo && onPlayVideo();
        setIsPlaying(true);
    }

    const onPlaying = (e) => {
        setVolume(videoRef.current.volume * 10);
    }

    const onPause = () => {
        setIsUserInteracting && setIsUserInteracting(false);
        setIsPlaying(false);
    }

    const playVideo = () => {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
    }

    const toggleMute = () => {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }

    const onTimeUpdate = (e) => {
        setTrackPercent(parseInt((videoRef.current.currentTime / videoRef.current.duration) * 100));

    }

    const getCurrentTrack = (e) => {
        const trackTime = videoRef.current.duration * e.target.value / 100;
        setTrackPercent(trackTime);
        videoRef.current.currentTime = trackTime;
    }

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        setFocusMode && setFocusMode(!isFullScreen)
    }

    const currentProgress = () => {
        if (!videoRef.current) {
            return;
        }
        const currentTime = videoRef.current.currentTime.toFixed(0);
        const duration = videoRef.current.duration;

        const convertSecondsToMinutes = (time) => {
            const minutes = Math.floor(time / 60);

            const seconds = time - minutes * 60;

            const str_pad_left = (string, pad, length) => {
                return (new Array(length + 1).join(pad) + string).slice(-length);
            }

            const finalTime = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
            return finalTime;
        }

        return `${convertSecondsToMinutes(currentTime)} / ${convertSecondsToMinutes(duration)}`
    }

    const changeVolume = (e) => {
        videoRef.current.volume = e.target.value * 0.1;
        setVolume(e.target.value);
    }

    const onMouseEnter = () => {
        setShowVideoControls(true);
    }

    const onMouseLeave = (e) => {
        setShowVideoControls(false)
    }

    const onDoubleClick = () => {
        toggleFullScreen();
    }

    return (
        <div className="modal-video-container" style={videoStyle} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onDoubleClick={onDoubleClick}>
            <div className='modal-video-icon-container'>
                {!isIOS && (
                    <div className="modal-video-expand-icon" onClick={toggleFullScreen} style={{ filter: isFullScreen ? 'invert(1)' : '' }}>
                        <img src={expandIcon} />
                    </div>
                )}
                <img className="modal-video-play-icon" src={videoIcon} style={{ visibility: isPlaying ? 'hidden' : 'visible' }} />
            </div>

            <video
                ref={videoRef}
                className='modal-video'
                preload="auto"
                onPlay={onPlay}
                onPause={onPause}
                onClick={playVideo}
                onTimeUpdate={onTimeUpdate}
                onPlaying={onPlaying}
                playsInline={playsInline}
                src={src}
            />
            <div className='video-control-bar' style={{ bottom: showVideoControls ? '0' : '-40px' }}>
                <div className='video-playback-controls'>
                    <button onClick={playVideo} type="button" className='video-play-icon'>
                        <img src={isPlaying ? pauseIcon : playIcon} />
                    </button>
                    <div className='video-progress-bar'>
                        <input type='range' min='0' max='100' value={trackPercent} onChange={getCurrentTrack} />
                    </div>
                    <div className='video-progress-timer'>
                        {currentProgress()}
                    </div>
                </div>
                <div className='video-volume-controls' style={{ margin: '0 0.5em 0 auto' }}>
                    <button onClick={toggleMute} type="button" className='video-mute-icon'>
                        <img src={isMuted ? muteIcon : volumeIcon} />
                    </button>
                    <div className='video-volume-bar'>
                        <input type='range' min='0' max='10' value={volume} onChange={changeVolume} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalVideo;

ModalVideo.propTypes = {
    src: PropTypes.string.isRequired,
    videoStyle: PropTypes.object
}

ModalVideo.defaultProps = {
    videoIcon: videoImg
}