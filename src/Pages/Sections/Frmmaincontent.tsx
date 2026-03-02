import React from 'react';
import News from './Frmnews';
import RelatedLinks from './Frmrelatedlinks';

const Frmmaincontent = () => {
    return (
        <section className="main-content section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-9">
                        <News />
                    </div>
                    <div className="col-lg-3">
                        <RelatedLinks />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Frmmaincontent;
