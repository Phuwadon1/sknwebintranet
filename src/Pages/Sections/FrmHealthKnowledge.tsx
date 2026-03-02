import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../hooks/useAuth'; // Assuming this hook exists

const FrmHealthKnowledge = () => {
    const { isAdmin } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [items, setItems] = useState<any[]>([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'บทความทางการแพทย์',
        content: '',
        link: ''
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Fetch Data
    const fetchItems = async () => {
        try {
            const res = await api.get('/health-knowledge');
            setItems(res.data);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Form Handlers
    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ title: '', category: 'บทความทางการแพทย์', content: '', link: '' });
        setSelectedImage(null);
        setSelectedFile(null);
        setEditMode(false);
        setEditId(null);
    };

    const handleShowAdd = () => {
        handleCloseModal(); // Reset first
        setShowModal(true);
    };

    const handleShowEdit = (item: any) => {
        setEditMode(true);
        setEditId(item.id);
        setFormData({
            title: item.title,
            category: item.category,
            content: item.content || '',
            link: item.file_path && !item.file_path.startsWith('/uploads/') ? item.file_path : ''
        });
        setSelectedImage(null);
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณต้องการลบบทความนี้ใช่หรือไม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/health-knowledge/${id}`);
                Swal.fire('เรียบร้อย!', 'ลบบทความแล้ว', 'success');
                fetchItems();
            } catch (error: any) {
                console.error(error);
                Swal.fire('ผิดพลาด', 'ไม่สามารถลบได้', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('content', formData.content);
        data.append('link', formData.link);

        if (selectedImage) data.append('image', selectedImage);
        if (selectedFile) data.append('file', selectedFile);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (editMode && editId) {
                await api.put(`/health-knowledge/${editId}`, data, config);
                Swal.fire('สำเร็จ!', 'แก้ไขบทความเรียบร้อย', 'success');
            } else {
                await api.post('/health-knowledge', data, config);
                Swal.fire('สำเร็จ!', 'เพิ่มบทความเรียบร้อย', 'success');
            }
            handleCloseModal();
            fetchItems();
        } catch (error: any) {
            console.error(error);
            Swal.fire('ผิดพลาด', 'บันทึกไม่สำเร็จ', 'error');
        }
    };

    const categories = ["All", "บทความทางการแพทย์", "คู่มือการปฏิบัติงาน", "เทคโนโลยีสารสนเทศ", "อื่นๆ"];

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Helper for rendering Item (Card)
    const renderCard = (item: any, index: number) => {
        const hasImage = item.image_path;
        // Determine link: if file_path is set, use it. if generic link is set in DB (stored in file_path col for urls), use it.
        // Actually my DB stores both in file_path usually, but creating logic to distinguish might be tricky if I didn't verify.
        // Backend put link into file_path if docFile was null.
        const targetLink = item.file_path || '#';

        return (
            <div className="col-lg-4 col-md-6" key={item.id} data-aos="fade-up" data-aos-delay={(index + 1) * 100}>
                <div className="card h-100 border-0 shadow-sm hover-card">
                    <div className="card-img-top overflow-hidden position-relative" style={{ height: '200px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasImage ? (
                            <img src={item.image_path} alt={item.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="text-center text-muted">
                                <i className="fas fa-book-open fa-3x mb-2 opacity-50"></i>
                                <div>{item.category}</div>
                            </div>
                        )}

                        {/* Admin Badge/Controls Overlay */}
                        {isAdmin && (
                            <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 10 }}>
                                <button className="btn btn-sm btn-light me-1 shadow-sm" onClick={(e) => { e.preventDefault(); handleShowEdit(item); }}><i className="fas fa-edit text-warning"></i></button>
                                <button className="btn btn-sm btn-light shadow-sm" onClick={(e) => { e.preventDefault(); handleDelete(item.id); }}><i className="fas fa-trash text-danger"></i></button>
                            </div>
                        )}
                    </div>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-light border border-primary-subtle text-uppercase text-truncate" style={{ fontSize: '0.75rem', maxWidth: '100%', color: '#1977cc' }}>{item.category}</span>
                            <small className="text-muted text-nowrap ms-2">
                                <i className="far fa-calendar-alt me-1"></i>
                                {new Date(item.created_at).toLocaleDateString('th-TH')}
                            </small>
                        </div>
                        <h5 className="card-title fw-bold mb-3">
                            <a href={targetLink} target="_blank" rel="noreferrer" className="text-dark text-decoration-none stretched-link">
                                {item.title}
                            </a>
                        </h5>
                        <p className="card-text text-muted small text-truncate-2">
                            {item.content || 'คลิกเพื่ออ่านรายละเอียดเพิ่มเติม...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section id="health-knowledge" className="health-knowledge section light-background" style={{ padding: '60px 0' }}>
            {/* Header */}
            <div className="container" data-aos="fade-up">
                <div className="section-title text-center">
                    <h2>คลังความรู้สุขภาพ</h2>
                    <p>แหล่งรวบรวมบทความวิชาการ คู่มือการปฏิบัติงาน และเกร็ดความรู้เพื่อบุคลากรและประชาชนทั่วไป</p>
                </div>
            </div>

            <div className="container">
                {/* Search & Filter */}
                <div className="row justify-content-center mb-5" data-aos="fade-up" data-aos-delay="100">
                    <div className="col-lg-8">
                        <div className="input-group mb-4 shadow-sm">
                            <span className="input-group-text bg-white border-end-0"><i className="fas fa-search" style={{ color: '#1977cc' }}></i></span>
                            <input
                                type="text"
                                className="form-control border-start-0 ps-0"
                                placeholder="ค้นหาบทความ, คู่มือ..."
                                style={{ height: '50px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn text-white px-4" type="button" style={{ backgroundColor: '#1977cc', borderColor: '#1977cc' }}>ค้นหา</button>
                        </div>

                        <div className="d-flex justify-content-center flex-wrap gap-2 align-items-center">
                            {categories.map((cat, index) => (
                                <button
                                    key={index}
                                    className={`btn rounded-pill px-3`}
                                    style={{
                                        backgroundColor: activeCategory === cat ? '#1977cc' : 'transparent',
                                        color: activeCategory === cat ? '#fff' : '#6c757d',
                                        borderColor: activeCategory === cat ? '#1977cc' : '#6c757d'
                                    }}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                            {isAdmin && (
                                <button className="btn btn-success rounded-pill px-3 ms-2 shadow-sm" onClick={handleShowAdd}>
                                    <i className="fas fa-plus me-1"></i> เพิ่มบทความ
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="row gy-4">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => renderCard(item, index))
                    ) : (
                        <div className="col-12 text-center py-5 text-muted">
                            <i className="far fa-file-alt fa-3x mb-3"></i>
                            <p>ยังไม่มีข้อมูลในหมวดหมู่นี้</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header text-white" style={{ backgroundColor: '#1977cc' }}>
                                <h5 className="modal-title" style={{ color: 'white' }}>{editMode ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">หัวข้อบทความ <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">หมวดหมู่</label>
                                            <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">เนื้อหาโดยย่อ / รายละเอียด</label>
                                        <textarea className="form-control" rows={3} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}></textarea>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">รูปภาพหน้าปก (ถ้ามี)</label>
                                            <input type="file" className="form-control" accept="image/*" onChange={e => setSelectedImage(e.target.files ? e.target.files[0] : null)} />
                                            {selectedImage && <small className="text-success">เลือกไฟล์: {selectedImage.name}</small>}
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">ไฟล์แนบ (PDF) หรือลิงก์</label>
                                            <input type="file" className="form-control mb-1" accept=".pdf,.doc,.docx" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                                            <input type="text" className="form-control" placeholder="หรือใส่ URL ลิงก์ภายนอก" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>ยกเลิก</button>
                                    <button type="submit" className="btn text-white" style={{ backgroundColor: '#1977cc', borderColor: '#1977cc' }}>บันทึกข้อมูล</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                .hover-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                }
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                `}
            </style>
        </section>
    );
};

export default FrmHealthKnowledge;
