import * as React from 'react';
import './App.css';

import { Player } from './components/VideoPlayer';

const video = 'https://player.vimeo.com/external/194837908.sd.mp4?s=c350076905b78c67f74d7ee39fdb4fef01d12420&profile_id=164';
const video2 = 'https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4';

class App extends React.Component<{}, any> {
  constructor() {
    super();

    this.state = {
      videos: [
        {key: 'video', mp4: video2 }
      ]
    };
  }

  handleClick(add: boolean) {
    let videos = [...this.state.videos];

    if (add) {
      videos.push({key: 'video2', mp4: video });
    } else {
      videos = [ {key: 'video', mp4: video2 } ];
    }

    this.setState({
      videos
    });
  }

  render() {
    console.log('App', this);
    return (
      <div className="App">
        <Player playlist={this.state.videos} />
        <button onClick={() => this.handleClick(true)}>Přidat video</button>
        <button onClick={() => this.handleClick(false)}>Odebrat video</button>
      </div>
    );
  }
}

export default App;
