import React, { Component } from 'react';

class LoginButton extends Component {

  render() {

    let loginButton = null;

    if (this.props.isLoggedIn.username) {
      loginButton = <li className="nav-item">
                      <a href="/auth/logout" className="nav-link">Log out</a>
                    </li>
    } else {
      loginButton = <li className="nav-item">
                      <a href="/auth/google" className="nav-link">Log in</a>
                    </li>
    }

    return (
      <div>
       {loginButton}
      </div>
    )
  }

}

export default LoginButton