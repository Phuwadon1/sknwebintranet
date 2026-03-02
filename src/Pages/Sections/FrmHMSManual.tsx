import React from 'react';

const FrmHMSManual: React.FC = () => {
    return (
        <section id="hms-manual" className="hms-manual section standard-page-content">
            {/* Header Section */}
            <div className="text-center mb-16">
                <h1 className="fw-bold mb-6 py-2">
                    คู่มือการใช้โปรแกรม HMS
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-teal-500 mx-auto rounded-full" style={{ background: '#1977cc' }}></div>
            </div>

            <div className="container">
                <div className="d-flex flex-column align-items-center gap-5">
                    {/* Image 1 */}
                    <div className="w-100 text-center">
                        <img src="/Webintranetskn/images/HMSManual/hms_new_01.png" alt="HMS Manual Page 1" className="img-fluid" />
                    </div>
                    {/* Image 2 */}
                    <div className="w-100 text-center">
                        <img src="/Webintranetskn/images/HMSManual/hms_new_02.png" alt="HMS Manual Page 2" className="img-fluid" />
                    </div>
                    {/* Image 3 */}
                    <div className="w-100 text-center">
                        <img src="/Webintranetskn/images/HMSManual/hms_new_03.png" alt="HMS Manual Page 3" className="img-fluid" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FrmHMSManual;
