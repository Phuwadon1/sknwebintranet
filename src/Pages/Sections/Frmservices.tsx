import React from 'react';
import { Link } from 'react-router-dom';
import FrmBannerLinks from '../../Components/FrmBannerLinks';
import FrmChiefProfile from '../../Components/FrmChiefProfile';

const Frmservices = () => {
    const services = [
        {
            icon: "fa-solid fa-file-signature",
            title: "ตรวจสอบสิทธิ / นัดหมาย",
            description: "ตรวจสอบสิทธิการรักษาพยาบาลและตารางนัดหมายของคุณได้ด้วยตนเอง",
            link: "/CheckRights"
        },
        {
            icon: "fa-solid fa-clock",
            title: "ตรวจสอบสถานะคิว",
            description: "เช็คสถานะคิวการรักษาได้แบบเรียลไทม์ ลดเวลาการรอคอย",
            link: "/QueueStatus"
        },
        {
            icon: "fa-solid fa-user-doctor",
            title: "ตารางแพทย์ออกตรวจ",
            description: "ตรวจสอบตารางเวลาการออกตรวจของแพทย์เฉพาะทางแต่ละสาขา",
            link: "/DoctorSchedule"
        },
        {
            icon: "fa-solid fa-comments",
            title: "รับเรื่องร้องเรียน / ข้อเสนอแนะ",
            description: "แจ้งเรื่องร้องเรียน หรือเสนอแนะเพื่อการพัฒนาการให้บริการ",
            link: "/Complaint"
        },
        {
            icon: "fa-solid fa-hand-holding-heart",
            title: "บริจาค",
            description: "ร่วมสมทบทุนจัดซื้อครุภัณฑ์ทางการแพทย์ เพื่อพัฒนาศักยภาพการรักษา",
            link: "/Donation"
        },
        {
            icon: "fa-solid fa-book-medical",
            title: "คลังความรู้สุขภาพ",
            description: "รวบรวมบทความวิชาการ คู่มือการทำงาน และเกร็ดความรู้สุขภาพที่น่าสนใจ",
            link: "/HealthKnowledge"
        }
    ];

    return (
        <section id="services" className="services section light-background">
            <div className="container section-title" data-aos="fade-up">
                <h2>บริการของเรา</h2>
                <p>โรงพยาบาลสกลนครมุ่งมั่นให้บริการด้วยเทคโนโลยีที่ทันสมัยและใส่ใจในทุกรายละเอียด</p>
            </div>

            <style>
                {`
                    @media (min-width: 992px) {
                        .sidebar-pull-up {
                            margin-top: -140px; /* Pull up to align with header */
                        }
                    }
                `}
            </style>
            <div className="container">
                <div className="row">
                    <div className="col-lg-9">
                        <div className="row gy-4">
                            {services.map((service, index) => (
                                <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={(index + 1) * 100} key={index}>
                                    <div className="service-item position-relative">
                                        <div className="icon">
                                            <i className={service.icon} />
                                        </div>
                                        {service.link.startsWith('/#') ? (
                                            <a href={service.link.substring(1)} className="stretched-link">
                                                <h3>{service.title}</h3>
                                            </a>
                                        ) : (
                                            <Link to={service.link} className="stretched-link">
                                                <h3>{service.title}</h3>
                                            </Link>
                                        )}
                                        <p>{service.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-lg-3 sidebar-pull-up" data-aos="fade-up" data-aos-delay={200} style={{ zIndex: 10 }}>
                        <FrmChiefProfile />
                        <h3 className="mb-4 fw-bold text-success" style={{ fontSize: '1.75rem' }}><i className="bi bi-link-45deg me-2"></i>ลิงก์ที่เกี่ยวข้อง</h3>
                        <FrmBannerLinks />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Frmservices;
