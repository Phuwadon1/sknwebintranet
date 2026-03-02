import React, { useEffect } from 'react';

const FrmExportPatientData = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <section className="section">
            <div className="container" data-aos="fade-up">
                <div className="section-title" style={{ marginTop: '100px' }}>
                    <h2>ส่งออกข้อมูลผู้ป่วย</h2>
                    <p>หน้าว่าง (Placeholder)</p>
                </div>
            </div>
        </section>
    );
};

export default FrmExportPatientData;
