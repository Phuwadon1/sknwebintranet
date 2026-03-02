import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Frmheader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [mobileNavActive, setMobileNavActive] = useState(false);
  const [activeLink, setActiveLink] = useState('hero');

  const toggleMobileNav = () => {
    setMobileNavActive(!mobileNavActive);
    document.body.classList.toggle("mobile-nav-active");
  };

  const handleSetActive = (link: string) => {
    setActiveLink(link);
    if (mobileNavActive) {
      setMobileNavActive(false);
      document.body.classList.remove("mobile-nav-active");
    }
  };

  const headerRef = useRef<HTMLElement | null>(null);

  // Check for logged in user on mount and route change
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload(); // Refresh page to clear admin UI
  };

  // Handle initial hash scrolling and active link on mount/location change
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        setActiveLink(location.hash.replace('#', ''));
      }
    } else if (location.pathname.startsWith('/Reporting')) {
      setActiveLink('reporting');
    } else if (location.pathname === '/Contact') {
      setActiveLink('contact');
      window.scrollTo(0, 0);
    } else {
      setActiveLink('hero');
      window.scrollTo(0, 0);
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      if (window.scrollY > 100) {
        document.body.classList.add('scrolled');
        headerRef.current.classList.add("header-scrolled");
      } else {
        document.body.classList.remove('scrolled');
        headerRef.current.classList.remove("header-scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Only run scroll spy on the main page where these sections exist
    if (location.pathname !== '/') return;

    const handleScrollSpy = () => {
      const sections = ['hero', 'services', 'doctors', 'about', 'departments', 'contact'];
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveLink(sectionId);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [location.pathname]);

  return (
    <header id="header" className="header" ref={headerRef}>
      <div className="topbar d-flex align-items-center">
        <div className="container d-flex justify-content-center justify-content-md-between">
          <div className="contact-info d-flex align-items-center">
            <i className="bi bi-envelope d-flex align-items-center"><a href="#">กลุ่มงานเทคโนโลยีสารสนเทศ</a></i>
            <i className="bi bi-phone d-flex align-items-center ms-4"><span>8715, 8716, 8719, 8741</span></i>
          </div>
          <div className="social-links d-none d-md-flex align-items-center">
            <a href="#" className="twitter"><i className="bi bi-twitter-x" /></a>
            <a href="#" className="facebook"><i className="bi bi-facebook" /></a>
            <a href="#" className="instagram"><i className="bi bi-instagram" /></a>
            <a href="#" className="linkedin"><i className="bi bi-linkedin" /></a>
          </div>
        </div>
      </div>

      <div className="branding d-flex align-items-center">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <a href="#" className="logo d-flex align-items-center me-auto">
            <h1 className="sitename">SKNINTRANET</h1>
          </a>
          <nav id="navmenu" className="navmenu">
            <ul>
              <li><Link to="/" className={activeLink === 'hero' ? 'active' : ''} onClick={() => { handleSetActive('hero'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>หน้าหลัก</Link></li>
              <li><Link to="/#services" className={activeLink === 'services' ? 'active' : ''} onClick={() => handleSetActive('services')}>บริการ</Link></li>
              <li><Link to="/#doctors" className={activeLink === 'doctors' ? 'active' : ''} onClick={() => handleSetActive('doctors')}>ตารางเวรแพทย์</Link></li>
              <li><Link to="/#about" className={activeLink === 'about' ? 'active' : ''} onClick={() => handleSetActive('about')}>แนะนำศูนย์ IT</Link></li>
              <li><Link to="/#departments" className={activeLink === 'departments' ? 'active' : ''} onClick={() => handleSetActive('departments')}>เบอร์โทรภายใน</Link></li>

              <li className="dropdown"><a href="#"><span>รายงานต่างๆ</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                <ul>
                  <li className="dropdown"><a href="#"><span>เกี่ยวกับโปรแกรม HMS</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                    <ul>
                      <li><a href="#">แนะนำโปรแกรม</a></li>
                      <li><a href="#">แนะนำการใช้งานระบบ HMS</a></li>
                      <li><a href="#">แนะนำศูนย์คอมพิวเตอร์</a></li>
                      <li><a href="#">Web master</a></li>
                    </ul>
                  </li>
                  <li className="dropdown"><a href="#"><span>กราฟแสดงข้อมูล</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                    <ul>
                      <li><Link to="/PatientGraph?type=annual">กราฟแสดงข้อมูลผู้ป่วยประจำปี</Link></li>
                      <li><Link to="/PatientGraph?type=doctor">กราฟแสดงข้อมูลผู้ป่วยรายแพทย์</Link></li>
                      <li><Link to="/PatientGraph?type=department">กราฟแสดงข้อมูลผู้ป่วยตามแผนก</Link></li>
                    </ul>
                  </li>
                  <li className="dropdown"><a href="#"><span>ข้อมูลทั่วไป</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                    <ul>
                      <li><Link to="/StressManagement">คิดอย่างไรไม่ให้เครียด</Link></li>
                      <li><Link to="/StressRelief">เทคนิคคลายเครียด</Link></li>
                      <li><Link to="/ComputerBuyingGuide">การเลือกซื้อคอมพิวเตอร์ชุด</Link></li>
                      <li><Link to="/IE7Install">วิธีการติดตั้ง IE7</Link></li>
                      <li><Link to="/HMSManual">คู่มือการใช้โปรแกรม HMS</Link></li>
                      <li><Link to="/OrganizationalStructure">โครงสร้างบริหาร</Link></li>
                      <li><a href="/Webintranetskn/downloads/resignation_form.pdf" download="แบบหนังสือขอลาออกจากราชการ.pdf" target="_blank" rel="noopener noreferrer">ขอรับและยื่นแบบหนังสือขอลา<br />ออกจากราชการตามมาตรการฯ</a></li>
                    </ul>
                  </li>
                  <li className="dropdown"><a href="#"><span>System</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                    <ul>
                      <li><a href="#" onClick={(e) => { e.preventDefault(); if (!user) { navigate('/Login'); } else { navigate('/Mortuary'); } }}>ระบบเก็บรักษาศพ</a></li>
                      <li><a href="#" onClick={(e) => { e.preventDefault(); if (!user) { navigate('/Login'); } else { navigate('/Nursing'); } }}>ฝ่ายการพยาบาล</a></li>
                      <li><a href="#" onClick={(e) => { e.preventDefault(); if (!user) { navigate('/Login'); } else { navigate('/Hemodialysis'); } }}>ไตเทียม</a></li>
                      <li><a href="#" onClick={(e) => { e.preventDefault(); if (!user) { navigate('/Login'); } else { navigate('/Storage'); } }}>โปรแกรมจัดเก็บ</a></li>
                    </ul>
                  </li>
                  <li className="dropdown"><a href="#"><span>Video File</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                    <ul>
                      <li><a href="#">ดูงานโปรแกรม Hos XP</a></li>
                      <li><a href="#">ระบบ HMS</a></li>
                      <li><a href="#">VDO ให้คำปรึกษาบำบัดทดแทนไต</a></li>
                      <li><a href="#">การกำจัดขยะหกตกแตก เคมีบำบัด</a></li>
                      <li><a href="#">สรุปผลการประเมินระบบสารสนเทศ</a></li>
                    </ul>
                  </li>
                  <li className="dropdown"><a href="#"><span>ภาพกิจกรรม</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                    <ul>
                      <li><Link to="/Activity/AssessmentSummary">สรุปผลการประเมินระบบสารสนเทศและข้อเสนอแนะ</Link></li>
                      <li><Link to="/Activity/SystemTest">ทดสอบระบบ</Link></li>
                      <li><Link to="/Activity/PublicHealthSports20">กีฬาสาธารณสุข ครั้งที่20</Link></li>
                      <li><Link to="/Activity/SKNColorSports2553">กีฬาสี รพ.สน. 2553</Link></li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li><Link to="/Reporting" className={activeLink === 'reporting' ? 'active' : ''} onClick={() => handleSetActive('reporting')}>ระบบรายงาน</Link></li>
              <li><Link to="/#contact" className={activeLink === 'contact' ? 'active' : ''} onClick={() => handleSetActive('contact')}>ติดต่อเรา</Link></li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list" onClick={toggleMobileNav} />
          </nav>
          {user ? (
            <div className="d-flex align-items-center ms-4" style={{ gap: '40px' }}>

              <button
                onClick={handleLogout}
                className="cta-btn d-none d-sm-block border-0 bg-danger text-white"
                style={{ cursor: 'pointer', padding: '8px 20px' }}
              >
                <i className="fas fa-sign-out-alt me-1" /> Logout
              </button>

              <div className="d-flex flex-column align-items-start d-none d-md-block" style={{ lineHeight: '1.2' }}>
                <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                  {user.Fname || user.fname || user.Username || 'User'}
                </span>
              </div>

            </div>
          ) : (
            <Link className="cta-btn d-none d-sm-block" to="/Login"><i className="fas fa-key" /> Login</Link>
          )}
        </div>
      </div>
    </header>

  )
}

export default Frmheader