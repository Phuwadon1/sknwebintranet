import React, { useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber, Card, Row, Col, Divider, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TextArea } = Input;

const FrmDoctorReportEntry = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const onFinish = (values: any) => {
        console.log('Success:', values);
        message.success('บันทึกข้อมูลเรียบร้อย (UI Demo)');
        // In real implementation, this would call an API
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        message.error('กรุณากรอกข้อมูลให้ครบถ้วน');
    };

    return (
        <section className="section">
            <div className="container" data-aos="fade-up">
                <div className="d-flex justify-content-start mb-3 pt-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/Reporting')}>
                        ย้อนกลับ
                    </Button>
                </div>

                <Card className="shadow-sm">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        initialValues={{
                            month: dayjs(),
                            opd_cases: 0,
                            ipd_cases: 0,
                            surgery_major: 0,
                            surgery_minor: 0,
                            conference_days: 0,
                            teaching_hours: 0
                        }}
                    >
                        {/* Section 1: General Information */}
                        <Divider orientation="left">ข้อมูลทั่วไป (General Info)</Divider>
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="ประจำเดือน (Month)"
                                    name="month"
                                    rules={[{ required: true, message: 'กรุณาเลือกเดือน' }]}
                                >
                                    <DatePicker picker="month" format="MM/YYYY" style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="แพทย์ผู้รายงาน (Doctor)"
                                    name="doctor_id"
                                    rules={[{ required: true, message: 'กรุณาเลือกแพทย์' }]}
                                >
                                    <Select placeholder="เลือกแพทย์">
                                        <Option value="1">นพ. ทดสอบ ระบบ</Option>
                                        <Option value="2">พญ. ใจดี มีสุข</Option>
                                        {/* Mock data */}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="สังกัดแผนก (Department)"
                                    name="department"
                                    rules={[{ required: true, message: 'กรุณาเลือกแผนก' }]}
                                >
                                    <Select placeholder="เลือกแผนก">
                                        <Option value="med">อายุรกรรม (Medicine)</Option>
                                        <Option value="surg">ศัลยกรรม (Surgery)</Option>
                                        <Option value="ped">กุมารเวชกรรม (Pediatrics)</Option>
                                        <Option value="obgyn">สูตินารีเวช (OB-GYN)</Option>
                                        <Option value="ortho">ศัลยกรรมกระดูก (Orthopedics)</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Section 2: Workload Statistics */}
                        <Divider orientation="left">สถิติภาระงาน (Workload)</Divider>
                        <Row gutter={16}>
                            <Col xs={24} md={6}>
                                <Form.Item label="ผู้ป่วยนอก (OPD Cases)" name="opd_cases">
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={6}>
                                <Form.Item label="ผู้ป่วยใน (IPD Cases)" name="ipd_cases">
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={6}>
                                <Form.Item label="ผ่าตัดใหญ่ (Major Surgery)" name="surgery_major">
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={6}>
                                <Form.Item label="ผ่าตัดเล็ก (Minor Surgery)" name="surgery_minor">
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Section 3: Academic & Other */}
                        <Divider orientation="left">งานวิชาการและอื่นๆ (Academic)</Divider>
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item label="จำนวนวันประชุมวิชาการ (Conference Days)" name="conference_days">
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="ชั่วโมงสอน/บรรยาย (Teaching Hours)" name="teaching_hours">
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="งานวิจัย/บทความ (Research/Articles)" name="research_count">
                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="จำนวนเรื่อง" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label="หมายเหตุ / ปัญหาอุปสรรค (Notes)" name="notes">
                                    <TextArea rows={4} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="text-center mt-4">
                            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />}>
                                บันทึกข้อมูล
                            </Button>
                        </div>
                    </Form>
                </Card>
            </div>
        </section>
    );
};

export default FrmDoctorReportEntry;
