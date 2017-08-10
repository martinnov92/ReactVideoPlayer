import * as React from 'react';

import { Video, VideoControls } from './';
import { startFullscreen, exitFullscreen } from '../../utils/VideoUtils';
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

interface VideoNode {
    name: string;
    ready: boolean;
    duration?: number;
    readyState: number;
    videoNode: HTMLVideoElement;
}

interface PlayerState {
    playing?: boolean;
    currentTime?: number;
    videoProgress?: number;
    video?: {video: VideoNode} | {};

    bufferPercent?: number;
    progressDragging?: boolean;
    fullscreen?: boolean;
    longestVideoNode?: HTMLVideoElement | null;
}

// TODO:
// * add more sources for different types of supported files
// * check the longes video and save to state

export class Player extends React.PureComponent<PlayerProps, PlayerState> {
    static defaultProps = {
        resetCurrentTime: true
    };

    progress: HTMLElement;
    focusablePlayer: HTMLElement;

    constructor() {
        super();

        this.state = {
            playing: false,
            currentTime: 0,
            videoProgress: 0,
            bufferPercent: 0,
            video: {}
        };

        this.handleCanPlay = this.handleCanPlay.bind(this);
        this.handleDurationChange = this.handleDurationChange.bind(this);
        this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
        this.handlePlaying = this.handlePlaying.bind(this);
        this.togglePlay = this.togglePlay.bind(this);

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleScrub = this.handleScrub.bind(this);
        this.handleProgressClick = this.handleProgressClick.bind(this);

        // ?????
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleVideoMouseLeave = this.handleVideoMouseLeave.bind(this);
        this.handleProgress = this.handleProgress.bind(this);
        this.restart = this.restart.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
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
            playing: false,
            currentTime: 0,
            videoProgress: 0,
            bufferPercent: 0,
            video: {}
        });
    }

    handleCanPlay(res: { name: string, isReady: boolean, readyState: number, videoNode: HTMLVideoElement }) {
        const videoCopy = this.state.video && {...this.state.video[res.name]};

        this.setState({
            video: {
                ...this.state.video as any,
                [res.name]: {
                    ...videoCopy,
                    ready: res.isReady,
                    readyState: res.readyState,
                    videoNode: res.videoNode
                }
            }
        });
        console.log('handleCanPlay. Video is ready', res);
    }

    handleDurationChange(res: { name: string, duration: number }) {
        this.setState({
            video: {
                ...this.state.video as any,
                [res.name]: {
                    duration: res.duration
                }
            }
        });
        console.log('handleDurationChange', res.duration);
    }

    handleTimeUpdate(res: { name: string, currentTime: number, percent: number }) {
        this.setState({
            currentTime: res.currentTime,
            videoProgress: res.percent
        });
        console.log('handleTimeUpdate', res.currentTime, res.percent);
    }

    handlePlaying(res: { name: string, playing: boolean }) {
        this.setState({
            playing: res.playing
        });
        console.log('handlePlaying', res.playing);
    }

    handleProgress(res: { name: string, percent: number}) {
        this.setState({
            bufferPercent: res.percent
        });
        console.log('handleProgress', res.percent);
    }

    togglePlay() {
        Object
        .keys(this.state.video)
        .forEach((name: string) => {
            if (this.state.video !== undefined) {
                if (this.state.video[name].videoNode.paused) {
                    this.state.video[name].videoNode.play();
                } else {
                    this.state.video[name].videoNode.pause();
                }
            }
        });
    }

    restart(e: any) {
        e.stopPropagation();
    }

    handleMouseDown(e: any) {
    }

    handleMouseUp(e: any) {

    }

    handleScrub(e: any) {
    }

    handleProgressClick(e: any) {
    }

    handleKeyUp(e: any) {
        e.preventDefault();

        /*if (this.state.ready === false) {
            return;
        }*/

        this.focusablePlayer.focus();
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
    }

    handleVideoMouseLeave(e: any) {
        this.focusablePlayer.blur();
        if (this.state.progressDragging) {
            this.handleMouseUp(e);
        }
    }

    render () {
        const { playing, fullscreen } = this.state;
        const { playlist } = this.props;
        const duration = this.state.video !== undefined ? this.state.video.hasOwnProperty('bunny') ? this.state.video['bunny'].duration : 0 : 0;

        const videoWrapperClasses = [
            'pd-player',
            //ready ? 'pd-player__ready' : 'pd-player__notready',
            playing ? 'pd-player__paused' : null,
            fullscreen ? 'pd-player__fullscreen' : null,
            playlist && playlist.length === 1 ? null : 'pd-player__pip'
        ].filter((cls) => cls !== null).join(' ');

        console.log('Player', this);

        return (
            <div
                ref={(node: any) => this.focusablePlayer = node}
                className={videoWrapperClasses}
                onClick={this.togglePlay}
                onKeyUp={this.handleKeyUp}
                onMouseOver={this.handleKeyUp}
                onMouseLeave={this.handleVideoMouseLeave}
                tabIndex={-1}
                data-videos={playlist && playlist.length}
            >
                {
                    playlist.map((video) => {
                        return <Video
                            key={video.key}
                            name={video.key}
                            video={video}
                            handleCanPlay={this.handleCanPlay}
                            handleDurationChange={this.handleDurationChange}
                            handleTimeUpdate={this.handleTimeUpdate}
                            handlePlaying={this.handlePlaying}
                            handleProgress={this.handleProgress}
                        />;
                    })
                }

                <VideoControls
                    currentTime={this.state.currentTime}
                    buffer={this.state.bufferPercent}
                    playing={this.state.playing || false}
                    duration={duration}
                />
            </div>
        );
    }

    // fullscreen for video element
    toggleFullscreen(e: React.SyntheticEvent<any>) {
        /*if (this.state.ready === false) {
            return;
        }*/

        let fullscreen = false;

        // check if some element is in fullscreen mode
        if (!this.state.fullscreen) {
            // if there is no element in fullscreen
            startFullscreen(this.focusablePlayer);
            fullscreen = true;
        } else {
            // otherwise exit fullscreen
            exitFullscreen();
            fullscreen = false;
        }

        this.setState({
            fullscreen
        });
    }
}
