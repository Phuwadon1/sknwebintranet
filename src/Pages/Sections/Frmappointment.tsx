import React, { useState } from 'react';

const departmentsData = [
    { id: 'med', name: 'แผนกอายุรกรรม (Internal Medicine)' },
    { id: 'surg', name: 'แผนกศัลยกรรม (Surgery)' },
    { id: 'ped', name: 'แผนกกุมารเวชกรรม (Pediatrics)' },
    { id: 'obgyn', name: 'แผนกสูตินารีเวช (Obstetrics & Gynecology)' },
    { id: 'ortho', name: 'แผนกศัลยกรรมกระดูกและข้อ (Orthopedics)' },
    { id: 'ent', name: 'แผนกหู คอ จมูก (ENT)' },
    { id: 'eye', name: 'แผนกจักษุ (Ophthalmology)' },
    { id: 'psy', name: 'แผนกจิตเวช (Psychiatry)' },
    { id: 'dent', name: 'แผนกทันตกรรม (Dentistry)' },
    { id: 'skin', name: 'แผนกผิวหนัง (Dermatology)' },
    { id: 'rehab', name: 'แผนกกายภาพบำบัด (Physical Therapy)' },
    { id: 'checkup', name: 'ศูนย์ตรวจสุขภาพ (Check-up Center)' },
];

const doctorsData: { [key: string]: { id: string; name: string }[] } = {
    'med': [
        { id: 'med1', name: 'นพ. สมชาย ใจดี' },
        { id: 'med2', name: 'พญ. สมหญิง รักษา' },
        { id: 'med3', name: 'นพ. วิชัย เก่งมาก' },
        { id: 'med4', name: 'พญ. นิตยา สุขภาพ' },
    ],
    'surg': [
        { id: 'surg1', name: 'นพ. กล้าหาญ ชาญชัย' },
        { id: 'surg2', name: 'พญ. ปราณี มีเมตตา' },
        { id: 'surg3', name: 'นพ. องอาจ ผ่าตัด' },
    ],
    'ped': [
        { id: 'ped1', name: 'พญ. ใจดี รักเด็ก' },
        { id: 'ped2', name: 'นพ. อ่อนโยน ดูแล' },
        { id: 'ped3', name: 'พญ. สดใส วัยเยาว์' },
    ],
    'obgyn': [
        { id: 'obgyn1', name: 'พญ. มารดา ห่วงใย' },
        { id: 'obgyn2', name: 'นพ. กำเนิด บุตร' },
    ],
    'ortho': [
        { id: 'ortho1', name: 'นพ. กระดูก แข็งแรง' },
        { id: 'ortho2', name: 'นพ. ข้อต่อ เคลื่อนไหว' },
    ],
    'ent': [
        { id: 'ent1', name: 'พญ. เสียงใส ได้ยิน' },
        { id: 'ent2', name: 'นพ. จมูก โล่ง' },
    ],
    'eye': [
        { id: 'eye1', name: 'พญ. ตาหวาน มองเห็น' },
        { id: 'eye2', name: 'นพ. สายตา คมชัด' },
    ],
    'psy': [
        { id: 'psy1', name: 'นพ. สบายใจ ไร้กังวล' },
        { id: 'psy2', name: 'พญ. รับฟัง เข้าใจ' },
    ],
    'dent': [
        { id: 'dent1', name: 'ทพ. ฟันสวย ยิ้มใส' },
        { id: 'dent2', name: 'ทพญ. เหงือก ดี' },
    ],
    'skin': [
        { id: 'skin1', name: 'พญ. ผิวสวย หน้าใส' },
        { id: 'skin2', name: 'นพ. ไร้สิว ผิวเนียน' },
    ],
    'rehab': [
        { id: 'rehab1', name: 'กภ. ยืดเหยียด ผ่อนคลาย' },
        { id: 'rehab2', name: 'กภ. ฟื้นฟู ร่างกาย' },
    ],
    'checkup': [
        { id: 'checkup1', name: 'นพ. ตรวจ ครบถ้วน' },
        { id: 'checkup2', name: 'พญ. สุขภาพ ดีเยี่ยม' },
    ],
};

const Frmappointment = () => {
    const [selectedDept, setSelectedDept] = useState('');
    const [availableDoctors, setAvailableDoctors] = useState<{ id: string; name: string }[]>([]);

    const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deptId = e.target.value;
        setSelectedDept(deptId);
        setAvailableDoctors(doctorsData[deptId] || []);
    };

    return (
        <section id="appointment" className="appointment section">
            <div className="container section-title" data-aos="fade-up">
                <h2>นัดหมายแพทย์</h2>
                <p>กรุณากรอกข้อมูลเพื่อทำการนัดหมายแพทย์ล่วงหน้า ทางโรงพยาบาลจะติดต่อกลับเพื่อยืนยันการนัดหมาย</p>
            </div>

            <div className="container" data-aos="fade-up" data-aos-delay={100}>
                <form action="#" method="post" role="form" className="php-email-form">
                    <div className="row">
                        <div className="col-md-4 form-group">
                            <label htmlFor="name" className="form-label text-muted small">ชื่อ-นามสกุล</label>
                            <input type="text" name="name" className="form-control" id="name" placeholder="ระบุชื่อ-นามสกุล" required />
                        </div>
                        <div className="col-md-4 form-group mt-3 mt-md-0">
                            <label htmlFor="email" className="form-label text-muted small">อีเมล</label>
                            <input type="email" className="form-control" name="email" id="email" placeholder="ระบุอีเมล" required />
                        </div>
                        <div className="col-md-4 form-group mt-3 mt-md-0">
                            <label htmlFor="phone" className="form-label text-muted small">เบอร์โทรศัพท์</label>
                            <input type="tel" className="form-control" name="phone" id="phone" placeholder="ระบุเบอร์โทรศัพท์" required />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 form-group mt-3">
                            <label htmlFor="date" className="form-label text-muted small">วันที่ต้องการนัดหมาย</label>
                            <input type="datetime-local" name="date" className="form-control datepicker" id="date" required />
                        </div>
                        <div className="col-md-4 form-group mt-3">
                            <label htmlFor="department" className="form-label text-muted small">แผนกที่ต้องการตรวจ</label>
                            <select
                                name="department"
                                id="department"
                                className="form-select"
                                required
                                value={selectedDept}
                                onChange={handleDeptChange}
                            >
                                <option value="">-- เลือกแผนก --</option>
                                {departmentsData.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4 form-group mt-3">
                            <label htmlFor="doctor" className="form-label text-muted small">แพทย์ที่ต้องการพบ</label>
                            <select
                                name="doctor"
                                id="doctor"
                                className="form-select"
                                required
                                disabled={!selectedDept}
                            >
                                <option value="">{selectedDept ? '-- เลือกแพทย์ --' : '-- กรุณาเลือกแผนกก่อน --'}</option>
                                {availableDoctors.map(doc => (
                                    <option key={doc.id} value={doc.name}>{doc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group mt-3">
                        <label htmlFor="message" className="form-label text-muted small">อาการเบื้องต้น / ข้อความเพิ่มเติม</label>
                        <textarea className="form-control" name="message" id="message" rows={5} placeholder="ระบุอาการเบื้องต้น หรือข้อความที่ต้องการแจ้งให้ทราบ (ถ้ามี)" defaultValue={""} />
                    </div>
                    <div className="mt-3">
                        <div className="loading">กำลังโหลด</div>
                        <div className="error-message" />
                        <div className="sent-message">คำขอนัดหมายของคุณถูกส่งเรียบร้อยแล้ว ขอบคุณครับ!</div>
                        <div className="text-center"><button type="submit">ทำการนัดหมาย</button></div>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Frmappointment;
