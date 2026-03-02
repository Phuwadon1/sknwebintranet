import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth';

const Frmnews = () => {
    const { isAdmin } = useAuth(); // Auth Check
    const [activeTab, setActiveTab] = useState<'staff' | 'pr' | 'jobs'>('staff');
    const [newsItems, setNewsItems] = useState<any[]>([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null); // Track expanded item
    const [showAll, setShowAll] = useState(false); // Track "See All" state
    const [formData, setFormData] = useState<{
        title: string;
        date: string;
        category: string;
        filePath: string;
        attachments: any[];
    }>({
        title: '',
        date: '',
        category: 'staff',
        filePath: '#',
        attachments: []
    });

    // Custom File Selection State
    const [selectedFiles, setSelectedFiles] = useState<{ file: File; name: string }[]>([]);

    // Fetch News
    const fetchNews = async () => {
        try {
            const res = await api.get('/news');
            setNewsItems(res.data);
        } catch (error) {
            console.error("Error fetching news:", error);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ title: '', date: '', category: activeTab, filePath: '#', attachments: [] });
        setSelectedFiles([]);
        setEditMode(false);
        setEditId(null);
    };

    const handleShowAdd = () => {
        setEditMode(false);
        setFormData({ title: '', date: '', category: activeTab, filePath: '#', attachments: [] });
        setSelectedFiles([]);
        setShowModal(true);
    };

    const handleShowEdit = (item: any) => {
        setEditMode(true);
        setEditId(item.ID);
        setFormData({
            title: item.Title,
            date: item.Date,
            category: item.Category,
            filePath: item.FilePath,
            attachments: item.Attachments || []
        });
        setSelectedFiles([]);
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
                await api.delete(`/news/${id}`);
                Swal.fire('ลบเรียบร้อย!', 'ข้อมูลถูกลบแล้ว.', 'success');
                fetchNews();
            } catch (error: any) {
                Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบข้อมูลได้.', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('date', formData.date);
        data.append('category', formData.category);

        // Append selected files and their names
        selectedFiles.forEach((item) => {
            data.append('files', item.file);
            data.append('fileNames', item.name);
        });

        // filePath is handled by backend Logic (using first file or keeping old)

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editMode && editId) {
                await api.put(`/news/${editId}`, data, config);
                Swal.fire('สำเร็จ!', 'แก้ไขข้อมูลเรียบร้อย.', 'success');
            } else {
                await api.post('/news', data, config);
                Swal.fire('สำเร็จ!', 'เพิ่มข้อมูลเรียบร้อย.', 'success');
            }
            handleCloseModal();
            fetchNews();
        } catch (error: any) {
            Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถบันทึกข้อมูลได้.', 'error');
        }
    };

    // Filter Items by Category (Tab)
    const filteredItems = newsItems.filter(item => item.Category === activeTab);

    // Helper: Format Date to Thai (YYYY-MM-DD -> d MMM yyyy)
    const formatThaiDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Fallback if not a valid date

        // Fix for when user enters Thai Year directly (e.g. 2559)
        // If year is > 2400, we assume it's already BE, so we subtract 543 before letting toLocaleDateString add it back.
        if (date.getFullYear() > 2400) {
            date.setFullYear(date.getFullYear() - 543);
        }

        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <section id="news" className="news section light-background">
            <div className="container section-title" data-aos="fade-up">
                <h2>ข่าวประชาสัมพันธ์และประกาศต่างๆ</h2>
            </div>

            <div className="container" data-aos="fade-up" data-aos-delay={100}>

                {/* Tabs & Add Button Group */}
                <div className="d-flex justify-content-center mb-4">
                    <div className="btn-group" role="group" aria-label="News Categories">
                        <button
                            type="button"
                            className={`btn btn-news-tab ${activeTab === 'staff' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('staff'); setShowAll(false); }}
                        >
                            ข่าวสารเจ้าหน้าที่
                        </button>
                        <button
                            type="button"
                            className={`btn btn-news-tab ${activeTab === 'pr' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('pr'); setShowAll(false); }}
                        >
                            ข่าวประชาสัมพันธ์
                        </button>
                        <button
                            type="button"
                            className={`btn btn-news-tab ${activeTab === 'jobs' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('jobs'); setShowAll(false); }}
                        >
                            ข่าวสมัครงาน
                        </button>

                        {isAdmin && (
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleShowAdd}
                            >
                                <i className="fas fa-plus me-1"></i> เพิ่มข้อมูล
                            </button>
                        )}
                    </div>
                </div>

                {/* Legacy Styles removed as they are no longer needed for btn-group */}

                {/* News List */}

                <div className="news-list">
                    {filteredItems.slice(0, showAll ? filteredItems.length : 8).map((item, index) => {
                        const isExpanded = expandedId === item.ID;
                        return (
                            <div key={item.ID || index} className="news-item border-bottom py-3">
                                {/* Header Row */}
                                <div className="d-flex align-items-center w-100">
                                    <div className="news-date flex-shrink-0 text-muted" style={{ minWidth: '100px' }}>
                                        {formatThaiDate(item.Date)}
                                    </div>
                                    <div className="news-content flex-grow-1 ms-3">
                                        <span className="news-title text-decoration-none text-dark fw-bold" style={{ fontSize: '0.9rem' }}>
                                            {item.Title}
                                        </span>
                                    </div>
                                    <div className="news-action ms-3 d-flex gap-2 align-items-center text-nowrap">
                                        {item.Attachments && item.Attachments.length > 0 ? (
                                            <button
                                                type="button"
                                                className={`btn btn-sm ${isExpanded ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setExpandedId(isExpanded ? null : item.ID)}
                                            >
                                                <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-download'} me-1`}></i>
                                                ดาวน์โหลด ({item.Attachments.length})
                                            </button>
                                        ) : (
                                            item.FilePath !== '#' && (
                                                <a href={item.FilePath} target="_blank" className="btn-read-more text-primary">
                                                    <i className="bi bi-arrow-right"></i>
                                                </a>
                                            )
                                        )}
                                        {isAdmin && (
                                            <>
                                                <button className="btn btn-sm btn-warning text-white" onClick={() => handleShowEdit(item)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.ID)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Collapsible Attachments Section */}
                                {isExpanded && item.Attachments && item.Attachments.length > 0 && (
                                    <div className="mt-3 ps-3 ms-5 border-start border-3 border-primary bg-light rounded p-3">
                                        <h6 className="fw-bold text-primary mb-2"><i className="fas fa-paperclip me-2"></i>เอกสารแนบ:</h6>
                                        <div className="list-group">
                                            {item.Attachments.map((f: any, i: number) => (
                                                <a key={i} href={f.FilePath} target="_blank" rel="noopener noreferrer" className="list-group-item list-group-item-action d-flex align-items-center">
                                                    <i className="fas fa-file-pdf text-danger me-3 fs-5"></i>
                                                    <span className="text-dark">{f.FileName}</span>
                                                    <i className="fas fa-external-link-alt ms-auto text-muted small"></i>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Show "See All" button only if there are more than 8 items */}
                    {filteredItems.length > 8 && (
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                className="btn btn-primary rounded-pill px-4"
                                onClick={() => setShowAll(!showAll)}
                                style={{ backgroundColor: '#1977cc', borderColor: '#1977cc' }}
                            >
                                {showAll ? (
                                    <>
                                        <i className="fas fa-chevron-up me-2"></i>ย่อ
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-chevron-down me-2"></i>ดูทั้งหมด
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {filteredItems.length === 0 && (
                        <p className="text-center text-muted mt-3">ไม่มีข้อมูลข่าวสารในหมวดหมู่นี้</p>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title" style={{ color: 'white' }}>{editMode ? 'แก้ไขข่าว/ประกาศ' : 'เพิ่มข่าว/ประกาศ'}</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">หัวข้อ</label>
                                            <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">วันที่</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                required
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">หมวดหมู่</label>
                                            <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="staff">ข่าวสารเจ้าหน้าที่</option>
                                                <option value="pr">ข่าวประชาสัมพันธ์</option>
                                                <option value="jobs">ข่าวสมัครงาน</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">ไฟล์แนบ (PDF/รูปภาพ/ZIP)</label>
                                            <input
                                                type="file"
                                                className="form-control mb-2"
                                                multiple
                                                accept=".pdf, image/*, .zip"
                                                onChange={e => {
                                                    if (e.target.files) {
                                                        const newFiles = Array.from(e.target.files).map(f => ({ file: f, name: f.name }));
                                                        setSelectedFiles([...selectedFiles, ...newFiles]);
                                                        // Reset input value to allow selecting same files again if needed
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />

                                            {/* List of Selected Files for Renaming */}
                                            {selectedFiles.length > 0 && (
                                                <div className="bg-light p-2 rounded border">
                                                    <small className="text-muted mb-2 d-block">ไฟล์ที่เลือก (สามารถเปลี่ยนชื่อได้):</small>
                                                    {selectedFiles.map((item, index) => (
                                                        <div key={index} className="input-group input-group-sm mb-2">
                                                            <span className="input-group-text bg-white"><i className="fas fa-file"></i></span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={item.name}
                                                                onChange={(e) => {
                                                                    const updated = [...selectedFiles];
                                                                    updated[index].name = e.target.value;
                                                                    setSelectedFiles(updated);
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-danger"
                                                                onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {editMode && formData.attachments && formData.attachments.length > 0 && (
                                                <div className="mt-3">
                                                    <label className="form-label text-muted" style={{ fontSize: '0.9rem' }}>ไฟล์แนบเดิม (บันทึกแล้ว):</label>
                                                    <ul className="list-group">
                                                        {formData.attachments.map((att: any) => (
                                                            <li key={att.ID} className="list-group-item d-flex justify-content-between align-items-center py-1 px-2">
                                                                <div className="d-flex align-items-center text-truncate">
                                                                    <i className="fas fa-paperclip me-2 text-secondary"></i>
                                                                    <span className="text-truncate" style={{ maxWidth: '250px' }} title={att.FileName}>{att.FileName}</span>
                                                                </div>
                                                                {/* Future: Add delete button here if needed */}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
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
            </div>
        </section>
    );
};

export default Frmnews;
