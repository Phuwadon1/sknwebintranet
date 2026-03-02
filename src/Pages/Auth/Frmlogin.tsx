import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Frmlogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Load saved username and password if exists
        const savedUsername = localStorage.getItem('rememberedUsername');
        const savedPassword = localStorage.getItem('rememberedPassword');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
        if (savedPassword) {
            setPassword(savedPassword);
        }
    }, []);

    const handleRememberMeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Show warning when checking the box
            const result = await Swal.fire({
                title: 'คำเตือนด้านความปลอดภัย',
                html: 'การจดจำข้อมูลจะบันทึก<strong>ชื่อผู้ใช้และรหัสผ่าน</strong>ไว้ใน Browser<br/><br/>⚠️ <span class="text-danger">ไม่แนะนำให้ใช้ในเครื่องสาธารณะ</span><br/><br/>ควรใช้เฉพาะในเครื่องส่วนตัวเท่านั้น',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#1977cc',
                cancelButtonColor: '#d33',
                confirmButtonText: 'เข้าใจแล้ว ดำเนินการต่อ',
                cancelButtonText: 'ยกเลิก'
            });

            if (result.isConfirmed) {
                setRememberMe(true);
            }
        } else {
            setRememberMe(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(''); // Clear previous errors

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token); // Store Token

                // Handle Remember Me
                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', username);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberedPassword');
                }

                // Trigger auth state update
                window.dispatchEvent(new Event('auth-storage-change'));

                // Redirect to home or dashboard
                navigate('/');
            } else {
                // Display error message
                setErrorMessage(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            }
        } catch (error) {
            console.error('Login Error:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="login" className="login section">
            <div className="container" data-aos="fade-up">
                <div className="section-title">
                    <h2>เข้าสู่ระบบ</h2>
                    <p>Login to SKNINTRANET</p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-5">
                                <form onSubmit={handleLogin}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label text-muted">ชื่อผู้ใช้งาน (Username)</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 bg-light text-primary"><i className="fas fa-user"></i></span>
                                            <input
                                                type="text"
                                                className="form-control border-0 bg-light"
                                                id="username"
                                                placeholder="Enter your username"
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
                                                placeholder="Enter your password"
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
                                        {errorMessage && (
                                            <div className="text-danger small mt-2">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errorMessage}
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="rememberMe"
                                                checked={rememberMe}
                                                onChange={handleRememberMeChange}
                                            />
                                            <label className="form-check-label text-muted small" htmlFor="rememberMe">
                                                จดจำฉันไว้
                                            </label>
                                        </div>
                                        <div className="small">
                                            <span className="text-muted me-1">ยังไม่มีบัญชี?</span>
                                            <Link to="/Register" className="text-primary text-decoration-none fw-bold">ลงทะเบียน</Link>
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
                                            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (LOGIN)'}
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

export default Frmlogin;
