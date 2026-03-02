import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

interface Department {
    id: number;
    title: string;
    content: string;
    phone_internal: string;
    image_path: string;
}

const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                setDepartments(res.data);
                if (res.data.length > 0) {
                    setSelectedDept(res.data[0]);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };
        fetchDepartments();
    }, []);

    return (
        <section id="departments" className="departments section">
            <div className="container" data-aos="fade-up">
                <div className="section-title text-center mb-5">
                    <h2>แผนกและศูนย์การแพทย์</h2>
                    <p>เรามีแผนกและศูนย์การแพทย์ที่พร้อมให้บริการดูแลรักษาผู้ป่วยด้วยทีมแพทย์ผู้เชี่ยวชาญและเครื่องมือที่ทันสมัย</p>
                </div>

                <div className="row g-4">
                    {/* Sidebar List */}
                    <div className="col-lg-3">
                        <div className="list-group shadow-sm">
                            {departments.map((dept) => (
                                <button
                                    key={dept.id}
                                    className="list-group-item list-group-item-action border-0 py-3"
                                    onClick={() => setSelectedDept(dept)}
                                    style={{
                                        fontWeight: selectedDept?.id === dept.id ? 'bold' : 'normal',
                                        borderLeft: selectedDept?.id === dept.id ? '4px solid #0d6efd' : '4px solid transparent',
                                        backgroundColor: selectedDept?.id === dept.id ? '#fff' : 'transparent',
                                        color: selectedDept?.id === dept.id ? '#0d6efd' : '#495057',
                                        paddingLeft: '20px',
                                        textAlign: 'left',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {dept.title}
                                </button>
                            ))}
                            {departments.length === 0 && (
                                <div className="list-group-item text-muted">กำลังโหลดข้อมูล...</div>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="col-lg-9">
                        {selectedDept ? (
                            <div className="card shadow-sm border-0 p-4">
                                <div className="row">
                                    <div className="col-md-7">
                                        <h3 className="text-primary fw-bold mb-3">{selectedDept.title}</h3>

                                        <div
                                            className="department-content ql-editor px-0"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedDept.content) }}
                                        />

                                        {selectedDept.phone_internal && (
                                            <div className="mt-4 pt-3 border-top">
                                                <p className="mb-0 text-muted">
                                                    <i className="bi bi-telephone-fill me-2 text-primary"></i>
                                                    เบอร์โทรศัพท์ภายใน: <span className="text-dark fw-bold">{selectedDept.phone_internal}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-5">
                                        {selectedDept.image_path ? (
                                            <img
                                                src={`${apiBase.replace('/api', '')}${selectedDept.image_path}`}
                                                alt={selectedDept.title}
                                                className="img-fluid rounded shadow-sm"
                                                style={{ width: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '300px' }}>
                                                <span className="text-muted">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted">กรุณาเลือกแผนกที่ต้องการดูข้อมูล</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Departments;
