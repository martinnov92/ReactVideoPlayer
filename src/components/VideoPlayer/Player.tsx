import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Video } from './Video';

// video player styles
import './Player.css';

interface VideoType {
    key: string;
    webm?: string;
    mp4?: string;
}

interface PlayerProps {
    onPlayingCallback?: Function;
    playlist: VideoType[];
    resetCurrentTime?: boolean;
}

interface PlayerState {
    currentTime?: number;
    videoDuration?: number;
    progressPercent?: number;
    bufferPercent?: number;
    videoPaused?: boolean;
    isVideoLoaded?: boolean;
    progressDragging?: boolean;
    fullscreen?: boolean;
    longestVideoNode?: HTMLVideoElement | null;
}

// TODO: add more sources for different types of supported files
export class Player extends React.PureComponent<PlayerProps, PlayerState> {
    static defaultProps = {
        resetCurrentTime: true
    };

    video: any = {};
    progress: HTMLElement;
    focusablePlayer: HTMLElement;

    constructor() {
        super();

        this.state = {
            currentTime: 0,
            videoDuration: 0,
            progressPercent: 0,
            bufferPercent: 0,
            videoPaused: true,
            isVideoLoaded: false,
            progressDragging: false,
            fullscreen: false,
            longestVideoNode: null
        };

        this.handleCanPlay = this.handleCanPlay.bind(this);
        this.handleDurationChange = this.handleDurationChange.bind(this);
        this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
        this.handlePlaying = this.handlePlaying.bind(this);

        // ?????
        this.addToVideoCollection = this.addToVideoCollection.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleVideoMouseLeave = this.handleVideoMouseLeave.bind(this);
        this.handleProgress = this.handleProgress.bind(this);
        this.handlePlaying = this.handlePlaying.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleScrub = this.handleScrub.bind(this);
        this.handleProgressClick = this.handleProgressClick.bind(this);
        this.restart = this.restart.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.arrOfRefs = this.arrOfRefs.bind(this);
        this.resetState = this.resetState.bind(this);
    }

    componentWillUnmount() {
        if (this.props.resetCurrentTime === true) {
            this.resetState();
        }
    }

    /*componentWillReceiveProps(nextProps: PlayerProps) {
        const { resetCurrentTime, video } = this.props;

        if (resetCurrentTime) {
            if (video.length === 1 && nextProps.video.length === 1) {
                if (video[0].key !== nextProps.video[0].key) {
                    this.resetState();
                }
            } else if (video.length === 0) {
                /*
                    * When using this.setState({ cams: []}) as videos array reset:
                        this.setState({
                            cams: []
                        }, () => this.setState({ cams }));
                    * this component will receive empty array once =>
                    * => we have to reset state (when resetCurrentTime is true)
                *//*
                this.resetState();
            }
        }
    }*/

    resetState() {
        this.setState({
            currentTime: 0,
            videoDuration: 0,
            progressPercent: 0,
            bufferPercent: 0,
            videoPaused: true,
            isVideoLoaded: false,
            progressDragging: false,
            fullscreen: false,
            longestVideoNode: null
        });
    }

    addToVideoCollection(node: HTMLVideoElement, key: string) {
        // add refs to collection
        this.video[key] = node;
    }

    arrOfRefs() {
        const videoArr = Object
            .keys(this.video)
            .map((key) => this.video[key])
            .filter((video) => video !== null);

        return videoArr;
    }

    handleCanPlay(res: { isReady: boolean, readyState: number }) {
        console.log('handleCanPlay. Video is ready', res.readyState);
    }

    handleDurationChange(res: { duration: number }) {
        console.log('handleDurationChange', res.duration);
    }

    handleTimeUpdate(res: { currentTime: number, percent: number }) {
        console.log('handleTimeUpdate', res.currentTime, res.percent);
    }

    handlePlaying(res: { playing: boolean }) {
        console.log('handlePlaying', res.playing);
    }

    handleProgress(res: { percent: number}) {
        console.log('handleProgress', res.percent);
    }

    restart(e: any) {
        e.stopPropagation();

        if (this.state.isVideoLoaded === false) {
            return;
        }
    }


    handleMouseDown(e: any) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleMouseUp(e: any) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleScrub(e: any) {
        e.stopPropagation();

        if (!this.state.progressDragging || this.state.isVideoLoaded === false) {
            return;
        }

        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const duration = this.state.longestVideoNode && this.state.longestVideoNode.duration || 0;
        const currentTime = (mousePosition / this.progress.offsetWidth) * duration;

        const progressPercent = (currentTime / duration) * 100;

        return progressPercent;
    }

    handleProgressClick(e: any) {
        e.stopPropagation();

        if (this.state.isVideoLoaded === false) {
            return;
        }

        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const duration = this.state.longestVideoNode && this.state.longestVideoNode.duration || 0;
        const scrubTime = (mousePosition / this.progress.offsetWidth) * duration;

        return scrubTime;
    }

    handleKeyUp(e: any) {
        e.preventDefault();

        if (this.state.isVideoLoaded === false) {
            return;
        }

        this.focusablePlayer.focus();
        const videos = this.arrOfRefs();
        let skip = this.state.currentTime || 0;

        switch (e.keyCode) {
            case 39:
                skip += 10;
                break;
            case 37:
                skip -= 25;
                break;
            case 32:
                // this.togglePlay(e);
                break;
            default:
                return;
        }

        for (let i = 0; i < videos.length; i++) {
            if (skip > videos[i].duration) {
                videos[i].currentTime = videos[i].duration;
                continue;
            }

            videos[i].currentTime = skip;
        }
    }

    handleVideoMouseLeave(e: any) {
        this.focusablePlayer.blur();
        if (this.state.progressDragging) {
            this.handleMouseUp(e);
        }
    }

    render () {
        const { isVideoLoaded, videoPaused, fullscreen } = this.state;
        const { playlist } = this.props;

        const videoWrapperClasses = [
            'pd-player',
            isVideoLoaded ? 'pd-player__ready' : 'pd-player__notready',
            videoPaused ? 'pd-player__paused' : null,
            fullscreen ? 'pd-player__fullscreen' : null,
            playlist && playlist.length === 1 ? null : 'pd-player__pip'
        ].filter((cls) => cls !== null).join(' ');

        console.log('Player', this);

        return (
            <div
                ref={(node: any) => this.focusablePlayer = node}
                className={videoWrapperClasses}
                //onClick={this.togglePlay}
                onKeyUp={this.handleKeyUp}
                onMouseOver={this.handleKeyUp}
                onMouseLeave={this.handleVideoMouseLeave}
                tabIndex={-1}
                data-videos={playlist && playlist.length}
            >

                {/* ZDE BUDE VIDEOPŘEHRÁVAČ*/}
                <Video 
                    video={this.props.playlist[0]} 
                    handleCanPlay={this.handleCanPlay}
                    handleDurationChange={this.handleDurationChange}
                    handleTimeUpdate={this.handleTimeUpdate}
                    handlePlaying={this.handlePlaying}
                    handleProgress={this.handleProgress}
                />

                <div className="pd-player__controls">
                    <div 
                        className="progress"
                        ref={(node: any) => this.progress = node}
                        onMouseDown={this.handleMouseDown}
                        onMouseUp={this.handleMouseUp}
                        onClick={this.handleProgressClick}
                    >
                        <div
                            className="buffer__filled"
                            style={{width: `${this.state.bufferPercent}%`}}
                        />
                        <div 
                            className="progress__filled"
                            style={{flexBasis: `${this.state.progressPercent}%`}}
                        />
                    </div>

                    <div className="pd-player__controls-holder">
                        <button 
                            className={`pd-player__button button-${videoPaused ? 'play' : 'pause'} toggle ${!isVideoLoaded ? 'disabled' : ''}`}
                            title="Play / pauza"
                            //onClick={this.togglePlay}
                        >
                            {videoPaused ? '▶' : '||'}
                        </button>

                        <button
                            className="pd-player__button button-restart"
                            title="Přehrát od začátku"
                            onClick={this.restart}
                        >
                            <i className="fa fa-step-backward" aria-hidden="true" />
                        </button>

                        <div className="pd-player__controls-duration pd-pull-right">
                            <strong>
                                {
                                    playlist && playlist.length > 1
                                        ? null
                                        : getDurationTime((this.state.videoDuration || 0) - (this.state.currentTime || 0))
                                }
                            </strong>
                        </div>

                        <button
                            className={`pd-player__button button-fullscreen ${!isVideoLoaded ? 'disabled' : ''}`}
                            onClick={this.toggleFullscreen}
                        >
                            <i className="fa fa-arrows-alt" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // fullscreen for video element
    toggleFullscreen(e: React.SyntheticEvent<any>) {
        e.stopPropagation();
        e.preventDefault();
        
        if (this.state.isVideoLoaded === false) {
            return;
        }

        let fullscreen = false;

        // check if some element is in fullscreen mode
        if (!this.state.fullscreen) {
            // if there is no element in fullscreen
            this.fullscreen(this.focusablePlayer);
            fullscreen = true;
        } else {
            // otherwise exit fullscreen
            this.exitFullscreen();
            fullscreen = false;
        }

        this.setState({
            fullscreen
        });
    }

    fullscreen(element: HTMLElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

export function getDurationTime(secs: number, mili?: boolean) {
    // const hours = Math.floor(secs / 3600);
    // const secondsLeft = secs % 3600;

    const mins = Math.floor(secs / 60);
    const secondsLeft = Math.floor(secs % 60);

    return `${mins < 10 ? '0' + mins : mins}:${secondsLeft < 10 ? '0' + secondsLeft : secondsLeft}`;
}
