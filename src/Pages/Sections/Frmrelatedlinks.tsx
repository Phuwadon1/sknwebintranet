import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth';

const Frmrelatedlinks = () => {
    const { isAdmin } = useAuth();
    const [links, setLinks] = useState<any[]>([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ title: '', url: '#' });

    const [linkType, setLinkType] = useState<'url' | 'file'>('url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchLinks = async () => {
        try {
            const res = await api.get('/related-links');
            setLinks(res.data);
        } catch (error) {
            console.error("Error fetching related links:", error);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ title: '', url: '#' });
        setEditMode(false);
        setEditId(null);
        setLinkType('url');
        setSelectedFile(null);
    };

    const handleShowAdd = () => {
        setEditMode(false);
        setFormData({ title: '', url: '#' });
        setLinkType('url'); // Default to URL
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleShowEdit = (item: any) => {
        setEditMode(true);
        setEditId(item.ID);
        setFormData({ title: item.Title, url: item.Url });

        // Determine type based on URL content
        // If URL starts with /uploads/, it's a file
        const isFile = item.Url && item.Url.includes('/uploads/');
        setLinkType(isFile ? 'file' : 'url');
        setSelectedFile(null); // Reset file input on edit open

        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "ต้องการลบข้อมูลนี้ใช่หรือไม่!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/related-links/${id}`);
                Swal.fire('ลบเรียบร้อย!', 'ข้อมูลถูกลบแล้ว.', 'success');
                fetchLinks();
            } catch (error: any) {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    Swal.fire({
                        icon: 'error',
                        title: 'Session หมดอายุ',
                        text: 'กรุณาเข้าสู่ระบบใหม่'
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบข้อมูลได้.', 'error');
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);

        if (linkType === 'url') {
            data.append('url', formData.url);
        } else {
            // If type is file, we send 'url' as existing url just in case no new file is selected during edit
            // But if a file IS selected, backend prefers file.
            data.append('url', formData.url); // Send existing URL/Path as fallback
            if (selectedFile) {
                data.append('file', selectedFile);
            }
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };

            if (editMode && editId) {
                await api.put(`/related-links/${editId}`, data, config);
                Swal.fire('สำเร็จ!', 'แก้ไขข้อมูลเรียบร้อย.', 'success');
            } else {
                await api.post('/related-links', data, config);
                Swal.fire('สำเร็จ!', 'เพิ่มข้อมูลเรียบร้อย.', 'success');
            }
            handleCloseModal();
            fetchLinks();
        } catch (error: any) {
            console.error(error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                Swal.fire({
                    icon: 'error',
                    title: 'Session หมดอายุ',
                    text: 'กรุณาเข้าสู่ระบบใหม่'
                }).then(() => {
                    handleCloseModal();
                    window.location.reload();
                });
            } else {
                Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถบันทึกข้อมูลได้.', 'error');
            }
        }
    };

    return (
        <section id="related-links" className="related-links section">
            <div className="container section-title" data-aos="fade-up">
                <h2>Download เพิ่มเติม</h2>
            </div>

            <div className="container" data-aos="fade-up" data-aos-delay={100}>

                {/* Add Button */}
                {isAdmin && (
                    <div className="d-flex justify-content-center mb-3">
                        <button type="button" className="btn btn-success" onClick={handleShowAdd}>
                            <i className="fas fa-plus me-1"></i> เพิ่มข้อมูล
                        </button>
                    </div>
                )}

                <div className="related-links-container" style={{ maxHeight: '720px', overflowY: 'auto', border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
                    <div className="row g-2">
                        {links.map((link) => (
                            <div key={link.ID} className="col-12">
                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <a href={link.Url} target="_blank" rel="noopener noreferrer" className="d-block p-2 text-decoration-none text-dark flex-grow-1 hover-bg-light">
                                        {link.Url && link.Url.includes('/uploads/') ? (
                                            <i className="bi bi-file-earmark-text me-2 text-danger"></i>
                                        ) : (
                                            <i className="bi bi-link-45deg me-2 text-primary"></i>
                                        )}
                                        {link.Title}
                                    </a>
                                    {isAdmin && (
                                        <div className="flex-shrink-0 ms-2">
                                            <button className="btn btn-sm btn-warning me-1" onClick={() => handleShowEdit(link)}>
                                                <i className="fas fa-edit text-white"></i>
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(link.ID)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <style>
                    {`
                        .hover-bg-light:hover {
                            background-color: #f8f9fa;
                            color: #1977cc !important;
                        }
                    `}
                </style>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title" style={{ color: 'white' }}>{editMode ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">ประเภทข้อมูล</label>
                                        <div className="d-flex">
                                            <div className="form-check me-3">
                                                <input className="form-check-input" type="radio" name="linkType" id="typeUrl"
                                                    checked={linkType === 'url'} onChange={() => setLinkType('url')} />
                                                <label className="form-check-label" htmlFor="typeUrl">ลิงค์ภายนอก (URL)</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="linkType" id="typeFile"
                                                    checked={linkType === 'file'} onChange={() => setLinkType('file')} />
                                                <label className="form-check-label" htmlFor="typeFile">อัปโหลดไฟล์ (PDF/Doc)</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ชื่อลิงค์ / หัวข้อ</label>
                                        <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>

                                    {linkType === 'url' ? (
                                        <div className="mb-3">
                                            <label className="form-label">URL (ใส่ # หากไม่มี)</label>
                                            <input type="text" className="form-control" required={linkType === 'url'} value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />
                                        </div>
                                    ) : (
                                        <div className="mb-3">
                                            <label className="form-label">เลือกไฟล์</label>
                                            <input type="file" className="form-control" onChange={e => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setSelectedFile(e.target.files[0]);
                                                }
                                            }} required={!editMode} /> {/* Required only on add, optional on edit */}
                                            {editMode && formData.url && formData.url.includes('/uploads/') && (
                                                <div className="form-text text-muted">ไฟล์ปัจจุบัน: {formData.url.split('/').pop()}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>ยกเลิก</button>
                                    <button type="submit" className="btn btn-primary">{editMode ? 'บันทึก' : 'เพิ่มข้อมูล'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Frmrelatedlinks;
