import React from 'react';
import RelatedLinks from './Frmrelatedlinks';

const Frmcontentwrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <section className="content-wrapper section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-9">
                        {children}
                    </div>
                    <div className="col-lg-3">
                        <RelatedLinks />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Frmcontentwrapper;
