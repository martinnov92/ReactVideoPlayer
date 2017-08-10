export const getDurationTime = (secs: number, mili?: boolean) => {
    // const hours = Math.floor(secs / 3600);
    // const secondsLeft = secs % 3600;

    const mins = Math.floor(secs / 60);
    const secondsLeft = Math.floor(secs % 60);

    return `${mins < 10 ? '0' + mins : mins}:${secondsLeft < 10 ? '0' + secondsLeft : secondsLeft}`;
};

export const startFullscreen = (element: HTMLElement) => {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
};

export const exitFullscreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
};
