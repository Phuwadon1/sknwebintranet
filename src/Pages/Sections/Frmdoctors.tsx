import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import api from '../../api/axios';

const currentYearBE = new Date().getFullYear() + 543;

const Frmdoctors = () => {
    const [visibleCount, setVisibleCount] = useState(15);
    const [scheduleType, setScheduleType] = useState<'doctor' | 'it'>('doctor');
    const { isAdmin } = useAuth();

    const [schedules, setSchedules] = useState<any[]>([]);
    const [itSchedules, setItSchedules] = useState<any[]>([]);

    const [showModal, setShowModal] = useState(false);

    // Form State
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState<{ title: string; month: string; year: string; type: string; filePath: string; file: File | null }>({
        title: '', month: '', year: '', type: 'doctor', filePath: '#', file: null
    });

    // Reset Form
    const resetForm = () => {
        setFormData({ title: '', month: '', year: '', type: 'doctor', filePath: '#', file: null });
        setEditMode(false);
        setEditId(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleShowAdd = () => {
        resetForm();
        setShowModal(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('month', formData.month);
        submitData.append('year', formData.year);
        submitData.append('type', formData.type);
        if (formData.file) {
            submitData.append('file', formData.file);
        } else {
            submitData.append('filePath', formData.filePath); // Keep existing if editing and no new file
        }

        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            let resultItem;
            if (editMode && editId) {
                const res = await api.put(`/schedules/${editId}`, submitData, config);
                resultItem = res.data;
            } else {
                const res = await api.post('/schedules', submitData, config);
                resultItem = res.data;
            }

            if (editMode) {
                // Update existing item in lists
                setSchedules(prev => prev.map(item => item.ID === editId ? resultItem : item));
                setItSchedules(prev => prev.map(item => item.ID === editId ? resultItem : item));
                Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
            } else {
                // Add new item
                if (resultItem.Type === 'doctor') {
                    setSchedules([resultItem, ...schedules]);
                } else {
                    setItSchedules([resultItem, ...itSchedules]);
                }
                Swal.fire('สำเร็จ', 'เพิ่มข้อมูลเรียบร้อยแล้ว', 'success');
            }

            handleCloseModal();
        } catch (error) {
            console.error("Error submitting form:", error);
            Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อ Server ไม่ได้ หรือเกิดข้อผิดพลาด', 'error');
        }
    };

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await api.get('/schedules');
                const data = response.data;
                setSchedules(data.filter((item: any) => item.Type === 'doctor'));
                setItSchedules(data.filter((item: any) => item.Type === 'it'));
            } catch (error) {
                console.error("Error fetching schedules:", error);
            }
        };

        fetchSchedules();
    }, []);

    const currentSchedules = scheduleType === 'doctor' ? schedules : itSchedules;

    const handleToggleView = () => {
        if (visibleCount >= currentSchedules.length) {
            setVisibleCount(15);
            // Scroll to the top of the section
            const section = document.getElementById('doctors');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            setVisibleCount(currentSchedules.length);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/schedules/${id}`);

                setSchedules(prev => prev.filter(item => item.ID !== id));
                setItSchedules(prev => prev.filter(item => item.ID !== id));
                Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบเรียบร้อยแล้ว.', 'success');
            } catch (error) {
                console.error("Error deleting item:", error);
                Swal.fire('ผิดพลาด!', 'เกิดข้อผิดพลาดในการลบข้อมูล.', 'error');
            }
        }
    };

    const handleEdit = (item: any) => {
        setFormData({
            title: item.Title,
            month: item.Month,
            year: item.Year,
            type: item.Type,
            filePath: item.FilePath,
            file: null
        });
        setEditId(item.ID);
        setEditMode(true);
        setShowModal(true);
    };

    // Hover states
    const [hoverDoctor, setHoverDoctor] = useState(false);
    const [hoverIT, setHoverIT] = useState(false);
    const [hoverZone, setHoverZone] = useState(false);

    // Bulk Upload State
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkFiles, setBulkFiles] = useState<{ id: string; file: File | null; title: string; month: string; year: string; type: string }[]>([]);
    const [bulkStartMonth, setBulkStartMonth] = useState('มกราคม');
    const [bulkStartYear, setBulkStartYear] = useState(currentYearBE.toString());
    const [bulkTitlePrefix, setBulkTitlePrefix] = useState('ตารางเวรแพทย์ประจำเดือน');
    const [bulkType, setBulkType] = useState('doctor');

    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Sort files numerically by filename (handling "1291.pdf" vs "1295.pdf")
            files.sort((a, b) => {
                const nameA = a.name.replace(/\D/g, ''); // Extract numbers
                const nameB = b.name.replace(/\D/g, '');
                return (parseInt(nameA) || 0) - (parseInt(nameB) || 0);
            });

            const newBulkFiles = files.map((file, index) => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                title: `${bulkTitlePrefix}`,
                month: '',
                year: bulkStartYear,
                type: bulkType
            }));
            setBulkFiles([...bulkFiles, ...newBulkFiles]);
        }
    };

    const handleAddEmptyRow = () => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            file: null,
            title: `${bulkTitlePrefix}`,
            month: '',
            year: bulkStartYear,
            type: bulkType
        };
        setBulkFiles([...bulkFiles, newItem]);
    };

    const handleAutoFill = () => {
        const startIndex = months.indexOf(bulkStartMonth);
        if (startIndex === -1) return;

        let currentMonthIndex = startIndex;
        let currentYear = parseInt(bulkStartYear);

        const updatedFiles = bulkFiles.map((item, index) => {
            const mIndex = (currentMonthIndex + index) % 12;
            const yearOffset = Math.floor((currentMonthIndex + index) / 12);

            return {
                ...item,
                month: months[mIndex],
                year: (currentYear + yearOffset).toString(),
                title: `${bulkTitlePrefix} ${months[mIndex]} ${(currentYear + yearOffset)}`,
                type: bulkType
            };
        });

        setBulkFiles(updatedFiles);
    };

    const handleBulkRemove = (id: string) => {
        setBulkFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleBulkItemChange = (id: string, field: string, value: string) => {
        setBulkFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const handleBulkSubmit = async () => {
        if (bulkFiles.length === 0) return;

        // Validate
        const missingInfo = bulkFiles.find(f => !f.title || !f.month || !f.year);
        if (missingInfo) {
            Swal.fire('ข้อมูลไม่ครบ', 'กรุณาระบุข้อมูลให้ครบถ้วนทุกไฟล์', 'warning');
            return;
        }

        Swal.fire({
            title: 'กำลังอัพโหลด...',
            html: 'กรุณารอสักครู่',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let successCount = 0;
        let failCount = 0;

        for (const item of bulkFiles) {
            const submitData = new FormData();
            submitData.append('title', item.title);
            submitData.append('month', item.month);
            submitData.append('year', item.year);
            submitData.append('type', item.type);
            if (item.file) {
                submitData.append('file', item.file);
            }
            submitData.append('filePath', '#'); // Default

            try {
                const config = {
                    headers: { 'Content-Type': 'multipart/form-data' }
                };
                await api.post('/schedules', submitData, config);
                successCount++;
            } catch (error) {
                console.error(error);
                failCount++;
            }
        }

        Swal.close();

        await Swal.fire({
            title: 'เสร็จสิ้น',
            text: `อัพโหลดสำเร็จ ${successCount} ไฟล์${failCount > 0 ? `, ล้มเหลว ${failCount} ไฟล์` : ''}`,
            icon: failCount === 0 ? 'success' : 'warning'
        });

        setShowBulkModal(false);
        setBulkFiles([]);

        // Refresh List
        const response = await fetch('/api/schedules');
        const data = await response.json();
        setSchedules(data.filter((item: any) => item.Type === 'doctor'));
        setItSchedules(data.filter((item: any) => item.Type === 'it'));
    };

    return (
        <section id="doctors" className="doctors section-bg">
            <div className="container">

                <div className="section-title">
                    <h2>ตารางเวร</h2>
                    <p>ตรวจสอบตารางเวรแพทย์และเจ้าหน้าที่</p>
                </div>

                <div className="d-flex justify-content-center mb-4">
                    <div className="btn-group" role="group" aria-label="Schedule Type">
                        <button
                            type="button"
                            className={`btn ${scheduleType === 'doctor' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => { setScheduleType('doctor'); setVisibleCount(15); }}
                            onMouseEnter={() => setHoverDoctor(true)}
                            onMouseLeave={() => setHoverDoctor(false)}
                            style={scheduleType === 'doctor' || hoverDoctor
                                ? { backgroundColor: '#1977cc', borderColor: '#1977cc', color: '#fff' }
                                : { color: '#1977cc', borderColor: '#1977cc' }
                            }
                        >
                            ตารางเวรแพทย์
                        </button>
                        <button
                            type="button"
                            className={`btn ${scheduleType === 'it' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => { setScheduleType('it'); setVisibleCount(15); }}
                            onMouseEnter={() => setHoverIT(true)}
                            onMouseLeave={() => setHoverIT(false)}
                            style={scheduleType === 'it' || hoverIT
                                ? { backgroundColor: '#1977cc', borderColor: '#1977cc', color: '#fff' }
                                : { color: '#1977cc', borderColor: '#1977cc' }
                            }
                        >
                            ตารางเวรเจ้าหน้าที่ IT
                        </button>
                        <a
                            href="http://192.168.42.7/images/IT.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary"
                            onMouseEnter={() => setHoverZone(true)}
                            onMouseLeave={() => setHoverZone(false)}
                            style={hoverZone
                                ? { backgroundColor: '#1977cc', borderColor: '#1977cc', color: '#fff' }
                                : { color: '#1977cc', borderColor: '#1977cc' }
                            }
                        >
                            โซน รับผิดชอบงาน IT
                        </a>
                        {isAdmin && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleShowAdd}
                                >
                                    <i className="fas fa-plus me-1"></i> เพิ่มข้อมูล
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-striped table-hover table-bordered">
                        <thead className="table-primary">
                            <tr>
                                <th scope="col" className="text-center" style={{ width: '5%' }}>#</th>
                                <th scope="col" style={{ width: '55%' }}>หัวข้อ</th>
                                <th scope="col" className="text-center" style={{ width: '15%' }}>เดือน</th>
                                <th scope="col" className="text-center" style={{ width: '10%' }}>ปี</th>
                                <th scope="col" className="text-center" style={{ width: '15%' }}>ดาวน์โหลด</th>
                                {isAdmin && <th scope="col" className="text-center" style={{ width: '10%' }}>จัดการ</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {currentSchedules.slice(0, visibleCount).map((item, index) => (
                                <tr key={item.ID}>
                                    <th scope="row" className="text-center">{index + 1}</th>
                                    <td>{item.Title}</td>
                                    <td className="text-center">{item.Month}</td>
                                    <td className="text-center">{item.Year}</td>
                                    <td className="text-center">
                                        {scheduleType === 'it' && item.ID === 1 ? (
                                            <div className="d-flex justify-content-center gap-2">
                                                <a
                                                    href="#"
                                                    className="btn btn-outline-primary btn-sm"
                                                    title="Download Image 1"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <i className="fa-solid fa-file-image me-1"></i> Img 1
                                                </a>
                                            </div>
                                        ) : (
                                            <a
                                                href={item.FilePath}
                                                className="btn btn-outline-primary btn-sm"
                                                title="Download PDF"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="fa-solid fa-file-pdf me-1"></i> Download
                                            </a>
                                        )}
                                    </td>
                                    {isAdmin && (
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-1">
                                                <button className="btn btn-warning btn-sm" onClick={() => handleEdit(item)}><i className="fas fa-edit"></i></button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.ID)}><i className="fas fa-trash"></i></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {currentSchedules.length > 15 && (
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-primary rounded-pill px-4 py-2"
                            onClick={handleToggleView}
                            style={{ backgroundColor: '#1977cc', borderColor: '#1977cc' }}
                        >
                            {visibleCount >= currentSchedules.length ? (
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

            </div>

            {
                showModal && (
                    <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title" style={{ color: 'white' }}>{editMode ? 'แก้ไขข้อมูลตารางเวร' : 'เพิ่มข้อมูลตารางเวร'}</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                                </div>
                                <form onSubmit={handleFormSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">หัวข้อ</label>
                                            <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">เดือน</label>
                                                <select className="form-select" value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })}>
                                                    <option value="">-- เลือกเดือน --</option>
                                                    {['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'].map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">ปี (พ.ศ.)</label>
                                                <select className="form-select" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })}>
                                                    <option value="">-- เลือกปี --</option>
                                                    {Array.from({ length: 15 }, (_, i) => (currentYearBE + 1) - i).map(y => <option key={y} value={y.toString()}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">ประเภท</label>
                                            <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                                <option value="doctor">แพทย์</option>
                                                <option value="it">เจ้าหน้าที่ IT</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">อัพโหลดไฟล์ (PDF/รูปภาพ/ZIP)</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                accept=".pdf, image/*, .zip"
                                                onChange={e => setFormData({ ...formData, file: e.target.files ? e.target.files[0] : null })}
                                            />
                                            {editMode && formData.filePath && (
                                                <small className="text-muted d-block mt-1">ไฟล์เดิม: {formData.filePath}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>ยกเลิก</button>
                                        <button type="submit" className="btn btn-primary">{editMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Bulk Upload Modal */}
            {showBulkModal && (
                <div className="modal show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl" role="document">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title" style={{ color: 'white' }}>อัพโหลดหลายไฟล์ (Bulk Upload)</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBulkModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-4 p-3 bg-light rounded border">
                                    <div className="col-md-12 mb-3">
                                        <label className="form-label fw-bold">1. เลือกไฟล์ PDF หรือ รูปภาพ (เลือกได้หลายไฟล์) หรือ เพิ่มแถวเปล่า</label>
                                        <div className="d-flex gap-2">
                                            <input
                                                type="file"
                                                className="form-control"
                                                multiple
                                                accept=".pdf, image/*, .zip"
                                                onChange={handleBulkFileSelect}
                                            />
                                            <button type="button" className="btn btn-outline-secondary text-nowrap" onClick={handleAddEmptyRow}>
                                                <i className="fas fa-plus me-1"></i> เพิ่มแถวเปล่า
                                            </button>
                                        </div>
                                        <small className="text-muted">ระบบจะเรียงลำดับไฟล์ตามตัวเลขในชื่อไฟล์ให้อัตโนมัติ (เช่น 1291.pdf มาก่อน 1295.pdf)</small>
                                    </div>
                                    <div className="col-md-12">
                                        <hr />
                                        <label className="form-label fw-bold">2. ตั้งค่าการรันข้อมูลอัตโนมัติ</label>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">เดือนเริ่มต้น</label>
                                        <select className="form-select" value={bulkStartMonth} onChange={e => setBulkStartMonth(e.target.value)}>
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">ปีเริ่มต้น</label>
                                        <select className="form-select" value={bulkStartYear} onChange={e => setBulkStartYear(e.target.value)}>
                                            {Array.from({ length: 15 }, (_, i) => (currentYearBE + 1) - i).map(y => <option key={y} value={y.toString()}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">คำนำหน้าหัวข้อ</label>
                                        <input type="text" className="form-control" value={bulkTitlePrefix} onChange={e => setBulkTitlePrefix(e.target.value)} />
                                    </div>
                                    <div className="col-md-3 d-flex align-items-end">
                                        <button type="button" className="btn btn-info text-white w-100" onClick={handleAutoFill}>
                                            <i className="fas fa-magic me-1"></i> รันข้อมูลอัตโนมัติ
                                        </button>
                                    </div>
                                </div>

                                {bulkFiles.length > 0 && (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: '20%' }}>ชื่อไฟล์</th>
                                                    <th style={{ width: '35%' }}>หัวข้อ</th>
                                                    <th style={{ width: '15%' }}>เดือน</th>
                                                    <th style={{ width: '10%' }}>ปี</th>
                                                    <th style={{ width: '15%' }}>ประเภท</th>
                                                    <th style={{ width: '5%' }}>ลบ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bulkFiles.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="align-middle text-truncate" style={{ maxWidth: '150px' }} title={item.file ? item.file.name : 'ไม่มีไฟล์'}>
                                                            {item.file ? item.file.name : <span className="text-muted fst-italic">- ไม่มีไฟล์ -</span>}
                                                        </td>
                                                        <td>
                                                            <input type="text" className="form-control form-control-sm" value={item.title} onChange={e => handleBulkItemChange(item.id, 'title', e.target.value)} />
                                                        </td>
                                                        <td>
                                                            <select className="form-select form-select-sm" value={item.month} onChange={e => handleBulkItemChange(item.id, 'month', e.target.value)}>
                                                                <option value="">-เลือก-</option>
                                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className="form-select form-select-sm" value={item.year} onChange={e => handleBulkItemChange(item.id, 'year', e.target.value)}>
                                                                {Array.from({ length: 15 }, (_, i) => (currentYearBE + 1) - i).map(y => <option key={y} value={y.toString()}>{y}</option>)}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select className="form-select form-select-sm" value={item.type} onChange={e => handleBulkItemChange(item.id, 'type', e.target.value)}>
                                                                <option value="doctor">แพทย์</option>
                                                                <option value="it">IT</option>
                                                            </select>
                                                        </td>
                                                        <td className="text-center">
                                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleBulkRemove(item.id)}>
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>ยกเลิก</button>
                                <button type="button" className="btn btn-primary" onClick={handleBulkSubmit} disabled={bulkFiles.length === 0}>
                                    <i className="fas fa-cloud-upload-alt me-1"></i> อัพโหลดทั้งหมด ({bulkFiles.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Frmdoctors;
