import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { getDurationTime } from '../../utils/VideoUtils';

interface VideoControlsProps {
    playing: boolean;
    duration: number;
    currentTime?: number;
    progress?: number;
    buffer?: number;
    showTime?: boolean;

    handlePlay?: () => void;
    toggleFullscreen?: () => void;
    handleRestart?: () => void;
    handleMouseDown?: () => void;
    handleMouseUp?: () => void;
    handleScrub?: () => void;
    handleProgressClick?: () => void;
}

interface VideoControlsState {
    isDragging?: boolean;
}

export class VideoControls extends React.PureComponent<VideoControlsProps, VideoControlsState> {
    static defaultProps = {
        currentTime: 0,
        duration: 0
    };

    progress: HTMLDivElement;

    constructor() {
        super();

        this.state = {
            isDragging: false
        };

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleScrub = this.handleScrub.bind(this);
        this.handleProgressClick = this.handleProgressClick.bind(this);
    }

    handleMouseDown(e: any) {
    }

    handleMouseUp(e: any) {
    }

    handleScrub(e: any) {
        /*if (!this.state.progressDragging || this.state.ready === false) {
            return;
        }*/

        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const duration = this.props.duration;
        const currentTime = (mousePosition / this.progress.offsetWidth) * duration;

        const videoProgress = (currentTime / duration) * 100;

        return videoProgress;
    }

    handleProgressClick(e: any) {
        e.stopPropagation();

        /*if (this.state.ready === false) {
            return;
        }*/

        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const duration = this.props.duration;
        const scrubTime = (mousePosition / this.progress.offsetWidth) * duration;

        return scrubTime;
    }

    render() {
        const {
            buffer,
            progress,
            duration,
            currentTime,
            playing,
            handleRestart,
            handlePlay,
            showTime,
            toggleFullscreen
        } = this.props;

        const bufferStyle = {
            width: `${buffer}%`
        };

        const progressStyle = {
            flexBasis: `${progress}%`
        };

        const time = getDurationTime(duration - (currentTime || 0));

        return (
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
                        style={bufferStyle}
                    />
                    <div
                        className="progress__filled"
                        style={progressStyle}
                    />
                </div>

                <div className="pd-player__controls-holder">
                    <button 
                        className={`pd-player__button button-${playing ? 'play' : 'pause'} toggle}`}
                        title="Play / pauza"
                        onClick={handlePlay}
                    >
                        {playing ? '▶' : '||'}
                    </button>

                    <button
                        className="pd-player__button button-restart"
                        title="Přehrát od začátku"
                        onClick={handleRestart}
                    >
                        <i className="fa fa-step-backward" aria-hidden="true" />
                    </button>

                    <div className="pd-player__controls-duration pd-pull-right">
                        <strong>
                            {
                                showTime
                                    ? null
                                    : time
                            }
                        </strong>
                    </div>

                    <button
                        className={`pd-player__button button-fullscreen`}
                        onClick={toggleFullscreen}
                    >
                        <i className="fa fa-arrows-alt" aria-hidden="true" />
                    </button>
                </div>
            </div>
        );
    }
}