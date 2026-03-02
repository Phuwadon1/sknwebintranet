import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../hooks/useAuth';

const FrmChiefProfile = () => {
    const [profile, setProfile] = useState({
        header_text: 'หัวหน้ากลุ่มภารกิจสุขภาพดิจิทัล',
        name: 'นายเกียรติศักดิ์ พรหมเสนสา',
        position: 'นายแพทย์ชำนาญการ',
        image_path: null
    });
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth(); // Use useAuth hook
    // Removed local user state as we use isAdmin from hook

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...profile });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [deleteImage, setDeleteImage] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);


    const fetchProfile = async () => {
        try {
            const res = await api.get('/chief');
            if (res.data && res.data.name) {
                setProfile(res.data);
                setEditForm(res.data);
            }
        } catch (err) {
            console.error('Error fetching chief profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
            setDeleteImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewImage(null);
        setDeleteImage(true);
        // Clear file input value if needed (requires ref), but simplicity first
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('header_text', editForm.header_text);
        formData.append('name', editForm.name);
        formData.append('position', editForm.position);

        if (deleteImage) {
            formData.append('delete_image', 'true');
        } else if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            // Authorization header injected by interceptor

            const res = await api.post('/chief', formData);

            const newImagePath = deleteImage ? null : (res.data.imagePath || profile.image_path);

            setProfile({
                ...editForm,
                image_path: newImagePath
            });
            setIsEditing(false);

            // Force re-fetch to ensure UI is in sync with server (fixes "refresh required" issue)
            await fetchProfile();

            // toast.success('บันทึกข้อมูลสำเร็จ');
        } catch (err: any) {
            console.error("Update Error:", err);
            if (err.response) {
                console.error("Response Information:", err.response);
                if (err.response.status === 401 || err.response.status === 400) {
                    const msg = err.response.data?.message || 'เซสชั่นหมดอายุ';
                    toast.error(`เซสชั่นหมดอายุ: ${msg} กำลังพาท่านไปหน้าเข้าสู่ระบบ...`);

                    // Auto-logout logic
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setTimeout(() => {
                        window.location.hash = '#/Login';
                        // window.location.reload(); // Optional: Force reload to clear states
                    }, 2000);
                } else {
                    toast.error(`บันทึกไม่สำเร็จ (Status: ${err.response.status})`);
                }
            } else {
                toast.error('บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    // Logic to determine what to show in preview area logic
    const showDeleteBtn = (previewImage || (profile.image_path && !deleteImage));

    return (
        <div className="chief-profile-card mb-4">
            <style>
                {`
                .chief-profile-card {
                    font-family: 'Sarabun', sans-serif;
                    text-align: center;
                }
                .chief-header {
                    background-color: #5bb2d7; 
                    color: #fff;
                    padding: 8px;
                    border-radius: 5px 5px 0 0;
                    font-weight: bold;
                    font-size: 18px;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                    border: 1px solid #4da5c8;
                }
                .chief-body {
                    border: 2px solid #5bb2d7;
                    border-top: none;
                    border-radius: 0 0 15px 15px;
                    padding: 20px;
                    background: #fff;
                    position: relative; 
                }
                .chief-image-frame {
                    width: 100%;
                    max-width: 200px;
                    margin: 0 auto 15px auto;
                    /* border: 5px solid #888; Removed as requested */
                    line-height: 0;
                }
                .chief-name {
                    font-size: 18px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 5px;
                }
                .chief-position {
                    font-size: 16px;
                    color: #333;
                }
                .edit-btn-overlay {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    opacity: 0.5;
                    transition: opacity 0.3s;
                    cursor: pointer;
                }
                .edit-btn-overlay:hover {
                    opacity: 1;
                }
                `}
            </style>

            <div className="chief-header">
                {profile.header_text}
            </div>

            <div className="chief-body">
                {isAdmin && (
                    <button
                        className="btn btn-sm btn-light edit-btn-overlay"
                        onClick={() => {
                            setEditForm({ ...profile });
                            setIsEditing(true);
                            setImageFile(null);
                            setPreviewImage(null);
                            setDeleteImage(false);
                        }}
                        title="Edit Profile"
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                )}

                <div className="chief-image-frame" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', minHeight: '200px' }}>
                    {profile.image_path ? (
                        <img
                            src={profile.image_path}
                            alt={profile.name}
                            className="img-fluid"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerText = 'No Photo';
                            }}
                        />
                    ) : (
                        <span style={{ color: '#aaa' }}>No Photo</span>
                    )}
                </div>

                <div className="chief-name">{profile.name}</div>
                <div className="chief-position">{profile.position}</div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Chief Profile</h5>
                                <button className="btn-close" onClick={() => setIsEditing(false)}></button>
                            </div>
                            <div className="modal-body text-start">
                                <form onSubmit={handleSave}>
                                    <div className="mb-3">
                                        <label className="form-label">Header Text</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.header_text}
                                            onChange={e => setEditForm({ ...editForm, header_text: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Position</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editForm.position}
                                            onChange={e => setEditForm({ ...editForm, position: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Photo</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <div className="mt-2 d-flex align-items-center gap-3">
                                            {previewImage && (
                                                <img src={previewImage} alt="Preview" style={{ height: '80px', border: '1px solid #ddd' }} />
                                            )}
                                            {!previewImage && !deleteImage && profile.image_path && (
                                                <img src={profile.image_path} alt="Current" style={{ height: '80px', border: '1px solid #ddd' }} />
                                            )}

                                            {showDeleteBtn && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={handleRemoveImage}
                                                >
                                                    <i className="fas fa-trash me-1"></i> Remove Photo
                                                </button>
                                            )}
                                            {deleteImage && <span className="text-danger small">Photo will be removed</span>}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default FrmChiefProfile;
