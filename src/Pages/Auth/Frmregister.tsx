import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Frmregister = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [titleID, setTitleID] = useState('1'); // Default to 1 (นาย)
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [tel, setTel] = useState('');
    const [position, setPosition] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, fname, lname, tel, position, titleID }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ (Registration Successful)');
                navigate('/Login');
            } else {
                toast.error(data.message || 'ลงทะเบียนไม่สำเร็จ (Registration Failed)');
            }
        } catch (error) {
            console.error('Register Error:', error);
            toast.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (Connection Error)');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="register" className="login section">
            <div className="container" data-aos="fade-up">
                <div className="section-title">
                    <h2>ลงทะเบียน</h2>
                    <p>Register for SKNINTRANET</p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-5">
                                <form onSubmit={handleRegister}>
                                    <div className="mb-3">
                                        <label htmlFor="titleID" className="form-label text-muted">คำนำหน้า (Title)</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light text-primary"><i className="fas fa-user-tag"></i></span>
                                            <select
                                                className="form-select border-0 bg-light"
                                                id="titleID"
                                                style={{ height: '45px' }}
                                                value={titleID}
                                                onChange={(e) => setTitleID(e.target.value)}
                                            >
                                                <option value="1">นาย (Mr.)</option>
                                                <option value="2">นางสาว (Miss)</option>
                                                <option value="3">นาง (Mrs.)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="fname" className="form-label text-muted">ชื่อ (First Name)</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 bg-light text-primary"><i className="fas fa-user"></i></span>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-light"
                                                    id="fname"
                                                    placeholder="First Name"
                                                    style={{ height: '45px' }}
                                                    value={fname}
                                                    onChange={(e) => setFname(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="lname" className="form-label text-muted">นามสกุล (Last Name)</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 bg-light text-primary"><i className="fas fa-user"></i></span>
                                                <input
                                                    type="text"
                                                    className="form-control border-0 bg-light"
                                                    id="lname"
                                                    placeholder="Last Name"
                                                    style={{ height: '45px' }}
                                                    value={lname}
                                                    onChange={(e) => setLname(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="position" className="form-label text-muted">ตำแหน่ง (Position)</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light text-primary"><i className="fas fa-briefcase"></i></span>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                id="position"
                                                placeholder="Position"
                                                style={{ height: '45px' }}
                                                value={position}
                                                onChange={(e) => setPosition(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="tel" className="form-label text-muted">เบอร์โทร (Tel)</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light text-primary"><i className="fas fa-phone"></i></span>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                id="tel"
                                                placeholder="Telephone Number"
                                                style={{ height: '45px' }}
                                                value={tel}
                                                onChange={(e) => setTel(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label text-muted">ชื่อผู้ใช้งาน (Username)</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light text-primary"><i className="fas fa-user"></i></span>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                id="username"
                                                placeholder="Choose a username"
                                                style={{ height: '45px' }}
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label text-muted">รหัสผ่าน (Password)</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light text-primary"><i className="fas fa-lock"></i></span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control border-0 bg-light"
                                                id="password"
                                                placeholder="Choose a password"
                                                style={{ height: '45px' }}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <span
                                                className="input-group-text border-0 bg-light text-muted"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="small">
                                            <span className="text-muted me-1">มีบัญชีอยู่แล้ว?</span>
                                            <Link to="/Login" className="text-primary text-decoration-none fw-bold">เข้าสู่ระบบ</Link>
                                        </div>
                                    </div>

                                    <div className="d-grid gap-2 mb-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg"
                                            disabled={isLoading}
                                            style={{
                                                background: '#1977cc',
                                                border: 'none',
                                                borderRadius: '50px',
                                                fontWeight: '600',
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน (REGISTER)'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Frmregister;
