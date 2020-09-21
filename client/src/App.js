import React, {Fragment} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Navbar from "./Components/layout/Navbar";
import Landing from "./Components/layout/Landing";
import Login from "./Components/auth/Login";
import Register from "./Components/auth/Register";
import './App.css';
const App = () => (
    <Router>
    <Fragment>
        <Navbar></Navbar>
       <Route exact path ='/' component={Landing}/>
       <section className="container">
           <Switch>
               <Route exact path="/Register" component={Register}></Route>
               <Route exact path="/Login" component={Login}></Route>

           </Switch>
       </section>

    </Fragment>
    </Router>
);

export default App;
