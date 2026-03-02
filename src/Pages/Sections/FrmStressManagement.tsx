import React from 'react';
import { FaSmile, FaLightbulb, FaBrain, FaUsers } from 'react-icons/fa';

const FrmStressManagement: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            <div className="standard-page-content">

                {/* Header Section - Clean and Minimal */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-6 py-2">
                        คิดอย่างไรไม่ให้เครียด
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-teal-500 mx-auto rounded-full"></div>
                    <p className="text-xl text-gray-500 mt-6 font-light">
                        เคล็ดลับการดูแลจิตใจให้สดใสและห่างไกลความเครียด
                    </p>
                </div>

                {/* Introduction Content */}
                <div className="prose prose-lg max-w-none text-gray-600 mb-16">
                    <p className="text-xl leading-relaxed mb-8">
                        <span className="text-3xl text-blue-600 font-bold mr-2">"เครียด"</span>
                        เป็นภาระที่ทุกคนไม่อยากประสบพบพาน แต่คงไม่มีใครที่ไม่เคยเครียด ดังนั้นมาทำความรู้จักกับความเครียด และวิธีการคิดเพื่อที่จะได้ไม่เครียดกันดีกว่า
                    </p>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-blue-50 p-8 rounded-3xl rounded-tl-none">
                            <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                                <FaBrain /> ความเครียดคืออะไร?
                            </h3>
                            <p className="leading-relaxed">
                                เป็นเรื่องของร่างกายและจิตใจ ที่เกิดจากการตื่นตัวเตรียมรับกับสถานการณ์ หรือเหตุการณ์ใดเหตุการณ์หนึ่ง ซึ่งคาดว่าเป็นเรื่องที่เกิดกำลังความสามารถที่จะแก้ไขได้ ทำให้รู้สึกหนักใจ เป็นทุกข์และส่งผลทำให้เกิดอาการผิดปกติ ทั้งทางร่างกายและจิตใจตามไปด้วย
                            </p>
                        </div>
                        <div>
                            <p className="leading-relaxed text-lg">
                                ความเครียดนั้นมีกันทุกคน แต่ละมากหรือน้อยขึ้นอยู่กับสภาพปัญหาการคิดการประเมินสถานการณ์ของแต่ละคน ถ้าคิดว่าปัญหาไม่ร้ายแรงแก้ไขได้โดยง่าย ก็จะไม่เครียด แต่ถ้าหากว่าปัญหานั้นยิ่งใหญ่ ร้ายแรง แก้ไขลำบาก ก็จะทำให้เครียดมาก
                            </p>
                            <p className="leading-relaxed text-lg mt-4 text-blue-600 font-medium">
                                "หากว่ามีความเครียดในระดับที่พอดี ๆ ก็จะช่วยให้มีพลัง มีความกระตือรือร้นในการต่อสู้ชีวิต ฟันฝ่าอุปสรรคต่าง ๆ ได้"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Causes Section */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-800 mb-10 border-l-8 border-red-500 pl-6">
                        สาเหตุสำคัญที่ทำให้เกิดความเครียด
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="group hover:bg-red-50 transition-colors duration-300 p-6 rounded-xl">
                            <div className="text-red-500 text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300"></div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">1. สภาพปัญหาที่เกิดขึ้นในชีวิต</h3>
                            <p className="text-gray-600 text-lg">
                                เช่น ปัญหาเศรษฐกิจ ปัญหาครอบครัว ปัญหาสังคม ปัญหาการปรับตัว ปัญหาการเรียน ฯลฯ ปัญหาเหล่านี้ล้วนเป็นตัวกระตุ้นอย่างดีที่จะทำให้เกิดความเครียดได้
                            </p>
                        </div>
                        <div className="group hover:bg-orange-50 transition-colors duration-300 p-6 rounded-xl">
                            <div className="text-orange-500 text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300"></div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">2. การคิดและการประเมินสถานการณ์</h3>
                            <p className="text-gray-600 text-lg">
                                คนที่มองโลกในแง่ดี มีอารมณ์ขัน ใจเย็น จะมีความเครียดน้อยกว่าคนที่มองโลกในแง่ร้าย เอาจริงเอาจัง ใจร้อนและวู่วาม
                            </p>
                        </div>
                    </div>
                </div>

                {/* Solutions Section */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-gray-800 mb-10 border-l-8 border-green-500 pl-6 flex items-center gap-3">
                        วิธีคิดเพื่อลดความเครียด <FaSmile className="text-green-500" />
                    </h2>

                    <div className="space-y-8">
                        {[
                            {
                                title: "1. คิดในแง่ยืดหยุ่นให้มากขึ้น",
                                desc: "อย่าเอาจริงเอาจัง เข้มงวดจับผิด หรือตัดสินถูกผิดตัวเอง หรือผู้อื่นตลอดเวลา รู้จักผ่อนหนัก ผ่อนเบา ผ่อนสั้น ผ่อนยาว ลดทิฐิมานะและที่สำคัญควรรู้จักการให้อภัย",
                                color: "blue"
                            },
                            {
                                title: "2. คิดอย่างมีเหตุผล",
                                desc: "ไม่ด่วนเชื่ออะไรง่าย ๆ ไม่ด่วนสรุปอะไรง่าย ๆ ให้พยายามใช้เหตุผลตรวจสอบข้อเท็จจริง ความเป็นไปได้ ไตร่ตรองให้รอบคอบ ตัดความกังวลใจเล็ก ๆ น้อย ๆ ไปได้",
                                color: "indigo"
                            },
                            {
                                title: "3. คิดหลาย ๆ แง่มุม",
                                desc: "มองหลาย ๆ ด้าน ทั้งด้านดีและไม่ดี ทุกอย่างมีข้อดีและข้อไม่ดีประกอบกันทั้งสิ้น ไม่ควรมองด้านใดด้านหนึ่งเพียงด้านเดียวให้ใจเป็นทุกข์ ควรเอาใจเขามาใส่ใจเรา",
                                color: "purple"
                            },
                            {
                                title: "4. คิดแต่เรื่องดี ๆ",
                                desc: "หากคิดแต่เรื่องร้าย ๆ เรื่องความล้มเหลวผิดหวัง ก็จะทำให้เครียดมากขึ้น ควรคิดถึงเรื่องดี ๆ ให้มาก ๆ จะทำให้สบายใจมากขึ้น",
                                color: "pink"
                            },
                            {
                                title: "5. คิดถึงคนอื่นบ้าง",
                                desc: "อย่าหมกมุ่นแต่เรื่องของตัวเอง เปิดใจรับรู้ความรู้สึกของคนอื่น ใส่ใจที่จะช่วยเหลือแก้ไขปัญหาของผู้อื่น จะพบว่าปัญหาของเราเป็นเรื่องเล็กนิดเดียวเมื่อเทียบกับผู้อื่น",
                                color: "teal"
                            }
                        ].map((item, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-6 p-6 hover:bg-gray-50 rounded-2xl transition-all duration-300">
                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-${item.color}-100 flex items-center justify-center text-${item.color}-600 font-bold text-2xl shadow-sm`}>
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-bold text-${item.color}-700 mb-2`}>{item.title}</h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 font-light">
                    <div className="flex items-center gap-2">
                        <FaUsers />
                        <span>ผู้เพิ่มรายการ : นายสกล อุ่มจันสา</span>
                    </div>
                    <div className="mt-2 md:mt-0">
                        <span>วันที่ : 18/05/2553 : 15:27:56</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FrmStressManagement;
