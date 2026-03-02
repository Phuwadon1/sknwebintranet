import React, { useState } from 'react';


const Frmfaq = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "โรงพยาบาลสกลนครตั้งอยู่ที่ไหน?",
            answer: "เลขที่ 1041 ถนนเจริญเมือง ตำบลธาตุเชิงชุม อำเภอเมืองสกลนคร จังหวัดสกลนคร 47000 (ติดกับหนองหาร)"
        },
        {
            question: "สามารถติดต่อโรงพยาบาลได้อย่างไร?",
            answer: "โทรศัพท์ 042-176000, 042-711615 หรือ 042-730419"
        },
        {
            question: "เปิดให้บริการเวลาใดบ้าง?",
            answer: "แผนกฉุกเฉินและผู้ป่วยในเปิดให้บริการตลอด 24 ชั่วโมง ทุกวัน สำหรับแผนกผู้ป่วยนอก (OPD) เปิดให้บริการตามเวลาราชการ 08.00 - 16.00 น."
        },
        {
            question: "มีบริการคลินิกพิเศษนอกเวลาหรือไม่?",
            answer: "มีบริการคลินิกพิเศษเฉพาะทางนอกเวลา (SMC) เพื่ออำนวยความสะดวกแก่ผู้ที่ไม่สามารถมาใช้บริการในเวลาราชการได้ กรุณาสอบถามตารางแพทย์ล่วงหน้า"
        },
        {
            question: "การนัดหมายแพทย์ต้องทำอย่างไร?",
            answer: "ท่านสามารถติดต่อแผนกเวชระเบียนหรือแผนกที่ต้องการตรวจเพื่อทำการนัดหมายล่วงหน้า หรือใช้บริการนัดหมายผ่านระบบออนไลน์ของโรงพยาบาล"
        }
    ];

    const toggleFaq = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section id="faq" className="faq section light-background">
            <div className="container section-title" data-aos="fade-up">
                <h2>คำถามที่พบบ่อย</h2>
                <p>รวบรวมคำถามที่ผู้รับบริการสอบถามเข้ามาบ่อยครั้ง</p>
            </div>

            <div className="container">
                <div className="row">
                    {/* FAQ Column */}
                    <div className="col-lg-12" data-aos="fade-up" data-aos-delay={100}>
                        <h3 className="mb-4 fw-bold text-primary"><i className="bi bi-question-circle-fill me-2"></i>คำถามที่พบบ่อย (FAQ)</h3>
                        <div className="faq-container">
                            {faqs.map((faq, index) => (
                                <div className={`faq-item ${activeIndex === index ? 'faq-active' : ''}`} key={index} onClick={() => toggleFaq(index)}>
                                    <h3>{faq.question}</h3>
                                    <div className="faq-content">
                                        <p>{faq.answer}</p>
                                    </div>
                                    <i className="faq-toggle bi bi-chevron-right"></i>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Frmfaq;

