import * as React from 'react';

class Test extends React.Component<{}, {}> {
  render() {
    console.log('Test', this);
    return (
      <div className="Test">
          {this.props.children}
      </div>
    );
  }
}

export default Test;
