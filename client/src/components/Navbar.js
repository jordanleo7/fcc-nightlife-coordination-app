import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import axios from 'axios';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: ''
    };
  }

  componentDidMount() {
    axios.get('/isLoggedIn')
    .then((response) => {
      this.setState({ isLoggedIn: response.data || 'Not logged in' })
    })
    .catch((error) => {
      console.log(error)
    });
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
          <Link to={"/"} className="navbar-brand">Nightlife Coordination App</Link>
          <ul className="navbar-nav">
            <LoginButton isLoggedIn={this.state.isLoggedIn} />
          </ul>
        </nav>
      </div>
    )
  }

}

export default Navbar