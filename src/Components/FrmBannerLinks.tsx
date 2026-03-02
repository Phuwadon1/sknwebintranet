import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/useAuth';

const FrmBannerLinks = () => {
    const { isAdmin } = useAuth();
    const [banners, setBanners] = useState<any[]>([]);

    // Modals
    const [showModal, setShowModal] = useState(false); // Add/Edit Modal
    const [showAllModal, setShowAllModal] = useState(false); // View All Modal

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('#');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState('');

    const fetchBanners = async () => {
        try {
            const res = await api.get('/banner-links');
            setBanners(res.data);
        } catch (error) {
            console.error("Error fetching banners:", error);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showAllModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showAllModal]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "ต้องการลบแบนเนอร์นี้เลบใช่ไหม!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/banner-links/${id}`);
                Swal.fire('ลบเรียบร้อย!', '', 'success');
                fetchBanners();
            } catch (err: any) {
                Swal.fire('Error!', 'ลบไม่ได้', 'error');
            }
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditId(null);
        setTitle('');
        setUrl('#');
        setSelectedFile(null);
        setExistingImage('');
        setShowModal(true);
    };

    const openEditModal = (banner: any) => {
        setIsEditing(true);
        setEditId(banner.ID);
        setTitle(banner.Title);
        setUrl(banner.TargetUrl);
        setExistingImage(banner.ImageUrl);
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditing && !selectedFile) {
            Swal.fire('กรุณาเลือกรูปภาพ', '', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('url', url);
        if (selectedFile) {
            formData.append('file', selectedFile);
        } else if (isEditing) {
            formData.append('existingImage', existingImage);
        }

        try {
            const headers = {
                'Content-Type': 'multipart/form-data',
                // Authorization handled automatically
            };

            if (isEditing && editId) {
                await api.put(`/banner-links/${editId}`, formData, { headers });
                Swal.fire('สำเร็จ!', 'แก้ไขเรียบร้อย', 'success');
            } else {
                await api.post('/banner-links', formData, { headers });
                Swal.fire('สำเร็จ!', 'เพิ่มแบนเนอร์เรียบร้อย', 'success');
            }

            setShowModal(false);
            fetchBanners();
        } catch (err: any) {
            console.error(err);
            Swal.fire('Error!', 'บันทึกข้อมูลไม่ได้', 'error');
        }
    };

    // Render Helper
    const renderBannerItem = (banner: any) => (
        <div key={banner.ID} className="position-relative banner-item-wrapper mb-1">
            <a href={banner.TargetUrl} target="_blank" rel="noopener noreferrer" className="d-block shadow-sm rounded overflow-hidden banner-link-item">
                <img src={banner.ImageUrl} alt={banner.Title} className="w-100" style={{ height: '50px', objectFit: 'fill', display: 'block' }} />
            </a>
            {isAdmin && (
                <div className="position-absolute top-0 end-0 m-1" style={{ zIndex: 10 }}>
                    <button className="btn btn-warning btn-sm me-1 text-white" onClick={() => openEditModal(banner)}>
                        <i className="fas fa-pencil-alt" style={{ fontSize: '0.75rem' }}></i>
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(banner.ID)}>
                        <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                    </button>
                </div>
            )}
        </div>
    );

    const visibleBanners = banners.slice(0, 5);

    return (
        <div className="banner-links-container">
            {isAdmin && (
                <div className="mb-3 d-flex justify-content-center">
                    <button className="btn btn-success btn-sm" onClick={openAddModal}>
                        <i className="fas fa-plus me-1"></i> เพิ่มแบนเนอร์
                    </button>
                </div>
            )}

            {/* Sidebar List (Limit 5) */}
            <div className="d-grid gap-2">
                {visibleBanners.map(renderBannerItem)}

                {banners.length === 0 && (
                    <div className="text-center text-muted py-4 border rounded bg-light">
                        <p className="mb-0">ยังไม่มีแบนเนอร์</p>
                    </div>
                )}
            </div>

            {/* Show More Button */}
            {banners.length > 5 && (
                <div className="text-center mt-3">
                    <button
                        className="btn btn-outline-success btn-sm w-100 rounded-pill"
                        onClick={() => setShowAllModal(true)}
                    >
                        ดูทั้งหมด ({banners.length}) <i className="fas fa-chevron-right ms-1"></i>
                    </button>
                </div>
            )}

            {/* VIEW ALL MODAL - REFACTORED TO MATCH FRMBANNER STYLE */}
            {showAllModal && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
                    overflowY: 'auto',
                    padding: '20px 0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }} onClick={() => setShowAllModal(false)}>
                    <div style={{
                        width: '100%',
                        maxWidth: '350px', // Match sidebar width
                        margin: '40px auto',
                        position: 'relative',
                        padding: '0 15px',
                        pointerEvents: 'auto'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowAllModal(false)}
                            style={{
                                position: 'fixed',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.8)',
                                border: 'none',
                                color: '#333',
                                borderRadius: '50%',
                                width: '45px',
                                height: '45px',
                                fontSize: '24px',
                                cursor: 'pointer',
                                zIndex: 10000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                            }}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                        <h3 className="text-center text-white mb-4" style={{ marginTop: '20px', whiteSpace: 'nowrap', fontSize: '1.25rem' }}>
                            <i className="bi bi-link-45deg me-2"></i> ลิงก์ที่เกี่ยวข้องทั้งหมด ({banners.length})
                        </h3>

                        <div className="d-flex flex-column gap-2 align-items-center">
                            {banners.map((banner) => (
                                <div key={banner.ID} className="banner-item-wrapper" style={{ width: '100%' }}>
                                    <a href={banner.TargetUrl} target="_blank" rel="noopener noreferrer"
                                        className="d-block shadow-lg rounded overflow-hidden banner-link-item hover-zoom"
                                        style={{ transition: 'transform 0.3s' }}>
                                        <img
                                            src={banner.ImageUrl}
                                            alt={banner.Title}
                                            className="w-100"
                                            style={{ height: '50px', objectFit: 'fill', display: 'block', backgroundColor: '#fff' }}
                                        />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ADD/EDIT MODAL */}
            {showModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">{isEditing ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์ใหม่'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">ชื่อแบนเนอร์ (Title)</label>
                                        <input type="text" className="form-control" required value={title} onChange={e => setTitle(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ลิงค์ปลายทาง (URL)</label>
                                        <input type="text" className="form-control" required value={url} onChange={e => setUrl(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">รูปภาพ (Image) {isEditing && <small className="text-muted">(ไม่เลือก = ใช้รูปเดิม)</small>}</label>
                                        <input type="file" className="form-control" accept="image/*" onChange={e => {
                                            if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                                        }} />
                                    </div>
                                    {isEditing && existingImage && (
                                        <div className="mb-3">
                                            <p className="small text-muted mb-1">รูปปัจจุบัน:</p>
                                            <img src={existingImage} alt="current" style={{ height: '50px' }} className="border rounded" />
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                                    <button type="submit" className="btn btn-success">บันทึก</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <style>
                {`
                    .banner-link-item {
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .banner-link-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                    }
                    .hover-zoom:hover {
                        transform: scale(1.02) !important;
                    }
                     /* Slim Scrollbar for Modal */
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1; 
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #888; 
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #555; 
                    }
                `}
            </style>
        </div>
    );
};

export default FrmBannerLinks;
