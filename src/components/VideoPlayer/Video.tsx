import * as React from 'react';
import { getDurationTime } from './';

interface VideoType {
    key: string;
    webm?: string;
    mp4?: string;
}

interface CanPlayInterface {
    isReady: boolean;
    readyState: number;
};

interface VideoProps {
    video: VideoType;
    timeLabel?: boolean;
    handleCanPlay?: (res: CanPlayInterface) => void;
    handleDurationChange?: (res: { duration: number}) => void;
    handleTimeUpdate?: (res: { currentTime: number, percent: number }) => void;
    handlePlaying?: (res: { playing: boolean }) => void;
    handleProgress?: (res: { percent: number }) => void;
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

    handleCanPlay() {
        const readyState = this.video.readyState;

        if (this.video.readyState > 0) {
            if (this.props.handleCanPlay) {
                return this.props.handleCanPlay({ isReady: true, readyState: readyState })
            }
        }
    }

    handleDurationChange() {
        const videoDuration = this.video.duration;

        if (this.props.handleDurationChange) {
            return this.props.handleDurationChange({ duration: videoDuration });
        }
    }

    handleTimeUpdate() {
        const currentTime = this.video.currentTime;
        const percent = (currentTime / this.video.duration) * 100;

        if (this.props.handleTimeUpdate) {
            return this.props.handleTimeUpdate({ currentTime, percent })
        }
    }

    handlePlaying() {
        const playing = !this.video.paused;

        if (this.props.handlePlaying) {
            return this.props.handlePlaying({ playing });
        }
    }

    handleProgress() {
        let percent = 0;
        const video = this.video;
        // add buffer for video player
        // based on MDN article:
        // https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/buffering_seeking_time_ranges

        if (this.video.readyState <= 0) return;

        // buffered end - return value in sec
        // buffered.length - number of time ranges in the object
        const bufferEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;

        if (duration > 0) {
            percent = (bufferEnd / duration) * 100;
        }

        if (this.props.handleProgress) {
            return this.props.handleProgress({ percent });
        }
    }

    render() {
        const { video, timeLabel } = this.props;
        const duration = this.video ? this.video.duration : 0;
        const currentTime = this.video ? this.video.currentTime : 0;
        const remainingTime = duration - currentTime;

        console.log('Video', this);

        return (
            <div className="pd-player__video viewer">
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
                {
                    !timeLabel
                    ? null
                    : <span className="pd-player__video-time">
                        {
                            this.video
                            ? getDurationTime(remainingTime) + ' / ' + getDurationTime(this.video.duration)
                            : '00:00'
                        }
                    </span>
                }
            </div>
        );  
    }
}
