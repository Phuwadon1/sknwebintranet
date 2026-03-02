import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { message, Modal, Table, Button, Popconfirm, Space } from 'antd'; // Updated imports
import { UnorderedListOutlined, DeleteOutlined } from '@ant-design/icons'; // Updated icons

const Frmcontact = () => {
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        try {
            await api.post('/contact/submit', data);
            message.success('ส่งข้อความเรียบร้อยแล้ว ขอบคุณครับ');
            (event.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error sending message:', error);
            message.error('เกิดข้อผิดพลาดในการส่งข้อความ');
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessages = async () => {
        fetchMessages();
        setIsModalVisible(true);
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get('/contact');
            setMessages(res.data);
        } catch (error: any) {
            message.error('ไม่สามารถดึงข้อมูลข้อความได้');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/contact/${id}`);
            message.success('ลบข้อความเรียบร้อยแล้ว');
            fetchMessages(); // Refresh list
        } catch (error: any) {
            message.error('เกิดข้อผิดพลาดในการลบข้อความ');
        }
    };

    const columns = [
        { title: 'วันที่', dataIndex: 'CreatedAt', key: 'CreatedAt', render: (text: string) => new Date(text).toLocaleString('th-TH') },
        { title: 'ชื่อ', dataIndex: 'Name', key: 'Name' },
        { title: 'อีเมล', dataIndex: 'Email', key: 'Email' },
        { title: 'หัวข้อ', dataIndex: 'Subject', key: 'Subject' },
        { title: 'ข้อความ', dataIndex: 'Message', key: 'Message', ellipsis: true },
        {
            title: 'จัดการ',
            key: 'action',
            render: (_: any, record: any) => (
                <Popconfirm
                    title="แน่ใจหรือไม่ที่จะลบข้อความนี้?"
                    onConfirm={() => handleDelete(record.ID)}
                    okText="ใช่"
                    cancelText="ไม่"
                >
                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    const canViewMessages = currentUser && (currentUser.Username === 'admin' || String(currentUser.Str) === '2');

    return (
        <section id="contact" className="contact section">
            <div className="container section-title" data-aos="fade-up">
                <h2>ติดต่อเรา</h2>
                <p>ติดต่อสอบถามข้อมูลเพิ่มเติมได้ที่</p>
            </div>

            <div className="mb-5" data-aos="fade-up" data-aos-delay={200}>
                <iframe style={{ border: 0, width: '100%', height: 270 }} src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.843644079634!2d104.14524437516232!3d17.15916698369666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313c819bc4465b0b%3A0x6b7440230230720!2sSakon%20Nakhon%20Hospital!5e0!3m2!1sen!2sth!4v1701413000000!5m2!1sen!2sth" frameBorder={0} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>

            <div className="container" data-aos="fade-up" data-aos-delay={100}>
                <div className="row gy-4">
                    <div className="col-lg-4">
                        <div className="info-item d-flex" data-aos="fade-up" data-aos-delay={300}>
                            <i className="bi bi-geo-alt flex-shrink-0" />
                            <div>
                                <h3>ที่อยู่</h3>
                                <p>1041 ถ.เจริญเมือง ต.ธาตุเชิงชุม อ.เมือง จ.สกลนคร 47000</p>
                            </div>
                        </div>
                        <div className="info-item d-flex" data-aos="fade-up" data-aos-delay={400}>
                            <i className="bi bi-telephone flex-shrink-0" />
                            <div>
                                <h3>เบอร์โทรศัพท์</h3>
                                <p>042-711-615</p>
                            </div>
                        </div>
                        <div className="info-item d-flex" data-aos="fade-up" data-aos-delay={500}>
                            <i className="bi bi-envelope flex-shrink-0" />
                            <div>
                                <h3>อีเมล</h3>
                                <p>admin@sknhospital.go.th</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <form onSubmit={handleSubmit} className="php-email-form" data-aos="fade-up" data-aos-delay={200}>
                            <div className="row gy-4">
                                <div className="col-md-6">
                                    <input type="text" name="name" className="form-control" placeholder="ชื่อ-นามสกุล" required />
                                </div>
                                <div className="col-md-6 ">
                                    <input type="email" className="form-control" name="email" placeholder="อีเมล" required />
                                </div>
                                <div className="col-md-12">
                                    <input type="text" className="form-control" name="subject" placeholder="หัวข้อ" required />
                                </div>
                                <div className="col-md-12">
                                    <textarea className="form-control" name="message" rows={6} placeholder="ข้อความ" required defaultValue={""} />
                                </div>
                                <div className="col-md-12 text-center">
                                    {loading && <div className="loading">กำลังส่ง...</div>}
                                    <div className="d-flex justify-content-center gap-2">
                                        <button type="submit" disabled={loading}>
                                            {loading ? 'Processing...' : 'ส่งข้อความ'}
                                        </button>
                                        {canViewMessages && (
                                            <Button
                                                type="default"
                                                shape="circle"
                                                icon={<UnorderedListOutlined />}
                                                onClick={handleViewMessages}
                                                style={{ marginLeft: 10, height: 44, width: 44 }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Modal
                title="ข้อความจากผู้ติดต่อ"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table dataSource={messages} columns={columns} rowKey="ID" />
            </Modal>
        </section>
    );
};

export default Frmcontact;
