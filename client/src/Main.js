import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './components/Home'

const Main = (props) => (
  <main>
    <Switch>
      <Route exact path='/' component={() => <Home isLoggedIn={props.isLoggedIn}/>}/>
    </Switch>
  </main>
)

export default Main;