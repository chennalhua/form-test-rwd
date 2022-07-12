import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
//view page
import HomePage from '../view/HomePage'
import Signature from '../view/Signature'
import GoldenForm from '../view/ReviewGoldenForm'
import Test from '../view/Test'
import PDFjs from '../view/PdfJs'

const AppRoute = () => {
    return (
        <>
            <Router>
                <Switch>
                    <Route exact path='/test'><Test /></Route>
                    <Route exact path='/'><HomePage /></Route>
                    <Route exact path='/signature'><Signature /></Route>
                    <Route exact path='/review'><GoldenForm /></Route>
                    <Route exact path='/pdf'><PDFjs /></Route>
                </Switch>
            </Router>
        </>
    )
}
export default AppRoute