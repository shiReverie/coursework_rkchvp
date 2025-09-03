/* eslint-disable no-unused-vars */
import 'bootstrap/dist/css/bootstrap.min.css';
import './RNav.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {
    Routes,
    BrowserRouter as Router,
    Route,
    NavLink
} from 'react-router-dom';
import BannerCanvas from './ReverieAd_CanvasI';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './i18n'; 
import VideoCreator from './ReverieAd_CanvasV';

// Sample pages with translation support
const Rhome = () => {
    const { t } = useTranslation();
    return (
        <>
        <h1>WELCOME TO REVERIE ADS</h1>
        <p> 1) To edit text click right mouse key on text<br/>
            2) To drag images in banner maker hold right mouse key<br/>
            3) To resize images in banner maker click left mouse key<br />
            4) To resize images in video maker find a grey square at the right bottom of images<br />
            5) To drage images in video maker hold left mouse key<br />
            6) To add animation to image click right mouse key on image<br />
        </p>
        </>
    );
};

const Rimage = () => (
   
        <BannerCanvas />
);

const Rvideo = () => (
    <VideoCreator></VideoCreator>
);

function RNav() {
    const { t, i18n } = useTranslation();

    
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Router>
            <Navbar
                expand="lg"
                className="position-absolute top-0 start-0 shadow-sm p-3 mb-5 bg-body-tertiary rounded"
                sticky="top"
            >
                <Container>
                    <Navbar.Brand>ReverieAd</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavLink to="/" className="navLink">
                                {t("home")}
                            </NavLink>
                            <NavLink to="/image" className="navLink">
                                {t("image")}
                            </NavLink>
                            <NavLink to="/video" className="navLink">
                                {t("video")}
                            </NavLink>
                        </Nav>
                       
                        <div>
                            <button
                                className="btn btn-outline-primary btn-sm me-1"
                                onClick={() => changeLanguage('en')}
                            >
                                EN
                            </button>
                            <button
                                className="btn btn-outline-primary btn-sm me-1"
                                onClick={() => changeLanguage('ru')}
                            >
                                RU
                            </button>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => changeLanguage('de')}
                            >
                                DE
                            </button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Routes>
                <Route path="/" element={<Rhome />} />
                <Route path="/image" element={<Rimage />} />
                <Route path="/video" element={<Rvideo />} />
            </Routes>
        </Router>
    );
}

export default RNav;
