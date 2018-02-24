import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './SearchResults'
class SearchResults extends Component {

  render() {

    const search = this.props.data;
    let results = '';

    if (search) {
      results = search.map((result) => {
        console.log(result.name);
        return (        
          <li key={result.id} className="list-group-item">
            <img src={result.image_url} alt="img" style={{height: '90px', width: '90px'}} />
            <a href={result.url}> {result.name} </a>

          </li>
        )
      })
    }

    return (
      <div className="pt-2 pb-5">
        <ul className="list-group">{results}</ul>
        <div>Search results provided by <a href="https://www.yelp.com/">Yelp</a></div>
      </div>
    );

  }

}

export default SearchResults