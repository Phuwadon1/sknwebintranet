import React from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import { UserOutlined, MedicineBoxOutlined, SmileOutlined } from '@ant-design/icons';

const FrmQueueStatus = () => {
    // Mock Data
    const queues = [
        { department: 'อายุรกรรม (Medicine)', currentInfo: 'A052', waiting: 12, color: '#1977cc' },
        { department: 'ศัลยกรรม (Surgery)', currentInfo: 'B018', waiting: 5, color: '#28a745' },
        { department: 'กุมารเวชกรรม (Pediatrics)', currentInfo: 'C030', waiting: 8, color: '#ffc107' },
        { department: 'สูติ-นารีเวช (OB-GYN)', currentInfo: 'D012', waiting: 3, color: '#e83e8c' },
        { department: 'กระดูกและข้อ (Orthopedics)', currentInfo: 'E025', waiting: 15, color: '#fd7e14' },
        { department: 'จักษุ (Eye)', currentInfo: 'F010', waiting: 6, color: '#6f42c1' },
    ];

    return (
        <div className="container py-5 mt-5">
            <div className="section-title text-center mb-5" data-aos="fade-up">
                <h2>สถานะคิวการรักษา</h2>
                <p>ตรวจสอบสถานะคิวปัจจุบันของแผนกต่างๆ แบบเรียลไทม์</p>
            </div>

            <Row gutter={[24, 24]}>
                {queues.map((q, index) => (
                    <Col xs={24} sm={12} lg={8} key={index} data-aos="fade-up" data-aos-delay={(index + 1) * 100}>
                        <Card hoverable className="h-100 shadow-sm text-center border-0" style={{ borderTop: `4px solid ${q.color}` }}>
                            <h4 className="mb-4" style={{ color: '#444' }}>{q.department}</h4>
                            <div className="mb-4">
                                <span className="text-muted">กำลังเรียกคิวที่</span>
                                <h1 style={{ fontSize: '3.5rem', color: q.color, fontWeight: 'bold', margin: '10px 0' }}>
                                    {q.currentInfo}
                                </h1>
                            </div>
                            <Row gutter={16} className="mt-3 pt-3 border-top">
                                <Col span={24}>
                                    <Statistic
                                        title="จำนวนรอตรวจ"
                                        value={q.waiting}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ color: '#6c757d' }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div className="text-center mt-5" data-aos="fade-up">
                <p className="text-muted">ข้อมูลมีการอัปเดตทุกๆ 1 นาที</p>
            </div>
        </div>
    );
};

export default FrmQueueStatus;
