import { Link } from 'react-router-dom';

const Frmheader = () => {
  return (
    <header id="header" className="header sticky-top">
      {/* ... topbar ... */}
      <div className="branding d-flex align-items-center">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <a href="index.html" className="logo d-flex align-items-center me-auto">
            <h1 className="sitename">SKN Admin</h1>
          </a>
          <nav id="navmenu" className="navmenu">
            <ul>
              <li><Link to="/Admin">หน้าหลัก</Link></li>
              <li><Link to="/Admin/Chat" className="text-primary fw-bold">ระบบตอบแชท</Link></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Services</a></li>
              <li><Link to="/Admin/ManageDepartments">Departments</Link></li>
              <li><a href="#doctors">Doctors</a></li>
              <li className="dropdown"><a href="#"><span>Dropdown</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                <ul>
                  <li><a href="#">Dropdown 1</a></li>
                  <li className="dropdown"><a href="#"><span>Deep Dropdown</span> <i className="bi bi-chevron-down toggle-dropdown" /></a>
                    <ul>
                      <li><a href="#">Deep Dropdown 1</a></li>
                      <li><a href="#">Deep Dropdown 2</a></li>
                      <li><a href="#">Deep Dropdown 3</a></li>
                      <li><a href="#">Deep Dropdown 4</a></li>
                      <li><a href="#">Deep Dropdown 5</a></li>
                    </ul>
                  </li>
                  <li><a href="#">Dropdown 2</a></li>
                  <li><a href="#">Dropdown 3</a></li>
                  <li><a href="#">Dropdown 4</a></li>
                </ul>
              </li>
              <li><a href="#contact">Contact</a></li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list" />
          </nav>
          <a className="cta-btn d-none d-sm-block" href="#appointment">Make an Appointment</a>
        </div>
      </div>
    </header>

  )
}

export default Frmheader