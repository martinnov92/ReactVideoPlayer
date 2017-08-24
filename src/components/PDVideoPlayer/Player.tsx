import * as React from 'react';
import { findDOMNode } from 'react-dom';

// video player styles
import '../VideoPlayer/Player.css';

interface VideoType {
    key: string;
    webm?: string;
    mp4?: string;
}

interface PlayerProps {
    onTogglePlayback?:(paused: boolean) => void;
    onPlayingCallback?: Function;
    video: VideoType[];
    resetCurrentTime?: boolean;
}

// TODO: add more sources for different types of supported files
export class PDPlayer extends React.PureComponent<PlayerProps, any> {
    video: any = {};
    progress: any;
    focusablePlayer: any;

    static defaultProps = {
        resetCurrentTime: true
    }

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

        this.addToVideoCollection = this.addToVideoCollection.bind(this);
        this.renderVideoPlayer = this.renderVideoPlayer.bind(this);
        this.togglePlay = this.togglePlay.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleVideoMouseLeave = this.handleVideoMouseLeave.bind(this);
        this.handleOnCanPlay = this.handleOnCanPlay.bind(this);
        this.handleDurationChange = this.handleDurationChange.bind(this);
        this.handleProgress = this.handleProgress.bind(this);
        this.updateButton = this.updateButton.bind(this);
        this.handleOnProgress = this.handleOnProgress.bind(this);
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

    componentWillReceiveProps(nextProps: PlayerProps) {
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
                */
                this.resetState();
            }
        }
    }

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

    addToVideoCollection(node: any, key: any) {
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

    handleOnCanPlay() {
        // video is not ready
        this.setState({
            isVideoLoaded: false
        });

        // check if every video is ready to play (has enough frames available)
        const videos = this.arrOfRefs();
        const isReady = videos.filter((video) => video.readyState > 0);

        // once all videos are ready set the state to true and find the longest video
        if (isReady.length === videos.length) {
            const longestVideoNode = this.arrOfRefs().sort((video, video2) => video2.duration - video.duration)[0];

            // if there is new videoplayer added, loop over all videos and find those
            // which are paused and with currentTime === 0 and set their time to currentTime from state
            if (this.state.currentTime !== 0) {
                for (let i = 0; i < videos.length; i++) {
                    if (videos[i].currentTime === 0) {
                        videos[i].currentTime = this.state.currentTime;

                        if (!this.state.videoPaused) {
                            if (this.state.currentTime > videos[i].duration) {
                                videos[i].currentTime = videos[i].duration;
                            } else {
                                videos[i].play();
                            }
                        }
                    }
                }
            }

            this.setState({
                isVideoLoaded: true,
                longestVideoNode
            });
        }
    }

    handleDurationChange() {
        // make array from refs object
        const arr = this.arrOfRefs();
        const max = Math.max.apply(null, arr.map((video) => video.duration));

        // set videoDuration to the longest video
        this.setState({
            videoDuration: max
        });
    }

    updateButton() {
        this.setState({
            videoPaused: this.state.longestVideoNode.paused,
        });
    }

    togglePlay(e?: React.SyntheticEvent<any>) {
        if (e instanceof MouseEvent) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (this.state.isVideoLoaded === false) {
            return;
        }

        const videos = this.arrOfRefs();
        for (let i = 0; i < videos.length; i++) {
            if (this.state.currentTime > videos[i].duration) {
                continue;
            }

            const type = this.state.videoPaused ? 'play' : 'pause';
            videos[i].currentTime = this.state.currentTime;
            videos[i][type]();
        }

        if (this.props.onTogglePlayback) {
            this.props.onTogglePlayback(this.state.longestVideoNode.paused);
        }
    }

    restart(e: React.SyntheticEvent<any>) {
        e.stopPropagation();

        if (this.state.isVideoLoaded === false) {
            return;
        }

        const videos = this.arrOfRefs();
        for (let i = 0; i < videos.length; i++) {
            videos[i].currentTime = 0;
        }
    }

    handleProgress() {
        const percent = (this.state.longestVideoNode.currentTime / this.state.longestVideoNode.duration) * 100;

        this.setState({
            progressPercent: percent,
            currentTime: this.state.longestVideoNode.currentTime
        });

        if (this.props.onPlayingCallback) {
            this.onPlaying();
        }
    }

    handleMouseDown(e: any) {
        e.preventDefault();
        e.stopPropagation();

        this.setState({
            progressDragging: true,
            videoPaused: false
        }, () => {
            this.togglePlay();
        });

        document.addEventListener('mousemove', this.handleScrub);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    handleScrub(e: any) {
        e.stopPropagation();

        if (!this.state.progressDragging || this.state.isVideoLoaded === false) {
            return;
        }

        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const currentTime = (mousePosition / this.progress.offsetWidth) * this.state.videoDuration;
        const progressPercent = (currentTime / this.state.videoDuration) * 100;

        this.setState({
            currentTime,
            progressPercent
        });

        if (this.props.onPlayingCallback) {
            this.props.onPlayingCallback({sec: currentTime});
        }
    }
    
    handleMouseUp(e: any) {
        e.preventDefault();
        e.stopPropagation();

        document.removeEventListener('mousemove', this.handleScrub);
        document.removeEventListener('mouseup', this.handleMouseUp);

        this.setState({
            progressDragging: false,
            videoPaused: true
        }, () => {
            this.togglePlay();
        });
    }

    handleProgressClick(e: any) {
        e.stopPropagation();

        if (this.state.isVideoLoaded === false) {
            return;
        }

        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const scrubTime = (mousePosition / this.progress.offsetWidth) * this.state.longestVideoNode.duration;

        const videos = this.arrOfRefs();
        for (let i = 0; i < videos.length; i++) {
            if (scrubTime > videos[i].duration) {
                videos[i].currentTime = videos[i].duration;
                continue;
            };

            videos[i].currentTime = scrubTime;
            videos[i].play();
        }
    }

    handleKeyUp(e: any) {
        e.preventDefault();

        if (this.state.isVideoLoaded === false) {
            return;
        }

        this.focusablePlayer.focus();
        const videos = this.arrOfRefs();
        let skip = this.state.currentTime;

        switch (e.keyCode) {
            case 39:
                skip += 10;
                break;
            case 37:
                skip -= 25;
                break;
            case 32:
                this.togglePlay(e);
                break;
            default:
                return;
        }

        for (let i = 0; i < videos.length; i++) {
            if (skip > videos[i].duration) {
                videos[i].currentTime = videos[i].duration;
                continue;
            };

            videos[i].currentTime = skip;
        }
    }

    handleVideoMouseLeave(e: React.SyntheticEvent<any>) {
        this.focusablePlayer.blur();
        if (this.state.progressDragging) {
            this.handleMouseUp(e);
        }
    }

    handleOnProgress() {
        const { isVideoLoaded, longestVideoNode } = this.state;

        // add buffer for video player
        // based on MDN article:
        // https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/buffering_seeking_time_ranges

        if (isVideoLoaded) {
            // buffered end - return value in sec
            // buffered.length - number of time ranges in the object
            const bufferEnd = longestVideoNode.buffered.end(longestVideoNode.buffered.length - 1);

            // duration in sec
            const duration = longestVideoNode.duration;

            if (duration > 0) {
                const bufferPercent = (bufferEnd / duration) * 100;
                this.setState({
                    bufferPercent
                });
            }
        }
    }

    onPlaying() {
        const currentTime = this.state.longestVideoNode.currentTime || 0;
        if (this.props.onPlayingCallback) {
            this.props.onPlayingCallback({sec: currentTime});
        }
    }

    renderVideoPlayer(video: VideoType) {
        const { webm, mp4 } = video;
        const videoPlayersCount = this.props.video.length;
        let remainingTime = 0;

        if (this.video[video.key]) {
            remainingTime =
                this.state.currentTime > this.video[video.key].duration
                ? this.video[video.key].duration
                : this.state.currentTime;
        }

        return (
            <div
                key={video.key}
                className="pd-player__video viewer"
            >
                <video
                    ref={node => this.addToVideoCollection(node, video.key)}
                    onCanPlay={this.handleOnCanPlay}
                    onDurationChange={this.handleDurationChange}
                    onTimeUpdate={this.handleProgress}
                    onPlay={this.updateButton}
                    onPause={this.updateButton}
                    onProgress={this.handleOnProgress}
                >
                    <source src={webm} type="video/webm" />
                    <source src={mp4} type="video/mp4" />
                    <p>
                        <strong>
                            Prohlížeč nepodporuje HTML5 video.
                        </strong>
                    </p>
                </video>
                {
                    videoPlayersCount <= 1
                    ? null
                    : <span className="pd-player__video-time">
                        {
                            this.video[video.key]
                            ? getDurationTime(remainingTime) + ' / ' + getDurationTime(this.video[video.key].duration)
                            : '00:00'
                        }
                    </span>
                }
            </div>
        );
    }

    render () {
        const { isVideoLoaded, videoPaused, fullscreen, progressDragging } = this.state;
        const { video: videos } = this.props;
        const videoPlayer = videos ? videos.map((video) => this.renderVideoPlayer(video)) : null;

        const videoWrapperClasses = [
            'pd-player',
            isVideoLoaded ? 'pd-player__ready' : 'pd-player__notready',
            videoPaused ? 'pd-player__paused' : null,
            fullscreen ? 'pd-player__fullscreen' : null,
            progressDragging ? 'pd-player__progress-dragging' : null,
            videos && videos.length === 1 ? null : 'pd-player__pip'
        ].filter((cls) => cls !== null).join(' ');

        return (
            <div
                ref={node => this.focusablePlayer = node}
                className={videoWrapperClasses}
                onClick={this.togglePlay}
                onKeyUp={this.handleKeyUp}
                onMouseOver={this.handleKeyUp}
                onMouseLeave={this.handleVideoMouseLeave}
                tabIndex={-1}
                data-videos={videos && videos.length}
            >

                {videoPlayer}

                <div className="pd-player__controls">
                    <div 
                        className="progress"
                        ref={node => this.progress = node}
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
                        <div className="progress__drag"/>
                    </div>

                    <div className="pd-player__controls-holder">
                        <button 
                            className={`pd-player__button button-${videoPaused ? 'play' : 'pause'} toggle ${!isVideoLoaded ? 'disabled' : ''}`}
                            title="Play / pauza"
                            onClick={this.togglePlay}
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
                                    videos && videos.length > 1
                                        ? null
                                        : getDurationTime(this.state.videoDuration - this.state.currentTime)
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
