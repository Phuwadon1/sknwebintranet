import React, { useEffect } from 'react';

const FrmThaiMedicineReports = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <section className="section">
            <div className="container" data-aos="fade-up">
                <div className="section-title" style={{ marginTop: '100px' }}>
                    <h2>รายงานแพทย์แผนไทย</h2>
                    <p>หน้าว่าง (Placeholder)</p>
                </div>
            </div>
        </section>
    );
};

export default FrmThaiMedicineReports;
