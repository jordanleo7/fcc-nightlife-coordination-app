import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Navbar extends Component {

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
          <Link to={"/"} className="navbar-brand">Nightlife Coordination App</Link>
        </nav>
      </div>
    )
  }

}

export default Navbar