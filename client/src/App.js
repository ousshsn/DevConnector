import React, {Fragment, useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Navbar from "./Components/layout/Navbar";
import Landing from "./Components/layout/Landing";
import Login from "./Components/auth/Login";
import Alert from "./Components/layout/Alert"
import Register from "./Components/auth/Register";
import Dashboard from "./Components/dashboard/Dashboard";
import PrivateRoute from "./Components/routing/PrivateRoute";
//Redux
import {Provider} from 'react-redux';
import store from "./store";
import './App.css';
import setAuthToken from "./utils/setAuthToken";
import {loadUser} from "./actions/auth";

if (localStorage.token) {
    setAuthToken(localStorage.token);
}
const App = () => {
    useEffect(() =>{
        store.dispatch(loadUser());

    }, []);
    return(
    <Provider store={store}>
    <Router>
    <Fragment>
        <Navbar></Navbar>
       <Route exact path ='/' component={Landing}/>
       <section className="container">
           <Alert></Alert>
           <Switch>
               <Route exact path="/Register" component={Register}></Route>
               <Route exact path="/Login" component={Login}></Route>
               <PrivateRoute exact path="/Dashboard" component={Dashboard} ></PrivateRoute>

           </Switch>
       </section>

    </Fragment>
    </Router>
    </Provider>
)};

export default App;
