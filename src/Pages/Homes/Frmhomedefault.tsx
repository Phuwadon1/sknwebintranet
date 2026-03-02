import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Banners from '../Sections/Frmbanner';
import About from '../Sections/Frmabout';
import Frmstatus from '../Sections/Frmstatus';
import Services from '../Sections/Frmservices';
import Departments from '../Sections/Frmdepartments';

import Doctors from '../Sections/Frmdoctors';
import Faq from '../Sections/Frmfaq';
import Testimonials from '../Sections/Frmtestimonials';
import Gallery from '../Sections/Frmgallery';
import Contact from '../Sections/Frmcontact';
import MainContent from '../Sections/Frmmaincontent';

const Frmhomedefault = () => {

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true
        });
    }, []);

    return (
        <>
            <Banners />
            <Services />
            <Doctors />
            <MainContent />
            <About />
            <Frmstatus />
            <Departments />
            <Faq />
            <Testimonials />
            <Gallery />
            <Contact />
        </>
    )
}

export default Frmhomedefault