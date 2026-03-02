import React, { useState, useEffect } from 'react';
import testimonialImg1 from '../../assets/img/testimonials/testimonials-1.jpg';
import testimonialImg2 from '../../assets/img/testimonials/testimonials-2.jpg';
import testimonialImg3 from '../../assets/img/testimonials/testimonials-3.jpg';
import testimonialImg4 from '../../assets/img/testimonials/testimonials-4.jpg';
import testimonialImg5 from '../../assets/img/testimonials/testimonials-5.jpg';

const Frmtestimonials = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const testimonials = [
        {
            name: "คุณสมชาย ใจดี",
            role: "ผู้รับบริการ",
            quote: "ประทับใจการบริการของแพทย์และพยาบาลมากครับ ให้คำแนะนำดีและดูแลเอาใจใส่ผู้ป่วยเป็นอย่างดี",
            image: testimonialImg1
        },
        {
            name: "คุณวิภาดา รักษา",
            role: "ผู้ป่วยใน",
            quote: "สถานที่สะอาด ห้องพักสะดวกสบาย เครื่องมือทันสมัย ทำให้รู้สึกอุ่นใจเมื่อมารักษาที่นี่ค่ะ",
            image: testimonialImg2
        },
        {
            name: "คุณประวิทย์ มั่นคง",
            role: "ญาติผู้ป่วย",
            quote: "ระบบการจัดการดีมากครับ รอคิวไม่นาน เจ้าหน้าที่ยิ้มแย้มแจ่มใส เต็มใจให้บริการ",
            image: testimonialImg3
        },
        {
            name: "คุณสุดาพร เจริญ",
            role: "ผู้รับบริการคลินิกพิเศษ",
            quote: "คุณหมอเก่งมากค่ะ วินิจฉัยโรคแม่นยำ รักษาหายไว ขอบคุณทีมงานทุกคนนะคะ",
            image: testimonialImg4
        },
        {
            name: "คุณกิตติศักดิ์ ภูมิใจ",
            role: "ผู้รับบริการตรวจสุขภาพ",
            quote: "มาตรวจสุขภาพประจำปีที่นี่ทุกปีครับ บริการรวดเร็ว ผลตรวจละเอียด เข้าใจง่าย",
            image: testimonialImg5
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current === testimonials.length - 1 ? 0 : current + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const handleDotClick = (index: number) => {
        setActiveIndex(index);
    };

    return (
        <section id="testimonials" className="testimonials section">
            <div className="container" data-aos="fade-up" data-aos-delay={100}>
                <div className="row gy-4">
                    <div className="col-lg-5">
                        <div className="section-title" data-aos="fade-up">
                            <h2>Testimonials</h2>
                            <p>ความประทับใจจากผู้รับบริการโรงพยาบาลสกลนคร</p>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="testimonial-slider">
                            <div className="testimonial-item">
                                <div className="d-flex align-items-center mb-3">
                                    <img src={testimonials[activeIndex].image} className="testimonial-img flex-shrink-0" alt="" style={{ width: '90px', height: '90px', borderRadius: '50%', marginRight: '20px', objectFit: 'cover' }} />
                                    <div>
                                        <h3>{testimonials[activeIndex].name}</h3>
                                        <h4>{testimonials[activeIndex].role}</h4>
                                        <div className="stars">
                                            <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                                        </div>
                                    </div>
                                </div>
                                <p>
                                    <i className="bi bi-quote quote-icon-left"></i>
                                    <span>{testimonials[activeIndex].quote}</span>
                                    <i className="bi bi-quote quote-icon-right"></i>
                                </p>
                            </div>
                            <div className="swiper-pagination">
                                {testimonials.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`swiper-pagination-bullet ${index === activeIndex ? 'swiper-pagination-bullet-active' : ''}`}
                                        onClick={() => handleDotClick(index)}
                                    ></span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Frmtestimonials;
