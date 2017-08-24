import * as React from 'react';

interface VideoType {
    key: string;
    webm?: string;
    mp4?: string;
}

interface CanPlayInterface {
    name: string;
    isReady: boolean;
    readyState: number;
    videoNode: HTMLVideoElement;
}

interface VideoProps {
    name: string;
    video: VideoType;
    timeLabel?: boolean;
    handleClick?: () => void;
    handleCanPlay?: (res: CanPlayInterface) => void;
    handleDurationChange?: (res: { name: string, duration: number}) => void;
    handleTimeUpdate?: (res: { name: string, currentTime: number }) => void;
    handlePlaying?: (res: { name: string, playing: boolean }) => void;
    handleProgress?: (res: { name: string, percent: number }) => void;
}

// TODO add constant of readyState 0, 1, 2, 3

export class Video extends React.PureComponent<VideoProps, any> {
    static defaultProps = {
        timeLabel: false
    };

    video: HTMLVideoElement;

    constructor() {
        super();

        this.handleCanPlay = this.handleCanPlay.bind(this);
        this.handleDurationChange = this.handleDurationChange.bind(this);
        this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
        this.handlePlaying = this.handlePlaying.bind(this);
        this.handleProgress = this.handleProgress.bind(this);
    }

    shouldComponentUpdate(nextProps: VideoProps) {
        if (nextProps.video !== this.props.video) {
            return true;
        }

        return false;
    }

    handleDurationChange() {
        // update video duration
        const videoDuration = this.video.duration;
        const { name } = this.props;

        if (this.props.handleDurationChange) {
            this.props.handleDurationChange({ name, duration: videoDuration });
        }
        console.log(videoDuration, this.video);
        return { name, duration: videoDuration };
    }

    handleCanPlay() {
        // is video ready?
        const readyState = this.video.readyState;
        const { name } = this.props;

        if (this.video.readyState > 0) {
            if (this.props.handleCanPlay) {
                this.props.handleCanPlay({ name, isReady: true, readyState: readyState, videoNode: this.video });
            }

            return { name, isReady: true, readyState, videoNode: this.video };
        }

        return { name, isReady: false, readyState: 0 };
    }

    handleTimeUpdate() {
        // update time every second
        const { name } = this.props;
        const currentTime = this.video.currentTime;

        if (this.props.handleTimeUpdate) {
            this.props.handleTimeUpdate({ name, currentTime });
        }

        return { name, currentTime };
    }

    handlePlaying() {
        // is video playing?
        const playing = !this.video.paused;
        const { name } = this.props;

        if (this.props.handlePlaying) {
            this.props.handlePlaying({ name, playing });
        }

        return { name, playing };
    }

    handleProgress() {
        // buffer progress
        let percent = 0;
        const video = this.video;
        const { name } = this.props;
        // add buffer for video player
        // based on MDN article:
        // https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/buffering_seeking_time_ranges

        if (this.video.readyState <= 0) { 
            return;
        }

        // buffered end - return value in sec
        // buffered.length - number of time ranges in the object
        const bufferEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;

        if (duration > 0) {
            percent = (bufferEnd / duration) * 100;
        }

        if (this.props.handleProgress) {
            this.props.handleProgress({ name, percent });
        }

        return { name, percent };
    }

    render() {
        const { video } = this.props;

        if (this.video) {
            if (this.video.ended && this.video.currentTime === this.video.duration) {
                // return null;
            }
        }

        return (
            <div
                onClick={this.props.handleClick}
                className="pd-player__video viewer"
            >
                <video
                    ref={(node: HTMLVideoElement) => this.video = node}
                    onCanPlay={this.handleCanPlay}
                    onDurationChange={this.handleDurationChange}
                    onTimeUpdate={this.handleTimeUpdate}
                    onPlaying={this.handlePlaying}
                    onPause={this.handlePlaying}
                    onProgress={this.handleProgress}
                >
                    <source src={video.webm} type="video/webm" />
                    <source src={video.mp4} type="video/mp4" />
                    <p>
                        <strong>
                            Prohlížeč nepodporuje HTML5 video.
                        </strong>
                    </p>
                </video>
            </div>
        );  
    }
}
