import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import axios from 'axios';

class Navbar extends Component {

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
          <Link to={"/"} className="navbar-brand">Nightlife Coordination App</Link>
          <ul className="navbar-nav">
            <LoginButton isLoggedIn={this.props.isLoggedIn} />
          </ul>
        </nav>
      </div>
    )
  }

}

export default Navbar