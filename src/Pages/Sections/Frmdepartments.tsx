import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import RichTextEditor from '../../Components/RichTextEditor';
import DOMPurify from 'dompurify';

interface Department {
    id: number;
    title: string;
    content: string;
    phone_internal: string;
    image_path: string;
    title_color?: string;
}

const Frmdepartments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Edit Mode States
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editTitleColor, setEditTitleColor] = useState('#000000');
    const [editImage, setEditImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'; // Handled by axios instance

    useEffect(() => {
        fetchDepartments();
        checkAdmin();
    }, []);

    const checkAdmin = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.Username === 'admin' || user.role === 'admin' || true) {
                setIsAdmin(true);
            }
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
            if (res.data.length > 0 && !selectedDept) {
                setSelectedDept(res.data[0]);
            } else if (selectedDept) {
                const updated = res.data.find((d: Department) => d.id === selectedDept.id);
                if (updated) setSelectedDept(updated);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleEditClick = (dept: Department) => {
        setEditId(dept.id);
        setEditTitle(dept.title);
        setEditContent(dept.content);
        setEditPhone(dept.phone_internal);
        setEditTitleColor(dept.title_color || '#000000');
        setPreviewImage(dept.image_path ? dept.image_path : null);
        setEditImage(null);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setEditId(null);
        setEditTitle('');
        setEditContent('');
        setEditPhone('');
        setEditTitleColor('#000000');
        setPreviewImage(null);
        setEditImage(null);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', editTitle);
        formData.append('content', editContent);
        formData.append('phone_internal', editPhone);
        formData.append('title_color', editTitleColor);
        if (editImage) {
            formData.append('image', editImage);
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Authorization handled by interceptor
                }
            };

            if (editId) {
                await api.put(`/departments/${editId}`, formData, config);
                Swal.fire({
                    title: 'Success',
                    text: 'Updated successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await api.post('/departments', formData, config);
                Swal.fire({
                    title: 'Success',
                    text: 'Created successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            setIsEditing(false);
            fetchDepartments();

            setTimeout(() => {
                const element = document.getElementById('departments');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);

        } catch (error) {
            console.error('Error saving:', error);
            Swal.fire('Error', 'Failed to save', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/departments/${id}`);
                Swal.fire('ลบเสร็จสิ้น!', 'ลบข้อมูลเรียบร้อยแล้ว.', 'success');
                if (selectedDept?.id === id) {
                    setSelectedDept(null);
                }
                fetchDepartments();
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
            }
        }
    };

    return (
        <section id="departments" className="departments section">
            <div className="container" data-aos="fade-up">
                <div className="section-title text-center mb-5 position-relative">
                    <h2>แผนกและศูนย์การแพทย์</h2>
                    <p>เรามีแผนกและศูนย์การแพทย์ที่พร้อมให้บริการดูแลรักษาผู้ป่วยด้วยทีมแพทย์ผู้เชี่ยวชาญและเครื่องมือที่ทันสมัย</p>
                    {isAdmin && !isEditing && (
                        <button
                            className="btn btn-success position-absolute top-0 end-0 mt-3 me-3"
                            onClick={handleAddNew}
                        >
                            <i className="bi bi-plus-lg me-1"></i> เพิ่มแผนกใหม่
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="card shadow-sm border-0 p-4 mb-4 bg-light">
                        <h4 className="mb-3">{editId ? 'แก้ไขข้อมูลแผนก' : 'เพิ่มแผนกใหม่'}</h4>
                        <form onSubmit={handleSave}>
                            <div className="mb-3">
                                <label className="form-label">หัวข้อ (Title)</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        value={editTitleColor}
                                        onChange={e => setEditTitleColor(e.target.value)}
                                        title="Choose title color"
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">เบอร์โทรภายใน</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">รูปภาพ</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setEditImage(e.target.files[0]);
                                            setPreviewImage(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }}
                                    accept="image/*"
                                />
                                {previewImage && (
                                    <img src={previewImage} alt="Preview" className="mt-2 rounded" style={{ maxWidth: '200px' }} />
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">รายละเอียด (ปรับแต่งตัวอักษรได้)</label>
                                <RichTextEditor
                                    value={editContent}
                                    onChange={setEditContent}
                                    style={{ height: '250px', marginBottom: '50px', background: 'white' }}
                                />
                            </div>
                            <div className="d-flex gap-2 pt-3">
                                <button type="submit" className="btn btn-primary">
                                    <i className="bi bi-save me-1"></i> บันทึกข้อมูล (Save)
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                                    ยกเลิก (Cancel)
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
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
                                            borderLeft: selectedDept?.id === dept.id ? `4px solid ${selectedDept.title_color || '#000000'}` : '4px solid transparent',
                                            backgroundColor: selectedDept?.id === dept.id ? '#fff' : 'transparent',
                                            color: selectedDept?.id === dept.id ? (selectedDept.title_color || '#000000') : '#495057',
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
                                <div className="card shadow-sm border-0 p-4 position-relative">
                                    {isAdmin && (
                                        <div className="position-absolute top-0 end-0 m-3 d-flex gap-2">
                                            <button
                                                className="btn btn-warning btn-sm text-white"
                                                onClick={() => handleEditClick(selectedDept)}
                                                title="Edit"
                                            >
                                                <i className="bi bi-pencil"></i> แก้ไข
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(selectedDept.id)}
                                                title="Delete"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-7">
                                            <h3 className="fw-bold mb-3" style={{ color: selectedDept.title_color || '#000000' }}>{selectedDept.title}</h3>

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
                                                    src={selectedDept.image_path}
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
                )}
            </div>
        </section>
    );
};

export default Frmdepartments;
