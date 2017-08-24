import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { getDurationTime } from './utils/VideoUtils';

interface VideoControlsProps {
    ready: boolean;
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
    handleMouseUp?: (res: { currentTime: number }) => void;
    handleScrub?: (res: { currentTime: number }) => void;
    handleProgressClick?: (res: { currentTime: number }) => void;
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
        e.preventDefault();
        e.stopPropagation();

        if (!this.props.ready) {
            return;
        }

        this.setState(() => {
            document.addEventListener('mousemove', this.handleScrub);
            document.addEventListener('mouseup', this.handleMouseUp);

            if (this.props.handleMouseDown) {
                this.props.handleMouseDown();
            }

            return {
                isDragging: true
            };
        });
    }

    handleScrub(e: any) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.props.ready || !this.state.isDragging) {
            return;
        }

        const { duration } = this.props;
        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const currentTime = (mousePosition / this.progress.offsetWidth) * duration;

        if (this.props.handleScrub) {
            this.props.handleScrub({ currentTime });
        }

        return { currentTime };
    }

    handleMouseUp(e: any) {
        e.preventDefault();
        e.stopPropagation();

        const { duration } = this.props;
        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const currentTime = (mousePosition / this.progress.offsetWidth) * duration;

        if (this.props.handleProgressClick) {
            this.props.handleProgressClick({ currentTime });
        } else if (this.props.handleMouseUp) {
            this.props.handleMouseUp({ currentTime });
        }

        this.setState(() => {
            document.removeEventListener('mousemove', this.handleScrub);
            document.removeEventListener('mouseup', this.handleMouseUp);

            if (this.props.handleMouseUp) {
                this.props.handleMouseUp({ currentTime });
            }

            return {
                isDragging: false
            };
        });
    }

    handleProgressClick(e: any) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.props.ready) {
            return;
        }

        const { duration } = this.props;
        const progressBar = findDOMNode(this.progress);
        const mousePosition = e.clientX - progressBar.getBoundingClientRect().left;
        const currentTime = (mousePosition / this.progress.offsetWidth) * duration;

        if (this.props.handleProgressClick) {
            this.props.handleProgressClick({ currentTime });
        }

        return { currentTime };
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
                        className={`pd-player__button button-${playing ? 'pause' : 'play'} toggle}`}
                        title="Play / pauza"
                        onClick={handlePlay}
                    >
                        {playing ? '||' : '▶'}
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