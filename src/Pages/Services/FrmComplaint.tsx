import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Form, Input, Button, Card, Typography, message, Divider, Modal, Table } from 'antd';
import { SendOutlined, UserOutlined, PhoneOutlined, SolutionOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const FrmComplaint = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await api.post('/complaints/submit', values);
            message.success('ส่งเรื่องร้องเรียน/ข้อเสนอแนะเรียบร้อยแล้ว ขอบคุณครับ');
            form.resetFields();
        } catch (error) {
            console.error('Error submitting complaint:', error);
            message.error('เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAll = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            message.warning('กรุณาเข้าสู่ระบบก่อนใช้งาน');
            navigate('/Login');
            return;
        }

        const user = JSON.parse(userStr);
        if (String(user.Str) !== '2') {
            message.error('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถดูข้อมูลได้');
            return;
        }

        try {
            const res = await api.get('/complaints');
            setComplaints(res.data);
            setIsModalVisible(true);
        } catch (error: any) {
            console.error('Error fetching complaints:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // navigate('/Login'); // Optional
            } else {
                message.error('ไม่สามารถดึงข้อมูลได้');
            }
        }
    };

    const columns = [
        {
            title: 'วันที่',
            dataIndex: 'CreatedAt',
            key: 'CreatedAt',
            render: (text: string) => new Date(text).toLocaleString('th-TH'),
        },
        {
            title: 'หัวข้อ',
            dataIndex: 'Topic',
            key: 'Topic',
        },
        {
            title: 'รายละเอียด',
            dataIndex: 'Detail',
            key: 'Detail',
            ellipsis: true,
        },
        {
            title: 'ผู้ติดต่อ',
            dataIndex: 'ContactName',
            key: 'ContactName',
            render: (text: string) => text || '-',
        },
        {
            title: 'ติดต่อกลับ',
            dataIndex: 'ContactInfo',
            key: 'ContactInfo',
            render: (text: string) => text || '-',
        },
    ];

    return (
        <div className="container py-5 mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <Card className="shadow-sm border-0">
                        <div className="text-center mb-4">
                            <Title level={2} style={{ color: '#1977cc' }}>
                                <SolutionOutlined className="me-2" />
                                รับเรื่องร้องเรียน / ข้อเสนอแนะ
                            </Title>
                            <Paragraph type="secondary">
                                โรงพยาบาลสกลนครยินดีรับฟังทุกความคิดเห็นเพื่อนำมาพัฒนาและปรับปรุงการให้บริการ
                            </Paragraph>
                        </div>

                        <Divider />

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            autoComplete="off"
                            size="large"
                        >
                            <Form.Item
                                label="หัวข้อเรื่อง (Subject)"
                                name="topic"
                                rules={[{ required: true, message: 'กรุณาระบุหัวข้อเรื่อง' }]}
                            >
                                <Input placeholder="เช่น การให้บริการของเจ้าหน้าที่, ข้อเสนอแนะเกี่ยวกับสถานที่" />
                            </Form.Item>

                            <Form.Item
                                label="รายละเอียด (Detail)"
                                name="detail"
                                rules={[{ required: true, message: 'กรุณาระบุรายละเอียด' }]}
                            >
                                <TextArea rows={6} placeholder="ระบุรายละเอียดของเรื่องที่ต้องการแจ้ง..." />
                            </Form.Item>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Item
                                        label="ชื่อผู้ติดต่อ (Contact Name)"
                                        name="contactName"
                                        tooltip="ข้อมูลของท่านจะถูกเก็บเป็นความลับ"
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="ระบุชื่อของท่าน (ไม่บังคับ)" />
                                    </Form.Item>
                                </div>
                                <div className="col-md-6">
                                    <Form.Item
                                        label="ช่องทางติดต่อกลับ (Contact Info)"
                                        name="contactInfo"
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="เบอร์โทรศัพท์ หรือ อีเมล (ไม่บังคับ)" />
                                    </Form.Item>
                                </div>
                            </div>

                            <Form.Item className="text-center mt-3">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SendOutlined />}
                                    loading={loading}
                                    style={{ paddingLeft: 30, paddingRight: 30, borderRadius: 50, height: 45, fontSize: 16, marginRight: 10 }}
                                >
                                    ส่งข้อมูล
                                </Button>
                                <Button
                                    type="default"
                                    icon={<UnorderedListOutlined />}
                                    onClick={handleViewAll}
                                    style={{ paddingLeft: 20, paddingRight: 20, borderRadius: 50, height: 45, fontSize: 16 }}
                                >
                                    ดูข้อความทั้งหมด
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>

            <Modal
                title="รายการข้อร้องเรียนและข้อเสนอแนะ"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={complaints}
                    columns={columns}
                    rowKey="ID"
                    pagination={{ pageSize: 5 }}
                />
            </Modal>
        </div>
    );
};

export default FrmComplaint;
