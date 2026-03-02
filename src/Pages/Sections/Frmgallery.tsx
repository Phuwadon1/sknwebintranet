import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Photo {
    id: number;
    title: string;
    image_path: string;
    created_at: string;
}

const Frmgallery = () => {
    // 1. Categories Definition
    interface Category {
        id: string;
        label: string;
    }

    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [user, setUser] = useState<any>(null);

    // Category Modal State
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [newCategoryLabel, setNewCategoryLabel] = useState('');
    const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    // CRUD States
    const [showModal, setShowModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

    // 2. Load User for Admin Rights
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/activity-categories');
            if (res.data && res.data.length > 0) {
                setCategories(res.data);
                if (!activeCategory || !res.data.find((c: any) => c.id === activeCategory)) {
                    setActiveCategory(res.data[0].id);
                }
            } else {
                setCategories([]);
                setActiveCategory('');
                setPhotos([]);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // 3. Fetch Photos when category changes
    useEffect(() => {
        if (activeCategory) {
            fetchPhotos();
        } else {
            setPhotos([]);
        }
    }, [activeCategory]);

    const fetchPhotos = async () => {
        if (!activeCategory) return;
        try {
            const res = await api.get(`/activity-photos/${activeCategory}`);
            setPhotos(res.data);
        } catch (err) {
            console.error('Error fetching photos:', err);
        }
    };

    // 4. Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    // 5. Handle Upload via Modal
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', activeCategory);
        formData.append('title', ''); // No description

        try {
            await api.post('/activity-photos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setShowModal(false);
            setFile(null);
            // Notifications removed as requested
            fetchPhotos();
        } catch (err: any) {
            console.error(err);
            // Keep error log
        }
    };

    // 6. Handle Delete via Modal
    const confirmDelete = (id: number) => {
        setPhotoToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!photoToDelete) return;
        try {
            await api.delete(`/activity-photos/${photoToDelete}`);
            setDeleteModalOpen(false);
            setPhotoToDelete(null);
            // Notifications removed as requested
            fetchPhotos();
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryLabel.trim()) return;

        const newId = 'cat_' + Date.now();

        try {
            await api.post('/activity-categories', {
                id: newId,
                label: newCategoryLabel.trim()
            });
            setNewCategoryLabel('');
            setShowAddCategoryModal(false);
            fetchCategories();
            setActiveCategory(newId);
            toast.success('เพิ่มหมวดหมู่สำเร็จ');
        } catch (err: any) {
            console.error(err);
            toast.error('ไม่สามารถเพิ่มหมวดหมู่ได้');
        }
    };

    // Category Deletion API
    const confirmDeleteCategory = (id: string) => {
        setCategoryToDelete(id);
        setDeleteCategoryModalOpen(true);
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        try {
            await api.delete(`/activity-categories/${categoryToDelete}`);
            setDeleteCategoryModalOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
            toast.success('ลบหมวดหมู่สำเร็จ');
        } catch (err: any) {
            console.error(err);
            toast.error('ไม่สามารถลบหมวดหมู่ได้ (อาจมีความเชื่อมโยงกับรูปภาพ)');
        }
    };

    return (
        <section id="gallery" className="gallery section" style={{ backgroundColor: '#fff', paddingBottom: '60px' }}>
            {/* Custom Button Styles */}
            <style>
                {`
                .gallery-tab-btn {
                    border: 1px solid #eef2f6;
                    color: #555;
                    background: #fff;
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    font-family: 'Sarabun', sans-serif;
                    font-size: 14px;
                    white-space: nowrap;
                }
                .gallery-tab-btn:hover {
                    border-color: #1977cc;
                    color: #1977cc;
                    background: #f8fbff;
                }
                .gallery-tab-btn.active {
                    background: #1977cc;
                    color: #fff;
                    border-color: #1977cc;
                    box-shadow: 0 4px 10px rgba(25, 119, 204, 0.2);
                }
            `}
            </style>

            <div className="container" data-aos="fade-up">
                {/* Title Section on Top */}
                <div className="section-title text-center" style={{ marginBottom: '20px' }}>
                    <h2>ภาพกิจกรรม</h2>
                    <p>กิจกรรมโรงพยาบาลสกลนคร</p>
                </div>

                {/* Buttons Row (Buttons + Add Button) */}
                <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center" style={{ marginBottom: '30px' }}>
                    {categories.map((cat) => (
                        <div key={cat.id} className="position-relative d-inline-block">
                            <button
                                type="button"
                                className={`gallery-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.label}
                            </button>
                            {user && activeCategory === cat.id && (
                                <button
                                    className="btn btn-sm btn-danger position-absolute"
                                    onClick={(e) => { e.stopPropagation(); confirmDeleteCategory(cat.id); }}
                                    style={{
                                        top: '-10px',
                                        right: '-10px',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px'
                                    }}
                                    title="ลบหมวดหมู่"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    ))}

                    {user && (
                        <>
                            <button
                                className="btn btn-outline-primary btn-sm ms-2 gallery-tab-btn"
                                onClick={() => setShowAddCategoryModal(true)}
                            >
                                <i className="fas fa-plus me-1"></i> เพิ่มหมวดหมู่
                            </button>
                            <button
                                className="btn btn-success shadow-sm btn-sm ms-2"
                                onClick={() => setShowModal(true)}
                                style={{ borderRadius: '50px', padding: '6px 20px', height: 'fit-content' }}
                                disabled={!activeCategory}
                            >
                                <i className="fas fa-plus-circle me-1"></i> เพิ่มรูปภาพ
                            </button>
                        </>
                    )}
                </div>

                {/* Gallery Grid */}
                <div className="row gy-4 justify-content-center">
                    {photos.length > 0 ? (
                        photos.map((photo) => (
                            <div className="col-lg-3 col-md-4" key={photo.id}>
                                <div className="gallery-item h-100" style={{
                                    boxShadow: '0 5px 20px rgba(0,0,0,0.06)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    border: '1px solid #eee'
                                }}>
                                    <div style={{ overflow: 'hidden', height: '220px' }}>
                                        <img
                                            src={photo.image_path}
                                            className="img-fluid w-100 h-100"
                                            alt="Activity Photos"
                                            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                        />
                                    </div>

                                    <style>{`
                                        .gallery-item:hover img { transform: scale(1.1); }
                                    `}</style>

                                    {user && (
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                                            <button
                                                className="btn btn-light text-danger btn-sm rounded-circle shadow"
                                                onClick={() => confirmDelete(photo.id)}
                                                title="ลบรูปภาพ"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center py-5">
                            <i className="fas fa-images text-muted mb-3" style={{ fontSize: '48px', opacity: 0.3 }}></i>
                            <p className="text-muted">ยังไม่มีรูปภาพในหมวดหมู่นี้</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Upload Modal (Restored) */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header bg-light" style={{ borderRadius: '15px 15px 0 0' }}>
                                <h5 className="modal-title">เพิ่มรูปภาพ: <span className="text-primary">{categories.find(c => c.id === activeCategory)?.label}</span></h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleUpload}>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">เลือกรูปภาพ</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary" style={{ borderRadius: '50px' }}>อัปโหลดทันที</button>
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: '50px' }}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal (Restored) */}
            {deleteModalOpen && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-0 pb-0">
                                <button type="button" className="btn-close" onClick={() => setDeleteModalOpen(false)}></button>
                            </div>
                            <div className="modal-body text-center p-4 pt-0">
                                <i className="fas fa-exclamation-circle text-danger mb-3" style={{ fontSize: '50px' }}></i>
                                <h4 className="mb-2">ยืนยันการลบ?</h4>
                                <p className="text-muted">คุณแน่ใจหรือไม่ที่จะลบรูปภาพนี้อย่างถาวร (ไม่มีการแจ้งเตือน)</p>
                                <div className="d-flex justify-content-center gap-2 mt-4">
                                    <button type="button" className="btn btn-secondary px-4" onClick={() => setDeleteModalOpen(false)} style={{ borderRadius: '50px' }}>ยกเลิก</button>
                                    <button type="button" className="btn btn-danger px-4" onClick={handleDelete} style={{ borderRadius: '50px' }}>ลบรูปภาพ</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Category Confirmation Modal */}
            {deleteCategoryModalOpen && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header border-0 pb-0">
                                <button type="button" className="btn-close" onClick={() => setDeleteCategoryModalOpen(false)}></button>
                            </div>
                            <div className="modal-body text-center p-4 pt-0">
                                <i className="fas fa-exclamation-triangle text-danger mb-3" style={{ fontSize: '50px' }}></i>
                                <h4 className="mb-2">ยืนยันการลบหมวดหมู่?</h4>
                                <p className="text-danger">รูปภาพทั้งหมดในหมวดหมู่นี้อาจหายไป</p>
                                <div className="d-flex justify-content-center gap-2 mt-4">
                                    <button type="button" className="btn btn-secondary px-4" onClick={() => setDeleteCategoryModalOpen(false)} style={{ borderRadius: '50px' }}>ยกเลิก</button>
                                    <button type="button" className="btn btn-danger px-4" onClick={handleDeleteCategory} style={{ borderRadius: '50px' }}>ลบหมวดหมู่</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-right" />

            {/* Add Category Modal */}
            {showAddCategoryModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                            <div className="modal-header bg-light" style={{ borderRadius: '15px 15px 0 0' }}>
                                <h5 className="modal-title">เพิ่มหมวดหมู่ใหม่</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddCategoryModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleAddCategory}>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">ชื่อหมวดหมู่</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newCategoryLabel}
                                            onChange={(e) => setNewCategoryLabel(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary" style={{ borderRadius: '50px' }}>บันทึก</button>
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddCategoryModal(false)} style={{ borderRadius: '50px' }}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Frmgallery;
