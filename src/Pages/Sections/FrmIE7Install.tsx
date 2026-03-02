import React from 'react';

const FrmIE7Install = () => {
    return (
        <section id="ie7-install" className="ie7-install section standard-page-content">
            {/* Header Section */}
            <div className="text-center mb-16">
                <h1 className="fw-bold mb-6 py-2">
                    วิธีการติดตั้ง IE7
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-teal-500 mx-auto rounded-full" style={{ background: '#1977cc' }}></div>
            </div>

            <div className="container">
                <div className="card shadow-sm border-0">
                    <div className="card-body p-4">
                        <div className="mb-5">
                            <h4 className="fw-bold mb-3">ขั้นตอนการติดตั้ง</h4>

                            <div className="step-item mb-5">
                                <p className="fs-5 mb-3">1. ดับเบิลคลิกที่ไฟล์ <span className="text-primary fw-bold">IE7-WindowsXP-x86-enu.exe</span> ที่ได้ทำการดาวน์โหลดมา</p>
                                <div className="text-center">
                                    <img src="/Webintranetskn/images/ie7/ie7_01.png" alt="Step 1" className="img-fluid rounded shadow-sm border" style={{ maxWidth: '600px' }} />
                                </div>
                            </div>

                            <div className="step-item mb-5">
                                <p className="fs-5 mb-3">2. เมื่อทำการคลิกที่ไฟล์ IE7-WindowsXP-x86-enu.exe แล้วจะขึ้นหน้าต่างใหม่ขึ้นมาเลวให้คลิก <span className="fw-bold">Run</span></p>
                                <div className="text-center">
                                    <img src="/Webintranetskn/images/ie7/ie7_02.png" alt="Step 2" className="img-fluid rounded shadow-sm border" style={{ maxWidth: '600px' }} />
                                </div>
                            </div>

                            <div className="step-item mb-5">
                                <p className="fs-5 mb-3">3. เมื่อเปิดโปรแกรมติดตั้ง จะพบหน้าต้อนรับ Welcome to Windows Internet Explorer 7 คลิกที่ปุ่ม <span className="fw-bold">"Next &gt;"</span> เพื่อเริ่มการติดตั้งโปรแกรม</p>
                                <div className="text-center">
                                    <img src="/Webintranetskn/images/ie7/ie7_03.png" alt="Step 3" className="img-fluid rounded shadow-sm border" style={{ maxWidth: '600px' }} />
                                </div>
                            </div>

                            <div className="step-item mb-5">
                                <p className="fs-5 mb-3">4. ก่อนการติดตั้ง จะมีข้อความเกี่ยวกับ license terms เมื่อเราอ่าน และยอมรับเงื่อนไขดังกล่าวแล้ว คลิกปุ่ม <span className="fw-bold">"I Accept"</span></p>
                                <div className="text-center">
                                    <img src="/Webintranetskn/images/ie7/ie7_04.png" alt="Step 4" className="img-fluid rounded shadow-sm border" style={{ maxWidth: '600px' }} />
                                </div>
                            </div>

                            <div className="step-item mb-5">
                                <p className="fs-5 mb-3">5. โปรแกรมจะถามอีกครั้งเกี่ยวกับการตั้งค่าการอัพเดทโปรแกรมแบบอัตโนมัติ หากไม่ต้องการ เราสามารถกำหนดได้ว่าไม่ต้องอัพเดท จากนั้นคลิกปุ่ม <span className="fw-bold">"Next &gt;"</span></p>
                                <div className="text-center">
                                    <img src="/Webintranetskn/images/ie7/ie7_05.png" alt="Step 5" className="img-fluid rounded shadow-sm border" style={{ maxWidth: '600px' }} />
                                </div>
                            </div>

                            <div className="step-item mb-5">
                                <p className="fs-5 mb-3">6. โปรแกรมติดตั้งจะทำการติดตั้งโปรแกรม Internet Explorer 7 เข้าไปแทนที่ IE 6</p>
                                <div className="text-center">
                                    <img src="/Webintranetskn/images/ie7/ie7_06.png" alt="Step 6" className="img-fluid rounded shadow-sm border" style={{ maxWidth: '600px' }} />
                                </div>
                            </div>

                            <div className="step-item mb-5">
                                <p className="fs-5 mb-3">7. หลังจากติดตั้งเรียบร้อย จะต้องทำการ Restart เครื่องเพื่อพร้อมทำงาน คลิกที่ปุ่ม <span className="fw-bold">"Restart Now (Recommended)"</span></p>
                                <div className="text-center">
                                    <img src="/Webintranetskn/images/ie7/ie7_07.png" alt="Step 7" className="img-fluid rounded shadow-sm border" style={{ maxWidth: '600px' }} />
                                </div>
                            </div>

                            <div className="step-item mb-5">
                                <p className="fs-5 mb-3">8. หลังจาก Restart เรียบร้อย เราก็จะได้โปรแกรมสำหรับเปิดดูเว็บไซต์ Internet Explorer 7 ที่ใหม่และดีกว่า IE 6</p>
                                <div className="text-center">
                                    <img src="/Webintranetskn/images/ie7/ie7_08.png" alt="Step 8" className="img-fluid rounded shadow-sm border" style={{ maxWidth: '600px' }} />
                                </div>
                            </div>
                        </div>

                        <div className="border-top pt-3 text-muted">
                            <i className="fas fa-user-edit me-2"></i> ผู้เพิ่มรายการ : นายสกล อุ่มจันสา
                            <span className="mx-2">|</span>
                            <i className="far fa-calendar-alt me-2"></i> วันที่ : 13/12/2010 : 12:04:35
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FrmIE7Install;
