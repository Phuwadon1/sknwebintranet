import React from 'react';
import { Card, Statistic, Table, Button, Tag } from 'antd';
import {
    UserOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

import { Modal, Form, Input, DatePicker, Select, message, Popconfirm, Space } from 'antd';
import api from '../../api/axios';
import moment from 'moment';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';

const FrmMortuary: React.FC = () => {
    const [form] = Form.useForm();
    const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
    const [mortuaryList, setMortuaryList] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [stats, setStats] = React.useState({ total: 0, waiting: 0, legal: 0, completed: 0 });

    // Fetch Data
    const fetchMortuaryData = async () => {
        try {
            const res = await api.get('/mortuary');
            setMortuaryList(res.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Fetch Stats
    const fetchStats = async () => {
        try {
            const res = await api.get('/mortuary/stats');
            setStats(res.data || { total: 0, waiting: 0, legal: 0, completed: 0 });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    React.useEffect(() => {
        fetchMortuaryData();
        fetchStats();
    }, []);

    // Handle Register/Update Submit
    const handleRegisterSubmit = async (values: any) => {
        try {
            setLoading(true);
            if (editingId) {
                // Update existing
                await api.put(`/mortuary/${editingId}`, values);
                message.success('แก้ไขข้อมูลเรียบร้อยแล้ว');
            } else {
                // Create new
                await api.post('/mortuary', values);
                message.success('ลงทะเบียนรับศพเรียบร้อยแล้ว');
            }
            setIsRegisterModalOpen(false);
            setEditingId(null);
            form.resetFields();
            fetchMortuaryData();
            fetchStats();
        } catch (error: any) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        } finally {
            setLoading(false);
        }
    };

    // Prepare Edit
    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsRegisterModalOpen(true);
    };

    // Handle Delete
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/mortuary/${id}`);
            message.success('ลบข้อมูลเรียบร้อยแล้ว');
            fetchMortuaryData();
            fetchStats();
        } catch (error: any) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    const columns = [
        { title: 'รหัส', dataIndex: 'id', key: 'id', render: (id: number) => `M-${id}` },
        { title: 'ชื่อ-สกุล', key: 'name', render: (_: any, record: any) => `${record.first_name} ${record.last_name}` },
        { title: 'วันที่รับ', dataIndex: 'admission_date', key: 'admission_date', render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm') },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'green';
                if (status === 'รอญาติมารับ') color = 'orange';
                if (status === 'ดำเนินคดี') color = 'red';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'สาเหตุการเสียชีวิต',
            dataIndex: 'cause_of_death',
            key: 'cause_of_death',
        },
        {
            title: 'ผู้บันทึก',
            dataIndex: 'recorder_name',
            key: 'recorder_name',
        },
        {
            title: 'จัดการ',
            key: 'action',
            width: 250,
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', gap: '50px' }}>
                    <Button
                        type="primary"
                        ghost
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        แก้ไข
                    </Button>
                    <Popconfirm
                        title="ยืนยันการลบ?"
                        description="คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="ใช่"
                        cancelText="ไม่"
                    >
                        <Button type="primary" danger ghost size="small">
                            ลบ
                        </Button>
                    </Popconfirm>
                </div>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-white pb-10 font-sans" style={{ paddingTop: '50px' }}>
            {/* Header Section - Clean and Minimal */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900 mb-6 py-2">
                    ระบบเก็บรักษาศพ
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-gray-700 to-gray-900 mx-auto rounded-full"></div>
                <p className="text-xl text-gray-500 mt-6 font-light max-w-2xl mx-auto">
                    ระบบบริหารจัดการข้อมูลผู้เสียชีวิต การรับ-ส่งศพ และการออกเอกสารรับรอง
                </p>
            </div>

            <div className="container mx-auto px-4">
                {/* Statistics Cards */}
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card bordered={true} className="cursor-pointer border-blue-200 bg-blue-50 hover:border-blue-400 transition-colors">
                        <Statistic
                            title={<span className="font-bold text-gray-600">จำนวนศพทั้งหมด (ปีนี้)</span>}
                            value={stats.total}
                            prefix={<UserOutlined className="text-blue-500 mr-2" />}
                        />
                    </Card>
                    <Card bordered={true} className="cursor-pointer border-orange-200 bg-orange-50 hover:border-orange-400 transition-colors">
                        <Statistic
                            title={<span className="font-bold text-gray-600">รอญาติมารับ</span>}
                            value={stats.waiting}
                            prefix={<ClockCircleOutlined className="text-orange-500 mr-2" />}
                        />
                    </Card>
                    <Card bordered={true} className="cursor-pointer border-red-200 bg-red-50 hover:border-red-400 transition-colors">
                        <Statistic
                            title={<span className="font-bold text-gray-600">คดีความ/นิติเวช</span>}
                            value={stats.legal}
                            prefix={<FileTextOutlined className="text-red-500 mr-2" />}
                        />
                    </Card>
                    <Card bordered={true} className="cursor-pointer border-green-200 bg-green-50 hover:border-green-400 transition-colors">
                        <Statistic
                            title={<span className="font-bold text-gray-600">ดำเนินการเสร็จสิ้น</span>}
                            value={stats.completed}
                            prefix={<CheckCircleOutlined className="text-green-500 mr-2" />}
                        />
                    </Card>
                </div>

                {/* Quick Actions & Menu */}
                <div style={{ marginBottom: '60px' }}>
                    <h3 className="text-xl font-bold text-gray-700 mb-4">เมนูด่วน</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<UserAddOutlined />}
                            block
                            style={{ height: '50px', fontSize: '18px' }}
                            onClick={() => {
                                setEditingId(null);
                                form.resetFields();
                                setIsRegisterModalOpen(true);
                            }}
                        >
                            ลงทะเบียนรับศพใหม่
                        </Button>
                        <Button size="large" icon={<UserOutlined />} block style={{ height: '50px', fontSize: '18px' }} onClick={() => setIsSearchModalOpen(true)}>
                            ค้นหาข้อมูลย้อนหลัง
                        </Button>
                        <Button size="large" icon={<FileTextOutlined />} block style={{ height: '50px', fontSize: '18px' }}>
                            พิมพ์ใบรับรอง
                        </Button>
                        <Button size="large" danger block style={{ height: '50px', fontSize: '18px' }}>
                            รายงานสรุป
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content / Table */}
                    <div className="lg:col-span-3">
                        {/* New Data Table Section */}
                        <Card title="ข้อมูลการจัดการศพ" bordered={true} className="border-gray-200">
                            <Table
                                dataSource={mortuaryList}
                                columns={columns}
                                locale={{ emptyText: 'ยังไม่มีข้อมูล' }}
                                size="middle"
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                            />
                        </Card>
                    </div>

                    {/* Announcement */}
                    <div className="lg:col-span-1">
                        <Card title="ประกาศ / แจ้งเตือน" bordered={true} className="border-gray-200">
                            <div className="text-gray-500">
                                <p className="mb-2 text-sm">• กรุณาตรวจสอบเอกสารให้ครบถ้วนก่อนปล่อยศพ</p>
                                <p className="text-sm">• อัปเดตระเบียบการใหม่ เริ่ม 1 ม.ค. 69</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Register Modal */}
            <Modal title="ลงทะเบียนรับศพใหม่" open={isRegisterModalOpen} onCancel={() => setIsRegisterModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleRegisterSubmit}>
                    <Form.Item name="first_name" label="ชื่อ" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="last_name" label="นามสกุล" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="id_card" label="เลขบัตรประชาชน">
                        <Input />
                    </Form.Item>
                    <div className="flex gap-4">
                        <Form.Item name="age" label="อายุ" className="w-1/2">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="cause_of_death" label="สาเหตุการเสียชีวิต" className="w-1/2">
                            <Input />
                        </Form.Item>
                    </div>
                    <Form.Item name="recorder_name" label="ผู้บันทึกข้อมูล">
                        <Input />
                    </Form.Item>
                    <Form.Item name="notes" label="หมายเหตุ">
                        <Input.TextArea />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        บันทึกข้อมูล
                    </Button>
                </Form>
            </Modal>

            {/* Search Modal */}
            <Modal title="ค้นหาข้อมูลย้อนหลัง" open={isSearchModalOpen} onCancel={() => setIsSearchModalOpen(false)} footer={null} width={800}>
                <div className="mb-4">
                    <Input.Search placeholder="ค้นหาชื่อ หรือ เลขบัตร..." enterButton size="large" onSearch={async (value) => {
                        const res = await api.get(`/mortuary/search?q=${value}`);
                        setMortuaryList(res.data);
                    }} />
                </div>
                <Table dataSource={mortuaryList} columns={columns} size="small" rowKey="id" />
            </Modal>
        </div >
    );
};

export default FrmMortuary;
