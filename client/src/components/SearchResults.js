import React, { Component } from 'react';
import './SearchResults.css'
import axios from 'axios';

class SearchResults extends Component {

  handleToggleGoing(id, e) {
    console.log(id, e)
    axios.get('api/togglegoing/' + id)
    .then((response) => {

    })
    .catch((error) => {
      console.log(error);
    })
  }

  render() {

    const search = this.props.data;
    let results = '';

    if (search) {
      results = search.map((result) => {
        return (        
          <li key={result.id} className="list-group-item">
            <div className="row">
              <div className="col-4">
                <img src={result.image_url} alt="img" style={{height: '90px', width: '90px'}} />
              </div>
              <div className="col-8">
                <a href={result.url}> {result.name} </a>

                <button onClick={(e) => this.handleToggleGoing(result.id, e)} className="btn btn-secondary">Going!</button>

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