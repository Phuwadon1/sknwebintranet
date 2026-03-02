import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Frmreporting = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <main id="main">
            {/* Breadcrumbs (Optional, but good for a separate page) */}

            <section id="reporting" className="reporting section">
                <div className="container" data-aos="fade-up">
                    <div className="section-title">
                        <h2>ระบบรายงาน</h2>
                        <p>รวมรายงานและข้อมูลสถิติต่างๆ ของโรงพยาบาล</p>
                    </div>

                    {/* Quick Access / Main Reports */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <h3 className="border-bottom pb-2 mb-3">รายงานหลัก</h3>
                        </div>
                        <div className="col-md-4 col-lg-3 mb-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center">
                                    <i className="bi bi-file-earmark-text fs-1 text-primary mb-3"></i>
                                    <h5 className="card-title"><Link to="/Reporting/ViewReports" className="stretched-link text-decoration-none text-dark">ดูรายงาน</Link></h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-3 mb-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center">
                                    <i className="bi bi-person-badge fs-1 text-primary mb-3"></i>
                                    <h5 className="card-title"><Link to="/Reporting/DoctorEntry" className="stretched-link text-decoration-none text-dark">รายงานแพทย์</Link></h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-3 mb-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center">
                                    <i className="bi bi-file-word fs-1 text-primary mb-3"></i>
                                    <h5 className="card-title"><Link to="/Reporting/WordReports" className="stretched-link text-decoration-none text-dark">รายงาน Word</Link></h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-3 mb-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center">
                                    <i className="bi bi-box-arrow-up-right fs-1 text-primary mb-3"></i>
                                    <h5 className="card-title"><Link to="/Reporting/ExportPatientData" className="stretched-link text-decoration-none text-dark">ส่งออกข้อมูลผู้ป่วย</Link></h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-3 mb-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center">
                                    <i className="bi bi-flower1 fs-1 text-primary mb-3"></i>
                                    <h5 className="card-title"><Link to="/Reporting/ThaiMedicineReports" className="stretched-link text-decoration-none text-dark">รายงานแพทย์แผนไทย</Link></h5>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-3 mb-3">
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center">
                                    <i className="bi bi-database-gear fs-1 text-primary mb-3"></i>
                                    <h5 className="card-title"><Link to="/Reporting/SelfQuery" className="stretched-link text-decoration-none text-dark">Query ข้อมูลเอง</Link></h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* General Reports */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <h3 className="border-bottom pb-2 mb-3">รายงานทั่วไป</h3>
                        </div>

                        {/* Medical Records */}
                        <div className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 border-primary">
                                <div className="card-header bg-primary text-white">
                                    <i className="bi bi-journal-medical me-2"></i> เวชระเบียน
                                </div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รายงานผู้ป่วย</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รายงานผู้ป่วยในปีงบประมาณ</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รายงานผู้ป่วยตามช่วงอายุ</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">จำนวนผู้ป่วยในแยกสิทธ์ คน/วันนอน</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">สรุปจำนวนวันนอนผู้ป่วยแยกหอผู้ชาย</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">10 อันดับโรค</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">สถิติผู้รับบิรการแยกราย PCT</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ระบบ Refer กับ OPD แยกตามหน่วยบริการ</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ข้อมูลผู้ป่วยประจำเดือน...</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ผู้ป่วยแยกตามโรค</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ผู้ป่วยผ่าตัด</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รายงานยอดผู้ป่วยเขตอำเภอเมือง</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รายงาน OPD Card</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Outpatient */}
                        <div className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 border-success">
                                <div className="card-header bg-success text-white">
                                    <i className="bi bi-people me-2"></i> ผู้ป่วยนอก
                                </div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ผู้ป่วยแยกตามสิทธ์</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ผู้ป่วยแยกตามสิทธ์ตามแผนก</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">อันดับโรค</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">สรุปยอดผู้ป่วยตามห้องตรวจ</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">หัตถการ</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">การให้บริการของโรงพยาบาล</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ผู้ป่วยมารับบริการห้องตรวจ</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รายงานสรุปยอดผู้ป่วยที่มารับบริการ</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ใบแจ้งยอดตรวจผู้ป่วยนอก</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ทะเบียนผู้รับบริการห้องตรวจแผนกผู้ป่วยนอก</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รายงานการฉีดวัคซีน</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รายงานข้ออมูลผู้ป่วยเบาหวานและความดันโลหิตสูง</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Inpatient */}
                        <div className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 border-info">
                                <div className="card-header bg-info text-white">
                                    <i className="bi bi-hospital me-2"></i> ผู้ป่วยใน
                                </div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ผู้ป่วยแยกตามสิทธ์</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">ผู้ป่วยแยกตามสิทธ์ตามแผนก</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">อันดับโรค</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">รวมวันนอนผู้ป่วย</a></li>
                                    <li className="list-group-item"><a href="#" className="text-decoration-none">Word Admit</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Other General Reports */}
                        <div className="col-12 mt-3">
                            <div className="card border-secondary">
                                <div className="card-header bg-secondary text-white">
                                    <i className="bi bi-list-check me-2"></i> รายงานอื่นๆ
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">ผู้ป่วยไม่มาตามนัด</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงาน 505</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">ตารางสรุปกิจกรรมสำคัญ รง.5</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">ประวัติการฉีดยา</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">สรุปยอดผู้ป่วยในตึก</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายางานการผ่าตัด OR</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานการฝากครรภ์</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานทะเบียนผู้รับบริการ DM,HT</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานวางสาย</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">ผู้ป่วยมารับบริการที่ รพ.สน.</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานการสั่งอาหาร</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานผู้ป่วยทำหมัน</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานค่ารักษาผู้ป่วย รพ.สน.</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">สรุปค่าบริการในการรักษาพยาบาล</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">ข้อมูลผู้ป่วยจ่าย 30 บาท</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานการรับเงิน 30 บาท</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">ทะเบียนผู้ป่วย Palliative</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานทะเบียนผู้ป่วยระยะสุดท้าย</a></div>
                                        <div className="col-md-4 mb-2"><a href="#" className="text-decoration-none">รายงานข้อมูลผู้ป่วยโรคเบาหวาน</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Surveillance */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <h3 className="border-bottom pb-2 mb-3">Surveillance</h3>
                        </div>
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <a href="#" className="d-flex align-items-center p-3 border rounded text-decoration-none hover-bg-light">
                                                <i className="bi bi-activity fs-3 text-danger me-3"></i>
                                                <span className="fs-5 text-dark">ข้อมูลโรคเรื้อรัง</span>
                                            </a>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <a href="#" className="d-flex align-items-center p-3 border rounded text-decoration-none hover-bg-light">
                                                <i className="bi bi-exclamation-triangle fs-3 text-warning me-3"></i>
                                                <span className="fs-5 text-dark">ข้อมูลการบาดเจ็บจาก 19 สาเหตุ</span>
                                            </a>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <a href="#" className="d-flex align-items-center p-3 border rounded text-decoration-none hover-bg-light">
                                                <i className="bi bi-clipboard-x fs-3 text-secondary me-3"></i>
                                                <span className="fs-5 text-dark">ผู้ป่วยเบาหวานที่ยังไม่ได้ขึ้นทะเบียนโรคเรื้อรัง</span>
                                            </a>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <a href="#" className="d-flex align-items-center p-3 border rounded text-decoration-none hover-bg-light">
                                                <i className="bi bi-clipboard-minus fs-3 text-secondary me-3"></i>
                                                <span className="fs-5 text-dark">ผู้ป่วยความดันที่ยังไม่ได้ขึ้นทะเบียนโรคเรื้อรัง</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
};

export default Frmreporting;
