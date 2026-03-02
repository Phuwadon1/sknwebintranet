
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ActivityHelperProps {
    category: string;
    title: string;
}

interface Photo {
    id: number;
    title: string;
    image_path: string;
    created_at: string;
}

const FrmActivityGallery: React.FC<ActivityHelperProps> = ({ category, title }) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [user, setUser] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchPhotos();
    }, [category]);

    const fetchPhotos = async () => {
        try {
            const res = await api.get(`/activity-photos/${category}`);
            setPhotos(res.data);
        } catch (err) {
            console.error('Error fetching photos:', err);
            // toast.error('Failed to load photos');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('title', uploadTitle);

        try {
            await api.post('/activity-photos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Authorization injected by interceptor
                }
            });
            // toast.success('Photo uploaded successfully');
            setShowModal(false);
            setFile(null);
            setUploadTitle('');
            fetchPhotos();
        } catch (err: any) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                toast.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error('Failed to upload photo');
            }
        }
    };

    const confirmDelete = (id: number) => {
        setPhotoToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!photoToDelete) return;
        try {
            await api.delete(`/activity-photos/${photoToDelete}`);
            // toast.success('Photo deleted');
            setDeleteModalOpen(false);
            setPhotoToDelete(null);
            fetchPhotos();
        } catch (err: any) {
            console.error(err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                toast.error('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error('Failed to delete photo');
            }
        }
    };

    return (
        <section className="section">
            <div className="container" data-aos="fade-up">
                <div className="section-title">
                    <h2>{title}</h2>
                    <p>Activity Photos</p>
                </div>

                {user && (
                    <div className="mb-4">
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <i className="bi bi-plus-circle me-2"></i> เพิ่มรูปภาพ
                        </button>
                    </div>
                )}

                <div className="row portfolio-container" data-aos="fade-up" data-aos-delay="200">
                    {photos.map((photo) => (
                        <div key={photo.id} className="col-lg-4 col-md-6 portfolio-item filter-app">
                            <div className="portfolio-wrap">
                                <img src={photo.image_path} className="img-fluid" alt={photo.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                                <div className="portfolio-info">
                                    <h4>{photo.title}</h4>
                                    {user && (
                                        <div className="portfolio-links">
                                            <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(photo.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {photos.length === 0 && <p className="text-center text-muted">ยังไม่มีรูปภาพในกิจกรรมนี้</p>}
                </div>

                {/* Upload Modal */}
                {showModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">เพิ่มรูปภาพใหม่</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleUpload}>
                                        <div className="mb-3">
                                            <label className="form-label">คำอธิบายรูปภาพ</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={uploadTitle}
                                                onChange={(e) => setUploadTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">เลือกรูปภาพ</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                required
                                            />
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ปิด</button>
                                            <button type="submit" className="btn btn-primary">อัปโหลด</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title text-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i> ยืนยันการลบ</h5>
                                    <button type="button" className="btn-close" onClick={() => setDeleteModalOpen(false)}></button>
                                </div>
                                <div className="modal-body text-center p-4">
                                    <h4>คุณแน่ใจหรือไม่ที่จะลบรูปภาพนี้?</h4>
                                    <p className="text-muted">การกระทำนี้ไม่สามารถเรียกคืนได้</p>
                                </div>
                                <div className="modal-footer justify-content-center">
                                    <button type="button" className="btn btn-secondary px-4" onClick={() => setDeleteModalOpen(false)}>ยกเลิก</button>
                                    <button type="button" className="btn btn-danger px-4" onClick={handleDelete}>ลบรูปภาพ</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </section>
    );
};

export default FrmActivityGallery;
