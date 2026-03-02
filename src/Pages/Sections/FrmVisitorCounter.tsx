import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const FrmVisitorCounter = () => {
    const [stats, setStats] = useState({
        total_visits: 0,
        start_date: '',
        online_count: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats from API
                const res = await api.get('/visitor');
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching visitor stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return null;

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        // Date format: DD/MM/YYYY
        return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <section id="visitor-counter" className="visitor-counter mt-4">
            <div className="card shadow-sm border-0" style={{ maxWidth: '300px', margin: '0 auto' }}>
                <div className="card-header text-center text-white py-2"
                    style={{
                        background: 'linear-gradient(to bottom, #2FA4E7 0%, #1977cc 100%)',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                    <i className="bi bi-bar-chart-fill me-2"></i>
                    จำนวนผู้เข้าชม
                </div>
                <div className="card-body text-center p-3" style={{ backgroundColor: '#fdfdfd', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', border: '1px solid #ddd', borderTop: 'none' }}>
                    <div className="mb-2">
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
                            {stats.total_visits.toLocaleString()}
                        </span>
                        <span className="ms-2" style={{ fontSize: '1rem', color: '#666' }}>ครั้ง</span>
                    </div>

                    <div className="mb-2" style={{ fontSize: '0.9rem', color: '#555' }}>
                        เริ่มนับ {formatDate(stats.start_date)}
                    </div>

                    <div style={{ fontSize: '1.1rem', color: '#000', fontWeight: '500' }}>
                        ออนไลน์ทั้งหมด {stats.online_count} คน
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FrmVisitorCounter;
