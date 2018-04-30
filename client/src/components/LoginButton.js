import React, { Component } from 'react';

function LoginButton(props) {
  const isLoggedIn = props.isLoggedIn;
  if (isLoggedIn !== 'Not logged in') {
    return (
      <li className="nav-item">
        <a href="/auth/logout" className="nav-link">Log out</a>
      </li>
    )
  } else {
    return (
      <li className="nav-item">
        <a href="/auth/google" className="nav-link">Log in</a>
      </li>
    )
  }
}

export default LoginButton