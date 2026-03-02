import React from 'react';
import { Link } from 'react-router-dom';

const Frmhomeadmin = () => {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary">ระบบจัดการหลังบ้าน (Admin Dashboard)</h2>
        <p className="text-muted">เลือกเมนูที่ต้องการจัดการ</p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Chat System Card */}
        {/* Chat System Card Removed (Moved to Widget) */}

        {/* Existing Management (Placeholder) */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 hover-card">
            <div className="card-body text-center p-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                <i className="fas fa-images fa-2x"></i>
              </div>
              <h5 className="card-title fw-bold">จัดการแบนเนอร์</h5>
              <p className="card-text text-muted small">เพิ่ม/ลบ/แก้ไข ลิงก์ที่เกี่ยวข้อง</p>
              <Link to="/" className="btn btn-outline-success rounded-pill px-4 mt-2">
                ไปที่หน้าเว็บหลัก <i className="fas fa-external-link-alt ms-1"></i>
              </Link>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .hover-card { transition: transform 0.2s; }
        .hover-card:hover { transform: translateY(-5px); }
      `}</style>
    </div>
  )
}

export default Frmhomeadmin