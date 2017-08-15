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
    playlist: VideoType[];
    onTogglePlayback?: (paused: boolean) => void;
    onPlayingCallback?: (res: { sec: number }) => void;
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
    primaryVideo?: string;
    ready?: boolean;
    videosCount?: number;

    bufferPercent?: number;
    fullscreen?: boolean;
}

// TODO:
// [ ] add more sources for different types of supported files
// [x] stop playing when currentTime is bigger then duration
// [ ] display currentTime / duration when 2 videos in tooltip, when hover over remaining time in progress bar
// [x] add props for handleScrub,...
// [x] restart fn, skip fn, handleKeyDown fn

export class Player extends React.PureComponent<PlayerProps, PlayerState> {
    static defaultProps = {
        resetCurrentTime: true
    };

    progress: HTMLElement;
    focusablePlayer: HTMLElement;

    constructor() {
        super();

        this.state = {
            ready: false,
            playing: false,
            primaryVideo: '',
            currentTime: 0,
            videoProgress: 0,
            bufferPercent: 0,
            videosCount: 0,
            video: {},
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
        this.updateVideoTime = this.updateVideoTime.bind(this);
        this.findPrimaryVideo = this.findPrimaryVideo.bind(this);
        this.isVideoReady = this.isVideoReady.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleVideoMouseLeave = this.handleVideoMouseLeave.bind(this);
        this.restart = this.restart.bind(this);
        this.handleProgress = this.handleProgress.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.resetState = this.resetState.bind(this);
    }

    componentDidMount() {
        const videosCount = this.props.playlist.length;

        this.setState({
            videosCount
        });
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

    handleDurationChange(res: { name: string, duration: number }) {
        const videosInState = Object.keys(this.state.video).length;
        const videosCountMatch =
            (this.state.videosCount === videosInState) && this.state.primaryVideo !== res.name;

        if (videosCountMatch) {
            return;
        }

        this.setState({
            video: {
                ...this.state.video as any,
                [res.name]: {
                    duration: res.duration
                }
            }
        }, () => {
            if (!videosCountMatch) {
                this.findPrimaryVideo();
            }
        });
        console.log('handleDurationChange', res.duration, res.name);
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
        }, () => this.isVideoReady());
        console.log('handleCanPlay. Video is ready', res);
    }

    handleTimeUpdate(res: { name: string, currentTime: number }) {
        const { primaryVideo, video } = this.state;
        let duration = 0;
        let percent = 0;

        if (primaryVideo !== res.name) {
            return;
        }

        if (primaryVideo) {
            duration = video && video[primaryVideo].duration;
            percent = (res.currentTime / duration) * 100;
        }

        this.setState({
            currentTime: res.currentTime,
            videoProgress: percent
        });

        if (this.props.onPlayingCallback) {
            this.props.onPlayingCallback({ sec: res.currentTime });
        }

        console.log('handleTimeUpdate', res.currentTime, percent, res.name);
    }

    handlePlaying(res: { name: string, playing: boolean }) {
        const videosInState = Object.keys(this.state.video).length;
        const videosCountMatch =
            (this.state.videosCount === videosInState) && this.state.primaryVideo !== res.name;

        if (videosCountMatch) {
            return;
        }

        if (this.props.onTogglePlayback) {
            this.props.onTogglePlayback(res.playing);
        }

        this.setState({
            playing: res.playing
        });
    }

    handleProgress(res: { name: string, percent: number}) {
        const { primaryVideo } = this.state;

        if (primaryVideo !== res.name) {
            return;
        }

        this.setState({
            bufferPercent: res.percent
        });
    }

    handleProgressClick(res: { currentTime: number }) {
        this.setState(() => {
            this.updateVideoTime({ currentTime: res.currentTime });

            return {
                currentTime: res.currentTime
            };
        });
    }

    handleMouseDown() {
        this.setState({
            playing: false
        });

        this.togglePlay('pause');
    }

    handleMouseUp(res?: { currentTime: number }) {
        this.setState({
            playing: true
        });

        if (res) {
            this.updateVideoTime({ currentTime: res.currentTime }, true);
        }
    }

    handleScrub(res: { currentTime: number }) {
        const { primaryVideo } = this.state;
        let duration = 0;

        if (primaryVideo && this.state.video) {
            duration = this.state.video[primaryVideo].duration;
        }

        const percent = (res.currentTime / duration) * 100;

        if (this.props.onPlayingCallback) {
            this.props.onPlayingCallback({ sec: res.currentTime });
        }

        // handleScrub, does not save currentTime, just pause video and update progress bar
        // currentTime will be updated on mouseUp
        this.setState({
            videoProgress: percent,
            currentTime: res.currentTime
        });
        console.log('handleScrub', res.currentTime);
    }

    restart(e?: any) {
        e.stopPropagation();
        this.updateVideoTime({ currentTime: 0 }, true);
    }

    render () {
        const {
            ready,
            playing,
            fullscreen,
            primaryVideo,
            videosCount
        } = this.state;
        const { playlist } = this.props;

        const duration =
            this.state.video && primaryVideo ? this.state.video[primaryVideo].duration : 0;

        const videoWrapperClasses = [
            'pd-player',
            ready ? 'pd-player__ready' : 'pd-player__notready',
            !playing ? 'pd-player__paused' : null,
            fullscreen ? 'pd-player__fullscreen' : null,
            playlist && playlist.length === 1 ? null : 'pd-player__pip'
        ].filter((cls) => cls !== null).join(' ');

        return (
            <div
                ref={(node: any) => this.focusablePlayer = node}
                className={videoWrapperClasses}
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
                            timeLabel={videosCount && videosCount > 1 ? true : false}
                            handleClick={this.togglePlay}
                            handleCanPlay={this.handleCanPlay}
                            handleDurationChange={this.handleDurationChange}
                            handleTimeUpdate={this.handleTimeUpdate}
                            handlePlaying={this.handlePlaying}
                            handleProgress={this.handleProgress}
                        />;
                    })
                }

                <VideoControls
                    ready={this.state.ready || false}
                    currentTime={this.state.currentTime}
                    buffer={this.state.bufferPercent}
                    playing={this.state.playing || false}
                    duration={duration}
                    progress={this.state.videoProgress}
                    handlePlay={this.togglePlay}
                    handleRestart={this.restart}
                    toggleFullscreen={this.toggleFullscreen}
                    handleMouseDown={this.handleMouseDown}
                    handleMouseUp={this.handleMouseUp}
                    handleProgressClick={this.handleProgressClick}
                    handleScrub={this.handleScrub}
                />
            </div>
        );
    }

    resetState() {
        this.setState({
            playing: false,
            primaryVideo: '',
            currentTime: 0,
            videoProgress: 0,
            bufferPercent: 0,
            videosCount: 0,
            video: {}
        });
    }

    handleKeyUp(e: any) {
        if (this.state.ready === false) {
            return;
        }

        e.preventDefault();

        this.focusablePlayer.focus();
        let skip = this.state.currentTime || 0;
        let updateTime = false;

        switch (e.keyCode) {
            case 39:
                skip += 15;
                updateTime = true;
                break;
            case 37:
                skip -= 15;
                updateTime = true;
                break;
            case 32:
                this.togglePlay();
                break;
            default:
                break;
        }

        if (updateTime) {
            this.updateVideoTime({ currentTime: skip }, updateTime);
        }
    }

    handleVideoMouseLeave(e: any) {
        this.focusablePlayer.blur();
    }

    updateVideoTime(res: {currentTime: number}, play?: boolean) {
        if (!this.state.ready) {
            return;
        }

        // programaticly update currentTime of video(s)
        Object
        .keys(this.state.video)
        .forEach((name: string) => {
            if (this.state.video !== undefined) {
                // TODO: provést kontrolu pozice vs. délky videa
                const { videoNode } = this.state.video[name];

                if (res.currentTime >= videoNode.duration) {
                    videoNode.currentTime = videoNode.duration;
                    videoNode.pause();
                } else {
                    videoNode.currentTime = res.currentTime;
                    if (play) {
                        videoNode.play();
                    }
                }
            }
        });
    }

    togglePlay(type?: 'play' | 'pause') {
        if (!this.state.ready) {
            return;
        }

        // toggle play/pause of video(s)
        Object
        .keys(this.state.video)
        .forEach((name: string) => {
            if (this.state.video !== undefined) {
                const { videoNode } = this.state.video[name];
                const isPlaying = !videoNode.paused && !videoNode.ended && videoNode.readyState > 0;

                if (videoNode.currentTime >= videoNode.duration) {
                    videoNode.currentTime = videoNode.duration;
                    videoNode.pause();
                } else {
                    if (type === 'play') {
                        if (!isPlaying) {
                            videoNode.play();
                        }
                    } else if (type === 'pause') {
                        videoNode.pause();
                    } else {
                        if (videoNode.paused) {
                            videoNode.play();
                        } else {
                            if (isPlaying) {
                                videoNode.pause();
                            }
                        }
                    }
                }
            }
        });
    }

    isVideoReady() {
        let ready = false;
        const indexes = Object.keys(this.state.video);

        if (this.props.playlist.length === 1) {
            if (this.state.video) {
                if (this.state.video[indexes[0]].ready) {
                    ready = true;
                }
            }
        } else {
            const readyVideos = indexes.filter((video) => {
                if (this.state.video) {
                    if (this.state.video[video].ready) {
                        return true;
                    }
                }
                return false;
            });

            if (readyVideos.length === this.props.playlist.length) {
                ready = true;
            }
        }

        // set state to ready = true when all the videos are in ready state
        this.setState({
            ready
        });
    }

    findPrimaryVideo() {
        const indexes = Object.keys(this.state.video);
        let primaryVideo = '';

        if (this.props.playlist.length === 1) {
            if (this.state.video) {
                primaryVideo = indexes[0];
            }
        } else {
            primaryVideo = indexes.sort((one, two) => {
                if (this.state.video) {
                    return this.state.video[two].duration - this.state.video[one].duration;
                }
                return 0;
            })[0];
        }

        // name of the longest video
        this.setState({
            primaryVideo
        });
    }

    // fullscreen for video element
    toggleFullscreen(e?: React.SyntheticEvent<any>) {
        if (!this.state.ready) {
            return;
        }

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
