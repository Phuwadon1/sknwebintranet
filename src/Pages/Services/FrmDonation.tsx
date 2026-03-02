import React from 'react';
import { Card, Row, Col, Divider, Button } from 'antd';
import { HeartOutlined, QrcodeOutlined, PhoneOutlined } from '@ant-design/icons';
import ktbLogo from '../../assets/img/ktb_logo_v2.png';

const FrmDonation = () => {
    return (
        <div className="container py-5 mt-5">
            <div className="section-title text-center mb-5" data-aos="fade-up">
                <h2>ร่วมบริจาค</h2>
                <p>ร่วมสมทบทุนจัดซื้อครุภัณฑ์ทางการแพทย์ เพื่อพัฒนาศักยภาพการรักษาและบริการ</p>
            </div>

            <div className="row justify-content-center" data-aos="fade-up">
                <div className="col-lg-8">
                    <Card className="shadow-sm border-0">
                        <div className="text-center mb-4">
                            <h3 className="text-primary fw-bold">ช่องทางการบริจาคที่แนะนำ (e-Donation)</h3>
                            <p className="text-muted">ลดหย่อนภาษีได้ 2 เท่า โดยไม่ต้องใช้ใบเสร็จ (ระบบส่งข้อมูลตรงถึงกรมสรรพากร)</p>
                        </div>

                        {/* Method 1: Krungthai NEXT */}
                        <div className="d-flex align-items-start mb-4 p-4 bg-light rounded hover-shadow">
                            <div className="me-4 text-center" style={{ minWidth: '80px' }}>
                                <img
                                    src={ktbLogo}
                                    alt="Krungthai Bank"
                                    style={{ width: '80px', height: 'auto', objectFit: 'contain' }}
                                />
                            </div>
                            <div>
                                <h5 className="mb-2 text-primary fw-bold">1. ผ่านแอป Krungthai NEXT (กรุงไทย เติมบุญ)</h5>
                                <ul className="mb-0 text-muted ps-3">
                                    <li>เข้าแอปฯ Krungthai NEXT</li>
                                    <li>เลือกเมนู <strong>"จ่ายบิล / เติมเงิน"</strong> หรือ <strong>"บริจาค" (Donation)</strong></li>
                                    <li>เลือกหมวดหมู่ <strong>"โรงพยาบาล"</strong></li>
                                    <li>ค้นหาคำว่า <strong>"โรงพยาบาลสกลนคร"</strong></li>
                                    <li>ระบุจำนวนเงินที่ต้องการบริจาค</li>
                                </ul>
                            </div>
                        </div>

                        {/* Method 2: SCB / Other Banks */}
                        <div className="d-flex align-items-start p-4 bg-light rounded hover-shadow">
                            <div className="me-4 text-center" style={{ minWidth: '80px' }}>
                                <div style={{ width: '60px', height: '60px', background: '#4e2a84', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                    <QrcodeOutlined />
                                </div>
                            </div>
                            <div>
                                <h5 className="mb-2 text-primary fw-bold">2. สแกน QR Code (e-Donation)</h5>
                                <p className="mb-2 text-muted">
                                    ท่านสามารถสแกน QR Code e-Donation ของโรงพยาบาลได้ที่:
                                </p>
                                <ul className="mb-0 text-muted ps-3">
                                    <li>จุดบริการรับบริจาค ภายในโรงพยาบาล</li>
                                    <li>ติดต่อขอรับ QR Code จากฝ่ายการเงิน</li>
                                </ul>
                                <small className="text-danger mt-2 d-block">* เพื่อความปลอดภัยและมั่นใจว่าเป็นบัญชีของโรงพยาบาลจริง</small>
                            </div>
                        </div>

                    </Card>
                </div>
            </div>

            <div className="row mt-4" data-aos="fade-up" data-aos-delay="100">
                <div className="col-12">
                    <Card className="shadow-sm border-0 bg-primary text-white">
                        <Row align="middle" gutter={[16, 16]}>
                            <Col md={16}>
                                <h3 className="text-white"><PhoneOutlined /> ต้องการใบเสร็จรับเงิน หรือสอบถามข้อมูลเพิ่มเติม</h3>
                                <p className="mb-0 text-white">กรุณาส่งหลักฐานการโอนเงินและรายละเอียดมาที่ฝ่ายการเงิน หรือติดต่อสอบถามได้ในวันและเวลาราชการ</p>
                            </Col>
                            <Col md={8} className="text-md-end text-center">
                                <Button size="large" ghost className="text-white border-white">
                                    โทร. 042-711615 ต่อ 1234
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </div>
            </div>
        </div >
    );
};

export default FrmDonation;
