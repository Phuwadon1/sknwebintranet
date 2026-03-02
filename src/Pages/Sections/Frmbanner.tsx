import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import hero_bg from '../../assets/img/hero-bg-main.png';
import api from '../../api/axios';
import Swal from 'sweetalert2';

const Frmbanner = () => {
    const [posters, setPosters] = useState<any[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Management State
    const [showManageModal, setShowManageModal] = useState(false);
    const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
    const [newPosterPdf, setNewPosterPdf] = useState<File | null>(null);
    const [newPosterLink, setNewPosterLink] = useState('');
    const [uploading, setUploading] = useState(false);

    // View All State
    const [showAllPosters, setShowAllPosters] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Edit State
    const [editingPosterId, setEditingPosterId] = useState<number | null>(null);

    // Ref for scrolling to form
    const formRef = useRef<HTMLDivElement>(null);

    // Fetch posters and user on mount
    useEffect(() => {
        fetchPosters();
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (parsedUser.Username === 'Admin2' || parsedUser.Str === '2') {
                setIsAdmin(true);
            }
        }
    }, []);

    const fetchPosters = async () => {
        try {
            setFetchError(null);
            const response = await api.get('/posters');
            setPosters(response.data);
        } catch (error) {
            console.error('Error fetching posters:', error);
            setFetchError('ไม่สามารถโหลดข้อมูลป้ายประกาศได้ กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleViewAllClick = () => {
        fetchPosters(); // Refresh data when opening
        setShowAllPosters(true);
    };

    const totalSlides = 1 + posters.length;

    useEffect(() => {
        if (!isHovered) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % totalSlides);
            }, 10000);
            return () => clearInterval(timer);
        }
    }, [totalSlides, isHovered]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewPosterFile(e.target.files[0]);
        }
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewPosterPdf(e.target.files[0]);
        }
    };

    const handleSavePoster = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingPosterId && !newPosterFile) {
            Swal.fire('Error', 'Please select an image file', 'error');
            return;
        }

        const formData = new FormData();
        if (newPosterFile) {
            formData.append('image', newPosterFile);
            formData.append('title', newPosterFile.name);
        }
        if (newPosterPdf) {
            formData.append('pdf', newPosterPdf);
        } else if (newPosterLink) {
            formData.append('link_url', newPosterLink);
        }

        setUploading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            };

            if (editingPosterId) {
                // Update existing
                await api.put(`/posters/${editingPosterId}`, formData, config);
                Swal.fire('Success', 'Poster updated successfully!', 'success');
            } else {
                // Add new
                await api.post('/posters', formData, config);
                Swal.fire('Success', 'Poster added successfully!', 'success');
            }

            resetForm();
            fetchPosters();
        } catch (error: any) {
            console.error('Error saving poster:', error);
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
                Swal.fire('Error', 'Failed to save poster', 'error');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleEditClick = (poster: any) => {
        setEditingPosterId(poster.id);
        setNewPosterLink(poster.link_url || '');
        setNewPosterFile(null); // Reset file input

        // Scroll to form
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const resetForm = () => {
        setEditingPosterId(null);
        setNewPosterFile(null);
        setNewPosterPdf(null);
        setNewPosterLink('');
    };

    const handleDeletePoster = async (id: number) => {
        try {
            const result = await Swal.fire({
                title: 'คุณแน่ใจหรือไม่?',
                text: "การลบนี้ไม่สามารถย้อนกลับได้!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'ตกลง!',
                cancelButtonText: 'ยกเลิก'
            });

            if (result.isConfirmed) {
                await api.delete(`/posters/${id}`);
                Swal.fire('ลบแล้ว!', 'ป้ายประกาศของคุณถูกลบแล้ว', 'success');
                fetchPosters();
                if (currentSlide >= posters.length) {
                    setCurrentSlide(0);
                }
            }
        } catch (error: any) {
            console.error('Error deleting poster:', error);
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
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบป้ายประกาศได้', 'error');
            }
        }
    };

    return (
        <section
            id="hero"
            className="hero section light-background"
            style={{ position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img src={hero_bg} alt="" data-aos="fade-in" style={{ opacity: currentSlide === 0 ? 1 : 0.3, transition: 'opacity 0.5s' }} />

            {/* Admin Management Button */}
            {isAdmin && (
                <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 100 }}>
                    <button
                        className="btn shadow-lg"
                        onClick={() => { resetForm(); setShowManageModal(true); }}
                        title="จัดการป้ายประกาศ"
                        style={{
                            borderRadius: '50%',
                            width: '55px',
                            height: '55px',
                            backgroundColor: '#ff6b35',
                            color: 'white',
                            border: '3px solid white',
                            fontSize: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.15)';
                            e.currentTarget.style.backgroundColor = '#e85a2a';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = '#ff6b35';
                        }}
                    >
                        <i className="bi bi-gear-fill"></i>
                    </button>
                </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ position: 'absolute', top: '50%', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 20px', zIndex: 10, transform: 'translateY(-50%)' }}>
                <button
                    onClick={prevSlide}
                    style={{
                        background: 'rgba(25, 119, 204, 0.5)', border: 'none', borderRadius: '50%', width: '50px', height: '50px',
                        color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                <button
                    onClick={nextSlide}
                    style={{
                        background: 'rgba(25, 119, 204, 0.5)', border: 'none', borderRadius: '50%', width: '50px', height: '50px',
                        color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>

            {/* Slide 0: Main Hero Content */}
            <div
                className="container position-relative"
                style={{
                    display: currentSlide === 0 ? 'flex' : 'none',
                    animation: 'fadeIn 0.5s ease-in-out',
                    minHeight: '600px',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
            >
                <div className="welcome position-relative" data-aos="fade-down" data-aos-delay="100">
                    <h2>ยินดีต้อนรับสู่โรงพยาบาลสกลนคร</h2>
                    <p>โรงพยาบาลศูนย์ชั้นนำแห่งภาคตะวันออกเฉียงเหนือ มุ่งมั่นให้บริการสุขภาพด้วยมาตรฐานสากล</p>
                </div>

                <div className="content row gy-4">
                    <div className="col-lg-4 d-flex align-items-stretch">
                        <div className="why-box" data-aos="zoom-out" data-aos-delay="200">
                            <h3>ทำไมต้องเลือกโรงพยาบาลสกลนคร?</h3>
                            <p>
                                เรามีความพร้อมทั้งด้านบุคลากรทางการแพทย์ที่เชี่ยวชาญ เครื่องมือแพทย์ที่ทันสมัย และการบริการที่ใส่ใจดุจญาติมิตร เพื่อสุขภาพที่ดีของประชาชน
                            </p>
                            <div className="text-center">
                                <a href="#about" className="more-btn"><span>อ่านเพิ่มเติม</span> <i className="bi bi-chevron-right"></i></a>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8 d-flex align-items-stretch">
                        <div className="d-flex flex-column justify-content-center">
                            <div className="row gy-4">
                                <div className="col-xl-4 d-flex align-items-stretch">
                                    <div className="icon-box" data-aos="zoom-out" data-aos-delay="300">
                                        <i className="bi bi-clipboard-data"></i>
                                        <h4>แพทย์ผู้เชี่ยวชาญ</h4>
                                        <p>ทีมแพทย์เฉพาะทางหลากหลายสาขา พร้อมดูแลรักษาทุกโรคภัย</p>
                                    </div>
                                </div>

                                <div className="col-xl-4 d-flex align-items-stretch">
                                    <div className="icon-box" data-aos="zoom-out" data-aos-delay="400">
                                        <i className="bi bi-gem"></i>
                                        <h4>เทคโนโลยีทันสมัย</h4>
                                        <p>อุปกรณ์ทางการแพทย์ครบครัน รองรับการวินิจฉัยและรักษาที่แม่นยำ</p>
                                    </div>
                                </div>

                                <div className="col-xl-4 d-flex align-items-stretch">
                                    <div className="icon-box" data-aos="zoom-out" data-aos-delay="500">
                                        <i className="bi bi-inboxes"></i>
                                        <h4>บริการด้วยใจ</h4>
                                        <p>มุ่งเน้นความพึงพอใจของผู้รับบริการ ด้วยความรวดเร็วและเป็นกันเอง</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slides 1+: Posters */}
            {currentSlide > 0 && posters[currentSlide - 1] && (
                <div
                    className="container position-relative d-flex justify-content-center align-items-center"
                    style={{
                        height: '100%',
                        minHeight: '600px',
                        animation: 'fadeIn 0.5s ease-in-out'
                    }}
                >
                    {posters[currentSlide - 1].link_url ? (
                        <a
                            href={posters[currentSlide - 1].link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'block', maxWidth: '100%', maxHeight: '600px', cursor: 'pointer' }}
                        >
                            <img
                                src={`${posters[currentSlide - 1].image_path}`}
                                alt={`Poster ${currentSlide}`}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                                }}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '600px',
                                    objectFit: 'contain'
                                }}
                            />
                        </a>
                    ) : (
                        <img
                            src={`${posters[currentSlide - 1].image_path}`}
                            alt={`Poster ${currentSlide}`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                            }}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '600px',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </div>
            )}

            {/* Indicators */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 5
            }}>
                {Array.from({ length: totalSlides }).map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: index === currentSlide ? '#1977cc' : 'rgba(255, 255, 255, 0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    />
                ))}
            </div>

            {/* View All Button */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                zIndex: 20
            }}>
                <button
                    className="btn btn-primary shadow-sm"
                    onClick={handleViewAllClick}
                    style={{
                        borderRadius: '20px',
                        padding: '8px 20px',
                        fontSize: '14px',
                        fontWeight: 500
                    }}
                >
                    <i className="bi bi-grid-fill me-2"></i>
                    ดูป้ายประกาศทั้งหมด
                </button>
            </div>

            {/* Management Modal */}
            {showManageModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                        width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4>{editingPosterId ? 'แก้ไขป้ายประกาศ' : 'จัดการป้ายประกาศ'}</h4>
                            <button className="btn-close" onClick={() => setShowManageModal(false)}></button>
                        </div>

                        {/* Add/Edit Poster Form */}
                        <div className="card mb-4" ref={formRef}>
                            <div className="card-body">
                                <h5 className="card-title">{editingPosterId ? 'แก้ไขข้อมูล' : 'เพิ่มป้ายใหม่'}</h5>
                                <form onSubmit={handleSavePoster}>
                                    <div className="mb-3">
                                        <label className="form-label">รูปภาพ {editingPosterId ? '(เว้นว่างถ้าไม่ต้องการเปลี่ยน)' : '*'}</label>
                                        <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} required={!editingPosterId} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">ลิงก์ / PDF Link (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            placeholder="https://... (ลิงก์ภายนอก)"
                                            value={newPosterLink}
                                            onChange={(e) => setNewPosterLink(e.target.value)}
                                        />
                                        <div className="text-center my-2">- หรือ -</div>
                                        <label className="form-label">อัปโหลดไฟล์ PDF</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="application/pdf"
                                            onChange={handlePdfChange}
                                        />
                                        <small className="text-muted">เลือกอัปโหลด PDF หรือใส่ลิงก์ข้างบน (เลือกอย่างใดอย่างหนึ่ง)</small>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                                            {uploading ? 'กำลังบันทึก...' : (editingPosterId ? 'บันทึกการแก้ไข' : 'เพิ่มป้าย')}
                                        </button>
                                        {editingPosterId && (
                                            <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                                ยกเลิก
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List Posters */}
                        <h5>รายการป้ายปัจจุบัน ({posters.length})</h5>
                        <ul className="list-group">
                            {posters.map((poster) => (
                                <li key={poster.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={`${poster.image_path}`}
                                            alt="thumb"
                                            style={{ width: '50px', height: '35px', objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                                <small className="text-truncate" style={{ maxWidth: '200px' }}>{poster.title}</small>
                                                {poster.link_url && (
                                                    <a href={poster.link_url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                        <small className="text-primary">
                                                            <i className="bi bi-link-45deg"></i>
                                                            <span className="text-truncate" style={{ maxWidth: '180px', display: 'inline-block', verticalAlign: 'middle' }}>
                                                                {poster.link_url}
                                                            </span>
                                                        </small>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            className="btn btn-sm btn-outline-warning me-2"
                                            onClick={() => handleEditClick(poster)}
                                            title="แก้ไข"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeletePoster(poster.id)}
                                            title="ลบ"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* View All Posters Modal */}
            {/* View All Posters Modal - Using Portal to escape overflow:hidden */}
            {showAllPosters && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, // Increased z-index
                    overflowY: 'auto',
                    padding: '20px 0',
                    display: 'flex', // Ensure flex container for centering content if needed
                    justifyContent: 'center',
                    alignItems: 'flex-start' // Content starts at top
                }} onClick={() => setShowAllPosters(false)}>
                    <div style={{
                        width: '100%',
                        maxWidth: '1000px', // Slightly narrower for better focus
                        margin: '20px auto',
                        position: 'relative',
                        padding: '0 15px',
                        pointerEvents: 'auto'
                    }} onClick={e => e.stopPropagation()}>

                        <button
                            onClick={() => setShowAllPosters(false)}
                            style={{
                                position: 'fixed',
                                top: '20px',
                                right: '20px',
                                background: 'rgba(255,255,255,0.8)', // More visible
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

                        <h3 className="text-center text-white mb-5" style={{ marginTop: '20px' }}>
                            ป้ายประกาศทั้งหมด ({posters.length})
                        </h3>

                        {fetchError ? (
                            <div className="alert alert-danger text-center">
                                {fetchError}
                                <br />
                                <button className="btn btn-sm btn-outline-danger mt-2" onClick={fetchPosters}>ลองใหม่</button>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-5 align-items-center">
                                {posters.map((poster) => (
                                    <div key={poster.id} className="bg-transparent" style={{ maxWidth: '100%', textAlign: 'center' }}>
                                        {poster.link_url ? (
                                            <a href={poster.link_url} target="_blank" rel="noopener noreferrer" className="d-inline-block shadow-lg" style={{ transition: 'transform 0.3s' }}>
                                                <img
                                                    src={poster.image_path}
                                                    alt={poster.title}
                                                    style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block', backgroundColor: '#333' }}
                                                    className="hover-zoom rounded"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Load+Error';
                                                    }}
                                                />
                                            </a>
                                        ) : (
                                            <div className="d-inline-block shadow-lg">
                                                <img
                                                    src={poster.image_path}
                                                    alt={poster.title}
                                                    style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', display: 'block', backgroundColor: '#333' }}
                                                    className="rounded"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Load+Error';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {/* Optional: Show Title for debugging or info */}
                                        {/* <div className="text-white mt-1">{poster.title}</div> */}
                                    </div>
                                ))}
                                {posters.length === 0 && (
                                    <div className="text-center text-white mt-5">
                                        <h4>ยังไม่มีป้ายประกาศ</h4>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default Frmbanner;
