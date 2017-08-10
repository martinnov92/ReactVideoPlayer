import * as React from 'react';
import './App.css';

import { Player } from './components/VideoPlayer';

const video = 'https://player.vimeo.com/external/194837908.sd.mp4?s=c350076905b78c67f74d7ee39fdb4fef01d12420&profile_id=164';

class App extends React.Component<{}, {}> {
  render() {
    console.log('App', this);
    return (
      <div className="App">
        <Player playlist={[ {key: 'bunny', mp4: video }, {key: 'bunny2', mp4: video } ]} />
      </div>
    );
  }
}

export default App;
