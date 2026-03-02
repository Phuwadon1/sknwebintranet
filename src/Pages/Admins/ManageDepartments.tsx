import React, { useState, useEffect } from 'react';
import RichTextEditor from '../../Components/RichTextEditor';
import api from '../../api/axios';
import Swal from 'sweetalert2';

interface Department {
    id?: number;
    title: string;
    content: string;
    phone_internal: string;
    image_path: string;
}

const ManageDepartments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [phoneInternal, setPhoneInternal] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('phone_internal', phoneInternal);
        if (image) {
            formData.append('image', image);
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Authorization handled by interceptor
                }
            };

            if (isEditing && currentId) {
                await api.put(`/departments/${currentId}`, formData, config);
                Swal.fire('Success', 'Updated successfully', 'success');
            } else {
                await api.post('/departments', formData, config);
                Swal.fire('Success', 'Created successfully', 'success');
            }
            resetForm();
            fetchDepartments();
        } catch (error) {
            console.error('Error saving department:', error);
            Swal.fire('Error', 'Failed to save', 'error');
        }
    };

    const handleEdit = (dept: Department) => {
        setIsEditing(true);
        setCurrentId(dept.id!);
        setTitle(dept.title);
        setContent(dept.content);
        setPhoneInternal(dept.phone_internal);
        setPreviewImage(dept.image_path ? `${apiBase.replace('/api', '')}${dept.image_path}` : null);
        window.scrollTo(0, 0); // Scroll to top for editing
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/departments/${id}`);
                Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
                fetchDepartments();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete', 'error');
            }
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentId(null);
        setTitle('');
        setContent('');
        setPhoneInternal('');
        setImage(null);
        setPreviewImage(null);
    };

    return (
        <section className="section">
            <div className="container">
                <div className="section-title">
                    <h2>Manage Departments & Medical Centers</h2>
                    <p>Add, Edit, or Delete departments. Use the editor to format text.</p>
                </div>

                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">{isEditing ? 'Edit Department' : 'Add New Department'}</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Title (หัวข้อ)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Internal Phone (เบอร์ภายใน)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={phoneInternal}
                                    onChange={e => setPhoneInternal(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Image (รูปภาพ)</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImage(e.target.files[0]);
                                            setPreviewImage(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }}
                                    accept="image/*"
                                />
                                {previewImage && (
                                    <img src={previewImage} alt="Preview" className="mt-2" style={{ maxWidth: '200px' }} />
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Content (ข้อความต่างๆ - ปรับแต่งได้)</label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    style={{ height: '300px', marginBottom: '50px' }}
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Update' : 'Create'}
                                </button>
                                {isEditing && (
                                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Departments List</h5>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Title</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map(dept => (
                                        <tr key={dept.id}>
                                            <td>
                                                {dept.image_path && (
                                                    <img
                                                        src={`${apiBase.replace('/api', '')}${dept.image_path}`}
                                                        alt={dept.title}
                                                        style={{ width: '50px', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </td>
                                            <td>{dept.title}</td>
                                            <td>{dept.phone_internal}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-info me-2"
                                                    onClick={() => handleEdit(dept)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(dept.id!)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ManageDepartments;
