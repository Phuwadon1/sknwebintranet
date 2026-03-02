import React from 'react';
import { Card, Input, Button, Form, DatePicker, Select } from 'antd';
import { UserOutlined, SearchOutlined, CalendarOutlined } from '@ant-design/icons';

const FrmCheckRights = () => {
    const onFinish = (values: any) => {
        console.log('Success:', values);
    };

    return (
        <div className="container py-5 mt-5">
            <div className="section-title text-center mb-5" data-aos="fade-up">
                <h2>ตรวจสอบสิทธิการรักษา / นัดหมาย</h2>
                <p>กรอกข้อมูลเพื่อตรวจสอบสิทธิการรักษาหรือดูตารางนัดหมายของคุณ</p>
            </div>

            <div className="row justify-content-center" data-aos="fade-up" data-aos-delay="100">
                <div className="col-lg-6">
                    <Card title="ข้อมูลผู้รับบริการ" bordered={false} className="shadow-sm">
                        <Form
                            name="check_rights"
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="เลขบัตรประจำตัวประชาชน (13 หลัก)"
                                name="idCard"
                                rules={[{ required: true, message: 'กรุณากรอกเลขบัตรประจำตัวประชาชน' }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="x-xxxx-xxxxx-xx-x"
                                    maxLength={13}
                                />
                            </Form.Item>

                            <Form.Item
                                label="วัน/เดือน/ปี เกิด"
                                name="birthDate"
                                rules={[{ required: true, message: 'กรุณาระบุวันเกิด' }]}
                            >
                                <DatePicker className="w-100" placeholder="เลือกวันที่" format="DD/MM/YYYY" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} block size="large" style={{ backgroundColor: '#1977cc', borderColor: '#1977cc' }}>
                                    ตรวจสอบข้อมูล
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>

            <div className="row mt-5" data-aos="fade-up" data-aos-delay="200">
                <div className="col-12 text-center">
                    <p className="text-muted">
                        * หากพบปัญหาในการตรวจสอบสิทธิ กรุณาติดต่อเวชระเบียน โทร. 042-711615
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FrmCheckRights;
