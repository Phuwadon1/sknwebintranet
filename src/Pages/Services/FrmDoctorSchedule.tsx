import React, { useState, useEffect } from 'react';
import { Table, Tag, Tabs, Button, Modal, Form, Input, Select, Popconfirm, message, Space, TimePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
import { SettingOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '../../api/axios';
import { departmentsIPD } from '../Sections/departmentsIPD';

const { Option } = Select;

interface DataType {
    ID: number;
    DoctorName: string;
    Specialty: string;
    TimeRange: string;
    Status: string;
    DayOfWeek: number;
}

const dayMap: { [key: number]: string } = {
    1: 'วันจันทร์',
    2: 'วันอังคาร',
    3: 'วันพุธ',
    4: 'วันพฤหัสบดี',
    5: 'วันศุกร์',
};

const FrmDoctorSchedule = () => {
    const [data, setData] = useState<DataType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isvModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor-schedules');
            setData(res.data);
        } catch (error) {
            console.error(error);
            message.error('ไม่สามารถดึงข้อมูลตารางแพทย์ได้');
        } finally {
            setLoading(false);
        }
    };

    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchData();
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    const handleAdd = async (values: any) => {
        try {
            const timeRange = values.TimeRange
                ? `${values.TimeRange[0].format('HH:mm')} - ${values.TimeRange[1].format('HH:mm')}`
                : '';

            await api.post('/doctor-schedules', {
                doctor: values.DoctorName,
                specialty: values.Specialty,
                time: timeRange,
                status: values.Status,
                day: values.DayOfWeek
            });
            message.success('เพิ่มข้อมูลสำเร็จ');
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
        }
    };

    const handleEdit = async (values: any) => {
        if (editingKey === null) return;
        try {
            const timeRange = values.TimeRange
                ? `${values.TimeRange[0].format('HH:mm')} - ${values.TimeRange[1].format('HH:mm')}`
                : '';

            await api.put(`/doctor-schedules/${editingKey}`, {
                doctor: values.DoctorName,
                specialty: values.Specialty,
                time: timeRange,
                status: values.Status,
                day: values.DayOfWeek
            });
            message.success('แก้ไขข้อมูลสำเร็จ');
            setEditingKey(null);
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/doctor-schedules/${id}`);
            message.success('ลบข้อมูลสำเร็จ');
            fetchData();
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    };

    const onFinish = (values: any) => {
        if (editingKey !== null) {
            handleEdit(values);
        } else {
            handleAdd(values);
        }
    };

    const startEdit = (record: DataType) => {
        setEditingKey(record.ID);

        let timeRange = undefined;
        if (record.TimeRange) {
            const times = record.TimeRange.split(' - ');
            if (times.length === 2) {
                timeRange = [dayjs(times[0], 'HH:mm'), dayjs(times[1], 'HH:mm')];
            }
        }

        form.setFieldsValue({
            ...record,
            TimeRange: timeRange
        });
    };

    const cancelEdit = () => {
        setEditingKey(null);
        form.resetFields();
    };

    const columns: ColumnsType<DataType> = [
        {
            title: 'แพทย์',
            dataIndex: 'DoctorName',
            key: 'DoctorName',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'ความเชี่ยวชาญ',
            dataIndex: 'Specialty',
            key: 'Specialty',
        },
        {
            title: 'เวลาออกตรวจ',
            dataIndex: 'TimeRange',
            key: 'TimeRange',
        },
        {
            title: 'สถานะ',
            key: 'Status',
            dataIndex: 'Status',
            render: (status) => {
                let color = status === 'ออกตรวจ' ? 'green' : 'red';
                return (
                    <Tag color={color} key={status}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
    ];

    const adminColumns: ColumnsType<DataType> = [
        ...columns,
        {
            title: 'วัน',
            dataIndex: 'DayOfWeek',
            key: 'DayOfWeek',
            render: (day: number) => dayMap[day] || day,
            sorter: (a, b) => a.DayOfWeek - b.DayOfWeek,
        },
        {
            title: 'จัดการ',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => startEdit(record)}
                        size="small"
                    />
                    <Popconfirm title="แน่ใจหรือไม่ที่จะลบ?" onConfirm={() => handleDelete(record.ID)}>
                        <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const renderTabContent = (day: number) => {
        const dayData = data.filter(item => item.DayOfWeek === day);
        return <Table columns={columns} dataSource={dayData} rowKey="ID" pagination={false} loading={loading} />;
    };

    const items = [
        { label: 'วันจันทร์', key: '1', children: renderTabContent(1) },
        { label: 'วันอังคาร', key: '2', children: renderTabContent(2) },
        { label: 'วันพุธ', key: '3', children: renderTabContent(3) },
        { label: 'วันพฤหัสบดี', key: '4', children: renderTabContent(4) },
        { label: 'วันศุกร์', key: '5', children: renderTabContent(5) },
    ];

    const canEdit = currentUser && (currentUser.Username === 'admin' || String(currentUser.Str) === '2');

    return (
        <div className="container py-5 mt-5">
            <div className="section-title text-center mb-5" data-aos="fade-up">
                <h2>ตารางแพทย์ออกตรวจ</h2>
                <p>ตรวจสอบตารางเวลาการออกตรวจของแพทย์แผนกต่างๆ</p>
            </div>

            <div className="row justify-content-center" data-aos="fade-up">
                <div className="col-12">
                    <div className="bg-white p-4 rounded shadow-sm">
                        <Tabs
                            className="doctor-schedule-tabs"
                            defaultActiveKey="1"
                            items={items}
                            type="card"
                            size="large"
                            tabBarExtraContent={
                                canEdit ? (
                                    <Button
                                        type="primary"
                                        icon={<SettingOutlined />}
                                        onClick={() => setIsModalVisible(true)}
                                    >
                                        แก้ไขข้อมูล
                                    </Button>
                                ) : null
                            }
                        />
                    </div>
                </div>
            </div>

            <Modal
                title="จัดการข้อมูลตารางแพทย์"
                open={isvModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingKey(null);
                }}
                footer={null}
                width={1000}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} className="mb-4">
                    <div className="row">
                        <div className="col-md-3">
                            <Form.Item name="DoctorName" label="ชื่อแพทย์" rules={[{ required: true, message: 'กรุณากรอกชื่อแพทย์' }]}>
                                <Input placeholder="ชื่อแพทย์" />
                            </Form.Item>
                        </div>
                        <div className="col-md-2">
                            <Form.Item name="Specialty" label="ความเชี่ยวชาญ" rules={[{ required: true, message: 'กรุณากรอกความเชี่ยวชาญ' }]}>
                                <Select
                                    showSearch
                                    placeholder="เลือกความเชี่ยวชาญ"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {departmentsIPD.map(dept => (
                                        <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>
                        <div className="col-md-3">
                            <Form.Item name="TimeRange" label="เวลาออกตรวจ" rules={[{ required: true, message: 'กรุณากรอกเวลา' }]}>
                                <TimePicker.RangePicker format="HH:mm" placeholder={['เริ่ม', 'จบ']} style={{ width: '100%' }} />
                            </Form.Item>
                        </div>
                        <div className="col-md-2">
                            <Form.Item name="DayOfWeek" label="วัน" initialValue={1}>
                                <Select style={{ width: '100%' }}>
                                    <Option value={1}>วันจันทร์</Option>
                                    <Option value={2}>วันอังคาร</Option>
                                    <Option value={3}>วันพุธ</Option>
                                    <Option value={4}>วันพฤหัสบดี</Option>
                                    <Option value={5}>วันศุกร์</Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <div className="col-md-2">
                            <Form.Item name="Status" label="สถานะ" initialValue="ออกตรวจ">
                                <Select style={{ width: '100%' }}>
                                    <Option value="ออกตรวจ">ออกตรวจ</Option>
                                    <Option value="งดออกตรวจ">งดออกตรวจ</Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </div>
                    <div className="row justify-content-end mt-2">
                        <div className="col-md-2">
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                    {editingKey && <Button onClick={cancelEdit} style={{ flex: 1 }}>ยกเลิก</Button>}
                                    <Button type="primary" htmlType="submit" icon={editingKey ? <EditOutlined /> : <PlusOutlined />} style={{ flex: 1, width: '100%' }}>
                                        {editingKey ? 'บันทึก' : 'เพิ่มข้อมูล'}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </div>
                    </div>
                </Form>

                <Table
                    columns={adminColumns}
                    dataSource={data}
                    rowKey="ID"
                    pagination={{ pageSize: 5 }}
                    size="small"
                />
            </Modal>
        </div>
    );
};

export default FrmDoctorSchedule;
