import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SearchResults from './SearchResults';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      searchResults: '',
      searchResultsJSON: ''
    }
    this.handleSearchQueryText = this.handleSearchQueryText.bind(this);
    this.handleSearchQuery = this.handleSearchQuery.bind(this);
  }

  handleSearchQueryText(event) {
    this.setState({searchQuery: event.target.value});
  }

  handleSearchQuery(event) {
    event.preventDefault();
    axios.get('api/yelp/search/' + this.state.searchQuery)
    .then((response) => {
      console.log(response);
      this.setState({searchResults: response.data})
    })
    .catch((error) => {
      console.log(error);
    })
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
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
                    placeholder="Enter your bar here" 
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
          <div>{this.state.searchResultsJSON}</div>
          <div className="col-12">
            <SearchResults data={this.state.searchResults} />
          </div>
        </div>
      </div>
    )
  }
}

export default Home