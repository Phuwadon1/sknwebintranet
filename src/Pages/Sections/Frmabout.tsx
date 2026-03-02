import React from 'react';
import FrmITSchedule from '../Services/FrmITSchedule';

const Frmabout = () => {
    return (
        <section id="about" className="about section">
            <div className="container" data-aos="fade-up">
                <div className="section-title text-center mb-5">
                    <h2>เกี่ยวกับศูนย์เทคโนโลยีสารสนเทศฯ</h2>
                    <p>ศูนย์เทคโนโลยีสารสนเทศและโลจิสติกส์ทางการแพทย์ โรงพยาบาลสกลนคร</p>
                </div>

                <div className="row g-4">
                    {/* ประวัติความเป็นมา */}
                    <div className="col-12" data-aos="fade-up">
                        <div className="info-card" style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderTop: '4px solid #1977cc'
                        }}>
                            <h3 style={{ color: '#1977cc', marginBottom: '20px' }}>
                                <i className="bi bi-building" style={{ marginRight: '10px' }}></i>
                                ประวัติความเป็นมา
                            </h3>
                            <p style={{ lineHeight: '1.8', color: '#4a5568', fontSize: '16px' }}>
                                ศูนย์เทคโนโลยีสารสนเทศและโลจิสติกส์ทางการแพทย์ โรงพยาบาลสกลนคร
                                จัดตั้งขึ้นเพื่อสนับสนุนการดำเนินงานด้านเทคโนโลยีสารสนเทศและระบบโลจิสติกส์
                                ในโรงพยาบาล รองรับการพัฒนาระบบสุขภาพดิจิทัลและการบริหารจัดการ
                                ทรัพยากรทางการแพทย์ให้มีประสิทธิภาพสูงสุด
                            </p>
                        </div>
                    </div>

                    {/* วิสัยทัศน์ */}
                    <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
                        <div className="info-card" style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderTop: '4px solid #1977cc',
                            height: '100%'
                        }}>
                            <h3 style={{ color: '#1977cc', marginBottom: '20px' }}>
                                <i className="bi bi-eye" style={{ marginRight: '10px' }}></i>
                                วิสัยทัศน์
                            </h3>
                            <p style={{ lineHeight: '1.8', color: '#4a5568', fontSize: '16px' }}>
                                เป็นหน่วยงานหลักในการพัฒนาระบบเทคโนโลยีสารสนเทศและโลจิสติกส์
                                ที่ทันสมัย มีประสิทธิภาพ และรองรับการให้บริการทางการแพทย์ที่มีคุณภาพ
                                แก่ประชาชนในจังหวัดสกลนครและพื้นที่ใกล้เคียง
                            </p>
                        </div>
                    </div>

                    {/* พันธกิจ */}
                    <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
                        <div className="info-card" style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderTop: '4px solid #1977cc',
                            height: '100%'
                        }}>
                            <h3 style={{ color: '#1977cc', marginBottom: '20px' }}>
                                <i className="bi bi-list-check" style={{ marginRight: '10px' }}></i>
                                พันธกิจ
                            </h3>
                            <ul style={{ lineHeight: '2', color: '#4a5568', fontSize: '16px', paddingLeft: '20px' }}>
                                <li>พัฒนาและบริหารจัดการระบบเทคโนโลยีสารสนเทศทางการแพทย์</li>
                                <li>จัดการโครงสร้างพื้นฐานด้าน IT และระบบเครือข่ายคอมพิวเตอร์</li>
                                <li>บริหารจัดการโลจิสติกส์และพัสดุทางการแพทย์</li>
                                <li>ให้บริการฝึกอบรมและสนับสนุนด้านเทคโนโลยี</li>
                            </ul>
                        </div>
                    </div>

                    {/* ภารกิจหลัก */}
                    <div className="col-12" data-aos="fade-up" data-aos-delay="300">
                        <div className="info-card" style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderTop: '4px solid #1977cc'
                        }}>
                            <h3 style={{ color: '#1977cc', marginBottom: '24px' }}>
                                <i className="bi bi-gear" style={{ marginRight: '10px' }}></i>
                                ภารกิจหลัก
                            </h3>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div style={{
                                        background: '#f7fafc',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '2px solid #e2e8f0'
                                    }}>
                                        <i className="bi bi-laptop" style={{ fontSize: '32px', color: '#1977cc' }}></i>
                                        <h5 style={{ marginTop: '12px', color: '#2d3748' }}>ระบบ IT</h5>
                                        <p style={{ color: '#718096', fontSize: '14px', marginBottom: 0 }}>
                                            พัฒนาและดูแลระบบสารสนเทศโรงพยาบาล (HIS, HosXP)
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div style={{
                                        background: '#f7fafc',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '2px solid #e2e8f0'
                                    }}>
                                        <i className="bi bi-broadcast" style={{ fontSize: '32px', color: '#1977cc' }}></i>
                                        <h5 style={{ marginTop: '12px', color: '#2d3748' }}>เครือข่าย</h5>
                                        <p style={{ color: '#718096', fontSize: '14px', marginBottom: 0 }}>
                                            บริหารจัดการระบบเครือข่ายและความปลอดภัย
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div style={{
                                        background: '#f7fafc',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '2px solid #e2e8f0'
                                    }}>
                                        <i className="bi bi-box-seam" style={{ fontSize: '32px', color: '#1977cc' }}></i>
                                        <h5 style={{ marginTop: '12px', color: '#2d3748' }}>โลจิสติกส์</h5>
                                        <p style={{ color: '#718096', fontSize: '14px', marginBottom: 0 }}>
                                            จัดการพัสดุ คลังวัสดุ และโลจิสติกส์ทางการแพทย์
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-title text-center mt-5 mb-3">
                    <h2>ตารางเวรเจ้าหน้าที่</h2>
                </div>
                <div className="row">
                    <div className="col-12" data-aos="fade-up" data-aos-delay="400">
                        <div className="info-card" style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            borderTop: '4px solid #1977cc'
                        }}>
                            <FrmITSchedule />
                        </div>
                    </div>
                </div>

            </div>
        </section >
    );
};

export default Frmabout;
