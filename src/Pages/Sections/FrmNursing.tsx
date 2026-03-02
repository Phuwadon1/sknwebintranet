import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Button, Progress, List, Avatar, Modal, Form, Input, Select, message, Popconfirm, Radio, Upload } from 'antd';
import {
    MedicineBoxOutlined,
    TeamOutlined,
    ScheduleOutlined,
    AlertOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

const FrmNursing: React.FC = () => {
    const { isAdmin } = useAuth();

    // News State
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'news'>('news');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [linkType, setLinkType] = useState<'link' | 'file'>('link');
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();

    // Stats State
    const [stats, setStats] = useState<any>({
        TotalNurses: 0,
        Patients: 0,
        Leave: 0,
        Incidents: 0,
        MorningShift: 0,
        AfternoonShift: 0,
        NightShift: 0
    });
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [statsForm] = Form.useForm();

    const fetchStats = async () => {
        try {
            const res = await api.get('/nursing/stats');
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const newsRes = await api.get('/nursing/pr-news');
            setNews(newsRes.data);
            await fetchStats();
        } catch (error) {
            console.error("Error fetching data:", error);
            message.error("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // CRUD Handlers
    const handleAdd = () => {
        setModalType('news');
        setEditingItem(null);
        setLinkType('link');
        setFileList([]);
        form.resetFields();
        form.setFieldsValue({ Date: new Date().toLocaleDateString('th-TH') });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setModalType('news');
        setEditingItem(item);
        setLinkType('link');
        setFileList([]);
        form.setFieldsValue({
            ...item,
            externalUrl: item.Url
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/nursing/pr-news/${id}`);
            message.success("ลบข้อมูลเรียบร้อย");
            fetchData();
        } catch (error: any) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
            }
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();

            formData.append('title', values.Title);
            formData.append('date', values.Date);
            formData.append('description', values.Description || '');
            formData.append('urlType', linkType);

            if (linkType === 'link') {
                formData.append('externalUrl', values.externalUrl || '#');
            } else if (linkType === 'file' && fileList.length > 0) {
                formData.append('file', fileList[0]);
            }

            const config = {
                headers: {} // api interceptor adds token
            };

            if (editingItem) {
                formData.append('existingUrl', editingItem.Url);
                await api.put(`/nursing/pr-news/${editingItem.ID}`, formData, config);
                message.success("อัปเดตข้อมูลเรียบร้อย");
            } else {
                await api.post(`/nursing/pr-news`, formData, config);
                message.success("เพิ่มข้อมูลเรียบร้อย");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error(error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        }
    };

    const handleEditStats = () => {
        statsForm.setFieldsValue(stats);
        setIsStatsModalOpen(true);
    };

    const handleUpdateStats = async () => {
        try {
            const values = await statsForm.validateFields();
            await api.put('/nursing/stats', values);
            message.success("อัปเดตข้อมูลเรียบร้อย");
            setIsStatsModalOpen(false);
            fetchStats();
        } catch (error: any) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
            }
        }
    };

    // ... (Render) ...
    return (
        <div className="min-h-screen bg-white pb-10 font-sans" style={{ paddingTop: '50px' }}>
            {/* ... Header ... */}
            <div className="text-center mb-12 relative">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 mb-6 py-2">
                    ฝ่ายการพยาบาล
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-pink-500 to-rose-400 mx-auto rounded-full"></div>
                <p className="text-xl text-gray-500 mt-6 font-light max-w-2xl mx-auto">
                    ระบบบริหารจัดการอัตรากำลัง ตารางเวร และข้อมูลบุคลากรทางการพยาบาล
                </p>
                {isAdmin && (
                    <Button
                        type="primary"
                        size="large"
                        icon={<EditOutlined />}
                        onClick={handleEditStats}
                        className="absolute top-0 right-10 shadow-lg hover:scale-105 transition-transform"
                        style={{
                            background: 'linear-gradient(to right, #ec4899, #f43f5e)',
                            borderColor: 'transparent'
                        }}
                    >
                        จัดการ Dashboard
                    </Button>
                )}
            </div>

            <div className="container mx-auto px-4">
                {/* ... Stats Cards ... */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card bordered={false} className="shadow-md cursor-pointer border-t-4 border-pink-500 hover:shadow-xl transition-shadow">
                        <Statistic title={<span className="font-bold text-gray-600">พยาบาลทั้งหมด</span>} value={stats.TotalNurses} suffix="คน" prefix={<TeamOutlined className="text-pink-500 mr-2" />} />
                    </Card>
                    <Card bordered={false} className="shadow-md cursor-pointer border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
                        <Statistic title={<span className="font-bold text-gray-600">ผู้ป่วยในดูแลวันนี้</span>} value={stats.Patients} suffix="ราย" prefix={<MedicineBoxOutlined className="text-blue-500 mr-2" />} />
                    </Card>
                    <Card bordered={false} className="shadow-md cursor-pointer border-t-4 border-yellow-500 hover:shadow-xl transition-shadow">
                        <Statistic title={<span className="font-bold text-gray-600">ลา/หยุดงาน</span>} value={stats.Leave} suffix="คน" prefix={<ScheduleOutlined className="text-yellow-500 mr-2" />} />
                    </Card>
                    <Card bordered={false} className="shadow-md cursor-pointer border-t-4 border-red-500 hover:shadow-xl transition-shadow">
                        <Statistic title={<span className="font-bold text-gray-600">เหตุการณ์สำคัญ</span>} value={stats.Incidents} prefix={<AlertOutlined className="text-red-500 mr-2" />} />
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shift Status */}
                    <div className="lg:col-span-2">
                        <Card title="สถานะอัตรากำลังประจำวัน" className="shadow-md h-full" bordered={false}>
                            <div className="flex flex-col gap-6 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-1/3 font-bold text-gray-700">เวรเช้า (08:00 - 16:00)</div>
                                    <div className="w-2/3">
                                        <Progress percent={95} status="active" strokeColor="#52c41a" format={() => `${stats.MorningShift} คน`} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-1/3 font-bold text-gray-700">เวรบ่าย (16:00 - 24:00)</div>
                                    <div className="w-2/3">
                                        <Progress percent={80} status="active" strokeColor="#1890ff" format={() => `${stats.AfternoonShift} คน`} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-1/3 font-bold text-gray-700">เวรดึก (24:00 - 08:00)</div>
                                    <div className="w-2/3">
                                        <Progress percent={60} status="exception" strokeColor="#ff4d4f" format={() => `${stats.NightShift} คน`} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* News Section */}
                    <div className="lg:col-span-1">
                        <Card
                            title="ข่าวประชาสัมพันธ์"
                            extra={isAdmin && <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleAdd()}>เพิ่ม</Button>}
                            className="shadow-md h-full"
                            bordered={false}
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={news}
                                renderItem={item => (
                                    <List.Item
                                        actions={isAdmin ? [
                                            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(item)} />,
                                            <Popconfirm title="ยืนยันการลบ?" onConfirm={() => handleDelete(item.ID)}>
                                                <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        ] : []}
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar style={{ backgroundColor: '#f56a00' }}>N</Avatar>}
                                            title={<a href={item.Url || '#'} target="_blank" rel="noopener noreferrer">{item.Title}</a>}
                                            description={<span className="text-xs">{item.Date} - {item.Description}</span>}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </div>
                </div>
            </div >

            {/* Modal News Form */}
            < Modal
                title={editingItem ? "แก้ไขข่าว" : "เพิ่มข่าว"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="Title" label="หัวข้อข่าว" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="Date" label="วันที่" rules={[{ required: true }]}>
                        <Input placeholder="วว/ดด/ปปปป" />
                    </Form.Item>
                    <Form.Item name="Description" label="รายละเอียดย่อ">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item label="ประเภทข้อมูล">
                        <Radio.Group onChange={e => setLinkType(e.target.value)} value={linkType}>
                            <Radio value="link">ลิงก์ภายนอก (URL)</Radio>
                            <Radio value="file">อัปโหลดไฟล์ (PDF/Image)</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {linkType === 'link' ? (
                        <Form.Item name="externalUrl" label="ลิงก์ (URL)" rules={[{ required: true, message: 'กรุณาระบุ URL' }]}>
                            <Input placeholder="https://..." />
                        </Form.Item>
                    ) : (
                        <Form.Item label="ไฟล์แนบ">
                            <Upload
                                fileList={fileList}
                                onRemove={() => setFileList([])}
                                beforeUpload={(file) => {
                                    setFileList([file]);
                                    return false; // Prevent auto upload
                                }}
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />}>เลือกไฟล์</Button>
                            </Upload>
                        </Form.Item>
                    )}
                </Form>
            </Modal >

            {/* Modal Stats Form */}
            < Modal
                title="จัดการข้อมูล Dashboard"
                open={isStatsModalOpen}
                onOk={handleUpdateStats}
                onCancel={() => setIsStatsModalOpen(false)}
            >
                <Form form={statsForm} layout="vertical">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="TotalNurses" label="พยาบาลทั้งหมด">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="Patients" label="ผู้ป่วยในดูแล">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="Leave" label="ลา/หยุดงาน">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="Incidents" label="เหตุการณ์สำคัญ">
                            <Input type="number" />
                        </Form.Item>
                    </div>
                    <div className="border-t pt-4 mt-2">
                        <h3 className="font-bold mb-3">ข้อมูลอัตรากำลังเวร</h3>
                        <Form.Item name="MorningShift" label="เวรเช้า (08:00 - 16:00)">
                            <Input type="number" suffix="คน" />
                        </Form.Item>
                        <Form.Item name="AfternoonShift" label="เวรบ่าย (16:00 - 24:00)">
                            <Input type="number" suffix="คน" />
                        </Form.Item>
                        <Form.Item name="NightShift" label="เวรดึก (24:00 - 08:00)">
                            <Input type="number" suffix="คน" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal >
        </div >
    );
};

export default FrmNursing;
