import React, { Component } from 'react';
import axios from 'axios';
import Main from './Main';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: ''
    };
  }

  componentWillMount() {
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
      <div className="App">
        <Navbar isLoggedIn={this.state.isLoggedIn} />
        <Main isLoggedIn={this.state.isLoggedIn} />
        <Footer />
      </div>
    )
  }

}

export default App;
