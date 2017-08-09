import * as React from 'react';
import './App.css';

import { Player } from './components/VideoPlayer';

const logo = require('./logo.svg');

const video = 'https://player.vimeo.com/external/194837908.sd.mp4?s=c350076905b78c67f74d7ee39fdb4fef01d12420&profile_id=164';

class App extends React.Component<{}, {}> {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <Player playlist={[ {key: 'bunny', mp4: video } ]} />
      </div>
    );
  }
}

export default App;
