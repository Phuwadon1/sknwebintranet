import React from 'react'

const Frmfooter = () => {
  return (

    <footer id="footer" className="footer light-background">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <a href="#" className="logo d-flex align-items-center">
              <span className="sitename">SKN Hospital</span>
            </a>
            <div className="footer-contact pt-3">
              <p>1041 ถ.เจริญเมือง ต.ธาตุเชิงชุม</p>
              <p>อ.เมือง จ.สกลนคร 47000</p>
              <p className="mt-3"><strong>โทรศัพท์:</strong> <span>042-711-615</span></p>
              <p><strong>อีเมล:</strong> <span>admin@sknhospital.go.th</span></p>
            </div>
            <div className="social-links d-flex mt-4">
              <a href="#"><i className="bi bi-twitter-x" /></a>
              <a href="#"><i className="bi bi-facebook" /></a>
              <a href="#"><i className="bi bi-instagram" /></a>
              <a href="#"><i className="bi bi-linkedin" /></a>
            </div>
          </div>
          <div className="col-lg-4 col-md-3 footer-links">
            <h4>ลิงค์ที่น่าสนใจ</h4>
            <ul>
              <li><a href="#/">หน้าแรก</a></li>
              <li><a href="#/OrganizationalStructure">เกี่ยวกับเรา</a></li>
              <li><a href="#/Contact">ติดต่อเรา</a></li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-3 footer-links">
            <h4>ระบบงานภายใน</h4>
            <ul>
              <li><a href="#/Mortuary">ระบบห้องดับจิต</a></li>
              <li><a href="#/Nursing">ระบบตึกผู้ป่วยใน</a></li>
              <li><a href="#/Hemodialysis">ระบบไตเทียม</a></li>
              <li><a href="#/Storage">ระบบจ่ายกลาง</a></li>
              <li><a href="#/QueueStatus">สถานะคิว</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">Sakon Nakhon Hospital</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          พัฒนาโดย <a href="#">ศูนย์เทคโนโลยีสารสนเทศ</a> โรงพยาบาลสกลนคร
        </div>
      </div>
    </footer>

  )
}

export default Frmfooter