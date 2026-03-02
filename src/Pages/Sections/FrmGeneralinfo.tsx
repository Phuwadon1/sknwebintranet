import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Button, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PersonModal from '../../Components/OrgChart/PersonModal';
import './FrmGeneralinfo.css';

interface OrgPerson {
    Id: number;
    Name: string;
    Title: string;
    Photo?: string;
    Level: number;
    ParentId?: number;
    Position?: string;
    SpecialTitle?: string;
    Prefix?: string;
    Order: number;
}

const FrmGeneralinfo = () => {
    const [persons, setPersons] = useState<OrgPerson[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editData, setEditData] = useState<OrgPerson | undefined>();
    const [isAdmin, setIsAdmin] = useState(false);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        fetchOrgChart();
        checkAdmin();
    }, []);

    const checkAdmin = () => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            // Check if username contains 'admin' (case insensitive)
            const username = (userData.Username || '').toLowerCase();
            setIsAdmin(username.includes('admin'));
        }
    };

    const fetchOrgChart = async () => {
        try {
            const res = await api.get('/orgchart');
            setPersons(res.data);
        } catch (error) {
            console.error('Error fetching org chart:', error);
            message.error('ไม่สามารถโหลดข้อมูลได้');
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (data.id) {
                await api.put(`/orgchart/${data.id}`, data);
            } else {
                await api.post('/orgchart', data);
            }

            message.success(data.id ? 'แก้ไขสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ');
            setModalVisible(false);
            setEditData(undefined);
            fetchOrgChart();
        } catch (error: any) {
            if (error.message === 'Unauthorized') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                message.error('บันทึกข้อมูลไม่สำเร็จ');
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/orgchart/${id}`);

            message.success('ลบข้อมูลสำเร็จ');
            fetchOrgChart();
        } catch (error: any) {
            if (error.message === 'Unauthorized') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                message.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                message.error(error.message || 'ลบข้อมูลไม่สำเร็จ');
            }
        }
    };

    const renderCard = (person: OrgPerson) => (
        <div key={person.Id} className="org-card">
            {person.Photo && (
                <div className="org-card-photo" style={{ backgroundImage: `url(${person.Photo})` }} />
            )}
            {!person.Photo && <div className="org-card-photo" />}
            <div className="org-card-content">
                <div className="org-card-name">
                    {person.Prefix ? `${person.Prefix} ${person.Name}` : person.Name}
                </div>
                {person.SpecialTitle && (
                    <div className="org-card-title" style={{ color: '#e67e22', marginBottom: '2px' }}>
                        {person.SpecialTitle}
                    </div>
                )}
                <div className="org-card-title">{person.Title}</div>
            </div>
            {isAdmin && (
                <div className="org-card-actions">
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditData(person);
                            setModalVisible(true);
                        }}
                    />
                    <Popconfirm
                        title="ยืนยันการลบ"
                        description="คุณแน่ใจหรือไม่ที่จะลบบุคคลนี้?"
                        onConfirm={() => handleDelete(person.Id)}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                    >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            )}
        </div>
    );

    // Group persons by level and parent
    const getPersonsByLevel = (level: number) => {
        return persons.filter(p => p.Level === level).sort((a, b) => a.Order - b.Order);
    };

    const getChildren = (parentId: number) => {
        return persons.filter(p => p.ParentId === parentId).sort((a, b) => a.Order - b.Order);
    };

    const containerRef = React.useRef<HTMLDivElement>(null);

    // Auto-center scroll when data loads
    useEffect(() => {
        if (persons.length > 0 && containerRef.current) {
            const container = containerRef.current;
            // Timeout to ensure rendering is complete
            setTimeout(() => {
                const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
                container.scrollLeft = scrollLeft;
            }, 100);
        }
    }, [persons, zoom]); // Re-center on data load or zoom change

    return (
        <section id="generalinfo" className="generalinfo section">
            <div className="container" data-aos="fade-up">
                <div className="section-title text-center mb-5">
                    <h2>โครงสร้างบริหาร</h2>
                    <p>ผังสายบังคับบัญชาฝ่ายงานเทคโนโลยีสารสนเทศโรงพยาบาลสกลนคร</p>

                    {/* Zoom Controls */}
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                        <Button icon={<span style={{ fontSize: '1.2em' }}>-</span>} onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))} />
                        <span style={{ minWidth: '60px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                        <Button icon={<span style={{ fontSize: '1.2em' }}>+</span>} onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} />
                        <Button onClick={() => setZoom(1)}>Reset</Button>
                    </div>

                    {isAdmin && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditData(undefined);
                                setModalVisible(true);
                            }}
                            style={{ marginTop: 20 }}
                        >
                            เพิ่มบุคคล
                        </Button>
                    )}
                </div>

                <div
                    ref={containerRef}
                    style={{ overflow: 'auto', width: '100%', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '20px', height: '800px', background: '#f9f9f9' }}
                >
                    <div className="org-chart-container" style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '40px 0',
                        minWidth: 'min-content' // Ensures container grows with zoom so scrollbars appear
                    }}>
                        {/* Render only root nodes (no parent) */}
                        {persons.filter(p => !p.ParentId).map(person => renderTree(person))}
                    </div>
                </div>
            </div>

            <PersonModal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditData(undefined);
                }}
                onSave={handleSave}
                editData={editData}
                allPersons={persons}
            />
        </section>
    );

    // Recursive function to render tree
    function renderTree(person: OrgPerson): React.ReactNode {
        const children = getChildren(person.Id);

        return (
            <div key={person.Id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Person card wrapper */}
                <div style={{ position: 'relative', margin: '0 10px 40px 10px', zIndex: 2 }}>
                    {renderCard(person)}

                    {/* Line DOWN from Parent */}
                    {children.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-20px',
                            left: '50%',
                            width: '2px',
                            height: '25px', // Slightly longer to overlap
                            backgroundColor: '#fff',
                            transform: 'translateX(-50%)',
                            zIndex: 1
                        }} />
                    )}
                </div>

                {/* Children Container */}
                {children.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        position: 'relative',
                        justifyContent: 'center'
                    }}>
                        {/* Horizontal Line connecting first and last child */}
                        {children.length > 1 && (
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '110px', // Center of first child (220px/2)
                                right: '110px', // Center of last child
                                height: '2px',
                                backgroundColor: '#fff',
                                zIndex: 1
                            }} />
                        )}

                        {children.map((child, index) => (
                            <div key={child.Id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                {/* Line UP from Child to Horizontal Bar/Parent */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-22px', // Go up to meet horizontal line (-20px) + overlap
                                    left: '50%',
                                    width: '2px',
                                    height: '22px',
                                    backgroundColor: '#fff',
                                    transform: 'translateX(-50%)',
                                    zIndex: 1
                                }} />

                                {renderTree(child)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
};

export default FrmGeneralinfo;
