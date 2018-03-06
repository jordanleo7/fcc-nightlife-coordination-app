import React, { Component } from 'react';
import axios from 'axios';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      searchResults: JSON.parse(localStorage.getItem('searchResults')) || '',
      isLoggedIn: this.props.isLoggedIn
    }
    this.handleSearchQueryText = this.handleSearchQueryText.bind(this);
    this.handleSearchQuery = this.handleSearchQuery.bind(this);
  }

  handleSearchQueryText(event) {
    this.setState({searchQuery: event.target.value});
  }

  handleSearchQuery(event) {
    event.preventDefault();
    localStorage.setItem('searchQuery', JSON.stringify(this.state.searchQuery));
    axios.get('api/yelp/search/' + this.state.searchQuery)
    .then((response) => {
      this.setState({searchResults: response.data});
      localStorage.setItem('searchResults', JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    })
  }

  handleToggleGoing(id, e) {
    e.preventDefault();
    if (this.state.isLoggedIn !== 'Not logged in') {
      axios.post('api/togglegoing/' + id, {
        searchQuery: JSON.parse(localStorage.getItem('searchQuery'))
      })
      .then((response) => {
        console.log(response);
        this.setState({searchResults: response.data})
        localStorage.setItem('searchResults', JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }

  render() {

    const isLoggedIn = this.state.isLoggedIn;
    let notice = null;
    if (isLoggedIn === 'Not logged in') {
      notice = (<div className="col-12 pt-3">Search by location to view how many people are going to local nightlife businesses. Log in to add yourself.</div>)
    }

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 pt-3"> <span role="img" area-label="nightlife emojis">🍸🥃🍷🍺🍶🍻🥂🍹🍾🎇🌃🏙🌌🌉</span>
          </div>
          <div className="col-12 pt-3">
            <form onSubmit={this.handleSearchQuery}>
              <div className="form-row">
                <div className="col-8">
                  <input 
                    type="text" 
                    name="search" 
                    className="form-control col-12" 
                    value={this.state.searchQuery} 
                    onChange={this.handleSearchQueryText} 
                    placeholder="Enter address, neighborhood, city, state or zip" 
                    required 
                  />
                </div>
                <div className="col-4">
                  <button
                    type="submit"
                    value="Submit"
                    className="btn btn-primary col-12"
                    >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          {notice}

          <div className="col-12">
            <div className="pt-3 pb-5">
              <ul className="list-group">
                {this.state.searchResults !== '' && this.state.searchResults.map(result => 
                  <li key={result.id} className="list-group-item">
                    <div className="row">
                      <div className="pl-2 pr-1">
                        <img src={result.image_url} alt="img" style={{height: '80px', width: '80px'}} />
                      </div>
                      <div className="pl-2">
                        <a href={result.url}> {result.name} </a>

                        <div>{result.location.address1 + ', ' + result.location.city}</div>

                        <div>
                          <button onClick={(e) => this.handleToggleGoing(result.id, e)} className="btn btn-secondary">Going!</button>
                          <div>{'Going: ' + result.numberGoing}</div>
                        </div>
                      </div>
                    </div>
                  </li>) 
                }
              </ul>
              <div>Search results provided by <a href="https://www.yelp.com/">Yelp</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Home