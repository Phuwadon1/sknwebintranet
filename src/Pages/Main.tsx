import React from 'react';
import { HashRouter, Route, Routes } from "react-router-dom";
import Layoutdefault from '../Layouts/Layoutdefault/Layoutdefault';
import Layoutadmin from '../Layouts/Layoutadmin/Layoutadmin';
import Homedefault from './Homes/Frmhomedefault';
import Homeadmin from './Homes/Frmhomeadmin';
import Frmreporting from './Homes/Frmreporting';
import Frmlogin from './Auth/Frmlogin';
import Frmregister from './Auth/Frmregister';
import FrmPatientGraph from './Sections/FrmPatientGraph';
import FrmStressManagement from './Sections/FrmStressManagement';
import FrmStressRelief from './Sections/FrmStressRelief';
import FrmComputerBuyingGuide from './Sections/FrmComputerBuyingGuide';
import FrmIE7Install from './Sections/FrmIE7Install';
import FrmHMSManual from './Sections/FrmHMSManual';
import FrmGeneralinfo from './Sections/FrmGeneralinfo';
import FrmMortuary from './Sections/FrmMortuary';
import FrmNursing from './Sections/FrmNursing';
import FrmHemodialysis from './Sections/FrmHemodialysis';
import FrmStorage from './Sections/FrmStorage';
import Frmcontact from './Sections/Frmcontact';
import FrmHealthKnowledge from './Sections/FrmHealthKnowledge';

import FrmCheckRights from './Services/FrmCheckRights';
import FrmQueueStatus from './Services/FrmQueueStatus';
import FrmDoctorSchedule from './Services/FrmDoctorSchedule';
import FrmITSchedule from './Services/FrmITSchedule';
import FrmDonation from './Services/FrmDonation';
import FrmComplaint from './Services/FrmComplaint';
import FrmActivityGallery from './Sections/FrmActivityGallery';
import ChatWidget from '../Components/ChatWidget';
import ManageDepartments from './Admins/ManageDepartments';
import Departments from './Services/Departments';
import FrmDoctorReportEntry from './Homes/FrmDoctorReportEntry';
import FrmViewReports from './Homes/SubReports/FrmViewReports';
import FrmWordReports from './Homes/SubReports/FrmWordReports';
import FrmExportPatientData from './Homes/SubReports/FrmExportPatientData';
import FrmThaiMedicineReports from './Homes/SubReports/FrmThaiMedicineReports';
import FrmSelfQuery from './Homes/SubReports/FrmSelfQuery';

const Main = () => {
    return (
        <HashRouter
            future={{
                v7_relativeSplatPath: true,
                v7_startTransition: true
            }}
        >
            <Routes>
                <Route element={<Layoutdefault />}>
                    <Route path="/" element={<Homedefault />} />
                    <Route path="/Reporting" element={<Frmreporting />} />
                    <Route path="/Login" element={<Frmlogin />} />
                    <Route path="/Register" element={<Frmregister />} />
                    <Route path="/PatientGraph" element={<FrmPatientGraph />} />
                    <Route path="/StressManagement" element={<FrmStressManagement />} />
                    <Route path="/StressRelief" element={<FrmStressRelief />} />
                    <Route path="/ComputerBuyingGuide" element={<FrmComputerBuyingGuide />} />
                    <Route path="/IE7Install" element={<FrmIE7Install />} />
                    <Route path="/HMSManual" element={<FrmHMSManual />} />
                    <Route path="/OrganizationalStructure" element={<FrmGeneralinfo />} />
                    <Route path="/HealthKnowledge" element={<FrmHealthKnowledge />} />

                    {/* Activity Photos */}
                    <Route path="/Activity/AssessmentSummary" element={<FrmActivityGallery category="assessment_summary" title="สรุปผลการประเมินระบบสารสนเทศและข้อเสนอแนะ" />} />
                    <Route path="/Activity/SystemTest" element={<FrmActivityGallery category="system_test" title="ทดสอบระบบ" />} />
                    <Route path="/Activity/PublicHealthSports20" element={<FrmActivityGallery category="public_health_sports_20" title="กีฬาสาธารณสุข ครั้งที่20" />} />
                    <Route path="/Activity/SKNColorSports2553" element={<FrmActivityGallery category="skn_color_sports_2553" title="กีฬาสี รพ.สน. 2553" />} />

                    {/* System Pages */}
                    <Route path="/Mortuary" element={<FrmMortuary />} />
                    <Route path="/Nursing" element={<FrmNursing />} />
                    <Route path="/Hemodialysis" element={<FrmHemodialysis />} />
                    <Route path="/Storage" element={<FrmStorage />} />

                    {/* Services Pages */}
                    <Route path="/CheckRights" element={<FrmCheckRights />} />
                    <Route path="/QueueStatus" element={<FrmQueueStatus />} />
                    <Route path="/DoctorSchedule" element={<FrmDoctorSchedule />} />
                    <Route path="/ITSchedule" element={<FrmITSchedule />} />
                    <Route path="/Donation" element={<FrmDonation />} />
                    <Route path="/Contact" element={<Frmcontact />} />
                    <Route path="/Contact" element={<Frmcontact />} />
                    <Route path="/Complaint" element={<FrmComplaint />} />
                    <Route path="/Departments" element={<Departments />} />
                    <Route path="/Reporting/DoctorEntry" element={<FrmDoctorReportEntry />} />
                    <Route path="/Reporting/ViewReports" element={<FrmViewReports />} />
                    <Route path="/Reporting/WordReports" element={<FrmWordReports />} />
                    <Route path="/Reporting/ExportPatientData" element={<FrmExportPatientData />} />
                    <Route path="/Reporting/ThaiMedicineReports" element={<FrmThaiMedicineReports />} />
                    <Route path="/Reporting/SelfQuery" element={<FrmSelfQuery />} />
                </Route>
                <Route element={<Layoutadmin />}>
                    <Route path="/Admin" element={<Homeadmin />} />
                    <Route path="/Admin/ManageDepartments" element={<ManageDepartments />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default Main