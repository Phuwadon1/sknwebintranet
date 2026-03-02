import React from 'react';
import { Card, Statistic, Table, Button, Badge, Timeline, Modal, Form, Input, Select, message, Popconfirm, Tooltip } from 'antd';
import api from '../../api/axios';
import {
    HeartOutlined,
    SolutionOutlined,
    SettingOutlined,
    CalendarOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const FrmHemodialysis: React.FC = () => {
    const [queues, setQueues] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [stats, setStats] = React.useState({ total_patients: 0, active_machines: 0, waiting_queue: 0, completed: 0, total_machines: 12 });
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = React.useState<number | null>(null);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [queueRes, statsRes] = await Promise.all([
                api.get('/hemodialysis'),
                api.get('/hemodialysis/stats')
            ]);
            setQueues(queueRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('ไม่สามารถดึงข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (values: any) => {
        try {
            if (editingId) {
                await api.put(`/hemodialysis/${editingId}`, values);
                message.success('อัปเดตข้อมูลสำเร็จ');
            } else {
                await api.post('/hemodialysis', values);
                message.success('เพิ่มคิวสำเร็จ');
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchData();
        } catch (error: any) {
            console.error('Error saving:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                message.error('บันทึกข้อมูลไม่สำเร็จ');
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/hemodialysis/${id}`);
            message.success('ลบข้อมูลสำเร็จ');
            fetchData();
        } catch (error: any) {
            console.error('Error deleting:', error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                message.error('ลบข้อมูลไม่สำเร็จ');
            }
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: 'เตียง/เครื่อง',
            dataIndex: 'bed_number',
            key: 'bed_number',
            render: (text: string) => <b className="text-blue-600">{text}</b>,
            sorter: (a: any, b: any) => a.bed_number.localeCompare(b.bed_number)
        },
        { title: 'ผู้ป่วย', dataIndex: 'patient_name', key: 'patient_name' },
        { title: 'เวลา', dataIndex: 'time_slot', key: 'time_slot' },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let statusType: "processing" | "success" | "default" | "error" | "warning" = 'default';
                let text = status;
                if (status === 'In Progress') { statusType = 'processing'; text = 'กำลังฟอก'; }
                if (status === 'Completed') { statusType = 'success'; text = 'เสร็จสิ้น'; }
                if (status === 'Waiting') { statusType = 'warning'; text = 'รอคิว'; }
                return <Badge status={statusType} text={text} />;
            }
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
                        onClick={() => handleEdit(record)}
                    >
                        แก้ไข
                    </Button>
                    <Popconfirm
                        title="ยืนยันการลบ"
                        description="คุณแน่ใจหรือไม่ที่จะลบรายการนี้?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="primary"
                            danger
                            ghost
                        >
                            ลบ
                        </Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-white pb-10 font-sans" style={{ paddingTop: '50px' }}>
            {/* Header Section - Clean and Minimal */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 mb-6 py-2">
                    ศูนย์ไตเทียม
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full"></div>
                <p className="text-xl text-gray-500 mt-6 font-light max-w-2xl mx-auto">
                    ระบบจองคิว จัดการเครื่องฟอกไต และติดตามสถานะผู้ป่วย Real-time
                </p>
            </div>

            <div className="container mx-auto px-4">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card bordered={false} className="shadow-md cursor-pointer border-t-4 border-cyan-500 hover:shadow-xl transition-shadow">
                        <Statistic
                            title={<span className="font-bold text-gray-600">เครื่องฟอกไตทั้งหมด</span>}
                            value={stats.total_machines}
                            suffix="เครื่อง"
                            prefix={<SettingOutlined className="text-cyan-500 mr-2" />}
                        />
                    </Card>
                    <Card bordered={false} className="shadow-md cursor-pointer border-t-4 border-green-500 hover:shadow-xl transition-shadow">
                        <Statistic
                            title={<span className="font-bold text-gray-600">ใช้งานอยู่</span>}
                            value={stats.active_machines}
                            suffix="เครื่อง"
                            prefix={<HeartOutlined className="text-green-500 mr-2" />}
                        />
                    </Card>
                    <Card bordered={false} className="shadow-md cursor-pointer border-t-4 border-blue-600 hover:shadow-xl transition-shadow">
                        <Statistic
                            title={<span className="font-bold text-gray-600">ผู้ป่วยนัดวันนี้</span>}
                            value={stats.total_patients}
                            suffix="ราย"
                            prefix={<SolutionOutlined className="text-blue-600 mr-2" />}
                        />
                    </Card>
                    <Card bordered={false} className="shadow-md cursor-pointer border-t-4 border-orange-500 hover:shadow-xl transition-shadow">
                        <Statistic
                            title={<span className="font-bold text-gray-600">คิวรอเรียก</span>}
                            value={stats.waiting_queue}
                            prefix={<CalendarOutlined className="text-orange-500 mr-2" />}
                        />
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Queue Table */}
                    <div className="lg:col-span-2">
                        <Card
                            title="สถานะการฟอกไตประจำวัน"
                            className="shadow-md"
                            bordered={false}
                            extra={
                                <Button type="primary" onClick={() => {
                                    setEditingId(null);
                                    form.resetFields();
                                    setIsModalOpen(true);
                                }}>
                                    จัดการคิว
                                </Button>
                            }
                        >
                            <Table
                                dataSource={queues}
                                columns={columns}
                                // pagination={false} 
                                size="middle"
                                rowKey="id"
                                loading={loading}
                            />
                        </Card>
                    </div>

                    {/* Machine Status / Tech info */}
                    <div className="lg:col-span-1">
                        <Card title="สถานะระบบน้ำ/เครื่อง" className="shadow-md" bordered={false}>
                            <Timeline
                                items={[
                                    { color: 'green', children: 'ระบบน้ำ RO ทำงานปกติ 06:00' },
                                    { color: 'blue', children: 'Calibrate เครื่อง Bed-01 เสร็จสิ้น 07:30' },
                                    { color: 'gray', children: 'Check stock น้ำยาไตเทียม 11:00' },
                                ]}
                            />
                            <Button className="mt-4 px-6 block mx-auto w-auto">แจ้งซ่อม / บำรุงรักษา</Button>
                        </Card>

                        <div className="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2">ข้อมูลติดต่อฉุกเฉิน</h3>
                            <p className="text-sm text-gray-600">หัวหน้าศูนย์ไตรฯ: 081-xxx-xxxx</p>
                            <p className="text-sm text-gray-600">ช่างเทคนิค (On-call): 089-xxx-xxxx</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manage Queue Modal */}
            <Modal
                title={editingId ? "แก้ไขข้อมูลคิว" : "เพิ่มคิวผู้ป่วยใหม่"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="patient_name" label="ชื่อ-สกุล ผู้ป่วย" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="bed_number" label="เตียง / เครื่อง" rules={[{ required: true }]}>
                            <Select>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <Select.Option key={i} value={`Bed-${String(i + 1).padStart(2, '0')}`}>
                                        {`Bed-${String(i + 1).padStart(2, '0')}`}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="time_slot" label="รอบเวลา" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="06:00 - 10:00">06:00 - 10:00</Select.Option>
                                <Select.Option value="10:30 - 14:30">10:30 - 14:30</Select.Option>
                                <Select.Option value="15:00 - 19:00">15:00 - 19:00</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <Form.Item name="status" label="สถานะ" initialValue="Waiting">
                        <Select>
                            <Select.Option value="Waiting">รอคิว</Select.Option>
                            <Select.Option value="In Progress">กำลังฟอก</Select.Option>
                            <Select.Option value="Completed">เสร็จสิ้น</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="note" label="หมายเหตุ">
                        <Input.TextArea />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>บันทึก</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default FrmHemodialysis;
