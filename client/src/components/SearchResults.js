import React, { Component } from 'react';
import axios from 'axios';

class SearchResults extends Component {

  constructor(props) {
    super(props); 
    this.state = {
      searchData: this.props.searchData
    }
  }

  handleToggleGoing(id, e, index) {
    console.log(id, e, index)
    axios.post('api/togglegoing/' + id, {
      index: index
    })
    .then((response) => {

    })
    .catch((error) => {
      console.log(error);
    })
  }

  render() {

    let search = this.state.searchData;
    let results = '';

    if (search) {
      results = search.map((result, index) => {
        return (        
          <li key={result.id} className="list-group-item">
            <div className="row">
              <div className="pl-2 pr-1">
                <img src={result.image_url} alt="img" style={{height: '80px', width: '80px'}} />
              </div>
              <div className="pl-2">
                <a href={result.url}> {result.name} </a>

                <div>{result.location.address1 + ', ' + result.location.city}</div>

                <div>
                  <button onClick={(e) => this.handleToggleGoing(result.id, e, index)} className="btn btn-secondary">Going!</button>
                  <div>{'Going: ' + result.numberGoing}</div>
                </div>
              </div>
            </div>
          </li>
        )
      })
    }

    return (
      <div className="pt-3 pb-5">
        <ul className="list-group pb-2">{results}</ul>
        <div>Search results provided by <a href="https://www.yelp.com/">Yelp</a></div>
      </div>
    );

  }

}

export default SearchResults