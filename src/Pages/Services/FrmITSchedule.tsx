import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Modal, message, Tag, Space, Popconfirm, Form, Input } from 'antd';
import { SettingOutlined, CalendarOutlined, UserOutlined, PlusOutlined, DeleteOutlined, DesktopOutlined, CloudServerOutlined, AppstoreOutlined } from '@ant-design/icons';
import api from '../../api/axios';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

const { Option } = Select;

interface Staff {
    ID: number;
    Name: string;
    Position: string;
    OrderIndex: number;
    Team: string;
}

interface ScheduleEntry {
    ID: number;
    StaffID: number;
    Date: string;
    ShiftID: number;
    Year: number;
    Month: number;
}

const SHIFT_MAP: { [key: number]: { label: string; color: string; full: string } } = {
    1: { label: 'ช', color: 'blue', full: 'เช้า (08.00 - 16.00 น.)' },
    2: { label: 'บ', color: 'green', full: 'บ่าย (16.00 - 00.00 น.)' },
    3: { label: 'ด', color: 'orange', full: 'ดึก (00.00 - 08.00 น.)' },
    4: { label: 'บด', color: 'purple', full: 'บ่ายดึก (16.00 - 08.00 น.)' },
};

const FrmITSchedule = () => {
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeTeam, setActiveTeam] = useState<string>('technology'); // 'technology' or 'software'

    // Modal States
    const [isStaffModalVisible, setIsStaffModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedCell, setSelectedCell] = useState<{ staffId: number, date: number } | null>(null);

    const [formStaff] = Form.useForm();

    const isAdmin = currentUser && (currentUser.Username === 'admin' || String(currentUser.Str) === '2');

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) setCurrentUser(JSON.parse(user));
    }, []);

    useEffect(() => {
        fetchData();
    }, [month, year, activeTeam]);

    const fetchData = () => {
        fetchStaff();
        fetchSchedule();
    }

    const fetchStaff = async () => {
        try {
            const res = await api.get(`/it-schedules/staff?team=${activeTeam}`);
            setStaffs(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/it-schedules?month=${month}&year=${year}&team=${activeTeam}`);
            setSchedules(res.data);
        } catch (error) {
            message.error('ไม่สามารถดึงข้อมูลตารางเวรได้');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            await api.post('/it-schedules/generate', { year, month, team: activeTeam });
            message.success(`สร้างตารางเวรเดือน ${month}/${year + 543} (${activeTeam === 'technology' ? 'เทคโนโลยีฯ' : 'Software'}) สำเร็จ`);
            fetchSchedule();
        } catch (error) {
            message.error('เกิดข้อผิดพลาดในการสร้างตาราง');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (values: any) => {
        try {
            await api.post('/it-schedules/staff', { ...values, team: activeTeam });
            message.success('เพิ่มเจ้าหน้าที่สำเร็จ');
            formStaff.resetFields();
            fetchStaff();
        } catch (error) {
            message.error('ไม่สามารถเพิ่มเจ้าหน้าที่ได้');
        }
    };

    const handleEditShift = async (shiftId: number) => {
        if (!selectedCell) return;
        const dateStr = dayjs(`${year}-${month}-${selectedCell.date}`).format('YYYY-MM-DD');
        const existingEntry = schedules.find(s =>
            s.StaffID === selectedCell.staffId &&
            dayjs(s.Date).date() === selectedCell.date
        );

        try {
            if (existingEntry) {
                if (shiftId === 0) {
                    await api.delete(`/it-schedules/${existingEntry.ID}`);
                } else {
                    await api.put(`/it-schedules/${existingEntry.ID}`, { shiftId });
                }
            } else {
                if (shiftId !== 0) {
                    await api.post('/it-schedules', {
                        staffId: selectedCell.staffId,
                        date: dateStr,
                        shiftId
                    });
                }
            }
            message.success('อัปเดตข้อมูลสำเร็จ');
            setIsEditModalVisible(false);
            fetchSchedule();
        } catch (error) {
            message.error('เกิดข้อผิดพลาด');
        }
    };

    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
    const columns: any[] = [
        {
            title: 'รายชื่อเจ้าหน้าที่',
            dataIndex: 'Name',
            key: 'Name',
            fixed: 'left',
            width: 200,
            render: (text: string) => <div style={{ fontWeight: 600 }}>{text}</div>
        },
        ...Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateObj = dayjs(`${year}-${month}-${day}`);
            const isWeekend = dateObj.day() === 0 || dateObj.day() === 6;

            return {
                title: <div style={{ color: isWeekend ? 'red' : 'inherit' }}>{day}</div>,
                key: day,
                align: 'center',
                width: 40,
                onCell: () => ({
                    style: {
                        backgroundColor: isWeekend ? '#ff9f9fff' : 'inherit' // Light red background for weekends
                    }
                }),
                render: (_: any, record: Staff) => {
                    const entry = schedules.find(s => s.StaffID === record.ID && dayjs(s.Date).date() === day);
                    if (entry) {
                        const shift = SHIFT_MAP[entry.ShiftID];
                        return (
                            <div
                                style={{
                                    backgroundColor: shift?.color === 'white' ? 'transparent' : `${shift?.color}`,
                                    color: shift?.color === 'purple' || shift?.color === 'blue' || shift?.color === 'green' || shift?.color === 'orange' ? 'white' : 'black',
                                    borderRadius: '4px',
                                    padding: '2px',
                                    cursor: isAdmin ? 'pointer' : 'default',
                                    fontSize: '12px',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => {
                                    if (isAdmin) {
                                        setSelectedCell({ staffId: record.ID, date: day });
                                        setIsEditModalVisible(true);
                                    }
                                }}
                            >
                                {shift?.label}
                            </div>
                        );
                    }
                    return (
                        <div
                            style={{ width: '100%', height: '24px', cursor: isAdmin ? 'pointer' : 'default' }}
                            onClick={() => {
                                if (isAdmin) {
                                    setSelectedCell({ staffId: record.ID, date: day });
                                    setIsEditModalVisible(true);
                                }
                            }}
                        />
                    );
                }
            };
        })
    ];

    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    return (
        <div className="it-schedule-section"> {/* Removed container class to fit in smaller areas if needed */}
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                <Button
                    type={activeTeam === 'technology' ? 'primary' : 'default'}
                    icon={<DesktopOutlined />}
                    size="large"
                    onClick={() => setActiveTeam('technology')}
                >
                    Hardware
                </Button>
                <Button
                    type={activeTeam === 'software' ? 'primary' : 'default'}
                    icon={<CloudServerOutlined />}
                    size="large"
                    onClick={() => setActiveTeam('software')}
                >
                    Software
                </Button>
                {isAdmin && (
                    <Button
                        icon={<SettingOutlined />}
                        size="large"
                        onClick={() => setIsStaffModalVisible(true)}
                    >
                        เพิ่ม/แก้ไขตาราง
                    </Button>
                )}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <h4 className="mb-0">ตารางเวร: {activeTeam === 'technology' ? 'Hardware' : 'Software'}</h4>
                <Space>
                    <Select
                        value={month}
                        onChange={setMonth}
                        style={{ width: 120 }}
                    >
                        {thaiMonths.map((m, i) => (
                            <Option key={i + 1} value={i + 1}>{m}</Option>
                        ))}
                    </Select>
                    <Select
                        value={year}
                        onChange={setYear}
                        style={{ width: 100 }}
                    >
                        {[year - 1, year, year + 1].map(y => (
                            <Option key={y} value={y}>{y + 543}</Option>
                        ))}
                    </Select>
                </Space>
            </div>

            <div className="table-responsive bg-white rounded shadow-sm">
                <Table
                    columns={columns}
                    dataSource={staffs}
                    rowKey="ID"
                    pagination={false}
                    loading={loading}
                    bordered
                    scroll={{ x: 'max-content' }}
                    size="small"
                />
            </div>

            {/* Contact Info Section */}
            <div className="mt-4 p-4 bg-white rounded shadow-sm">
                <h5 className="mb-3 text-secondary">
                    หมายเหตุ : {activeTeam === 'technology'
                        ? 'ให้โทรตามที่ กลุ่มงานเทคโนโลยีสารสนเทศ 1506 , 8716 หากไม่พบให้โทรตามเบอร์มือถือ'
                        : 'ให้โทรตามที่ กลุ่มงานศูนย์เทคโนโลยีสารสนเทศ 8741 หากไม่พบให้โทรตามเบอร์มือถือ'}
                </h5>
                <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                        <tbody>
                            {activeTeam === 'technology' ? (
                                <>
                                    <tr>
                                        <td>1. นายกิตติศักดิ์ มงคล</td>
                                        <td>087-946-6077</td>
                                    </tr>
                                    <tr>
                                        <td>2. นายญาณวุฒิ สุตะโคตร</td>
                                        <td>061-179-8891</td>
                                    </tr>
                                    <tr>
                                        <td>3. นายทศวรรษ แก่นประชา</td>
                                        <td>065-075-0782</td>
                                    </tr>
                                    <tr>
                                        <td>4. นายภมรพล โพธิ์พงศ์วิวัฒน์</td>
                                        <td>063-905-1198</td>
                                    </tr>
                                    <tr>
                                        <td>5. นายอทิตย์ บุญเย็น</td>
                                        <td>084-974-3260</td>
                                    </tr>
                                    <tr>
                                        <td>6. นายภาณุพัฒน์ พระกัตติยะ</td>
                                        <td>098-291-4824</td>
                                    </tr>
                                </>
                            ) : (
                                <>
                                    <tr>
                                        <td>1. นายอนิรุทธิ์ คำสุโพธิ์</td>
                                        <td>089-278-0364 , 085-925-3421</td>
                                    </tr>
                                    <tr>
                                        <td>2. นายธนากร นามศรี</td>
                                        <td>080-930-5401</td>
                                    </tr>
                                    <tr>
                                        <td>3. นายสกล อุ่มจันสา</td>
                                        <td>080-419-0484</td>
                                    </tr>
                                    <tr>
                                        <td>4. น.ส.กนกวรรณ จันทะพรหม</td>
                                        <td>096-862-8516</td>
                                    </tr>
                                    <tr>
                                        <td>5. น.ส.ชินานาฎ แสนสุภา</td>
                                        <td>091-804-5060</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Controls Modal (Generate & Staff) */}
            <Modal
                title={`จัดการตารางเวร (${activeTeam === 'technology' ? 'เทคโนโลยีฯ' : 'Software'})`}
                open={isStaffModalVisible}
                onCancel={() => setIsStaffModalVisible(false)}
                footer={null}
                width={800}
            >
                <Space className="mb-4 w-100 justify-content-between align-items-center bg-light p-3 rounded">
                    <span>สร้างตารางประจำเดือน {thaiMonths[month - 1]} {year + 543}</span>
                    <Popconfirm
                        title="ยืนยันการสร้างตาราง?"
                        description={`ระบบจะลบข้อมูลเก่าของเดือน ${thaiMonths[month - 1]} ${year + 543} ทีม ${activeTeam} และสร้างใหม่`}
                        onConfirm={handleGenerate}
                    >
                        <Button type="primary" danger loading={loading} icon={<CalendarOutlined />}>
                            สร้างตารางประจำเดือน
                        </Button>
                    </Popconfirm>
                </Space>

                <div className="mb-3">
                    <h6>เพิ่มเจ้าหน้าที่ใหม่ ({activeTeam === 'technology' ? 'เทคโนโลยีฯ' : 'Software'})</h6>
                    <Form form={formStaff} layout="inline" onFinish={handleAddStaff} className="mb-3">
                        <Form.Item name="name" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
                            <Input placeholder="ชื่อ-นามสกุล" />
                        </Form.Item>
                        <Form.Item name="position" rules={[{ required: true, message: 'กรุณากรอกตำแหน่ง' }]}>
                            <Input placeholder="ตำแหน่ง" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>เพิ่ม</Button>
                        </Form.Item>
                    </Form>
                </div>

                <Table
                    columns={[
                        { title: 'ชื่อ', dataIndex: 'Name', key: 'Name' },
                        { title: 'ตำแหน่ง', dataIndex: 'Position', key: 'Position' },
                        {
                            title: 'ทีม',
                            dataIndex: 'Team',
                            key: 'Team',
                            render: (t) => t === 'technology' ? 'เทคโนโลยีฯ' : 'Software'
                        },
                    ]}
                    dataSource={staffs}
                    rowKey="ID"
                    size="small"
                    pagination={{ pageSize: 5 }}
                />
            </Modal>

            {/* Shift Edit Modal */}
            <Modal
                title={`แก้ไขเวรวันที่ ${selectedCell?.date} ${thaiMonths[month - 1]} ${year + 543}`}
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={400}
                centered
            >
                <div className="d-grid gap-2">
                    {Object.entries(SHIFT_MAP).map(([id, info]) => (
                        <Button
                            key={id}
                            size="large"
                            style={{
                                backgroundColor: info.color,
                                color: 'white',
                                border: 'none'
                            }}
                            onClick={() => handleEditShift(Number(id))}
                        >
                            {info.full}
                        </Button>
                    ))}
                    <Button size="large" onClick={() => handleEditShift(0)} danger>
                        ลบเวร (เว้นว่าง)
                    </Button>
                </div>
            </Modal>
        </div >
    );
};

export default FrmITSchedule;
